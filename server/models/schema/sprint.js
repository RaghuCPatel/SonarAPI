import Joi from 'joi';

export const projectSprintSchema = Joi.object().keys({
	sprint_name: Joi.string().required(),
	start_date: Joi.date().required(),
	end_date: Joi.date().required(),
	project_id: Joi.string().guid().required(),
	goal: Joi.string()
});
