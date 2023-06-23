import dayjs from 'dayjs';
import { DEFAULT_PAGE_SIZE } from '../../config';
import { ProjectBuild } from '../../models/mongoose/build';
import { Defect } from '../../models/mongoose/defect';
import { defectSchema, updateDefectSchema } from '../../models/schema/defect';
import TenantProject from '../../models/tenant_project';
import { generateBadRequestResponse, generateInternalServerErrorRepsonse } from '../../utils/errorHandler';

export async function createDefect(defectInfo, tenantId) {
	try {
		const _res = defectSchema.validate(defectInfo);
		if (_res.error) return Promise.reject(generateBadRequestResponse(new Error(), _res.error.message));

		const defect = await Defect.findOne({ display_id: defectInfo.display_id, build: defectInfo.build_id });
		if (defect) return Promise.reject(generateBadRequestResponse(new Error(), 'Defect ID already exists'));

		const project = await TenantProject.query().findById(defectInfo.project_id);
		if (!project) return Promise.reject(generateBadRequestResponse(new Error(), 'Project not found'));

		if (project.tenant_id !== tenantId) return Promise.reject(generateBadRequestResponse(new Error(), 'No access'));

		const build = await ProjectBuild.findById(defectInfo.build_id).populate('sprint');
		if (!build) return Promise.reject(new Error(), 'Specified build not found');

		const sprint = build.sprint;

		const result = await Defect.create({
			display_id: defectInfo.display_id,
			display_name: defectInfo.display_name,
			entry_date: defectInfo.entry_date,
			reported_date: defectInfo.reported_date,
			status: defectInfo.status,
			project_id: defectInfo.project_id,
			project_code: project.display_id,
			tenant_id: tenantId,
			build: defectInfo.build_id,
			sprint: sprint.id
		});

		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(generateInternalServerErrorRepsonse(error, 'createDefect'));
	}
}
export async function getDefects(projectId, sprintId, tenantId, key, build, pageSize, pageNumber) {
	try {
		if (!pageSize) pageSize = DEFAULT_PAGE_SIZE;
		if (!pageNumber) pageNumber = 0;

		const query = { project_id: projectId, tenant_id: tenantId };
		const qb = Defect.find(query);

		if (sprintId) {
			query.sprint = sprintId;
			qb.find({ sprint: sprintId });
		}

		if (key) {
			query.display_id = { $regex: new RegExp(`.*${key}.*`, 'gi') };
			qb.find({ display_id: { $regex: new RegExp(`.*${key}.*`, 'gi') } });
		}
		if (build) {
			query.build = build;
			qb.find({ build: build });
		}

		const defects = await qb.sort({ createdAt: 'desc' })
			.populate('build sprint')
			.limit(pageSize)
			.skip(pageNumber * pageSize);

		const count = await Defect.countDocuments(query);
		const result = {
			defects: defects,
			total: count
		};

		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(generateInternalServerErrorRepsonse(error, 'getDefects'));
	}
}
export async function updateDefect(defectId, tenantId, defectInfo) {
	try {
		const _res = updateDefectSchema.validate(defectInfo);
		if (_res.error) return Promise.reject(generateBadRequestResponse(new Error(), _res.error.message));

		const defect = await Defect.findById(defectId).populate('sprint');

		if (!defect) return Promise.reject(generateBadRequestResponse(new Error(), 'Defect not found'));

		if (defect.tenant_id !== tenantId) return Promise.reject(generateBadRequestResponse(new Error(), 'No access'));

		if (defect.display_id !== defectInfo.display_id) {
			const _defect = await Defect.countDocuments({ display_id: defectInfo.display_id, project_id: defectInfo.project_id, tenant_id: tenantId });
			if (_defect > 0) return Promise.reject(generateBadRequestResponse(new Error(), 'Defect ID already exists'));
		}

		if (defectInfo.status === 'closed') {
			if (dayjs(defect.reported_date).isAfter(dayjs(defectInfo.closed_date).toISOString())) return Promise.reject(generateBadRequestResponse(new Error(), 'Closed date should be on or after reported date'));
		}

		await Defect.findByIdAndUpdate(defectId, defectInfo);

		return Promise.resolve();
	} catch (error) {
		return Promise.reject(generateInternalServerErrorRepsonse(error, 'updateDefect'));
	}
}
export async function deleteDefect(defectId, tenantId) {
	try {
		const defect = await Defect.findById(defectId).populate('sprint');

		if (!defect) return Promise.reject(generateBadRequestResponse(new Error(), 'Defect not found'));

		if (defect.tenant_id !== tenantId) return Promise.reject(generateBadRequestResponse(new Error(), 'No access'));

		await Defect.findByIdAndDelete(defectId);

		return Promise.resolve();
	} catch (error) {
		return Promise.reject(generateInternalServerErrorRepsonse(error, 'deleteDefect'));
	}
}
