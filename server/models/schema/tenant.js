import Joi from 'joi';

export const tenantSchema = Joi.object().keys({
	domain: Joi.string().required(),
	title: Joi.string().required(),
	email: Joi.string().email().required(),
	phone_number: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
	first_name: Joi.string().required(),
	last_name: Joi.string().allow(null, ''),
	password: Joi.string().required()
});
