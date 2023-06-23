import fetch from 'node-fetch';
import TenantProject from '../../models/tenant_project';
import { generateBadRequestResponse, generateInternalServerErrorRepsonse } from '../../utils/errorHandler';
export async function buildRPProject(projectData) {
	try {
		const _dataString = {
			projectName: projectData.projectName,
			entryType: 'INTERNAL'
		};
		const _url = `${process.env.REPORT_PORTAL_URL}/api/v1/project`;
		const key = process.env.REPORT_PORTAL_ACCESS_TOKEN;
		const result = await fetch(_url, {
			method: 'POST',
			body: JSON.stringify(_dataString),
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + key
			}
		});
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(generateInternalServerErrorRepsonse(error, 'buildRPProject'));
	}
}
export async function startLaunch(projectCode, launchData) {
	try {
		const project = await TenantProject.query().findOne({ display_id: projectCode });
		if (!project) return Promise.reject(generateBadRequestResponse(new Error(), 'Project not found'));

		const _dataString = {
			name: launchData.name,
			startTime: launchData.startTime
		};
		const _url = `${process.env.REPORT_PORTAL_URL}/api/v1/${project.display_name}/launch`;
		const key = process.env.REPORT_PORTAL_ACCESS_TOKEN;
		const result = await fetch(_url, {
			method: 'POST',
			body: JSON.stringify(_dataString),
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + key
			}
		});
		if (result.status !== 201 && result.status !== 200) {
			return Promise.reject(generateBadRequestResponse(new Error(), result));
		}
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(generateInternalServerErrorRepsonse(error, 'startLaunch'));
	}
}
export async function startTest(projectCode, testData) {
	try {
		const project = await TenantProject.query().findOne({ display_id: projectCode });
		if (!project) return Promise.reject(generateBadRequestResponse(new Error(), 'Project not found'));

		const _dataString = {
			name: testData.name,
			startTime: testData.startTime,
			launchUuid: testData.launchUuid,
			type: testData.type
		};
		const _url = `${process.env.REPORT_PORTAL_URL}/api/v1/${project.display_name}/item`;
		const key = process.env.REPORT_PORTAL_ACCESS_TOKEN;
		const result = await fetch(_url, {
			method: 'POST',
			body: JSON.stringify(_dataString),
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + key
			}
		});
		if (result.status !== 201 && result.status !== 200) {
			return Promise.reject(generateBadRequestResponse(new Error(), result));
		}
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(generateInternalServerErrorRepsonse(error, 'startTest'));
	}
}
export async function endTest(projectCode, testId, testData) {
	try {
		const project = await TenantProject.query().findOne({ display_id: projectCode });
		if (!project) return Promise.reject(generateBadRequestResponse(new Error(), 'Project not found'));

		const _dataString = {
			endTime: testData.endTime,
			launchUuid: testData.launchUuid,
			status: testData.status
		};
		const _url = `${process.env.REPORT_PORTAL_URL}/api/v1/${project.display_name}/item/${testId}`;
		const key = process.env.REPORT_PORTAL_ACCESS_TOKEN;
		const result = await fetch(_url, {
			method: 'PUT',
			body: JSON.stringify(_dataString),
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + key
			}
		});
		if (result.status !== 201 && result.status !== 200) {
			return Promise.reject(generateBadRequestResponse(new Error(), result));
		}
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(generateInternalServerErrorRepsonse(error, 'endTest'));
	}
}
export async function closeLaunch(projectCode, launchId, launchData) {
	try {
		const project = await TenantProject.query().findOne({ display_id: projectCode });
		if (!project) return Promise.reject(generateBadRequestResponse(new Error(), 'Project not found'));

		const _dataString = {
			endTime: launchData.endTime
		};
		const _url = `${process.env.REPORT_PORTAL_URL}/api/v1/${project.display_name}/launch/${launchId}/finish`;
		const key = process.env.REPORT_PORTAL_ACCESS_TOKEN;
		const result = await fetch(_url, {
			method: 'PUT',
			body: JSON.stringify(_dataString),
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + key
			}
		});
		if (result.status !== 201 && result.status !== 200) {
			return Promise.reject(generateBadRequestResponse(new Error(), result));
		}
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(generateInternalServerErrorRepsonse(error, 'closeLaunch'));
	}
}
export async function deleteRPProject(id) {
	try {
		const _url = `${process.env.REPORT_PORTAL_URL}/api/v1/project/${id}`;
		const key = process.env.REPORT_PORTAL_ACCESS_TOKEN;
		const result = await fetch(_url, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + key
			}
		});
		if (result.status !== 201 && result.status !== 200) {
			return Promise.reject(generateBadRequestResponse(new Error(), result));
		}
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(generateInternalServerErrorRepsonse(error, 'deleteRPProject'));
	}
}
