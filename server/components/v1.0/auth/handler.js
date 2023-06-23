import cache from '../../../setup/redis';
import { v4 as uuidv4 } from 'uuid';
import User from '../../../models/user';
import { generateResetPasswordURL, sendEmail } from '../../../utils/email';
import { generateInternalServerErrorRepsonse, generateNotFoundErrorResponse } from '../../../utils/errorHandler';

export async function forgotPassword(userEmail) {
	try {
		const user = await User.query().findOne({ email: userEmail });

		if (!user) return Promise.reject(generateNotFoundErrorResponse('User with this email does not exist'));

		const token = uuidv4();
		const subject = 'Reset your password';

		const url = await generateResetPasswordURL(token);

		const resetEmail = {
			url: url.toString(),
			email: userEmail.toString()
		};

		await cache.set('RESET!PASSWORD!' + token, JSON.stringify(resetEmail), 'EX', process.env.RESET_EXPIRY);
		if (process.env.NODE_ENV === 'production') {
			const mailResponse = await sendEmail(userEmail, subject, url);
			return Promise.resolve(mailResponse);
		} else {
			return Promise.resolve({ debug: { reset_link: url } });
		}
	} catch (e) {
		return Promise.reject(await generateInternalServerErrorRepsonse(e, 'forgotPassword'));
	}
}
export async function resetPassword(token, password) {
	try {
		const redisValue = await cache.get('RESET!PASSWORD!' + token);
		const redisJsonValue = JSON.parse(redisValue);

		if (redisJsonValue !== null) {
			const email = redisJsonValue.email;

			await User.query()
				.patch({ encrypted_password: password })
				.where({ email: email });
			await cache.del('RESET!PASSWORD!' + token);

			return Promise.resolve('password changed');
		} else {
			return Promise.reject(generateNotFoundErrorResponse('Password reset link no longer valid, please try again or contact administrator'));
		}
	} catch (e) {
		return Promise.reject(await generateInternalServerErrorRepsonse(e, 'resetPassword'));
	}
}
export async function verifyResetToken(token) {
	try {
		const redisValue = await cache.get('RESET!PASSWORD!' + token);
		const redisJsonValue = JSON.parse(redisValue);

		if (redisJsonValue !== null) {
			return Promise.resolve('Token valid');
		} else {
			return Promise.reject(generateNotFoundErrorResponse('Password reset link no longer valid, please try again or contact administrator'));
		}
	} catch (e) {
		return Promise.reject(await generateInternalServerErrorRepsonse(e, 'verifyResetToken'));
	}
}
