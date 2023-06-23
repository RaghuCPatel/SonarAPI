import { authenticateJwt } from '../../../services/auth/strategies/passport_jwt';
import express from 'express';
import { _activateUser, _assignProject, _createUser, _deactivateUser, _getAllUsers, _getProjectAssignments, _getRoles, _getUnassignedProjects, _getUsersRelatedToAProject, _removeProject, _updateProfile, _updateUser } from './handler';
import { generateApiSuccessResponse } from '../../../utils/response_helper';
import { sendErrorHttpResponse } from '../../../utils/errorHandler';
import { checkAccessPermissions, resolveTenant } from '../../../services/auth/middleware';
import { PERMISSIONS } from '../../../services/constants';

const router = express.Router();

router.post('/', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.CREATE_USER]), async(request, response) => {
	try {
		const result = await _createUser(request.body, request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.put('/update/:userId', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.UPDATE_USER]), async(request, response) => {
	try {
		const result = await _updateUser(request.params.userId, request.body, request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.put('/:id', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.DEACTIVATE_USER]), async(request, response) => {
	try {
		const result = await _deactivateUser(request.params.id, request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.put('/activate/:id', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.ACTIVATE_USER]), async(request, response) => {
	try {
		const result = await _activateUser(request.params.id, request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.get('/', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.VIEW_USER]), async(request, response) => {
	try {
		const result = await _getAllUsers(
			request.tenant.tenant_id,
			request.query.status,
			request.query.role,
			request.query.key,
			request.query.pageNumber,
			request.query.pageSize
		);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.post('/assign-project', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.ASSIGN_PROJECT]), async(request, response) => {
	try {
		const result = await _assignProject(request.body, request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.delete('/:testerId/unassign-project/:projectId', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.UNASSIGN_PROJECT]), async(request, response) => {
	try {
		const result = await _removeProject(request.params.projectId, request.params.testerId, request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.get('/assignments/:testerId', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.VIEW_PROJECT]), async(request, response) => {
	try {
		const result = await _getProjectAssignments(request.params.testerId, request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.get('/unassigned-projects/:testerId', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.VIEW_PROJECT]), async(request, response) => {
	try {
		const result = await _getUnassignedProjects(request.params.testerId, request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.get('/project-users/:projectId', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.VIEW_USER]), async(request, response) => {
	try {
		const result = await _getUsersRelatedToAProject(request.params.projectId, request.query.pageSize, request.query.pageNumber, request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.get('/roles', authenticateJwt, resolveTenant, async(request, response) => {
	try {
		const result = await _getRoles();
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.put('/:userId/update-profile', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.UPDATE_PROFILE]), async(request, response) => {
	try {
		const result = await _updateProfile(request.userId, request.body, request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
export default router;
