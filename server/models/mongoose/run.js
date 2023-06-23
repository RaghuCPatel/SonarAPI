import { mongoose } from '../../setup/mongo';
import { Activity } from './activity';
import { AutomationLaunch } from './automation_launch';
import { ProjectBuild } from './build';
import { ManualLaunch } from './manual_launch';
import { TestCase } from './test_case';
const projectRunSchema = new mongoose.Schema({
	run_name: {
		type: String,
		required: true
	},
	build: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'build'
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
	activity: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'activity'
	},
	mlaunches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'manuallaunch' }],
	alaunches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'automationlaunch' }]
},
{ timestamps: true }
);

projectRunSchema.post('save', async function(doc) {
	await ProjectBuild.findByIdAndUpdate(doc.build, { $push: { runs: doc._id } },
		{ new: true, upsert: true }
	);
});
projectRunSchema.post('findOneAndDelete', async function(doc) {
	await ProjectBuild.findByIdAndUpdate(doc.build, { $pull: { runs: doc._id } },
		{ new: true, upsert: true }
	);
});
projectRunSchema.post('findOneAndDelete', async function(doc) {
	let msum = await ManualLaunch.aggregate([{
		$match: { run: doc._id }
	}, {
		$group: {
			_id: null,
			sum: {
				$sum: '$metrics.execution_time'
			}
		}
	}
	]);

	let asum = await AutomationLaunch.aggregate([{

		$match: { run: doc._id }
	},
	{
		$group: {
			_id: 'null',
			sum: {
				$sum: '$duration'
			}
		}
	}
	]);
	console.log(asum);
	if (msum.length > 0) { msum = msum[0].sum / 60; } else msum = 0;
	if (asum.length > 0) { asum = asum[0].sum / 3600000; } else asum = 0;
	console.log(asum);
	await Activity.findByIdAndUpdate({ _id: doc.activity }, { $inc: { actual_time: -(msum + asum) } },
		{ new: true, upsert: true });
	await AutomationLaunch.deleteMany({ run: doc._id },
		{ new: true, upsert: true });
	await ManualLaunch.deleteMany({ run: doc._id },
		{ new: true, upsert: true });
	await TestCase.deleteMany({ run: doc._id },
		{ new: true, upsert: true });
});

export const ProjectRun = mongoose.model('run', projectRunSchema);
