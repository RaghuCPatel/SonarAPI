import express from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import Tenant from '../../../models/tenant';
import { authenticateJwt } from '../../../services/auth/strategies/passport_jwt';
import { updateUserSignInTracking } from '../../../services/auth/user';
import cache from '../../../setup/redis';
import { sendErrorHttpResponse } from '../../../utils/errorHandler';
import { forgotPassword, resetPassword, verifyResetToken } from './handler';

const router = express.Router();

router.post('/login', function(req, res, next) {
	passport.authenticate(
		'local',
		{ failureRedirect: '/', failWithError: true },
		async function(err, user, info) {
			if (err) {
				console.log('Error logging in user', err);
				return res.sendStatus(401);
			}
			if (!user) {
				return res.sendStatus(401);
			}
			let url = req.headers.origin;
			url = url.split('/');
			const reqUrl = url[2];

			const subDomain = reqUrl.split('.');
			const tenant = await Tenant.query().findOne({ domain: subDomain[0] });

			if (!tenant) return res.sendStatus(404);

			if (user.tenant.tenant_id !== tenant.id) return res.status(400).send(`Email is not registered with ${tenant.domain}`);

			const payload = {
				user: user,
				tenant: tenant
			};

			await updateUserSignInTracking(user);
			const token = jwt.sign(payload, process.env.JWT_SECRET);
			await cache.set('user!' + user.id + 'login!status', '1', 'EX', process.env.WEB_SESSION_TTL);
			return res.json({ user, token });
		}
	)(req, res, next);
});

router.delete('/logout', authenticateJwt, async(request, response) => {
	await cache.del('user!' + request.userId + 'login!status');
	return response.status(200).json({});
});
router.post('/forgot-password', async(request, response) => {
	try {
		const result = await forgotPassword(request.body.email);
		response.status(200).json(result);
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.put('/reset-password/:token', async(request, response) => {
	try {
		const result = await resetPassword(request.params.token, request.body.password);
		response.status(200).json(result);
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
router.get('/verifyResetToken/:token', async(request, response) => {
	try {
		const result = await verifyResetToken(request.params.token);
		response.status(200).json(result);
	} catch (e) {
		sendErrorHttpResponse(response, e);
	}
});
export default router;
