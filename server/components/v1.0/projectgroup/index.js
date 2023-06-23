import express from 'express';
import { authenticateJwt } from '../../../services/auth/strategies/passport_jwt';
import { sendErrorHttpResponse } from '../../../utils/errorHandler';
import { generateApiSuccessResponse } from '../../../utils/response_helper';
import { createProjectGroup, deleteProjectGroup, getProjectGroups, updateProjectGroup } from './handler';
const router = express.Router();

router.post('/', authenticateJwt, async(request, response) => {
	try {
		const result = await createProjectGroup(request.body, request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.get('/', authenticateJwt, async(request, response) => {
	try {
		const result = await getProjectGroups();
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.put('/:id', authenticateJwt, async(request, response) => {
	try {
		updateProjectGroup(request.params.id, request.body);
		response.status(200).json(generateApiSuccessResponse({}));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.delete('/:id', authenticateJwt, async(request, response) => {
	try {
		await deleteProjectGroup(request.params.id);
		response.status(200).json(generateApiSuccessResponse({}));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
export default router;
