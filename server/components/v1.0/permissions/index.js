import express from 'express';
import { resolveTenant } from '../../../services/auth/middleware';
import { authenticateJwt } from '../../../services/auth/strategies/passport_jwt';
import { sendErrorHttpResponse } from '../../../utils/errorHandler';
import { generateApiSuccessResponse } from '../../../utils/response_helper';
import { _getCapabilities, _getpermissions } from './handler';
const router = express.Router();

router.get('/', authenticateJwt, async(request, response) => {
	try {
		const result = await _getpermissions();
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.get('/capabilities', authenticateJwt, resolveTenant, async(request, response) => {
	try {
		const result = await _getCapabilities(request.roles);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
export default router;
