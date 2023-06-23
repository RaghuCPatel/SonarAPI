import Joi from 'joi';

export const automationLaunchSchemaJoi = Joi.object().keys({
	build_number: Joi.string().required(),
	environment: Joi.string().valid('production', 'development').required(),
	project_code: Joi.number().required(),
	run_name: Joi.string().required(),
	start_time: Joi.date().required(),
	suite_name: Joi.string().required(),
	source: Joi.string().required(),
	activity_id: Joi.string().required()
});

export const automationLaunchSchemaUpdateJoi = Joi.object().keys({
	overallstatus: Joi.string().required(),
	total_testcases: Joi.number().integer().positive().allow(0).required(),
	passed_testcases: Joi.number().integer().positive().allow(0).required(),
	failed_testcases: Joi.number().integer().positive().allow(0).required(),
	skipped_testcases: Joi.number().integer().positive().allow(0).required(),
	end_time: Joi.date().required(),
	duration: Joi.number().integer().positive().allow(0).required()
});
