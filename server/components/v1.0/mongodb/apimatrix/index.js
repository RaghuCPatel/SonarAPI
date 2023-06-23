import express from 'express';
import { checkAccessPermissions, resolveTenant } from '../../../../services/auth/middleware';
import { authenticateJwt } from '../../../../services/auth/strategies/passport_jwt';
import { PERMISSIONS } from '../../../../services/constants';
import { sendErrorHttpResponse } from '../../../../utils/errorHandler';
import { generateApiSuccessResponse } from '../../../../utils/response_helper';
import { _createAPIMatrix, _deleteAPIMatrix, _getAPIMatrix, _updateAPIMatrix } from './handler';
const router = express.Router();

router.post('/', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.CREATE_API_MATRIX]), async(request, response) => {
	try {
		await _createAPIMatrix(request.body, request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse({}));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.get('/:projectId', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.VIEW_API_MATRIX]), async(request, response) => {
	try {
		const result = await _getAPIMatrix(request.params.projectId, request.query.sprintId, request.tenant.tenant_id, request.query.key, request.query.pageSize, request.query.pageNumber);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.put('/', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.UPDATE_API_MATRIX]), async(request, response) => {
	try {
		await _updateAPIMatrix(request.body, request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse({}));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.delete('/:matrixId', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.DELETE_API_MATRIX]), async(request, response) => {
	try {
		await _deleteAPIMatrix(request.params.matrixId, request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse({}));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
export default router;
