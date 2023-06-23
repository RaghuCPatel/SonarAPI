import dayjs from 'dayjs';
import { DEFAULT_PAGE_SIZE } from '../../config';
import { Sprint } from '../../models/mongoose/sprint';
import { projectSprintSchema } from '../../models/schema/sprint';
import TenantProject from '../../models/tenant_project';

import { generateBadRequestResponse, generateInternalServerErrorRepsonse } from '../../utils/errorHandler';

export async function createSprint(sprintInfo, tenantId, userId) {
	try {
		const _res = projectSprintSchema.validate(sprintInfo);
		if (_res.error) return Promise.reject(generateBadRequestResponse(new Error(), _res.error.message));

		const project = await TenantProject.query().findOne({ id: sprintInfo.project_id, tenant_id: tenantId });

		if (!project) return Promise.reject(generateBadRequestResponse(new Error(), 'Project not found'));

		const _sprint = await Sprint.countDocuments({ sprint_name: sprintInfo.sprint_name, project_id: sprintInfo.project_id, tenant_id: tenantId });
		if (_sprint > 0) return Promise.reject(generateBadRequestResponse(new Error(), 'Sprint name already exists'));

		if (dayjs(sprintInfo.start_date).isAfter(dayjs(sprintInfo.end_date))) {
			return Promise.reject(generateBadRequestResponse(new Error(), 'incorrect dates'));
		}

		const startDate = dayjs(sprintInfo.start_date).toISOString();
		const endDate = dayjs(sprintInfo.end_date).toISOString();
		const duration = dayjs(endDate).diff(startDate, 'day') + 1;

		const prevSprint = await Sprint.find({ start_date: { $lte: startDate }, project_id: sprintInfo.project_id, tenant_id: tenantId }).sort({ start_date: 'desc' }).limit(1);

		if (prevSprint.length !== 0) {
			if (prevSprint.length !== 0 && dayjs(startDate).isBefore(dayjs(prevSprint[0].end_date).format())) {
				return Promise.reject(generateBadRequestResponse(new Error(), 'Sprint exists on this date'));
			}
		}
		const nextSprint = await Sprint.find({ start_date: { $gt: endDate }, project_id: sprintInfo.project_id, tenant_id: tenantId }).sort({ start_date: 'asc' }).limit(1);

		if (nextSprint.length !== 0 && (dayjs(startDate).isAfter(dayjs(nextSprint[0].start_date).format()) || dayjs(endDate).isAfter(dayjs(nextSprint[0].start_date).format()))) {
			return Promise.reject(generateBadRequestResponse(new Error(), 'Sprint exists on this date'));
		}
		const result = await Sprint.create({
			sprint_name: sprintInfo.sprint_name,
			start_date: startDate,
			end_date: endDate,
			duration: duration,
			goal: sprintInfo.goal,
			creator: userId,
			project_id: sprintInfo.project_id,
			project_code: project.display_id,
			tenant_id: tenantId
		});

		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'createSprint'));
	}
}
export async function updateSprint(sprintId, sprintInfo, tenantId) {
	try {
		const _res = projectSprintSchema.validate(sprintInfo);
		if (_res.error) return Promise.reject(generateBadRequestResponse(new Error(), _res.error.message));

		const project = await TenantProject.query().findById(sprintInfo.project_id);
		if (!project) return Promise.reject(generateBadRequestResponse(new Error(), 'Project not found'));

		const sprint = await Sprint.findById(sprintId);
		if (!sprint) return Promise.reject(generateBadRequestResponse(new Error(), 'Sprint not found'));

		if (sprint.tenant_id !== tenantId) return Promise.reject(generateBadRequestResponse(new Error(), 'No access'));

		if (sprint.sprint_name !== sprintInfo.sprint_name) {
			const _sprint = await Sprint.countDocuments({ sprint_name: sprintInfo.sprint_name, project_id: sprintInfo.project_id, tenant_id: tenantId });
			if (_sprint > 0) return Promise.reject(generateBadRequestResponse(new Error(), 'Sprint name already exists'));
		}

		if (dayjs(sprintInfo.start_date).isAfter(dayjs(sprintInfo.end_date))) {
			return Promise.reject(generateBadRequestResponse(new Error(), 'incorrect dates'));
		}

		const startDate = dayjs(sprintInfo.start_date).toISOString();
		const endDate = dayjs(sprintInfo.end_date).toISOString();
		const duration = dayjs(endDate).diff(dayjs(startDate).format(), 'day') + 1;

		const prevSprint = await Sprint.find({ start_date: { $lt: sprint.start_date }, project_id: sprintInfo.project_id }).sort({ start_date: 'desc' }).limit(1);

		if (prevSprint.length !== 0 && dayjs(startDate).isBefore(dayjs(prevSprint[0].end_date))) {
			return Promise.reject(generateBadRequestResponse(new Error(), 'Sprint exists on this date'));
		}

		const nextSprint = await Sprint.find({ start_date: { $gte: sprint.end_date }, project_id: sprintInfo.project_id }).sort({ start_date: 'asc' }).limit(1);

		if (nextSprint.length !== 0 && dayjs(endDate).isAfter(dayjs(nextSprint[0].start_date).format())) {
			return Promise.reject(generateBadRequestResponse(new Error(), 'Sprint exists on this date'));
		}
		const result = await Sprint.findByIdAndUpdate(sprintId, {
			sprint_name: sprintInfo.sprint_name,
			start_date: startDate,
			end_date: endDate,
			duration: duration,
			goal: sprintInfo.goal
		});
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'updateSprint'));
	}
}
export async function getSprints(projectId, tenantId, pageSize, pageNumber, all) {
	try {
		if (!pageSize) pageSize = DEFAULT_PAGE_SIZE;
		if (!pageNumber) pageNumber = 0;

		const query = { project_id: projectId, tenant_id: tenantId };
		const qb = Sprint.find(query);
		let sprints = [];
		if (!all) {
			sprints = await qb
				.sort({ start_date: 'asc' })
				.limit(pageSize)
				.skip(pageNumber * pageSize);
		} else {
			sprints = await qb
				.sort({ start_date: 'asc' });
		}

		const count = await Sprint.countDocuments(query);
		const result = {
			sprints: sprints,
			total: count
		};
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'getSprints'));
	}
}
export async function addSprintReport(sprintId, reportData, userId, tenantId) {
	try {
		const sprint = await Sprint.findById(sprintId);
		if (!sprint) return Promise.reject(generateBadRequestResponse(new Error(), 'Sprint not found'));

		if (sprint.tenant_id !== tenantId) return Promise.reject(generateBadRequestResponse(new Error(), 'No access'));

		const report = {
			content: reportData,
			createdAt: dayjs().toISOString(),
			creator: userId
		};

		const result = await Sprint.findByIdAndUpdate(sprintId, {
			report: report
		});
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(new Error(), 'addSprintReport'));
	}
}
export async function deleteSprint(sprintId, tenantId) {
	try {
		const sprint = await Sprint.findById(sprintId);
		if (!sprint) return Promise.reject(generateBadRequestResponse(new Error(), 'Sprint not found'));

		if (sprint.tenant_id !== tenantId) return Promise.reject(generateBadRequestResponse(new Error(), 'No access'));

		await Sprint.findOneAndDelete({ _id: sprintId });

		return Promise.resolve();
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(new Error(), 'deleteSprint'));
	}
}
