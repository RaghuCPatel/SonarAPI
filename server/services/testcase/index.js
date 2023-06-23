import dayjs from 'dayjs';
import { DEFAULT_PAGE_SIZE } from '../../config';
import { AutomationLaunch } from '../../models/mongoose/automation_launch';
import { Sprint } from '../../models/mongoose/sprint';
import { TestCase } from '../../models/mongoose/test_case';
import { testCaseSchemaJoi } from '../../models/schema/test_case';
import { generateBadRequestResponse, generateInternalServerErrorRepsonse } from '../../utils/errorHandler';

export async function createTestRecord(testCase, tenantId) {
	try {
		const _res = testCaseSchemaJoi.validate(testCase);
		if (_res.error) return Promise.reject(generateBadRequestResponse(new Error(), _res.error.message));

		const launch = await AutomationLaunch.findById(testCase.launch_id).populate('sprint');
		if (!launch) return Promise.reject(generateBadRequestResponse(new Error(), 'Launch not found'));

		const sprint = launch.sprint;

		const _sprint = await Sprint.find({ start_date: { $lte: dayjs().format() }, project_id: launch.project_id })
			.sort({ start_date: 'desc' })
			.limit(1);
		if (_sprint.length === 0) return Promise.reject(generateBadRequestResponse(new Error(), 'Sprint not found'));

		if (sprint.id !== _sprint[0].id) return Promise.reject(generateBadRequestResponse(new Error(), 'Select a build under current sprint'));

		const _testCase = {
			tag: testCase.tag,
			launch: testCase.launch_id,
			metrics: testCase.metrics,
			trace: testCase.trace,
			build: launch.build,
			run: launch.run,
			tenant_id: tenantId,
			project_code: launch.project_code,
			project_id: launch.project_id,
			sprint: launch.sprint,
			activity: launch.activity
		};
		const result = await TestCase.create(_testCase);
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'createTestRecord'));
	}
}
export async function getTestRecords(launchId, key, status, pageSize, pageNumber, tenantId) {
	try {
		if (!pageSize) pageSize = DEFAULT_PAGE_SIZE;
		if (!pageNumber) pageNumber = 0;

		let query = { launch: launchId, tenant_id: tenantId };
		const qb = TestCase.find(query);
		if (key) {
			query.tag = { $regex: new RegExp(`.*${key}.*`, 'gi') };
			qb.find({ tag: { $regex: new RegExp(`.*${key}.*`, 'gi') } });
		}
		if (status) {
			query = { 'metrics.status': status };
			query.launch = launchId;
			query.tenant_id = tenantId;
			qb.find({ 'metrics.status': status });
		}
		const testCases = await qb.sort({ createdAt: 'desc' }).limit(pageSize).skip(pageNumber * pageSize);
		const count = await TestCase.countDocuments(query);
		const result = {
			testCases: testCases,
			total: count
		};

		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'getTestRecords'));
	}
}
