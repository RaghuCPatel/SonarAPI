import Joi from 'joi';

export const userSchema = Joi.object().keys({
	email: Joi.string().email().required(),
	phone_number: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
	first_name: Joi.string().required(),
	last_name: Joi.string().allow(null, ''),
	password: Joi.string().required(),
	is_active: Joi.boolean().required(),
	role_id: Joi.string().guid().required()
});

export const updateUserSchema = Joi.object().keys({
	phone_number: Joi.string().length(10).pattern(/^[0-9]+$/),
	first_name: Joi.string(),
	last_name: Joi.string().allow(null, '')
});

export const updateUserProfileSchema = Joi.object().keys({
	first_name: Joi.string(),
	last_name: Joi.string().allow(null, '')
});
