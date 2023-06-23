import Joi from 'joi';

export const projectGroupSchema = Joi.object().keys({
	tenant_id: Joi.string().guid().required(),
	project_id: Joi.string().guid().required(),
	display_name: Joi.string().required()
});
