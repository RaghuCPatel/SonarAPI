import express from 'express';
import { authenticateJwt } from '../../../../services/auth/strategies/passport_jwt';
import { sendErrorHttpResponse } from '../../../../utils/errorHandler';
import { checkAccessPermissions, resolveTenant } from '../../../../services/auth/middleware';
import { generateApiSuccessResponse } from '../../../../utils/response_helper';
import { _createActivity, _deleteActivity, _getActivities, _updateActivity } from './handler';
import { PERMISSIONS } from '../../../../services/constants';
const router = express.Router();

router.post('/', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.CREATE_ACTIVITY]), async(request, response) => {
	try {
		const result = await _createActivity(request.body, request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.put('/:activityId', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.UPDATE_ACTIVITY]), async(request, response) => {
	try {
		const result = await _updateActivity(request.params.activityId, request.body, request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.get('/:buildId', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.VIEW_ACTIVITY]), async(request, response) => {
	try {
		const result = await _getActivities(request.params.buildId,
			request.tenant.tenant_id,
			request.query.key,
			request.query.pageSize,
			request.query.pageNumber);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.delete('/:activityId', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.DELETE_ACTIVITY]), async(request, response) => {
	try {
		const result = await _deleteActivity(request.params.activityId, request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
export default router;
