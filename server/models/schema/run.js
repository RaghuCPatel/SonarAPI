import Joi from 'joi';

export const projectRunSchema = Joi.object().keys({
	activity_id: Joi.string().required(),
	project_id: Joi.string().guid().required(),
	project_code: Joi.number().required()
});
