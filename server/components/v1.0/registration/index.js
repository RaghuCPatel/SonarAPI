import express from 'express';
import { checkForRootToken } from '../../../services/auth/middleware';
import { sendErrorHttpResponse } from '../../../utils/errorHandler';
import { generateApiSuccessResponse } from '../../../utils/response_helper';
import {
	registerNewTenant, verifyDomain
} from './handler';
const router = express.Router();

// create tenant from tenant details
router.post(
	'/', checkForRootToken,
	async(request, response) => {
		try {
			const result = await registerNewTenant(request.body);
			response.status(200).json(generateApiSuccessResponse(result));
		} catch (e) {
			sendErrorHttpResponse(response, e);
		}
	}
);
router.get('/verify-domain/:domain', async(request, response) => {
	try {
		const result = await verifyDomain(request.params.domain);
		response.status(200).json(generateApiSuccessResponse(result));
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
export default router;
