import express from 'express';
import { sendErrorHttpResponse } from '../../../../utils/errorHandler';
import { generateApiSuccessResponse } from '../../../../utils/response_helper';
import { authenticateJwt } from '../../../../services/auth/strategies/passport_jwt';
import { _addSprintReport, _createSprint, _deleteSprint, _getSprints, _updateSprint } from './handler';
import { checkAccessPermissions, resolveTenant } from '../../../../services/auth/middleware';
import { PERMISSIONS } from '../../../../services/constants';

const router = express.Router();
router.post('/', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.CREATE_SPRINT]), async(request, response) => {
	try {
		const result = await _createSprint(request.body, request.tenant.tenant_id, request.userId);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.put('/:sprintId', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.UPDATE_SPRINT]), async(request, response) => {
	try {
		const result = await _updateSprint(request.params.sprintId, request.body, request.tenant.tenant_id, request.userId);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.get('/:projectId', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.VIEW_SPRINT]), async(request, response) => {
	try {
		const result = await _getSprints(request.params.projectId, request.tenant.tenant_id, request.query.pageSize, request.query.pageNumber, request.query.all);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.put('/:sprintId/addReport', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.UPDATE_SPRINT]), async(request, response) => {
	try {
		const result = await _addSprintReport(request.params.sprintId, request.body.report, request.userId, request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.delete('/:sprintId', authenticateJwt, resolveTenant, /* checkAccessPermissions([PERMISSIONS.DELETE_SPRINT]), */ async(request, response) => {
	try {
		await _deleteSprint(request.params.sprintId, request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse({}));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
export default router;
