import User from '../../../models/user';

export async function updateUserSignInTracking(user) {
	try {
		// The count cannot be updated here as its mistaking integer 1 for boolean
		// This will be handled via a update trigger.
		await User.query()
			.findById(user.id)
			.patch({ last_sign_in_at: new Date().toISOString() });
		return Promise.resolve({});
	} catch (error) {
		console.log(error);
		return Promise.reject(error);
	}
}
