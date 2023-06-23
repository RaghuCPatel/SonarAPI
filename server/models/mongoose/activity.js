import { mongoose } from '../../setup/mongo';
import { ProjectBuild } from './build';
import { AutomationLaunch } from './automation_launch';
import { ManualLaunch } from './manual_launch';
import { TestCase } from './test_case';
import { ProjectRun } from './run';

const activitySchema = new mongoose.Schema({
	display_id: {
		type: String,
		required: true
	},
	display_name: {
		type: String,
		required: true
	},
	estimated_time: {
		type: Number,
		required: true
	},
	actual_time: {
		type: Number,
		required: false
	},
	variance: {
		type: Number,
		required: false
	},
	comments: {
		type: String,
		required: false
	},
	project_id: {
		type: String,
		required: true
	},
	project_code: {
		type: Number,
		required: true
	},
	tenant_id: {
		type: String,
		required: true
	},
	sprint: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'sprint'
	},
	build: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'build'
	},
	mlaunches:
		[{ type: mongoose.Schema.Types.ObjectId, ref: 'manuallaunch' }],
	alaunches:
		[{ type: mongoose.Schema.Types.ObjectId, ref: 'automationlaunch' }]
},
{ timestamps: true }
);
activitySchema.post('save', async function(doc) {
	await ProjectBuild.findByIdAndUpdate(doc.build, { $push: { activities: doc._id } },
		{ new: true, upsert: true });
});
activitySchema.post('findOneAndUpdate', async function() {
	const id = this.getQuery();
	const activity = await Activity.findById(id);
	let variance = 0;
	if (!activity.actual_time || activity.actual_time === 0) variance = 0;
	else {
		variance = (((activity.actual_time - activity.estimated_time) / activity.estimated_time) * 100);
		if (isNaN(variance)) variance = 0;
	}
	await Activity.updateOne({ _id: id }, { $set: { variance: variance } },
		{ new: true, upsert: true });
});
activitySchema.post('findOneAndDelete', async function(doc) {
	await ProjectBuild.findByIdAndUpdate(doc.build, { $pull: { activities: doc._id } },
		{ new: true, upsert: true });
	await ProjectRun.deleteMany({ activity: doc._id },
		{ new: true, upsert: true });
	await AutomationLaunch.deleteMany({ activity: doc._id },
		{ new: true, upsert: true });
	await ManualLaunch.deleteMany({ activity: doc._id },
		{ new: true, upsert: true });
	await TestCase.deleteMany({ activity: doc._id },
		{ new: true, upsert: true });
});
export const Activity = mongoose.model('activity', activitySchema);
