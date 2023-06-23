import dayjs from 'dayjs';
import { DEFAULT_PAGE_SIZE } from '../../config';
import { ApiMatrix } from '../../models/mongoose/api_matrix';
import { ProjectBuild } from '../../models/mongoose/build';
import { Sprint } from '../../models/mongoose/sprint';
import { apiMatrixSchemaJoi, apiMatrixUpdateSchemaJoi } from '../../models/schema/api_matrix';
import TenantProject from '../../models/tenant_project';
import { generateBadRequestResponse, generateInternalServerErrorRepsonse } from '../../utils/errorHandler';

export async function createAPIMatrix(matrixInfo, tenantId) {
	try {
		const _res = apiMatrixSchemaJoi.validate(matrixInfo);
		if (_res.error) return Promise.reject(generateBadRequestResponse(new Error(), _res.error.message));

		const project = await TenantProject.query().findOne({ id: matrixInfo.project_id });
		if (!project) return Promise.reject(generateBadRequestResponse(new Error(), 'Project not found'));

		const apimatrix = await ApiMatrix.findOne({ module: matrixInfo.module, project_id: matrixInfo.project_id });
		if (apimatrix) return Promise.reject(generateBadRequestResponse(new Error(), 'Matrix already exists'));

		const build = await ProjectBuild.findById(matrixInfo.build_id).populate('sprint');
		if (!build) return Promise.reject(new Error(), 'Specified build not found');

		const sprint = build.sprint;

		const _sprint = await Sprint.find({ start_date: { $lte: dayjs().format() }, project_id: matrixInfo.project_id })
			.sort({ start_date: 'desc' })
			.limit(1);
		if (_sprint.length === 0) return Promise.reject(generateBadRequestResponse(new Error(), 'Sprint not found'));

		if (sprint.id !== _sprint[0].id) return Promise.reject(generateBadRequestResponse(new Error(), 'Select a build under current sprint'));

		await ApiMatrix.create({
			module: matrixInfo.module,
			priority: matrixInfo.priority,
			total_apis: matrixInfo.total_apis,
			total_TCs: matrixInfo.total_TCs,
			total_TCs_exec: matrixInfo.total_TCs_exec,
			total_TCs_pass: matrixInfo.total_TCs_pass,
			total_TCs_fail: matrixInfo.total_TCs_fail,
			blocked_tests: matrixInfo.blocked_tests,
			total_defects: matrixInfo.total_defects,
			open_defects: matrixInfo.open_defects,
			total_feasible_TCs: matrixInfo.total_feasible_TCs,
			total_TCs_automated: matrixInfo.total_TCs_automated,
			total_executable: matrixInfo.total_executable,
			MT_coverage: matrixInfo.MT_coverage,
			blocked_execution: matrixInfo.blocked_execution,
			AT_coverage: matrixInfo.AT_coverage,
			project_id: matrixInfo.project_id,
			project_code: project.display_id,
			tenant_id: tenantId,
			build: matrixInfo.build_id,
			sprint: sprint.id
		});
		return Promise.resolve();
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'createAPIMatrix'));
	}
}
export async function getAPIMatrix(projectId, sprintId, tenantId, key, build, pageSize, pageNumber) {
	try {
		if (!pageSize) pageSize = DEFAULT_PAGE_SIZE;
		if (!pageNumber) pageNumber = 0;

		const query = { project_id: projectId, tenant_id: tenantId };
		const qb = ApiMatrix.find(query);

		if (sprintId) {
			query.sprint = sprintId;
			qb.find({ sprint: sprintId });
		}

		if (key) {
			query.module = { $regex: new RegExp(`.*${key}.*`, 'gi') };
			qb.find({ module: { $regex: new RegExp(`.*${key}.*`, 'gi') } });
		}

		if (build) {
			query.build = build;
			qb.find({ build: build });
		}

		const apimatrixes = await qb.sort({ createdAt: 'desc' })
			.limit(pageSize)
			.skip(pageNumber * pageSize);

		const count = await ApiMatrix.countDocuments(query);
		const result = {
			apimatrixes: apimatrixes,
			total: count
		};

		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'getAPIMatrix'));
	}
}
export async function updateAPIMatrix(matrixInfo, tenantId) {
	try {
		const _res = apiMatrixUpdateSchemaJoi.validate(matrixInfo);
		if (_res.error) return Promise.reject(generateBadRequestResponse(new Error(), _res.error.message));

		const matrix = await ApiMatrix.findById(matrixInfo.id).populate('sprint');

		if (!matrix) return Promise.reject(generateBadRequestResponse(new Error(), 'Matrix not found'));

		if (matrix.tenant_id !== tenantId) return Promise.reject(generateBadRequestResponse(new Error(), 'No access'));

		if (matrix.module !== matrixInfo.module) {
			const _matrix = await ApiMatrix.countDocuments({ module: matrixInfo.module, project_id: matrixInfo.project_id, tenant_id: tenantId });
			if (_matrix > 0) return Promise.reject(generateBadRequestResponse(new Error(), 'Matrix already exists'));
		}

		const sprint = matrix.sprint;

		const _sprint = await Sprint.find({ start_date: { $lte: dayjs().format() }, project_id: matrix.project_id })
			.sort({ start_date: 'desc' })
			.limit(1);
		if (_sprint.length === 0) return Promise.reject(generateBadRequestResponse(new Error(), 'Sprint not found'));

		if (sprint.id !== _sprint[0].id) return Promise.reject(generateBadRequestResponse(new Error(), 'Select a matrix under current sprint'));

		await ApiMatrix.findByIdAndUpdate(matrixInfo.id, {
			module: matrixInfo.module,
			priority: matrixInfo.priority,
			total_apis: matrixInfo.total_apis,
			total_TCs: matrixInfo.total_TCs,
			total_TCs_exec: matrixInfo.total_TCs_exec,
			total_TCs_pass: matrixInfo.total_TCs_pass,
			total_TCs_fail: matrixInfo.total_TCs_fail,
			blocked_tests: matrixInfo.blocked_tests,
			total_defects: matrixInfo.total_defects,
			open_defects: matrixInfo.open_defects,
			total_feasible_TCs: matrixInfo.total_feasible_TCs,
			total_TCs_automated: matrixInfo.total_TCs_automated,
			total_executable: matrixInfo.total_executable,
			MT_coverage: matrixInfo.MT_coverage,
			blocked_execution: matrixInfo.blocked_execution,
			AT_coverage: matrixInfo.AT_coverage
		});
		return Promise.resolve();
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'updateAPIMatrix'));
	}
}
export async function deleteAPIMatrix(matrixId, tenantId) {
	try {
		const matrix = await ApiMatrix.findById(matrixId).populate('sprint');

		if (!matrix) return Promise.reject(generateBadRequestResponse(new Error(), 'Matrix not found'));

		if (matrix.tenant_id !== tenantId) return Promise.reject(generateBadRequestResponse(new Error(), 'No access'));

		const sprint = matrix.sprint;

		if (dayjs(sprint.end_date).isBefore(dayjs())) return Promise.reject(generateBadRequestResponse(new Error(), 'Not allowed to delete old sprints data'));

		await ApiMatrix.findByIdAndDelete(matrixId);
		return Promise.resolve();
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'deleteAPIMatrix'));
	}
}
