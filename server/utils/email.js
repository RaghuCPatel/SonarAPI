import { createTransport } from 'nodemailer';
const ejs = require('ejs');
export async function generateEmailBody(params, template) {
	let filePath = __dirname;
	filePath = filePath + '/' + template;
	console.log(filePath);
	const data = await ejs.renderFile(filePath, params);
	return data;
}
export async function sendEmail(to, subject, body) {
	return new Promise((resolve, reject) => {
		try {
			const transporter = createTransport({
				host: process.env.SMTP_ADDRESS,
				port: process.env.SMTP_PORT,
				secure: true, // true for 465, false for other ports
				auth: {
					user: process.env.SMTP_USER, // generated ethereal user
					pass: process.env.SMTP_PASSWORD // generated ethereal password
				},
				tls: {
					// do not fail on invalid certs
					rejectUnauthorized: false
				}
			});
			console.log(to, subject);

			const mainOptions = {
				from: process.env.SMTP_EMAIL_ADDRESS,
				to: to,
				subject: subject,
				html: body
			};

			transporter.sendMail(mainOptions, (err, info) => {
				if (err) {
					console.log(err);
				} else {
					console.log('Message sent: ' + info.response);
				}
			});
			return resolve('Message sent');
		} catch (error) {
			return reject(error);
		}
	});
}
export async function sendEmailWithIcsile(to, subject, body, icsFile) {
	return new Promise((resolve, reject) => {
		try {
			const transporter = createTransport({
				host: process.env.SMTP_ADDRESS,
				port: process.env.SMTP_PORT,
				secure: true, // true for 465, false for other ports
				auth: {
					user: process.env.SMTP_USER, // generated ethereal user
					pass: process.env.SMTP_PASSWORD // generated ethereal password
				},
				tls: {
					// do not fail on invalid certs
					rejectUnauthorized: false
				}
			});
			console.log(to, subject);
			console.log('icsResponse', icsFile);

			const mainOptions = {
				from: process.env.SMTP_EMAIL_ADDRESS,
				to: to,
				subject: subject,
				attachments: icsFile,
				html: body
			};
			transporter.sendMail(mainOptions, (err, info) => {
				if (err) {
					console.log(err);
				} else {
					console.log('Message sent: ' + info.response);
				}
			});
			return resolve('Message sent');
		} catch (error) {
			console.log(error);
		}
	});
}
export async function generateEmailIcsBody(params, template) {
	let filePath = __dirname;
	filePath = filePath + '/' + template;
	console.log(filePath);
	const data = await ejs.renderFile(filePath, params);
	return data;
}
export function generateResetPasswordURL(token) {
	return process.env.RESET_PASSWORD_URL + token;
}
