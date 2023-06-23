import { mongoose } from '../../setup/mongo';
import { Activity } from './activity';
import { AutomationLaunch } from './automation_launch';
import { ProjectBuild } from './build';
import { ManualLaunch } from './manual_launch';
import { ProjectRun } from './run';
import { TestCase } from './test_case';
import { Defect } from './defect';

const sprintSchema = new mongoose.Schema({
	sprint_name: {
		type: String,
		required: true
	},
	start_date: {
		type: Date,
		required: true
	},
	end_date: {
		type: Date,
		required: true
	},
	duration: {
		type: Number,
		required: true
	},
	creator: {
		type: String,
		required: true
	},
	report: {
		type: Object,
		required: false
	},
	goal: {
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
	}
},
{ timestamps: true }
);
sprintSchema.post('findOneAndDelete', async function(doc) {
	await ProjectBuild.deleteMany({ sprint: doc._id },
		{ new: true, upsert: true });
	await Activity.deleteMany({ sprint: doc._id },
		{ new: true, upsert: true });
	await ProjectRun.deleteMany({ sprint: doc._id },
		{ new: true, upsert: true });
	await AutomationLaunch.deleteMany({ sprint: doc._id },
		{ new: true, upsert: true });
	await ManualLaunch.deleteMany({ sprint: doc._id },
		{ new: true, upsert: true });
	await TestCase.deleteMany({ sprint: doc._id },
		{ new: true, upsert: true });
	await Defect.deleteMany({ sprint: doc._id },
		{ new: true, upsert: true });
});
export const Sprint = mongoose.model('sprint', sprintSchema);
