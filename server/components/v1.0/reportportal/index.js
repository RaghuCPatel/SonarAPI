import express from 'express';
import { checkTokenForTenantAPI } from '../../../services/auth/middleware';
import { sendErrorHttpResponse } from '../../../utils/errorHandler';
import { generateApiSuccessResponse } from '../../../utils/response_helper';
import { createTest, finishLaunch, finishTest, createLaunch, createRPProject } from './handler';
const router = express.Router();
router.post('/:id/rp-project', checkTokenForTenantAPI, async(request, response) => {
	try {
		const result = await createRPProject(request.body);
		response.status(200).json(generateApiSuccessResponse(await result.json()));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.post('/:id/:projectCode/launch', checkTokenForTenantAPI, async(request, response) => {
	try {
		const result = await createLaunch(request.params.projectCode, request.body);
		response.status(200).json(generateApiSuccessResponse(await result.json()));
	} catch (e) {
		console.log(e);
		sendErrorHttpResponse(response, e);
	}
});
router.post('/:id/:projectCode/test', checkTokenForTenantAPI, async(request, response) => {
	try {
		const result = await createTest(request.params.projectCode, request.body);
		response.status(200).json(generateApiSuccessResponse(await result.json()));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.put('/:id/:projectCode/test/:testId', checkTokenForTenantAPI, async(request, response) => {
	try {
		const result = await finishTest(request.params.projectCode, request.params.testId, request.body);
		response.status(200).json(generateApiSuccessResponse(await result.json()));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.put('/:id/:projectCode/launch/:launchId', checkTokenForTenantAPI, async(request, response) => {
	try {
		const result = await finishLaunch(request.params.projectCode, request.params.launchId, request.body);
		response.status(200).json(generateApiSuccessResponse(await result.json()));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
export default router;
