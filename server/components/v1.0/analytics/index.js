import express from 'express';
import { authenticateJwt } from '../../../services/auth/strategies/passport_jwt';
import { sendErrorHttpResponse } from '../../../utils/errorHandler';
import { checkAccessPermissions, resolveTenant } from '../../../services/auth/middleware';
import { generateApiSuccessResponse } from '../../../utils/response_helper';
import { _getActivitiesData, _getBuildsData, _getDataFortiles, _getDefectsData, _getDefectsDataForEachBuild, _getProjectDefetcsData, _getProjectTestExecCoverage, _getProjectTilesData, _getTestExecCoverage, _getTestExecCoverageForEachBuild, _getVarianceActivitiesData } from './handler';
import { PERMISSIONS } from '../../../services/constants';
const router = express.Router();

router.get('/:projectId/test-exec-coverage', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.VIEW_ANALYTICS]), async(request, response) => {
	try {
		const result = await _getTestExecCoverage(request.userId, request.roles[0].role_id, request.params.projectId, request.tenant.tenant_id, request.query.startDate, request.query.endDate, request.query.pageSize, request.query.pageNumber);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.get('/:projectId/tiles', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.VIEW_ANALYTICS]), async(request, response) => {
	try {
		const result = await _getDataFortiles(request.userId, request.roles[0].role_id, request.params.projectId, request.tenant.tenant_id, request.query.buildId, request.query.startDate, request.query.endDate, request.query.pageSize, request.query.pageNumber);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.get('/:projectId/defects', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.VIEW_ANALYTICS]), async(request, response) => {
	try {
		const result = await _getDefectsData(request.userId, request.roles[0].role_id, request.params.projectId, request.tenant.tenant_id, request.query.startDate, request.query.endDate, request.query.pageSize, request.query.pageNumber);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.get('/:projectId/activities', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.VIEW_ANALYTICS]), async(request, response) => {
	try {
		const result = await _getActivitiesData(request.userId, request.roles[0].role_id, request.params.projectId, request.tenant.tenant_id, request.query.startDate, request.query.endDate, request.query.pageSize, request.query.pageNumber);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.get('/:projectId/defects/:buildId', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.VIEW_ANALYTICS]), async(request, response) => {
	try {
		const result = await _getDefectsDataForEachBuild(request.userId, request.roles[0].role_id, request.params.projectId, request.tenant.tenant_id, request.params.buildId, request.query.pageSize, request.query.pageNumber);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.get('/:projectId/test-exec-coverage/:buildId', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.VIEW_ANALYTICS]), async(request, response) => {
	try {
		const result = await _getTestExecCoverageForEachBuild(request.userId, request.roles[0].role_id, request.params.projectId, request.tenant.tenant_id, request.params.buildId, request.query.pageSize, request.query.pageNumber);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.get('/test-exec-coverage', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.VIEW_ANALYTICS]), async(request, response) => {
	try {
		const result = await _getProjectTestExecCoverage(request.userId, request.roles[0].role_id, request.tenant.tenant_id, request.query.projectIds);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.get('/defects', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.VIEW_ANALYTICS]), async(request, response) => {
	try {
		const result = await _getProjectDefetcsData(request.userId, request.roles[0].role_id, request.tenant.tenant_id, request.query.projectIds);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.get('/tiles', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.VIEW_ANALYTICS]), async(request, response) => {
	try {
		const result = await _getProjectTilesData(request.userId, request.roles[0].role_id, request.tenant.tenant_id, request.query.projectIds);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.get('/builds', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.VIEW_ANALYTICS]), async(request, response) => {
	try {
		const result = await _getBuildsData(request.userId, request.roles[0].role_id, request.tenant.tenant_id, request.query.projectIds);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.get('/variance', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.VIEW_ANALYTICS]), async(request, response) => {
	try {
		const result = await _getVarianceActivitiesData(request.userId, request.roles[0].role_id, request.tenant.tenant_id, request.query.projectIds);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
export default router;
