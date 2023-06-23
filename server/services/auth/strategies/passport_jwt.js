'use strict';
import cache from '../../../setup/redis';
import passport from 'passport';
import * as passportJwt from 'passport-jwt';
import { postToSlack } from '../../../utils/errorHandler';
export function setupPassportWithJwtStrategy(_passport) {
	_passport.use(
		new passportJwt.Strategy({ jwtFromRequest: passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(), secretOrKey: process.env.JWT_SECRET }, async(jwtPayload, done) => {
			try {
				const userId = jwtPayload.user.id;
				console.log(`User -> ${userId}`);
				const status = await cache.get('user!' + userId + 'login!status');
				if (!status) {
					done(null, false);
				} else {
					done(null, jwtPayload);
				}
			} catch (e) {
				await postToSlack(e, 'setupPassportWithJwtStrategy');
				console.log('EEE', e);
			}
		})
	);
}

export function authenticateJwt(req, res, next) {
	passport.authenticate('jwt', { failWithError: true }, function(err, payload, info) {
		console.log(err);
		console.log('payload', payload);
		if (err) return next(err);
		if (!payload) return next({ status: 401, message: 'User is not authenticated.' });
		req.userId = payload.user.id;
		req.email = payload.user.email;
		req.roles = payload.user.roles;
		req.tenant = payload.user.tenant;
		next();
	})(req, res, next);
}
