import Joi from 'joi';

export const projectBuildSchema = Joi.object().keys({
	build_number: Joi.string().required(),
	project_id: Joi.string().guid().required(),
	sprint_id: Joi.string().required(),
	summary: Joi.string().required()
});
export const projectBuildUpdateSchema = Joi.object().keys({
	status: Joi.string().valid('passed', 'failed', 'onhold').required()
});
