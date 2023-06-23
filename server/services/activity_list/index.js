import ActivityList from '../../models/activity_list';
import {
	activityListSchema,
	activityListUpdateSchema
} from '../../models/schema/activity_list';
import {
	generateBadRequestResponse,
	generateInternalServerErrorRepsonse
} from '../../utils/errorHandler';
import { DEFAULT_PAGE_SIZE } from '../../config';

export async function createActivityList(tenantId, activityListBody) {
	try {
		const _res = activityListSchema.validate(activityListBody);
		if (_res.error) {
			return Promise.reject(
				generateBadRequestResponse(new Error(), _res.error.message)
			);
		}
		const existingItem = await ActivityList.query().findOne({
			activity_name: activityListBody.activity_name,
			tenant_id: tenantId
		});
		if (existingItem) {
			return Promise.reject(
				generateBadRequestResponse(new Error(), 'activity name already exists')
			);
		}
		let activityList = null;
		activityList = await ActivityList.query().insertAndFetch({
			activity_name: activityListBody.activity_name,
			tenant_id: tenantId
		});
		return Promise.resolve(activityList);
	} catch (error) {
		return Promise.reject(
			await generateInternalServerErrorRepsonse(error, 'createActivityList')
		);
	}
}

export async function getActivityList(tenantId, key, pageSize, pageNumber) {
	try {
		if (!pageSize) pageSize = DEFAULT_PAGE_SIZE;
		if (!pageNumber) pageNumber = 0;

		const qb = ActivityList.query()
			.select('id', 'activity_name')
			.where('tenant_id', tenantId);

		if (key) {
			qb.where('activity_name', 'ilike', `%${key}%`);
		}

		const result = await qb
			.orderBy('activity_name', 'DESC')
			.page(pageNumber, pageSize);
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(
			await generateInternalServerErrorRepsonse(error, 'getActivityList')
		);
	}
}

export async function getAllActivityList(tenantId) {
	try {
		const qb = ActivityList.query()
			.select('id', 'activity_name')
			.where('tenant_id', tenantId);

		const result = await qb
			.orderBy('activity_name', 'DESC');
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(
			await generateInternalServerErrorRepsonse(error, 'getAllActivityList')
		);
	}
}

export async function updateActivityList(
	tenantId,
	activityListId,
	activityListBody
) {
	try {
		const activityList = await ActivityList.query().findOne({
			id: activityListId
		});

		if (!activityList) {
			return Promise.reject(
				generateBadRequestResponse(new Error(), 'Activity not found')
			);
		}

		if (activityList.tenant_id !== tenantId) {
			return Promise.reject(
				generateBadRequestResponse(new Error(), 'No access')
			);
		}

		const _res = activityListUpdateSchema.validate(activityListBody);
		if (_res.error) {
			return Promise.reject(
				generateBadRequestResponse(new Error(), _res.error.message)
			);
		}

		const result = await ActivityList.query()
			.select('id', 'activity_name')
			.patchAndFetchById(activityListId, {
				activity_name: activityListBody.activity_name
			});

		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(
			await generateInternalServerErrorRepsonse(error, 'updateActivityList')
		);
	}
}

export async function deleteActivityList(tenantId, activityListId) {
	try {
		const activityList = await ActivityList.query().findById(activityListId);
		if (!activityList) {
			return Promise.reject(
				generateBadRequestResponse(new Error(), 'Activity not found')
			);
		}

		if (activityList.tenant_id !== tenantId) {
			return Promise.reject(
				generateBadRequestResponse(new Error(), 'No access')
			);
		}

		await ActivityList.query().delete().where({ id: activityListId });

		return Promise.resolve(activityList);
	} catch (error) {
		return Promise.reject(
			await generateInternalServerErrorRepsonse(error, 'deleteActivityList')
		);
	}
}
