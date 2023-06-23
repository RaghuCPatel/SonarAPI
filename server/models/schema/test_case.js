import Joi from 'joi';

export const testCaseSchemaJoi = Joi.object().keys({
	tag: Joi.string().required(),
	launch_id: Joi.string().required(),
	metrics: Joi.object().keys({
		status: Joi.string().required(),
		start_time: Joi.date().required(),
		end_time: Joi.date().required(),
		duration: Joi.number().integer().positive().allow(0).required()
	}),
	trace: Joi.object()
});
