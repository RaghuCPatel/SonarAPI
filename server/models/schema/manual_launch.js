import Joi from 'joi';

export const manualLaunchSchema = Joi.object().keys({
	environment: Joi.string().valid('production', 'development').required(),
	run_id: Joi.string().required(),
	build_id: Joi.string().required(),
	project_id: Joi.string().guid().required(),
	project_code: Joi.number().required(),
	execution_date: Joi.date().required(),
	released: Joi.boolean().required(),
	source: Joi.string().required(),
	defect_finding_data: Joi.object().keys({
		total_defects: Joi.number().integer().positive().allow(0).required(),
		blockers: Joi.number().integer().positive().allow(0).required(),
		critical_defects: Joi.number().integer().positive().allow(0).required(),
		major_defects: Joi.number().integer().positive().allow(0).required(),
		minor_defects: Joi.number().integer().positive().allow(0).required(),
		rejected_defects: Joi.number().integer().positive().allow(0).required()
	}),
	defect_fix_data: Joi.object().keys({
		retested_defects: Joi.number().integer().positive().allow(0).required(),
		fixed_defects: Joi.number().integer().positive().allow(0).required()
	}),
	metrics: Joi.object().keys({
		planned_testcases: Joi.number().integer().positive().allow(0).required(),
		executed_testcases: Joi.number().integer().positive().allow(0).required(),
		passed_testcases: Joi.number().integer().positive().allow(0).required(),
		failed_testcases: Joi.number().integer().positive().allow(0).required(),
		blocked_testcases: Joi.number().integer().positive().allow(0).required(),
		execution_time: Joi.number().integer().positive().allow(0).required()
	}),
	new_testcases_added: Joi.object().keys({
		p0: Joi.number().integer().positive().allow(0).required(),
		p1: Joi.number().integer().positive().allow(0).required(),
		p2: Joi.number().integer().positive().allow(0).required(),
		p3: Joi.number().integer().positive().allow(0).required(),
		p4: Joi.number().integer().positive().allow(0).required(),
		total_new_testcases: Joi.number().integer().positive().allow(0).required()
	}),
	defect_rejected_data: Joi.object().keys({
		blockers: Joi.number().integer().positive().allow(0).required(),
		critical_defects: Joi.number().integer().positive().allow(0).required(),
		major_defects: Joi.number().integer().positive().allow(0).required(),
		minor_defects: Joi.number().integer().positive().allow(0).required()
	}),
	testcases_updated: Joi.object().keys({
		p0: Joi.number().integer().positive().allow(0).required(),
		p1: Joi.number().integer().positive().allow(0).required(),
		p2: Joi.number().integer().positive().allow(0).required(),
		p3: Joi.number().integer().positive().allow(0).required(),
		p4: Joi.number().integer().positive().allow(0).required(),
		total_updated_testcases: Joi.number().integer().positive().allow(0).required()
	})
});
export const updateManualLaunchSchema = Joi.object().keys({
	execution_date: Joi.date().required(),
	released: Joi.boolean().required(),
	defect_finding_data: Joi.object().keys({
		total_defects: Joi.number().integer().positive().allow(0).required(),
		blockers: Joi.number().integer().positive().allow(0).required(),
		critical_defects: Joi.number().integer().positive().allow(0).required(),
		major_defects: Joi.number().integer().positive().allow(0).required(),
		minor_defects: Joi.number().integer().positive().allow(0).required(),
		rejected_defects: Joi.number().integer().positive().allow(0).required()
	}),
	defect_fix_data: Joi.object().keys({
		retested_defects: Joi.number().integer().positive().allow(0).required(),
		fixed_defects: Joi.number().integer().positive().allow(0).required()
	}),
	metrics: Joi.object().keys({
		planned_testcases: Joi.number().integer().positive().allow(0).required(),
		executed_testcases: Joi.number().integer().positive().allow(0).required(),
		passed_testcases: Joi.number().integer().positive().allow(0).required(),
		failed_testcases: Joi.number().integer().positive().allow(0).required(),
		blocked_testcases: Joi.number().integer().positive().allow(0).required(),
		execution_time: Joi.number().integer().positive().allow(0).required()
	}),
	new_testcases_added: Joi.object().keys({
		p0: Joi.number().integer().positive().allow(0).required(),
		p1: Joi.number().integer().positive().allow(0).required(),
		p2: Joi.number().integer().positive().allow(0).required(),
		p3: Joi.number().integer().positive().allow(0).required(),
		p4: Joi.number().integer().positive().allow(0).required(),
		total_new_testcases: Joi.number().integer().positive().allow(0).required()
	}),
	defect_rejected_data: Joi.object().keys({
		blockers: Joi.number().integer().positive().allow(0).required(),
		critical_defects: Joi.number().integer().positive().allow(0).required(),
		major_defects: Joi.number().integer().positive().allow(0).required(),
		minor_defects: Joi.number().integer().positive().allow(0).required()
	}),
	testcases_updated: Joi.object().keys({
		p0: Joi.number().integer().positive().allow(0).required(),
		p1: Joi.number().integer().positive().allow(0).required(),
		p2: Joi.number().integer().positive().allow(0).required(),
		p3: Joi.number().integer().positive().allow(0).required(),
		p4: Joi.number().integer().positive().allow(0).required(),
		total_updated_testcases: Joi.number().integer().positive().allow(0).required()
	})
});
