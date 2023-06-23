import express from 'express';
import { checkAccessPermissions, checkTokenForTenantAPI, resolveTenant } from '../../../../services/auth/middleware';
import { authenticateJwt } from '../../../../services/auth/strategies/passport_jwt';
import { PERMISSIONS } from '../../../../services/constants';
import { sendErrorHttpResponse } from '../../../../utils/errorHandler';
import { generateApiSuccessResponse } from '../../../../utils/response_helper';
import { _createTestRecord, _getTestRecords } from './handler';
const router = express.Router();

router.post('/:id/record', checkTokenForTenantAPI, async(request, response) => {
	try {
		const result = await _createTestRecord(request.body, request.params.id);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.get('/:launchId', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.VIEW_TESTCASE]), async(request, response) => {
	try {
		const result = await _getTestRecords(
			request.params.launchId,
			request.query.key,
			request.query.status,
			request.query.pageSize,
			request.query.pageNumber,
			request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
export default router;
