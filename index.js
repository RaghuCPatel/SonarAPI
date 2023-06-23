require('dotenv').config();
process.on('uncaughtException', (err) => {
	console.error('There was an uncaught error', err);
	process.exit(1);
});
const { app } = require('./server/app.js');

export default app;
