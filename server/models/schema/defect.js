import Joi from 'joi';

export const defectSchema = Joi.object().keys({
	display_id: Joi.string().required(),
	display_name: Joi.string().allow('', null),
	entry_date: Joi.date().required(),
	reported_date: Joi.date().required(),
	status: Joi.string().valid('open', 'closed').required(),
	project_id: Joi.string().guid().required(),
	project_code: Joi.number().integer().positive().required(),
	build_id: Joi.string().required()
});
export const updateDefectSchema = Joi.object().keys({
	display_id: Joi.string(),
	display_name: Joi.string().allow('', null),
	entry_date: Joi.date().required(),
	closed_date: Joi.date(),
	defect_age: Joi.number().integer().positive().allow(0).required(),
	status: Joi.string().valid('open', 'closed')
});
