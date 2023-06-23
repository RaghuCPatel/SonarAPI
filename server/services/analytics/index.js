import { generateBadRequestResponse, generateInternalServerErrorRepsonse } from '../../utils/errorHandler';
import TenantProject from '../../models/tenant_project';
import { ProjectBuild } from '../../models/mongoose/build';
import { ROLES } from '../constants';
import ProjectUser from '../../models/project_user';
import { ManualLaunch } from '../../models/mongoose/manual_launch';
import { AutomationLaunch } from '../../models/mongoose/automation_launch';
import { Activity } from '../../models/mongoose/activity';
import { Sprint } from '../../models/mongoose/sprint';

export async function getTestExecCoverage(userId, roleId, projectId, tenantId, startDate, endDate, pageSize, pageNumber) {
	try {
		if (roleId !== ROLES.TENANT_ADMIN) {
			const projectUser = await ProjectUser.query().findOne({ user_id: userId, project_id: projectId });
			if (!projectUser) return Promise.reject(generateBadRequestResponse(new Error(), 'No access to this project'));
		}
		const project = await TenantProject.query().findById(projectId);
		if (!project) return Promise.reject(generateBadRequestResponse(new Error(), 'Project not found'));

		if (project.tenant_id !== tenantId) return Promise.reject(generateBadRequestResponse(new Error(), 'No access'));

		let sprint = null;
		let query = {};
		if (startDate && endDate) {
			sprint = await Sprint.findOne({ start_date: startDate, end_date: endDate, project_id: projectId });
			if (!sprint) return Promise.reject(generateBadRequestResponse(new Error(), 'Sprint not found'));
			query = {
				sprint: sprint.id,
				project_id: projectId
			};
		} else {
			query = {
				project_id: projectId
			};
		}

		const qb = ProjectBuild.find(query);

		const count = await ProjectBuild.countDocuments(query);

		if (!pageSize) pageSize = count;
		if (!pageNumber) pageNumber = 0;

		const builds = await qb
			.select('id mlaunches build_number alaunches sprint')
			.populate('mlaunches alaunches sprint', 'metrics passed_testcases failed_testcases duration start_date end_date project_id new_testcases_added')
			.sort({ createdAt: 'asc' })
			.limit(pageSize)
			.skip(pageNumber * pageSize);

		const _builds = [];

		builds.forEach(build => {
			_builds.push({
				id: build.id,
				build_number: build.build_number,
				sprint: build.sprint,
				execution_coverage: build.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.metrics.executed_testcases;
				}, 0) / build.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.metrics.planned_testcases;
				}, 0),
				blocked_execution_coverage: build.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.metrics.blocked_testcases;
				}, 0) / build.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.metrics.planned_testcases;
				}, 0),
				passed_testcases: build.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.metrics.passed_testcases;
				}, 0),
				failed_testcases: build.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.metrics.failed_testcases;
				}, 0),
				manual_executed_testcases: build.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.metrics.executed_testcases;
				}, 0),
				automation_executed_testcases: build.alaunches.reduce(function(sum, alaunch) {
					return sum + alaunch.passed_testcases;
				}, 0) + build.alaunches.reduce(function(sum, alaunch) {
					return sum + alaunch.failed_testcases;
				}, 0),
				manual_execution_time: (build.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.metrics.execution_time;
				}, 0)) / 60,
				automation_execution_time: (build.alaunches.reduce(function(sum, alaunch) {
					return sum + alaunch.duration;
				}, 0)) / 3600000,
				automation_passed_testcases: build.alaunches.reduce(function(sum, alaunch) {
					return sum + alaunch.passed_testcases;
				}, 0),
				manual_passed_testcases: build.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.metrics.passed_testcases;
				}, 0),
				automation_failed_testcases: build.alaunches.reduce(function(sum, alaunch) {
					return sum + alaunch.failed_testcases;
				}, 0),
				manual_failed_testcases: build.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.metrics.failed_testcases;
				}, 0),
				new_testcases_added: build.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.new_testcases_added.total_new_testcases;
				}, 0)
			});
		});

		const result = {
			builds: _builds,
			total: count,
			project: project
		};
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'getTestExecCoverage'));
	}
}
export async function getDataFortiles(userId, roleId, projectId, tenantId, buildId, startDate, endDate, pageSize, pageNumber) {
	try {
		if (roleId !== ROLES.TENANT_ADMIN) {
			const projectUser = await ProjectUser.query().findOne({ user_id: userId, project_id: projectId });
			if (!projectUser) return Promise.reject(generateBadRequestResponse(new Error(), 'No access to this project'));
		}
		const project = await TenantProject.query().findById(projectId);
		if (!project) return Promise.reject(generateBadRequestResponse(new Error(), 'Project not found'));

		if (project.tenant_id !== tenantId) return Promise.reject(generateBadRequestResponse(new Error(), 'No access'));

		let sprint = null;
		let query = {};
		if (startDate && endDate) {
			sprint = await Sprint.findOne({ start_date: startDate, end_date: endDate, project_id: projectId });
			if (!sprint) return Promise.reject(generateBadRequestResponse(new Error(), 'Sprint not found'));
			query = {
				sprint: sprint.id,
				project_id: projectId
			};
		} else if (buildId) {
			query.build = buildId;
		} else {
			query = {
				project_id: projectId
			};
		}

		const mlaunches = await ManualLaunch.find(query).select('metrics new_testcases_added defect_finding_data defect_rejected_data');

		const alaunches = await AutomationLaunch.find(query);

		const activities = await Activity.find(query);
		let builds = 0;

		if (!buildId) {
			builds = await ProjectBuild.countDocuments(query);
		}

		const result = {
			total_tcs: mlaunches.reduce(function(sum, mlaunch) {
				return sum + mlaunch.new_testcases_added.total_new_testcases;
			}, 0),
			manual_duration: mlaunches.reduce(function(sum, mlaunch) {
				return sum + mlaunch.metrics.execution_time;
			}, 0) / 60,
			automation_duration: alaunches.reduce(function(sum, alaunch) {
				return sum + alaunch.duration;
			}, 0) / 3600000,
			sum_duration: (mlaunches.reduce(function(sum, mlaunch) {
				return sum + mlaunch.metrics.execution_time;
			}, 0) / 60) + ((alaunches.reduce(function(sum, alaunch) {
				return sum + alaunch.duration;
			}, 0)) / 3600000),
			total_launches: mlaunches.length + alaunches.length,
			total_exec_tcs: mlaunches.reduce(function(sum, mlaunch) {
				return sum + mlaunch.metrics.executed_testcases;
			}, 0),
			total_plan_tcs: mlaunches.reduce(function(sum, mlaunch) {
				return sum + mlaunch.metrics.planned_testcases;
			}, 0),
			mlcount: mlaunches.length,
			alcount: alaunches.length,
			automation_pass_tcs: alaunches.reduce(function(sum, alaunch) {
				return sum + alaunch.passed_testcases;
			}, 0),
			automation_total_tcs: alaunches.reduce(function(sum, alaunch) {
				return sum + alaunch.total_testcases;
			}, 0),
			manual_pass_tcs: mlaunches.reduce(function(sum, mlaunch) {
				return sum + mlaunch.metrics.passed_testcases;
			}, 0),
			manual_total_tcs: mlaunches.reduce(function(sum, mlaunch) {
				return sum + mlaunch.metrics.executed_testcases;
			}, 0),
			total_defects: mlaunches.reduce(function(sum, mlaunch) {
				return sum + mlaunch.defect_finding_data.total_defects;
			}, 0),
			total_rejected_defects: mlaunches.reduce(function(sum, mlaunch) {
				return sum + mlaunch.defect_finding_data.rejected_defects;
			}, 0),
			total_variance: activities.reduce(function(sum, activity) {
				if (!activity.variance) activity.variance = 0;
				return sum + activity.variance;
			}, 0),
			p0_defects: mlaunches.reduce(function(sum, mlaunch) {
				return sum + mlaunch.defect_finding_data.blockers;
			}, 0),
			p1_defects: mlaunches.reduce(function(sum, mlaunch) {
				return sum + mlaunch.defect_finding_data.critical_defects;
			}, 0),
			p2_defects: mlaunches.reduce(function(sum, mlaunch) {
				return sum + mlaunch.defect_finding_data.major_defects;
			}, 0),
			p3_defects: mlaunches.reduce(function(sum, mlaunch) {
				return sum + mlaunch.defect_finding_data.minor_defects;
			}, 0),
			blocker_rejected_defects: mlaunches.reduce(function(sum, mlaunch) {
				return sum + mlaunch.defect_rejected_data.blockers;
			}, 0),
			critical_rejected_defects: mlaunches.reduce(function(sum, mlaunch) {
				return sum + mlaunch.defect_rejected_data.critical_defects;
			}, 0),
			major_rejected_defects: mlaunches.reduce(function(sum, mlaunch) {
				return sum + mlaunch.defect_rejected_data.major_defects;
			}, 0),
			minor_rejected_defects: mlaunches.reduce(function(sum, mlaunch) {
				return sum + mlaunch.defect_rejected_data.minor_defects;
			}, 0),
			activity_count: activities.length,
			build_count: builds

		};

		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'getDataFortiles'));
	}
}
export async function getDefectsData(userId, roleId, projectId, tenantId, startDate, endDate, pageSize, pageNumber) {
	try {
		if (roleId !== ROLES.TENANT_ADMIN) {
			const projectUser = await ProjectUser.query().findOne({ user_id: userId, project_id: projectId });
			if (!projectUser) return Promise.reject(generateBadRequestResponse(new Error(), 'No access to this project'));
		}
		const project = await TenantProject.query().findById(projectId);
		if (!project) return Promise.reject(generateBadRequestResponse(new Error(), 'Project not found'));

		if (project.tenant_id !== tenantId) return Promise.reject(generateBadRequestResponse(new Error(), 'No access'));

		let sprint = null;
		let query = {};
		if (startDate && endDate) {
			sprint = await Sprint.findOne({ start_date: startDate, end_date: endDate, project_id: projectId });
			if (!sprint) return Promise.reject(generateBadRequestResponse(new Error(), 'Sprint not found'));
			query = {
				sprint: sprint.id,
				project_id: projectId
			};
		} else {
			query = {
				project_id: projectId
			};
		}

		const qb = ProjectBuild.find(query);

		const count = await ProjectBuild.countDocuments(query);

		if (!pageSize) pageSize = count;
		if (!pageNumber) pageNumber = 0;

		const builds = await qb
			.select('id mlaunches build_number alaunches sprint')
			.populate('mlaunches alaunches sprint')
			.sort({ createdAt: 'asc' })
			.limit(pageSize)
			.skip(pageNumber * pageSize);

		const _builds = [];

		builds.forEach(build => {
			_builds.push({
				id: build.id,
				build_number: build.build_number,
				sprint: build.sprint,
				total_defects_raised: build.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.defect_finding_data.total_defects;
				}, 0),
				total_defects_fixed: build.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.defect_fix_data.fixed_defects;
				}, 0),
				total_defects_retested: build.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.defect_fix_data.retested_defects;
				}, 0),
				total_defects_rejected: build.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.defect_finding_data.rejected_defects;
				}, 0),
				total_defects_accepted: build.mlaunches.reduce(function(sum, mlaunch) {
					return sum + (mlaunch.defect_finding_data.total_defects - mlaunch.defect_finding_data.rejected_defects);
				}, 0),
				total_blocker_defects: build.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.defect_finding_data.blockers;
				}, 0),
				total_minor_defects: build.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.defect_finding_data.minor_defects;
				}, 0),
				total_major_defects: build.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.defect_finding_data.major_defects;
				}, 0),
				total_critical_defects: build.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.defect_finding_data.critical_defects;
				}, 0),
				MTTD: ((build.mlaunches.reduce(function(sum, mlaunch) {
					return sum + (mlaunch.metrics.execution_time / 60);
				}, 0)) + (build.alaunches.reduce(function(sum, alaunch) {
					return sum + alaunch.duration;
				}, 0)) / 3600000) / (build.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.defect_finding_data.total_defects;
				}, 0) + build.alaunches.reduce(function(sum, alaunch) {
					return sum + alaunch.failed_testcases;
				}, 0)),
				rejected_defects: {
					blockers: build.mlaunches.reduce(function(sum, mlaunch) {
						return sum + mlaunch.defect_rejected_data.blockers;
					}, 0),
					critical: build.mlaunches.reduce(function(sum, mlaunch) {
						return sum + mlaunch.defect_rejected_data.critical_defects;
					}, 0),
					major: build.mlaunches.reduce(function(sum, mlaunch) {
						return sum + mlaunch.defect_rejected_data.major_defects;
					}, 0),
					minor: build.mlaunches.reduce(function(sum, mlaunch) {
						return sum + mlaunch.defect_rejected_data.minor_defects;
					}, 0)
				}
			});
		});
		const result = {
			builds: _builds,
			total: count,
			project: project
		};
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'getDefectsData'));
	}
}
export async function getActivitiesData(userId, roleId, projectId, tenantId, startDate, endDate, pageSize, pageNumber) {
	try {
		if (roleId !== ROLES.TENANT_ADMIN) {
			const projectUser = await ProjectUser.query().findOne({ user_id: userId, project_id: projectId });
			if (!projectUser) return Promise.reject(generateBadRequestResponse(new Error(), 'No access to this project'));
		}
		const project = await TenantProject.query().findById(projectId);
		if (!project) return Promise.reject(generateBadRequestResponse(new Error(), 'Project not found'));

		if (project.tenant_id !== tenantId) return Promise.reject(generateBadRequestResponse(new Error(), 'No access'));

		let sprint = null;
		let query = {};
		if (startDate && endDate) {
			sprint = await Sprint.findOne({ start_date: startDate, end_date: endDate, project_id: projectId });
			if (!sprint) return Promise.reject(generateBadRequestResponse(new Error(), 'Sprint not found'));
			query = {
				sprint: sprint.id,
				project_id: projectId
			};
		} else {
			query = {
				project_id: projectId
			};
		}

		const count = await Activity.countDocuments(query);

		if (!pageSize) pageSize = count;
		if (!pageNumber) pageNumber = 0;

		const activities = await Activity.find(query)
			.select('mlaunches display_name alaunches estimated_time actual_time  variance build')
			.populate('mlaunches alaunches build', 'defect_finding_data metrics duration build_number')
			.sort({ createdAt: 'asc' })
			.limit(pageSize)
			.skip(pageNumber * pageSize);

		const _actvities = [];

		activities.forEach(activity => {
			_actvities.push({
				display_name: activity.display_name,
				build_number: activity.build.build_number,
				total_defects_raised: activity.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.defect_finding_data.total_defects;
				}, 0),
				total_defects_rejected: activity.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.defect_finding_data.rejected_defects;
				}, 0),
				total_defects_accepted: activity.mlaunches.reduce(function(sum, mlaunch) {
					return sum + (mlaunch.defect_finding_data.total_defects - mlaunch.defect_finding_data.rejected_defects);
				}, 0),
				manual_execution_time: (activity.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.metrics.execution_time;
				}, 0)) / 60,
				automation_execution_time: (activity.alaunches.reduce(function(sum, alaunch) {
					return sum + alaunch.duration;
				}, 0)) / 3600000,
				variance_data: {
					variance: activity.variance,
					estimated_time: activity.estimated_time,
					actual_time: activity.actual_time
				}
			});
		});

		const result = {
			activities: _actvities,
			total: count
		};

		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'getActivitiesData'));
	}
}
export async function getDefectsDataForEachBuild(userId, roleId, projectId, tenantId, buildId, pageSize, pageNumber) {
	try {
		if (roleId !== ROLES.TENANT_ADMIN) {
			const projectUser = await ProjectUser.query().findOne({ user_id: userId, project_id: projectId });
			if (!projectUser) return Promise.reject(generateBadRequestResponse(new Error(), 'No access to this project'));
		}
		const project = await TenantProject.query().findById(projectId);
		if (!project) return Promise.reject(generateBadRequestResponse(new Error(), 'Project not found'));

		if (project.tenant_id !== tenantId) return Promise.reject(generateBadRequestResponse(new Error(), 'No access'));

		const query = {
			build: buildId
		};

		const qb = Activity.find(query);

		const count = await Activity.countDocuments(query);

		if (!pageSize) pageSize = count;
		if (!pageNumber) pageNumber = 0;

		const activities = await qb
			.select('mlaunches display_name alaunches')
			.populate('mlaunches alaunches')
			.sort({ createdAt: 'asc' })
			.limit(pageSize)
			.skip(pageNumber * pageSize);

		const _actvities = [];

		activities.forEach(activity => {
			_actvities.push({
				display_name: activity.display_name,
				total_defects_raised: activity.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.defect_finding_data.total_defects;
				}, 0),
				total_defects_fixed: activity.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.defect_fix_data.fixed_defects;
				}, 0),
				total_defects_retested: activity.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.defect_fix_data.retested_defects;
				}, 0),
				total_defects_rejected: activity.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.defect_finding_data.rejected_defects;
				}, 0),
				total_defects_accepted: activity.mlaunches.reduce(function(sum, mlaunch) {
					return sum + (mlaunch.defect_finding_data.total_defects - mlaunch.defect_finding_data.rejected_defects);
				}, 0),
				total_blocker_defects: activity.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.defect_finding_data.blockers;
				}, 0),
				total_minor_defects: activity.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.defect_finding_data.minor_defects;
				}, 0),
				total_major_defects: activity.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.defect_finding_data.major_defects;
				}, 0),
				total_critical_defects: activity.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.defect_finding_data.critical_defects;
				}, 0),
				MTTD: ((activity.mlaunches.reduce(function(sum, mlaunch) {
					return sum + (mlaunch.metrics.execution_time / 60);
				}, 0)) + (activity.alaunches.reduce(function(sum, alaunch) {
					return sum + alaunch.duration;
				}, 0)) / 3600000) / (activity.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.defect_finding_data.total_defects;
				}, 0) + activity.alaunches.reduce(function(sum, alaunch) {
					return sum + alaunch.failed_testcases;
				}, 0)),
				rejected_defects: {
					blockers: activity.mlaunches.reduce(function(sum, mlaunch) {
						return sum + mlaunch.defect_rejected_data.blockers;
					}, 0),
					critical: activity.mlaunches.reduce(function(sum, mlaunch) {
						return sum + mlaunch.defect_rejected_data.critical_defects;
					}, 0),
					major: activity.mlaunches.reduce(function(sum, mlaunch) {
						return sum + mlaunch.defect_rejected_data.major_defects;
					}, 0),
					minor: activity.mlaunches.reduce(function(sum, mlaunch) {
						return sum + mlaunch.defect_rejected_data.minor_defects;
					}, 0)
				}
			});
		});
		const result = {
			activities: _actvities,
			total: count
		};
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'getDefectsDataForEachBuild'));
	}
}
export async function getTestExecCoverageForEachBuild(userId, roleId, projectId, tenantId, buildId, pageSize, pageNumber) {
	try {
		if (roleId !== ROLES.TENANT_ADMIN) {
			const projectUser = await ProjectUser.query().findOne({ user_id: userId, project_id: projectId });
			if (!projectUser) return Promise.reject(generateBadRequestResponse(new Error(), 'No access to this project'));
		}
		const project = await TenantProject.query().findById(projectId);
		if (!project) return Promise.reject(generateBadRequestResponse(new Error(), 'Project not found'));

		if (project.tenant_id !== tenantId) return Promise.reject(generateBadRequestResponse(new Error(), 'No access'));

		const query = {
			build: buildId
		};

		const qb = Activity.find(query);

		const count = await Activity.countDocuments(query);

		if (!pageSize) pageSize = count;
		if (!pageNumber) pageNumber = 0;

		const activities = await qb
			.select('variance estimated_time actual_time mlaunches display_name alaunches build')
			.populate('mlaunches alaunches build', 'metrics passed_testcases failed_testcases duration new_testcases_added build_number')
			.sort({ createdAt: 'asc' })
			.limit(pageSize)
			.skip(pageNumber * pageSize);

		const _actvities = [];

		activities.forEach(activity => {
			_actvities.push({
				display_name: activity.display_name,
				build_number: activity.build.build_number,
				execution_coverage: activity.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.metrics.executed_testcases;
				}, 0) / activity.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.metrics.planned_testcases;
				}, 0),
				blocked_execution_coverage: activity.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.metrics.blocked_testcases;
				}, 0) / activity.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.metrics.planned_testcases;
				}, 0),
				passed_testcases: activity.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.metrics.passed_testcases;
				}, 0),
				failed_testcases: activity.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.metrics.failed_testcases;
				}, 0),
				manual_executed_testcases: activity.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.metrics.executed_testcases;
				}, 0),
				automation_executed_testcases: activity.alaunches.reduce(function(sum, alaunch) {
					return sum + alaunch.passed_testcases;
				}, 0) + activity.alaunches.reduce(function(sum, alaunch) {
					return sum + alaunch.failed_testcases;
				}, 0),
				manual_execution_time: (activity.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.metrics.execution_time;
				}, 0)) / 60,
				automation_execution_time: (activity.alaunches.reduce(function(sum, alaunch) {
					return sum + alaunch.duration;
				}, 0)) / 3600000,
				automation_passed_testcases: activity.alaunches.reduce(function(sum, alaunch) {
					return sum + alaunch.passed_testcases;
				}, 0),
				manual_passed_testcases: activity.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.metrics.passed_testcases;
				}, 0),
				automation_failed_testcases: activity.alaunches.reduce(function(sum, alaunch) {
					return sum + alaunch.failed_testcases;
				}, 0),
				manual_failed_testcases: activity.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.metrics.failed_testcases;
				}, 0),
				new_testcases_added: activity.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.new_testcases_added.total_new_testcases;
				}, 0),
				variance_data: {
					variance: activity.variance,
					estimated_time: activity.estimated_time,
					actual_time: activity.actual_time
				}
			});
		});

		const result = {
			activities: _actvities,
			total: count
		};
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'getTestExecCoverage'));
	}
}
export async function getProjectTestExecCoverage(userId, roleId, tenantId, projectIds) {
	try {
		let projects = [];
		let _projects = [];
		const projectsData = [];
		if (roleId !== ROLES.TENANT_ADMIN) {
			if (projectIds && projectIds.length > 0) {
				_projects = await ProjectUser.query()
					.where({ user_id: userId })
					.whereIn('project_id', projectIds)
					.select('project_id')
					.withGraphFetched('project');
				_projects.forEach(_project => {
					projects.push({
						id: _project.project_id,
						display_name: _project.project.display_name
					});
				});
			} else {
				_projects = await ProjectUser.query().where({ user_id: userId }).select('project_id').withGraphFetched('project');
			}
		} else {
			if (projectIds && projectIds.length > 0) {
				projects = await TenantProject.query()
					.where({ tenant_id: tenantId })
					.whereIn('id', projectIds);
			} else {
				projects = await TenantProject.query().where({ tenant_id: tenantId });
			}
		}
		for (const project of projects) {
			const qb = ProjectBuild.find({ project_id: project.id });

			const builds = await qb
				.select('id mlaunches build_number alaunches sprint')
				.populate('mlaunches alaunches sprint', 'metrics passed_testcases failed_testcases duration start_date end_date project_id new_testcases_added')
				.sort({ createdAt: 'asc' });

			const _builds = [];

			builds.forEach(build => {
				_builds.push({
					execution_coverage: build.mlaunches.reduce(function(sum, mlaunch) {
						return sum + mlaunch.metrics.executed_testcases;
					}, 0) / build.mlaunches.reduce(function(sum, mlaunch) {
						return sum + mlaunch.metrics.planned_testcases;
					}, 0),
					blocked_execution_coverage: build.mlaunches.reduce(function(sum, mlaunch) {
						return sum + mlaunch.metrics.blocked_testcases;
					}, 0) / build.mlaunches.reduce(function(sum, mlaunch) {
						return sum + mlaunch.metrics.planned_testcases;
					}, 0),
					passed_testcases: build.mlaunches.reduce(function(sum, mlaunch) {
						return sum + mlaunch.metrics.passed_testcases;
					}, 0),
					failed_testcases: build.mlaunches.reduce(function(sum, mlaunch) {
						return sum + mlaunch.metrics.failed_testcases;
					}, 0),
					manual_executed_testcases: build.mlaunches.reduce(function(sum, mlaunch) {
						return sum + mlaunch.metrics.executed_testcases;
					}, 0),
					automation_executed_testcases: build.alaunches.reduce(function(sum, alaunch) {
						return sum + alaunch.passed_testcases;
					}, 0) + build.alaunches.reduce(function(sum, alaunch) {
						return sum + alaunch.failed_testcases;
					}, 0),
					manual_execution_time: (build.mlaunches.reduce(function(sum, mlaunch) {
						return sum + mlaunch.metrics.execution_time;
					}, 0)) / 60,
					automation_execution_time: (build.alaunches.reduce(function(sum, alaunch) {
						return sum + alaunch.duration;
					}, 0)) / 3600000,
					automation_passed_testcases: build.alaunches.reduce(function(sum, alaunch) {
						return sum + alaunch.passed_testcases;
					}, 0),
					manual_passed_testcases: build.mlaunches.reduce(function(sum, mlaunch) {
						return sum + mlaunch.metrics.passed_testcases;
					}, 0),
					automation_failed_testcases: build.alaunches.reduce(function(sum, alaunch) {
						return sum + alaunch.failed_testcases;
					}, 0),
					manual_failed_testcases: build.mlaunches.reduce(function(sum, mlaunch) {
						return sum + mlaunch.metrics.failed_testcases;
					}, 0),
					new_testcases_added: build.mlaunches.reduce(function(sum, mlaunch) {
						return sum + mlaunch.new_testcases_added.total_new_testcases;
					}, 0)
				});
			});
			projectsData.push(
				{
					project_id: project.id,
					display_name: project.display_name,
					execution_coverage: _builds.reduce(function(sum, _build) {
						return sum + _build.execution_coverage;
					}, 0),
					blocked_execution_coverage: _builds.reduce(function(sum, _build) {
						return sum + _build.blocked_execution_coverage;
					}, 0),
					passed_testcases: _builds.reduce(function(sum, _build) {
						return sum + _build.passed_testcases;
					}, 0),
					failed_testcases: _builds.reduce(function(sum, _build) {
						return sum + _build.failed_testcases;
					}, 0),
					manual_executed_testcases: _builds.reduce(function(sum, _build) {
						return sum + _build.manual_executed_testcases;
					}, 0),
					automation_executed_testcases: _builds.reduce(function(sum, _build) {
						return sum + _build.automation_executed_testcases;
					}, 0),
					manual_execution_time: _builds.reduce(function(sum, _build) {
						return sum + _build.manual_execution_time;
					}, 0),
					automation_execution_time: _builds.reduce(function(sum, _build) {
						return sum + _build.automation_execution_time;
					}, 0),
					automation_passed_testcases: _builds.reduce(function(sum, _build) {
						return sum + _build.automation_passed_testcases;
					}, 0),
					manual_passed_testcases: _builds.reduce(function(sum, _build) {
						return sum + _build.manual_passed_testcases;
					}, 0),
					automation_failed_testcases: _builds.reduce(function(sum, _build) {
						return sum + _build.automation_failed_testcases;
					}, 0),
					manual_failed_testcases: _builds.reduce(function(sum, _build) {
						return sum + _build.manual_failed_testcases;
					}, 0),
					new_testcases_added: _builds.reduce(function(sum, _build) {
						return sum + _build.new_testcases_added;
					}, 0)
				}
			);
		}
		const result = {
			projects: projectsData,
			total: projects.length
		};
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'getProjectTestExecCoverage'));
	}
}
export async function getProjectDefetcsData(userId, roleId, tenantId, projectIds) {
	try {
		let projects = [];
		const projectsData = [];
		let _projects = [];
		if (roleId !== ROLES.TENANT_ADMIN) {
			if (projectIds && projectIds.length > 0) {
				_projects = await ProjectUser.query()
					.where({ user_id: userId })
					.whereIn('project_id', projectIds)
					.select('project_id')
					.withGraphFetched('project');
				_projects.forEach(_project => {
					projects.push({
						id: _project.project_id,
						display_name: _project.project.display_name
					});
				});
			} else {
				_projects = await ProjectUser.query().where({ user_id: userId }).select('project_id').withGraphFetched('project');
			}
		} else {
			if (projectIds && projectIds.length > 0) {
				projects = await TenantProject.query()
					.where({ tenant_id: tenantId })
					.whereIn('id', projectIds);
			} else {
				projects = await TenantProject.query().where({ tenant_id: tenantId });
			}
		}

		console.log(projects);
		for (const project of projects) {
			const qb = ProjectBuild.find({ project_id: project.id });

			const builds = await qb
				.select('id mlaunches build_number alaunches sprint')
				.populate('mlaunches alaunches sprint')
				.sort({ createdAt: 'asc' });

			const _builds = [];

			builds.forEach(build => {
				_builds.push({
					total_defects_raised: build.mlaunches.reduce(function(sum, mlaunch) {
						return sum + mlaunch.defect_finding_data.total_defects;
					}, 0),
					total_defects_fixed: build.mlaunches.reduce(function(sum, mlaunch) {
						return sum + mlaunch.defect_fix_data.fixed_defects;
					}, 0),
					total_defects_retested: build.mlaunches.reduce(function(sum, mlaunch) {
						return sum + mlaunch.defect_fix_data.retested_defects;
					}, 0),
					total_defects_rejected: build.mlaunches.reduce(function(sum, mlaunch) {
						return sum + mlaunch.defect_finding_data.rejected_defects;
					}, 0),
					total_defects_accepted: build.mlaunches.reduce(function(sum, mlaunch) {
						return sum + (mlaunch.defect_finding_data.total_defects - mlaunch.defect_finding_data.rejected_defects);
					}, 0),
					total_blocker_defects: build.mlaunches.reduce(function(sum, mlaunch) {
						return sum + mlaunch.defect_finding_data.blockers;
					}, 0),
					total_minor_defects: build.mlaunches.reduce(function(sum, mlaunch) {
						return sum + mlaunch.defect_finding_data.minor_defects;
					}, 0),
					total_major_defects: build.mlaunches.reduce(function(sum, mlaunch) {
						return sum + mlaunch.defect_finding_data.major_defects;
					}, 0),
					total_critical_defects: build.mlaunches.reduce(function(sum, mlaunch) {
						return sum + mlaunch.defect_finding_data.critical_defects;
					}, 0),
					MTTD: ((build.mlaunches.reduce(function(sum, mlaunch) {
						return sum + (mlaunch.metrics.execution_time / 60);
					}, 0)) + (build.alaunches.reduce(function(sum, alaunch) {
						return sum + alaunch.duration;
					}, 0)) / 3600000) / (build.mlaunches.reduce(function(sum, mlaunch) {
						return sum + mlaunch.defect_finding_data.total_defects;
					}, 0) + build.alaunches.reduce(function(sum, alaunch) {
						return sum + alaunch.failed_testcases;
					}, 0)),
					rejected_blocker: build.mlaunches.reduce(function(sum, mlaunch) {
						return sum + mlaunch.defect_rejected_data.blockers;
					}, 0),
					rejected_critical: build.mlaunches.reduce(function(sum, mlaunch) {
						return sum + mlaunch.defect_rejected_data.critical_defects;
					}, 0),
					rejected_major: build.mlaunches.reduce(function(sum, mlaunch) {
						return sum + mlaunch.defect_rejected_data.major_defects;
					}, 0),
					rejected_minor: build.mlaunches.reduce(function(sum, mlaunch) {
						return sum + mlaunch.defect_rejected_data.minor_defects;
					}, 0)

				});
			});
			projectsData.push(
				{
					project_id: project.id,
					display_name: project.display_name,
					total_defects_raised: _builds.reduce(function(sum, _build) {
						return sum + _build.total_defects_raised;
					}, 0),
					total_defects_fixed: _builds.reduce(function(sum, _build) {
						return sum + _build.total_defects_fixed;
					}, 0),
					total_defects_retested: _builds.reduce(function(sum, _build) {
						return sum + _build.total_defects_retested;
					}, 0),
					total_defects_rejected: _builds.reduce(function(sum, _build) {
						return sum + _build.total_defects_rejected;
					}, 0),
					total_defects_accepted: _builds.reduce(function(sum, _build) {
						return sum + _build.total_defects_accepted;
					}, 0),
					total_blocker_defects: _builds.reduce(function(sum, _build) {
						return sum + _build.total_blocker_defects;
					}, 0),
					total_minor_defects: _builds.reduce(function(sum, _build) {
						return sum + _build.total_minor_defects;
					}, 0),
					total_major_defects: _builds.reduce(function(sum, _build) {
						return sum + _build.total_major_defects;
					}, 0),
					total_critical_defects: _builds.reduce(function(sum, _build) {
						return sum + _build.total_critical_defects;
					}, 0),
					MTTD: _builds.reduce(function(sum, _build) {
						return sum + _build.MTTD;
					}, 0),
					rejected_defects: {
						blockers: _builds.reduce(function(sum, _build) {
							return sum + _build.rejected_blocker;
						}, 0),
						critical: _builds.reduce(function(sum, _build) {
							return sum + _build.rejected_critical;
						}, 0),
						major: _builds.reduce(function(sum, _build) {
							return sum + _build.rejected_major;
						}, 0),
						minor: _builds.reduce(function(sum, _build) {
							return sum + _build.rejected_minor;
						}, 0)
					}
				}
			);
		}
		const result = {
			projects: projectsData,
			total: projects.length
		};
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'getProjectDefetcsData'));
	}
}
export async function getProjectTilesData(userId, roleId, tenantId, projectIds) {
	try {
		console.log(projectIds);
		let projects = [];
		let query = {};
		const _projects = [];
		if (roleId !== ROLES.TENANT_ADMIN) {
			if (projectIds && projectIds.length > 0) {
				projects = await ProjectUser.query()
					.where({ user_id: userId })
					.whereIn('project_id', projectIds)
					.select('project_id');
				projects.forEach(project => {
					_projects.push(project.project_id
					);
				});
			} else {
				projects = await ProjectUser.query().where({ user_id: userId }).select('project_id');
				projects.forEach(project => {
					_projects.push(project.project_id
					);
				});
			}
		} else {
			if (projectIds && projectIds.length > 0) {
				projects = await TenantProject.query()
					.where({ tenant_id: tenantId })
					.whereIn('id', projectIds);
				projects.forEach(project => {
					_projects.push(project.id
					);
				});
				console.log(_projects);
			} else {
				projects = await TenantProject.query().where({ tenant_id: tenantId });
				projects.forEach(project => {
					_projects.push(project.id
					);
				});
			}
		}
		query = { project_id: { $in: _projects } };

		const mlaunches = await ManualLaunch.find(query).select('metrics new_testcases_added defect_finding_data defect_rejected_data');

		const alaunches = await AutomationLaunch.find(query);

		const activities = await Activity.find(query);
		const builds = await ProjectBuild.countDocuments(query);

		const result = {
			total_tcs: mlaunches.reduce(function(sum, mlaunch) {
				return sum + mlaunch.new_testcases_added.total_new_testcases;
			}, 0),
			manual_duration: mlaunches.reduce(function(sum, mlaunch) {
				return sum + mlaunch.metrics.execution_time;
			}, 0) / 60,
			automation_duration: alaunches.reduce(function(sum, alaunch) {
				return sum + alaunch.duration;
			}, 0) / 3600000,
			sum_duration: (mlaunches.reduce(function(sum, mlaunch) {
				return sum + mlaunch.metrics.execution_time;
			}, 0) / 60) + ((alaunches.reduce(function(sum, alaunch) {
				return sum + alaunch.duration;
			}, 0)) / 3600000),
			total_launches: mlaunches.length + alaunches.length,
			total_exec_tcs: mlaunches.reduce(function(sum, mlaunch) {
				return sum + mlaunch.metrics.executed_testcases;
			}, 0),
			total_plan_tcs: mlaunches.reduce(function(sum, mlaunch) {
				return sum + mlaunch.metrics.planned_testcases;
			}, 0),
			mlcount: mlaunches.length,
			alcount: alaunches.length,
			automation_pass_tcs: alaunches.reduce(function(sum, alaunch) {
				return sum + alaunch.passed_testcases;
			}, 0),
			automation_total_tcs: alaunches.reduce(function(sum, alaunch) {
				return sum + alaunch.total_testcases;
			}, 0),
			manual_pass_tcs: mlaunches.reduce(function(sum, mlaunch) {
				return sum + mlaunch.metrics.passed_testcases;
			}, 0),
			manual_total_tcs: mlaunches.reduce(function(sum, mlaunch) {
				return sum + mlaunch.metrics.executed_testcases;
			}, 0),
			total_defects: mlaunches.reduce(function(sum, mlaunch) {
				return sum + mlaunch.defect_finding_data.total_defects;
			}, 0),
			total_rejected_defects: mlaunches.reduce(function(sum, mlaunch) {
				return sum + mlaunch.defect_finding_data.rejected_defects;
			}, 0),
			total_variance: activities.reduce(function(sum, activity) {
				if (!activity.variance) activity.variance = 0;
				return sum + activity.variance;
			}, 0),
			p0_defects: mlaunches.reduce(function(sum, mlaunch) {
				return sum + mlaunch.defect_finding_data.blockers;
			}, 0),
			p1_defects: mlaunches.reduce(function(sum, mlaunch) {
				return sum + mlaunch.defect_finding_data.critical_defects;
			}, 0),
			p2_defects: mlaunches.reduce(function(sum, mlaunch) {
				return sum + mlaunch.defect_finding_data.major_defects;
			}, 0),
			p3_defects: mlaunches.reduce(function(sum, mlaunch) {
				return sum + mlaunch.defect_finding_data.minor_defects;
			}, 0),
			blocker_rejected_defects: mlaunches.reduce(function(sum, mlaunch) {
				return sum + mlaunch.defect_rejected_data.blockers;
			}, 0),
			critical_rejected_defects: mlaunches.reduce(function(sum, mlaunch) {
				return sum + mlaunch.defect_rejected_data.critical_defects;
			}, 0),
			major_rejected_defects: mlaunches.reduce(function(sum, mlaunch) {
				return sum + mlaunch.defect_rejected_data.major_defects;
			}, 0),
			minor_rejected_defects: mlaunches.reduce(function(sum, mlaunch) {
				return sum + mlaunch.defect_rejected_data.minor_defects;
			}, 0),
			activity_count: activities.length,
			build_count: builds

		};

		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'getProjectTilesData'));
	}
}
export async function getBuildsData(userId, roleId, tenantId, projectIds) {
	try {
		let projects = [];
		let query = {};
		const _projects = [];
		if (roleId !== ROLES.TENANT_ADMIN) {
			if (projectIds && projectIds.length > 0) {
				projects = await ProjectUser.query()
					.where({ user_id: userId })
					.whereIn('project_id', projectIds)
					.select('project_id');
				projects.forEach(project => {
					_projects.push(project.project_id
					);
				});
			} else {
				projects = await ProjectUser.query().where({ user_id: userId }).select('project_id');
				projects.forEach(project => {
					_projects.push(project.project_id
					);
				});
			}
		} else {
			if (projectIds && projectIds.length > 0) {
				projects = await TenantProject.query()
					.where({ tenant_id: tenantId })
					.whereIn('id', projectIds);
				projects.forEach(project => {
					_projects.push(project.id
					);
				});
			} else {
				projects = await TenantProject.query().where({ tenant_id: tenantId });
				projects.forEach(project => {
					_projects.push(project.id
					);
				});
			}
		}
		query = { project_id: { $in: _projects } };

		const count = await ProjectBuild.countDocuments(query);

		const builds = await ProjectBuild.find(query)
			.select('mlaunches build_number alaunches')
			.populate('mlaunches alaunches', 'defect_finding_data metrics duration')
			.sort({ createdAt: 'asc' });

		const _builds = [];

		builds.forEach(build => {
			_builds.push({
				build_number: build.build_number,
				total_defects_raised: build.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.defect_finding_data.total_defects;
				}, 0),
				total_defects_rejected: build.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.defect_finding_data.rejected_defects;
				}, 0),
				total_defects_accepted: build.mlaunches.reduce(function(sum, mlaunch) {
					return sum + (mlaunch.defect_finding_data.total_defects - mlaunch.defect_finding_data.rejected_defects);
				}, 0),
				manual_execution_time: (build.mlaunches.reduce(function(sum, mlaunch) {
					return sum + mlaunch.metrics.execution_time;
				}, 0)) / 60,
				automation_execution_time: (build.alaunches.reduce(function(sum, alaunch) {
					return sum + alaunch.duration;
				}, 0)) / 3600000
			});
		});

		const result = {
			builds: _builds,
			total: count
		};

		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'getBuildsData'));
	}
}
export async function getVarianceActivitiesData(userId, roleId, tenantId, projectIds) {
	try {
		let projects = [];
		let query = {};
		const _projects = [];
		if (roleId !== ROLES.TENANT_ADMIN) {
			if (projectIds && projectIds.length > 0) {
				projects = await ProjectUser.query()
					.where({ user_id: userId })
					.whereIn('project_id', projectIds)
					.select('project_id');
				projects.forEach(project => {
					_projects.push(project.project_id
					);
				});
			} else {
				projects = await ProjectUser.query().where({ user_id: userId }).select('project_id');
				projects.forEach(project => {
					_projects.push(project.project_id
					);
				});
			}
		} else {
			if (projectIds && projectIds.length > 0) {
				projects = await TenantProject.query()
					.where({ tenant_id: tenantId })
					.whereIn('id', projectIds);
				projects.forEach(project => {
					_projects.push(project.id
					);
				});
			} else {
				projects = await TenantProject.query().where({ tenant_id: tenantId }).select('id', 'display_name');
				projects.forEach(project => {
					_projects.push(project.id
					);
				});
			}
		}
		query = { project_id: { $in: _projects } };

		const count = await Activity.countDocuments(query);

		const activities = await Activity
			.aggregate([
				{
					$match: query
				},
				{
					$lookup: {
						from: 'builds',
						localField: 'activities.build',
						foreignField: 'id',
						as: 'builds'
					}
				},
				{
					$group: {
						_id: '$project_id',
						activity: {
							$push: {
								display_name: '$display_name',
								estimated_time: '$estimated_time',
								actual_time: '$actual_time',
								variance: '$variance',
								build: '$builds',
								build_id: '$build'
							}
						}
					}
				},
				{ $sort: { _id: -1 } }
			]);

		const res = await ProjectBuild.populate(activities, { path: 'build' });

		const result = {
			activities: res,
			projects: projects,
			total: count
		};

		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'getBuildsData'));
	}
}
