import Joi from 'joi';

export const testUnitSchema = Joi.object().keys({
	tenant_id: Joi.string().guid().required(),
	project_id: Joi.string().guid().required(),
	group_id: Joi.string().guid().required(),
	display_name: Joi.string(),
	is_active: Joi.boolean(),
	description: Joi.string()
});
