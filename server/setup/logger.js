'use strict';
import winston from 'winston';
import moment from 'moment';

const appRoot = require('app-root-path');
const { combine, timestamp, prettyPrint } = winston.format;

const fileName = `app-${moment().format('YYYY-MM-DD')}`;

const options = {
	file: {
		level: 'info',
		filename: `${appRoot}/logs/${fileName}.log`,
		handleExceptions: true,
		json: true,
		maxsize: process.env.LOG_SIZE,
		maxFiles: process.env.LOG_ROTATION_DAYS,
		colorize: true,
		timestamp: true
	},
	console: {
		level: 'debug',
		handleExceptions: true,
		json: true,
		colorize: true
	}
};

const loggerOptions = {
	level: process.env.LOG_LEVEL || 'debug',
	format: combine(
		timestamp(),
		prettyPrint()
	),
	transports: [
		new winston.transports.File(options.file)
	]
};
const logger = winston.createLogger(loggerOptions);

if (process.env.NODE_ENV !== 'production') {
	logger.add(
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.simple(),
				winston.format.colorize()
			)
		})
	);
}

logger.on('error', (err) => {
	console.error('Error inside winston', err);
});

export default logger;
