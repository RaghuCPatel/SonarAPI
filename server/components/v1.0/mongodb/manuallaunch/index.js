import express from 'express';
import { checkAccessPermissions, resolveTenant } from '../../../../services/auth/middleware';
import { authenticateJwt } from '../../../../services/auth/strategies/passport_jwt';
import { PERMISSIONS } from '../../../../services/constants';
import { sendErrorHttpResponse } from '../../../../utils/errorHandler';
import { generateApiSuccessResponse } from '../../../../utils/response_helper';
import { _createManualLaunch, _deleteManualLaunch, _getManualLaunches, _updateManualLaunch } from './handler';
const router = express.Router();
router.post('/', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.CREATE_LAUNCH]), async(request, response) => {
	try {
		await _createManualLaunch(request.body, request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse({}));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.get('/:runId', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.VIEW_LAUNCH]), async(request, response) => {
	try {
		const result = await _getManualLaunches(request.params.runId,
			request.tenant.tenant_id,
			request.query.key,
			request.query.execDate,
			request.query.pageSize,
			request.query.pageNumber);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.put('/:launchId', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.UPDATE_LAUNCH]), async(request, response) => {
	try {
		await _updateManualLaunch(request.body, request.params.launchId, request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse({}));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.delete('/:launchId', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.DELETE_LAUNCH]), async(request, response) => {
	try {
		await _deleteManualLaunch(request.params.launchId, request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse({}));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
export default router;
