import express from 'express';
import { checkAccessPermissions, resolveTenant } from '../../../../services/auth/middleware';
import { authenticateJwt } from '../../../../services/auth/strategies/passport_jwt';
import { PERMISSIONS } from '../../../../services/constants';
import { sendErrorHttpResponse } from '../../../../utils/errorHandler';
import { generateApiSuccessResponse } from '../../../../utils/response_helper';
import { _createRun, _deleteRun, _getRuns } from './handler';
const router = express.Router();
router.post('/', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.CREATE_RUN]), async(request, response) => {
	try {
		await _createRun(request.body, request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse({}));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.get('/:buildId', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.VIEW_RUN]), async(request, response) => {
	try {
		const result = await _getRuns(
			request.params.buildId,
			request.tenant.tenant_id,
			request.query.key,
			request.query.pageSize,
			request.query.pageNumber);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.delete('/:runId', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.DELETE_RUN]), async(request, response) => {
	try {
		await _deleteRun(request.params.runId, request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse({}));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
export default router;
