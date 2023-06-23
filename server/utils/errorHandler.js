export function generateNotFoundErrorResponse(msg) {
	return { status: 400, message: msg };
}
export async function generateInternalServerErrorRepsonse(e, fName = '') {
	// TODO: log error and upload if required for further analysis. Introduce critical flagging.
	console.log(e);
	await postToSlack(e, fName);
	return { status: 500, message: 'Unexpected error occurred' };
}
export function sendForbiddenErrorResponse(response) {
	response.status(403).json({ message: 'Not allowed' });
}
export function generateBadRequestResponse(e, message) {
	return { status: 400, message: message };
}
export function generateUniqueViolationResponse(e, message) {
	return { status: 422, message: message };
}
export function sendErrorHttpResponse(response, e) {
	response.status(e.status).json({ message: e.message });
}

export async function postToSlack(err, functionName = '') {
	const Slack = require('slack-node');
	return new Promise(function(resolve, reject) {
		const webhookUri = process.env.SLACK_WEBHOOK_URI;
		if (!webhookUri || (webhookUri.trim() === '')) {
			resolve(err);
			return;
		}

		if (!process.env.SLACK_CHANNEL || (process.env.SLACK_CHANNEL.trim() === '')) {
			resolve(err);
			return;
		}

		if (!process.env.SLACK_USERNAME || (process.env.SLACK_USERNAME.trim() === '')) {
			resolve(err);
			return;
		}

		const slackInstance = new Slack();
		slackInstance.setWebhook(webhookUri);

		slackInstance.webhook({
			channel: process.env.SLACK_CHANNEL,
			username: process.env.SLACK_USERNAME,
			icon_emoji: process.env.SLACK_ERROR_ICON,
			text: `Error found in v2-api-server ${process.env.NODE_ENV}: ${err.message}\n${err.stack}`,
			attachments: [{
				color: '#eed140',
				fields: [
					{
						title: 'Environment',
						value: process.env.NODE_ENV,
						short: true
					},
					{
						title: 'callerFunction',
						value: functionName,
						short: true
					}
				]
			}]
		}, function(slackErr) {
			if (!slackErr) {
				resolve(err);
				return;
			}
			reject(slackErr);
		});
	});
}
