import Joi from 'joi';

export const urlSchema = Joi.object().keys({
	title: Joi.string().required(),
	url: Joi.string().regex(/^(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z0-9]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/).required()
});
export const tenantProjectSchema = Joi.object().keys({
	display_name: Joi.string().min(3).required(),
	title: Joi.string().required(),
	url: Joi.string().regex(/^(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z0-9]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/).required(),
	sprint_name: Joi.string().required(),
	sprint_start_date: Joi.string().isoDate(),
	sprint_end_date: Joi.string().isoDate()
});
