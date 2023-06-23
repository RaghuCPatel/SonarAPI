import Joi from 'joi';

export const apiMatrixSchemaJoi = Joi.object().keys({
	module: Joi.string().required(),
	priority: Joi.string().required().valid('critical', 'high', 'medium', 'low'),
	total_apis: Joi.number().integer().positive().allow(0).required(),
	total_TCs: Joi.number().integer().positive().allow(0).required(),
	total_TCs_exec: Joi.number().integer().positive().allow(0).required(),
	total_TCs_pass: Joi.number().integer().positive().allow(0).required(),
	total_TCs_fail: Joi.number().integer().positive().allow(0).required(),
	blocked_tests: Joi.number().integer().positive().allow(0).required(),
	total_defects: Joi.number().integer().positive().allow(0).required(),
	open_defects: Joi.number().integer().positive().allow(0).required(),
	total_feasible_TCs: Joi.number().integer().positive().allow(0).required(),
	total_TCs_automated: Joi.number().integer().positive().allow(0).required(),
	total_executable: Joi.number().integer().positive().allow(0).required(),
	MT_coverage: Joi.number().required(),
	blocked_execution: Joi.number().required(),
	AT_coverage: Joi.number().required(),
	project_id: Joi.string().required(),
	build_id: Joi.string().required()
});
export const apiMatrixUpdateSchemaJoi = Joi.object().keys({
	id: Joi.string().required(),
	module: Joi.string().required(),
	priority: Joi.string().required().valid('critical', 'high', 'medium', 'low'),
	total_apis: Joi.number().integer().positive().allow(0).required(),
	total_TCs: Joi.number().integer().positive().allow(0).required(),
	total_TCs_exec: Joi.number().integer().positive().allow(0).required(),
	total_TCs_pass: Joi.number().integer().positive().allow(0).required(),
	total_TCs_fail: Joi.number().integer().positive().allow(0).required(),
	blocked_tests: Joi.number().integer().positive().allow(0).required(),
	total_defects: Joi.number().integer().positive().allow(0).required(),
	open_defects: Joi.number().integer().positive().allow(0).required(),
	total_feasible_TCs: Joi.number().integer().positive().allow(0).required(),
	total_TCs_automated: Joi.number().integer().positive().allow(0).required(),
	total_executable: Joi.number().integer().positive().allow(0).required(),
	MT_coverage: Joi.number().required(),
	blocked_execution: Joi.number().required(),
	AT_coverage: Joi.number().required()
});
