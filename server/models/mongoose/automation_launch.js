import { mongoose } from '../../setup/mongo';
import { Activity } from './activity';
import { ProjectBuild } from './build';
import { ProjectRun } from './run';
import { TestCase } from './test_case';
const automationLaunchSchema = new mongoose.Schema({
	run: {
		type: mongoose.Schema.Types.ObjectId,
		required: false,
		ref: 'run'
	},
	build: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'build'
	},
	environment: {
		type: String,
		required: true
	},
	sprint: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'sprint'
	},
	activity: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'activity'
	},
	suite_name: {
		type: String,
		required: false
	},
	project_id: {
		type: String,
		required: false
	},
	tenant_id: {
		type: String,
		required: false
	},
	project_code: {
		type: Number,
		required: false
	},
	launch_name: {
		type: String,
		required: false
	},
	overallstatus: {
		type: String,
		required: false
	},
	total_testcases: {
		type: Number,
		required: false
	},
	passed_testcases: {
		type: Number,
		required: false
	},
	failed_testcases: {
		type: Number,
		required: false
	},
	skipped_testcases: {
		type: Number,
		required: false
	},
	start_time: {
		type: Date,
		required: false
	},
	end_time: {
		type: Date,
		required: false
	},
	duration: {
		type: Number,
		required: false
	},
	source: {
		type: String,
		required: true
	}
},
{ timestamps: true }
);
automationLaunchSchema.post('save', async function(doc) {
	await ProjectRun.findByIdAndUpdate(doc.run, { $push: { alaunches: doc._id } },
		{ new: true, upsert: true });
	await ProjectBuild.findByIdAndUpdate(doc.build, { $push: { alaunches: doc._id } },
		{ new: true, upsert: true });
	await Activity.findByIdAndUpdate(doc.activity, { $push: { alaunches: doc._id } },
		{ new: true, upsert: true });
});
automationLaunchSchema.pre('updateOne', async function(next) {
	const id = this.getQuery();
	const updateData = this.getUpdate();
	const alaunch = await AutomationLaunch.findById(id);
	await Activity.findByIdAndUpdate(alaunch.activity, { $inc: { actual_time: (updateData.duration / 60000) } },
		{ new: true, upsert: true });
	next();
});
automationLaunchSchema.post('findOneAndDelete', async function(doc) {
	await ProjectRun.findByIdAndUpdate(doc.run, { $pull: { alaunches: doc._id } },
		{ new: true, upsert: true });
	await ProjectBuild.findByIdAndUpdate(doc.build, { $pull: { alaunches: doc._id } },
		{ new: true, upsert: true });
	await Activity.findByIdAndUpdate(doc.activity, { $pull: { alaunches: doc._id }, $inc: { actual_time: -(doc.duration / 60000) } },
		{ new: true, upsert: true });
	await TestCase.deleteMany({ launch: doc._id },
		{ new: true, upsert: true });
});

export const AutomationLaunch = mongoose.model('automationlaunch', automationLaunchSchema);
