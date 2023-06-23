import express from 'express';
import { checkAccessPermissions, checkTokenForTenantAPI, resolveTenant } from '../../../../services/auth/middleware';
import { authenticateJwt } from '../../../../services/auth/strategies/passport_jwt';
import { PERMISSIONS } from '../../../../services/constants';
import { sendErrorHttpResponse } from '../../../../utils/errorHandler';
import { generateApiSuccessResponse } from '../../../../utils/response_helper';
import { createProjectLaunch, getProjectLaunches, _deleteLaunch, _updateLaunch } from './handler';

const router = express.Router();

router.post('/:id', checkTokenForTenantAPI, async(request, response) => {
	try {
		const result = await createProjectLaunch(request.body, request.params.id);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.get('/:id', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.VIEW_LAUNCH]), async(request, response) => {
	try {
		const result = await getProjectLaunches(
			request.params.id,
			request.query.key,
			request.query.startDate,
			request.query.source,
			request.query.pageSize,
			request.query.pageNumber,
			request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.put('/:id/updateLaunch/:launchId', checkTokenForTenantAPI, async(request, response) => {
	try {
		await _updateLaunch(request.params.launchId, request.body, request.params.id);
		response.status(200).json(generateApiSuccessResponse({}));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.delete('/:launchId', authenticateJwt, checkAccessPermissions([PERMISSIONS.DELETE_LAUNCH]), async(request, response) => {
	try {
		await _deleteLaunch(request.params.launchId, request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse({}));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
export default router;
