import Joi from 'joi';

export const activityListSchema = Joi.object().keys({
	activity_name: Joi.string().required()
});
export const activityListUpdateSchema = Joi.object().keys({
	activity_name: Joi.string()
});
