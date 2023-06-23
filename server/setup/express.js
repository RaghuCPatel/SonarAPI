'use strict';
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import session from 'express-session';
import * as redis from 'connect-redis';
import cache from './redis';
import cors from 'cors';
import path from 'path';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import { setupPassportWithLocalStrategy } from '../services/auth/strategies/passport_local';
import { setupPassportWithJwtStrategy } from '../services/auth/strategies/passport_jwt';
import { RATE_LIMITER_WINDOWMS, RATE_LIMITER_MAX_REQUEST, RATE_LIMITER_MESSAGE } from '../config';
import { allowOrigins } from '../utils/origin_guard';

export const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));
app.use(morgan('combined'));
const RedisStore = redis.default(session);
const limiter = rateLimit({
	windowMs: RATE_LIMITER_WINDOWMS || 900000,
	max: RATE_LIMITER_MAX_REQUEST || 100,
	message: RATE_LIMITER_MESSAGE
});

app.use(
	session({
		secret: process.env.SESSION_SECRET,
		name: process.env.SESSION_ID,
		resave: false,
		saveUninitialized: false,
		cookie: { secure: false, httpOnly: false, domain: process.env.SESSION_DOMAIN, maxAge: 604800 },
		store: new RedisStore({
			port: process.env.SERVICES_CACHE_PORT || 6379,
			host: process.env.SERVICES_CACHE_HOST || '127.0.0.1',
			prefix: 'core-api-server!web!session!',
			client: cache,
			ttl: process.env.WEB_SESSION_TTL || 1440
		})
	})
);

if (process.env.ALLOWED_DOMAIN_LIST) {
	const allowedDomains = allowOrigins();
	app.use(
		cors({ origin: allowedDomains })
	);
}
app.use(passport.initialize());
app.use(passport.session());
app.use(limiter);
setupPassportWithLocalStrategy(passport);
setupPassportWithJwtStrategy(passport);
const port = process.env.PORT || 3000;

export const _server = app.listen(port);
console.log('Express Server started and listening on port ', port, 'mode (' + process.env.NODE_ENV + ')');

export function teardown() {
	_server.close();
}
