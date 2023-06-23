'use strict';
import User from '../../../models/user';
import * as passportLocal from 'passport-local';

export function setupPassportWithLocalStrategy(passport) {
	passport.use(
		new passportLocal.Strategy({ passReqToCallback: true, usernameField: 'email', passwordField: 'password' }, (req, email, password, done) => {
			User.query().first().where({ email: email })
				.withGraphJoined('tenant')
				.withGraphJoined('roles.role')
				.select('users.id', 'users.email', 'users.first_name', 'users.last_name', 'users.encrypted_password', 'sign_in_count', 'users.is_active')
				.then(async(user) => {
					console.log(user);
					if (!user) {
						return done(null, false);
					}
					const validPassword = await user.verifyPassword(password);
					if (!validPassword) {
						return done(null, false);
					}
					if (!user.is_active) {
						return done(null, false);
					}
					user = user.toJSON();
					delete user.encrypted_password;
					return done(null, user);
				})
				.catch(new User().NotFoundError, () => {
					req.authError = 'User not found';
					done(null, false);
				})
				.catch((err) => {
					console.log(`err: ${JSON.stringify(err)}`);
					done(err);
				});
		})
	);

	passport.serializeUser(function(user, done) {
		done(null, user);
	});

	passport.deserializeUser(function(id, done) {
		done(null, id);
	});
}
