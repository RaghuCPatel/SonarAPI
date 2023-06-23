import { mongoose } from '../../setup/mongo';
import { Activity } from './activity';
import { AutomationLaunch } from './automation_launch';
import { Defect } from './defect';
import { ManualLaunch } from './manual_launch';
import { ProjectRun } from './run';
import { TestCase } from './test_case';

const projectBuildSchema = new mongoose.Schema({
	build_number: {
		type: String,
		required: true
	},
	report: {
		type: Object,
		required: false
	},
	project_id: {
		type: String,
		required: true
	},
	status: {
		type: String,
		required: false
	},
	summary: {
		type: String,
		required: false
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
	activities:
		[{ type: mongoose.Schema.Types.ObjectId, ref: 'activity' }],
	runs:
		[{ type: mongoose.Schema.Types.ObjectId, ref: 'run' }],
	mlaunches:
		[{ type: mongoose.Schema.Types.ObjectId, ref: 'manuallaunch' }],
	alaunches:
		[{ type: mongoose.Schema.Types.ObjectId, ref: 'automationlaunch' }]
},
{ timestamps: true }
);

projectBuildSchema.post('findOneAndDelete', async function(doc) {
	await Activity.deleteMany({ build: doc._id },
		{ new: true, upsert: true });
	await ProjectRun.deleteMany({ build: doc._id },
		{ new: true, upsert: true });
	await AutomationLaunch.deleteMany({ build: doc._id },
		{ new: true, upsert: true });
	await ManualLaunch.deleteMany({ build: doc._id },
		{ new: true, upsert: true });
	await TestCase.deleteMany({ build: doc._id },
		{ new: true, upsert: true });
	await Defect.deleteMany({ build: doc._id },
		{ new: true, upsert: true });
});

export const ProjectBuild = mongoose.model('build', projectBuildSchema);
