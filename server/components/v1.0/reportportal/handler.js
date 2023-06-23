import { buildRPProject, closeLaunch, endTest, startLaunch, startTest } from '../../../services/reportportal';
import { generateInternalServerErrorRepsonse } from '../../../utils/errorHandler';
export async function createRPProject(projectData) {
	try {
		const result = await buildRPProject(projectData);
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'createRPProject'));
	}
}
export async function createLaunch(projectCode, launchData) {
	try {
		const result = await startLaunch(projectCode, launchData);
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'createLaunch'));
	}
}
export async function createTest(projectCode, testData) {
	try {
		const result = await startTest(projectCode, testData);
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'createLaunch'));
	}
}
export async function finishTest(projectCode, testId, testData) {
	try {
		const result = await endTest(projectCode, testId, testData);
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'finishTest'));
	}
}
export async function finishLaunch(projectCode, launchId, launchData) {
	try {
		const result = await closeLaunch(projectCode, launchId, launchData);
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'finishLaunch'));
	}
}
