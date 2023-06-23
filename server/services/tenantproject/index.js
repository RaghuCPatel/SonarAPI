import { tenantProjectSchema, urlSchema } from '../../models/schema/tenant_project';
import TenantProject from '../../models/tenant_project';
import UserRole from '../../models/user_role';
import { generateBadRequestResponse, generateInternalServerErrorRepsonse } from '../../utils/errorHandler';
import { ROLES } from '../constants';
import { buildRPProject, deleteRPProject } from '../reportportal';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_PAGE_SIZE } from '../../config';
import { AutomationLaunch } from '../../models/mongoose/automation_launch';
import { ProjectBuild } from '../../models/mongoose/build';
import { ProjectRun } from '../../models/mongoose/run';
import { ManualLaunch } from '../../models/mongoose/manual_launch';
import { ApiMatrix } from '../../models/mongoose/api_matrix';
import { Defect } from '../../models/mongoose/defect';
import { TestCase } from '../../models/mongoose/test_case';
import ProjectUser from '../../models/project_user';
import { createSprint } from '../../services/sprints';
import { Sprint } from '../../models/mongoose/sprint';
import { Activity } from '../../models/mongoose/activity';

export async function createProject(projectInfo, tenantId, userId, roleId) {
	try {
		const _res = tenantProjectSchema.validate(projectInfo);
		if (_res.error) return Promise.reject(generateBadRequestResponse(new Error(), _res.error.message));

		const project = await TenantProject.query()
			.findOne({ display_name: projectInfo.display_name });

		if (project) {
			return Promise.reject(generateBadRequestResponse(new Error(), 'Project name already exists'));
		}
		if (projectInfo.display_name === 'project') return Promise.reject(generateBadRequestResponse(new Error(), 'Project name is reserved by the system'));

		const projectData = {
			projectName: projectInfo.display_name,
			entryType: 'INTERNAL'
		};
		let _result = await buildRPProject(projectData);
		if (_result.status !== 201 && _result.status !== 200) {
			return Promise.reject(generateBadRequestResponse(new Error(), _result));
		}
		_result = await _result.json();
		const links = [];
		const link = {
			id: uuidv4(),
			title: projectInfo.title,
			url: projectInfo.url
		};
		links.push(link);
		const metaData = {
			links: links,
			rp_project_id: _result.id
		};
		const result = await TenantProject.query().insertAndFetch({
			display_name: projectInfo.display_name,
			tenant_id: tenantId,
			meta: metaData
		});

		if (roleId !== ROLES.TENANT_ADMIN) { await ProjectUser.query().insert({ user_id: userId, project_id: result.id }); };

		const sprintInfo = {
			sprint_name: projectInfo.sprint_name,
			start_date: projectInfo.sprint_start_date,
			end_date: projectInfo.sprint_end_date,
			project_id: result.id
		};

		await createSprint(sprintInfo, tenantId, userId, true);

		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'createProject'));
	}
}
export async function getAllProjects(tenantId, userId, key, pageSize, pageNumber) {
	try {
		if (!pageSize) pageSize = DEFAULT_PAGE_SIZE;
		if (!pageNumber) pageNumber = 0;
		const userRole = await UserRole.query().findOne({ user_id: userId });
		if (userRole.role_id === ROLES.TENANT_ADMIN) {
			const qb = TenantProject.query().where({ tenant_id: tenantId });
			if (key) {
				qb.where('display_name', 'ilike', `%${key}%`);
			}
			const _projects = await qb.orderBy('created_at', 'DESC').page(pageNumber, pageSize);

			const projects = _projects.results;
			const projectIds = [];

			projects.forEach(project => {
				projectIds.push(project.id);
			});
			const projectRuns = await AutomationLaunch
				.find({ project_id: { $in: projectIds } })
				.select('overallstatus project_id createdAt')
				.sort({ createdAt: 'desc' });
			const result = [];
			projects.forEach(project => {
				const _projectRuns = projectRuns.filter(projectRun => projectRun.project_id === project.id);
				_projectRuns.splice(5, _projectRuns.length);
				const _project = {
					project: project,
					projectRuns: _projectRuns
				};
				result.push(_project);
			});
			const _result = {
				projects: result,
				total: _projects.total
			};
			return Promise.resolve(_result);
		} else {
			const qb = TenantProject.query().where({ tenant_id: tenantId });
			if (key) {
				qb.where('display_name', 'ilike', `%${key}%`);
			}
			const _projects = await qb
				.joinRelated('project_users')
				.where('project_users.user_id', '=', userId)
				.orderBy('created_at', 'DESC')
				.page(pageNumber, pageSize);

			const projects = _projects.results;
			const projectIds = [];

			projects.forEach(project => {
				projectIds.push(project.id);
			});

			const projectRuns = await AutomationLaunch
				.find({ project_id: { $in: projectIds } })
				.select('overallstatus project_id createdAt')
				.sort({ createdAt: 'desc' });
			const result = [];
			projects.forEach(project => {
				const _projectRuns = projectRuns.filter(projectRun => projectRun.project_id === project.id);
				_projectRuns.splice(5, _projectRuns.length);
				const _project = {
					project: project,
					projectRuns: _projectRuns
				};
				result.push(_project);
			});
			const _result = {
				projects: result,
				total: _projects.total
			};
			return Promise.resolve(_result);
		}
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'getAllProjects'));
	}
}
export async function addLinkToProject(projectId, linkData, tenantId) {
	try {
		const project = await TenantProject.query().findById(projectId);
		if (!project) return Promise.reject(generateBadRequestResponse(new Error(), 'project not found'));

		if (project.tenant_id !== tenantId) return Promise.reject(generateBadRequestResponse(new Error(), 'No access'));

		const _res = urlSchema.validate(linkData);
		if (_res.error) return Promise.reject(generateBadRequestResponse(new Error(), _res.error.message));

		const link = {
			id: uuidv4(),
			title: linkData.title,
			url: linkData.url
		};
		const links = project.meta.links;
		links.push(link);
		const metaData = { links: links, rp_project_id: project.meta.rp_project_id };

		const result = await TenantProject.query()
			.patchAndFetchById(projectId, { meta: metaData });
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'addLinkToProject'));
	}
}
export async function deleteLinkFromProject(projectId, linkId, tenantId) {
	try {
		const project = await TenantProject.query().findById(projectId);
		if (!project) return Promise.reject(generateBadRequestResponse(new Error(), 'Project not found'));

		if (project.tenant_id !== tenantId) return Promise.reject(generateBadRequestResponse(new Error(), 'No access'));

		const links = project.meta.links;
		for (let index = 0; index < links.length; index++) {
			const link = links[index];
			if (link.id === linkId) links.splice(index, 1);
		}
		const metaData = { links: links, rp_project_id: project.meta.rp_project_id };

		const result = await TenantProject.query()
			.findById(projectId)
			.patchAndFetchById(projectId, { meta: metaData });
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'deleteLinkFromProject'));
	}
}
export async function deleteProject(projectId, tenantId) {
	try {
		const project = await TenantProject.query().findById(projectId);
		if (!project) return Promise.reject(generateBadRequestResponse(new Error(), 'project not found'));

		if (project.tenant_id !== tenantId) return Promise.reject(generateBadRequestResponse(new Error(), 'No access'));

		await ProjectUser.query().delete().where({ project_id: projectId });
		await deleteRPProject(project.meta.rp_project_id);
		await TenantProject.query().deleteById(projectId);
		await Sprint.deleteMany({ project_id: projectId });
		await ProjectBuild.deleteMany({ project_id: projectId });
		await Activity.deleteMany({ project_id: projectId });
		await ProjectRun.deleteMany({ project_id: projectId });
		await ManualLaunch.deleteMany({ project_id: projectId });
		await AutomationLaunch.deleteMany({ project_id: projectId });
		await TestCase.deleteMany({ project_id: projectId });
		await ApiMatrix.deleteMany({ project_id: projectId });
		await Defect.deleteMany({ project_id: projectId });

		return Promise.resolve(project);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'deleteProject'));
	}
}
export async function getProject(projectId, tenantId) {
	try {
		const result = await TenantProject.query().findOne({ id: projectId, tenant_id: tenantId });
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'getProject'));
	}
}
export async function getProjectLaunchStatus(projectId) {
	try {
		const result = await AutomationLaunch
			.find({})
			.where({ project_id: projectId })
			.select('overallstatus')
			.sort('desc')
			.limit(5);
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'getProjectLaunchStatus'));
	}
}
