import express from 'express';
import { sendErrorHttpResponse } from '../../../utils/errorHandler';
import { generateApiSuccessResponse } from '../../../utils/response_helper';
import { _getTenant, _updateLogoUrl, _updateTenant } from './handler';
import multer from 'multer';
import { authenticateJwt } from '../../../services/auth/strategies/passport_jwt';
import { checkAccessPermissions, resolveTenant } from '../../../services/auth/middleware';
import { PERMISSIONS } from '../../../services/constants';

const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post('/:id/upload-logo', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.UPDATE_TENANT]), upload.single('logo'), async(request, response) => {
	try {
		const result = await _updateLogoUrl(request.params.id, request.file);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.put('/:id', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.UPDATE_TENANT]), async(request, response) => {
	try {
		const result = await _updateTenant(request.params.id, request.body);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.get('/', authenticateJwt, resolveTenant, checkAccessPermissions([PERMISSIONS.VIEW_TENANT]), async(request, response) => {
	try {
		const result = await _getTenant(request.tenant.tenant_id);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
export default router;
