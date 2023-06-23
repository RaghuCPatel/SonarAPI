import express from 'express';
import { checkAccessPermissions, resolveTenant } from '../../../services/auth/middleware';
import { authenticateJwt } from '../../../services/auth/strategies/passport_jwt';
import { PERMISSIONS } from '../../../services/constants';
import { sendErrorHttpResponse } from '../../../utils/errorHandler';
import { generateApiSuccessResponse } from '../../../utils/response_helper';
import { _createActivityList, _deleteActivityList, _getActivityList, _getAllActivityList, _updateActivityList } from './handler';
const router = express.Router();

router.post('/', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.CREATE_ACTIVITY_LIST]), async(request, response) => {
	try {
		const result = await _createActivityList(request.tenant.tenant_id, request.body);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});

router.get('/', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.VIEW_ACTIVITY_LIST]), async(request, response) => {
	try {
		const result = await _getActivityList(request.tenant.tenant_id, request.query.key, request.query.pageSize, request.query.pageNumber);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});

router.get('/all', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.VIEW_ACTIVITY_LIST]), async(request, response) => {
	try {
		const result = await _getAllActivityList(request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});

router.put('/:id', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.UPDATE_ACTIVITY_LIST]), async(request, response) => {
	try {
		const result = await _updateActivityList(request.tenant.tenant_id, request.params.id, request.body);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});

router.delete('/:id', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.DELETE_ACTIVITY_LIST]), async(request, response) => {
	try {
		const result = await _deleteActivityList(request.tenant.tenant_id, request.params.id);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
export default router;
