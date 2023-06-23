import express from 'express';
import { authenticateJwt } from '../../../services/auth/strategies/passport_jwt';
import { sendErrorHttpResponse } from '../../../utils/errorHandler';
import { generateApiSuccessResponse } from '../../../utils/response_helper';
import { checkAccessPermissions, resolveTenant } from '../../../services/auth/middleware';
import { createTenantProject, deleteTenantProject, getTenantProject, getTenantProjects, _addLinkToProject, _deleteLinkFromProject } from './handler';
import { PERMISSIONS } from '../../../services/constants';
const router = express.Router();

router.post('/', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.CREATE_PROJECT]), async(request, response) => {
	try {
		const result = await createTenantProject(request.body, request.tenant.tenant_id, request.userId, request.roles[0].role_id);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.get('/', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.VIEW_PROJECT]), async(request, response) => {
	try {
		const result = await getTenantProjects(request.tenant.tenant_id, request.userId, request.query.key, request.query.pageSize, request.query.pageNumber);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.put('/:id/add-link', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.ADD_LINK_TO_PROJECT]), async(request, response) => {
	try {
		const result = await _addLinkToProject(request.params.id, request.body, request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.delete('/:projectId/delete-link/:linkId', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.DELETE_LINK_FROM_PROJECT]), async(request, response) => {
	try {
		const result = await _deleteLinkFromProject(request.params.projectId, request.params.linkId, request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.delete('/:id', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.DELETE_PROJECT]), async(request, response) => {
	try {
		await deleteTenantProject(request.params.id, request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse({}));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.get('/:id', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.VIEW_PROJECT]), async(request, response) => {
	try {
		const result = await getTenantProject(request.params.id, request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
export default router;
