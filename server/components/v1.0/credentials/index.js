import express from 'express';
import { checkAccessPermissions, resolveTenant } from '../../../services/auth/middleware';
import { authenticateJwt } from '../../../services/auth/strategies/passport_jwt';
import { PERMISSIONS } from '../../../services/constants';
import { sendErrorHttpResponse } from '../../../utils/errorHandler';
import { generateApiSuccessResponse } from '../../../utils/response_helper';
import { getAPIKeyForTenant, refreshTenantAPIKey } from './handler';
const router = express.Router();
router.get('/', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.VIEW_API_KEY]), async(request, response) => {
	try {
		const tenantAPIKey = await getAPIKeyForTenant(request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse(tenantAPIKey));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});

router.post('/', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.REGENERATE_API_KEY]), async(request, response) => {
	try {
		const tenantAPIkey = await refreshTenantAPIKey(request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse(tenantAPIkey));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
export default router;
