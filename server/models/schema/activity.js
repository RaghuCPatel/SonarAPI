import Joi from 'joi';

export const activityJoiSchema = Joi.object().keys({
	display_name: Joi.string().required(),
	estimated_time: Joi.number().integer().positive().required(),
	project_id: Joi.string().guid().required(),
	build_id: Joi.string().required()
});
export const activityJoiSchemaUpdate = Joi.object().keys({
	comments: Joi.string(),
	estimated_time: Joi.number().integer().positive().required()
});
