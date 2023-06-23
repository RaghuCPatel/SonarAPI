'use strict';
import logger from './setup/logger';
import { app, teardown } from './setup/express';
import routes from './routes';
import { knex } from './setup/db';
import { API_VERSION } from './config';
(async() => {
	try {
		logger.info('Application Started');
		process.on('SIGINT', () => {
			console.log(`Exiting application at ${new Date()}`);
			try {
				teardown();
			} catch (e) { console.error(e); }
			process.exit(0);
		});
		logger.info('Executing migrations..');
		knex.migrate.latest();

		app.use('/' + API_VERSION, routes);
		const express = require('express');
		app.use(express.static('uploads'));
		app.use((err, req, res, next) => {
			// set locals, only providing error in development
			res.locals.message = err.message;
			res.locals.error = req.app.get('env') === 'development' ? err : {};
			if (req.app.get('env') === 'development') { console.log('Error: ', err); }
			return res.status(err.status || 500).json(err.message);
		});
	} catch (e) {
		console.error(e);
	}
})();
