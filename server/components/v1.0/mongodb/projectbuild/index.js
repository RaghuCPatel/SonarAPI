import express from 'express';
import { checkAccessPermissions, resolveTenant } from '../../../../services/auth/middleware';
import { authenticateJwt } from '../../../../services/auth/strategies/passport_jwt';
import { PERMISSIONS } from '../../../../services/constants';
import { sendErrorHttpResponse } from '../../../../utils/errorHandler';
import { generateApiSuccessResponse } from '../../../../utils/response_helper';
import { _addBuildReport, _createBuild, _deleteBuild, _getAllBuilds, _getBuildExecTime, _getBuilds, _updateBuild } from './handler';
const router = express.Router();
router.post('/', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.CREATE_BUILD]), async(request, response) => {
	try {
		await _createBuild(request.body, request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse({}));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.get('/:projectId', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.VIEW_BUILD]), async(request, response) => {
	try {
		const result = await _getBuilds(
			request.params.projectId,
			request.query.sprintId,
			request.tenant.tenant_id,
			request.query.key,
			request.query.pageSize,
			request.query.pageNumber);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});

router.get('/:projectId/allBuilds', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.VIEW_BUILD]), async(request, response) => {
	try {
		const result = await _getAllBuilds(
			request.params.projectId,
			request.query.sprintId,
			request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.delete('/:buildId', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.DELETE_BUILD]), async(request, response) => {
	try {
		await _deleteBuild(request.params.buildId, request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse({}));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.put('/:buildId', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.UPDATE_BUILD]), async(request, response) => {
	try {
		await _updateBuild(request.params.buildId, request.body, request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse({}));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.put('/:buildId/addreport', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.UPDATE_BUILD]), async(request, response) => {
	try {
		await _addBuildReport(request.params.buildId, request.body.report, request.userId, request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse({}));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});

router.get('/:projectId/execution-time', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.VIEW_BUILD]), async(request, response) => {
	try {
		const result = await _getBuildExecTime(
			request.params.projectId,
			request.query.sprintId,
			request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
export default router;
