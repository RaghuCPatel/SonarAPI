import express from 'express';
import { checkAccessPermissions, resolveTenant } from '../../../../services/auth/middleware';
import { authenticateJwt } from '../../../../services/auth/strategies/passport_jwt';
import { PERMISSIONS } from '../../../../services/constants';
import { sendErrorHttpResponse } from '../../../../utils/errorHandler';
import { generateApiSuccessResponse } from '../../../../utils/response_helper';
import { _createDefect, _deleteDefect, _getDefects, _updateDefect } from './handler';
const router = express.Router();
router.post('/', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.CREATE_DEFECT]), async(request, response) => {
	try {
		const result = await _createDefect(request.body, request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.get('/:projectId', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.VIEW_DEFECT]), async(request, response) => {
	try {
		const result = await _getDefects(request.params.projectId,
			request.query.sprintId,
			request.tenant.tenant_id,
			request.query.key,
			request.query.build,
			request.query.pageSize,
			request.query.pageNumber);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.put('/:defectId', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.UPDATE_DEFECT]), async(request, response) => {
	try {
		await _updateDefect(request.params.defectId, request.tenant.tenant_id, request.body);
		response.status(200).json(generateApiSuccessResponse({}));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.delete('/:defectId', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.DELETE_DEFECT]), async(request, response) => {
	try {
		await _deleteDefect(request.params.defectId, request.tenant.tenant_id, request.body);
		response.status(200).json(generateApiSuccessResponse({}));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
export default router;
