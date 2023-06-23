import { DEFAULT_PAGE_SIZE } from '../../config';
import { ProjectBuild } from '../../models/mongoose/build';
import { projectBuildSchema, projectBuildUpdateSchema } from '../../models/schema/build';
import TenantProject from '../../models/tenant_project';
import { generateBadRequestResponse, generateInternalServerErrorRepsonse } from '../../utils/errorHandler';
import dayjs from 'dayjs';

export async function createBuild(buildInfo, tenantId) {
	try {
		const _res = await projectBuildSchema.validate(buildInfo);
		if (_res.error) return Promise.reject(generateBadRequestResponse(new Error(), _res.error.message));

		const project = await TenantProject.query().findById(buildInfo.project_id);
		if (!project) return Promise.reject(generateBadRequestResponse(new Error(), 'Project not found'));

		if (project.tenant_id !== tenantId) return Promise.reject(generateBadRequestResponse(new Error(), 'No access'));

		const build = await ProjectBuild.findOne({ build_number: buildInfo.build_number, project_id: buildInfo.project_id, sprint: buildInfo.sprint_id });
		if (build) return Promise.reject(generateBadRequestResponse(new Error(), 'Build exists'));

		const result = await ProjectBuild.create(
			{
				build_number: buildInfo.build_number,
				summary: buildInfo.summary,
				project_id: buildInfo.project_id,
				project_code: project.display_id,
				tenant_id: tenantId,
				sprint: buildInfo.sprint_id
			});

		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(generateInternalServerErrorRepsonse(error, 'createBuild'));
	}
}

export async function getBuilds(projectId, sprintId, tenantId, key, pageSize, pageNumber) {
	try {
		if (!pageSize) pageSize = DEFAULT_PAGE_SIZE;
		if (!pageNumber) pageNumber = 0;

		const query = { project_id: projectId, tenant_id: tenantId };
		const qb = ProjectBuild.find(query);

		if (sprintId) {
			query.sprint = sprintId;
			qb.find({ sprint: sprintId });
		}
		if (key) {
			query.build_number = { $regex: new RegExp(`.*${key}.*`, 'gi') };
			qb.find({ build_number: { $regex: new RegExp(`.*${key}.*`, 'gi') } });
		}

		const builds = await qb
			.sort({ createdAt: 'desc' })
			.limit(pageSize)
			.skip(pageNumber * pageSize);

		const count = await ProjectBuild.countDocuments(query);
		const result = {
			builds: builds,
			total: count
		};
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(generateInternalServerErrorRepsonse(error, 'getBuilds'));
	}
}
export async function getAllBuilds(projectId, sprintId, tenantId) {
	try {
		const query = { project_id: projectId, tenant_id: tenantId };
		const qb = ProjectBuild.find(query);

		if (sprintId) {
			query.sprint = sprintId;
			qb.find({ sprint: sprintId });
		}

		const builds = await qb
			.sort({ createdAt: 'desc' });

		const count = await ProjectBuild.countDocuments(query);
		const result = {
			builds: builds,
			total: count
		};
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(generateInternalServerErrorRepsonse(error, 'getBuilds'));
	}
}
export async function deleteBuild(buildId, tenantId) {
	try {
		const build = await ProjectBuild.findById(buildId).populate('sprint');

		if (!build) return Promise.reject(generateBadRequestResponse(new Error(), 'Build not found'));

		if (build.tenant_id !== tenantId) return Promise.reject(generateBadRequestResponse(new Error(), 'No access'));

		await ProjectBuild.findOneAndDelete({ _id: buildId, tenant_id: tenantId });

		return Promise.resolve();
	} catch (error) {
		return Promise.reject(generateInternalServerErrorRepsonse(error, 'deleteBuild'));
	}
}
export async function updateBuild(buildId, buildInfo, tenantId) {
	try {
		const _res = await projectBuildUpdateSchema.validate(buildInfo);
		if (_res.error) return Promise.reject(generateBadRequestResponse(new Error(), _res.error.message));

		const build = await ProjectBuild.findById(buildId);

		if (!build) return Promise.reject(generateBadRequestResponse(new Error(), 'Build not found'));

		if (build.tenant_id !== tenantId) return Promise.reject(generateBadRequestResponse(new Error(), 'No access'));

		await ProjectBuild.findByIdAndUpdate(buildId, {
			status: buildInfo.status
		});

		return Promise.resolve();
	} catch (error) {
		return Promise.reject(generateInternalServerErrorRepsonse(error, 'updateBuild'));
	}
}
export async function addBuildReport(buildId, reportData, userId, tenantId) {
	try {
		const build = await ProjectBuild.findById(buildId);

		if (!build) return Promise.reject(generateBadRequestResponse(new Error(), 'Build not found'));

		if (build.tenant_id !== tenantId) return Promise.reject(generateBadRequestResponse(new Error(), 'No access'));

		const report = {
			content: reportData,
			createdAt: dayjs().toISOString(),
			creator: userId
		};

		const result = await ProjectBuild.findByIdAndUpdate(buildId, {
			report: report
		});

		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'addBuildReport'));
	}
}

export async function getBuildExecTime(projectId, sprintId, tenantId) {
	try {
		const query = { project_id: projectId, tenant_id: tenantId };
		const qb = ProjectBuild.find(query);

		if (sprintId) {
			query.sprint = sprintId;
			qb.find({ sprint: sprintId });
		}
		const builds = await qb
			.populate('mlaunches alaunches')
			.sort({ createdAt: 'desc' });

		const _builds = [];
		builds.forEach(build => {
			_builds.push({
				_id: build._id,
				build_number: build.build_number,
				executionTime: (build.mlaunches.reduce(function(sum, mlaunch) {
					return sum + (mlaunch.metrics.execution_time / 60);
				}, 0) + build.alaunches.reduce(function(sum, alaunch) {
					return sum + (alaunch.duration / (1000 * 60 * 60));
				}, 0))
			});
		});
		return Promise.resolve(_builds);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'getBuildExecTime'));
	}
}
