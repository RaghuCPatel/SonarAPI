import { mongoose } from '../../setup/mongo';
import { Activity } from './activity';
import { ProjectBuild } from './build';
import { ProjectRun } from './run';
const manualLaunchSchema = new mongoose.Schema({
	launch_name: {
		type: String,
		required: true
	},
	run: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
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
	execution_date: {
		type: Date,
		required: true
	},
	released: {
		type: Boolean,
		required: true
	},
	source: {
		type: String,
		required: true
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
	defect_finding_data: {
		total_defects: {
			type: Number,
			required: true
		},
		blockers: {
			type: Number,
			required: true
		},
		critical_defects: {
			type: Number,
			required: true
		},
		major_defects: {
			type: Number,
			required: true
		},
		minor_defects: {
			type: Number,
			required: true
		},
		rejected_defects: {
			type: Number,
			required: true
		}
	},
	defect_fix_data: {
		retested_defects: {
			type: Number,
			required: true
		},
		fixed_defects: {
			type: Number,
			required: true
		}
	},
	metrics: {
		planned_testcases: {
			type: Number,
			required: true
		},
		executed_testcases: {
			type: Number,
			required: true
		},
		passed_testcases: {
			type: Number,
			required: true
		},
		failed_testcases: {
			type: Number,
			required: true
		},
		blocked_testcases: {
			type: Number,
			required: true
		},
		execution_time: {
			type: Number,
			required: true
		},
		overallstatus: {
			type: String,
			required: true
		}
	},
	new_testcases_added: {
		p0: {
			type: Number,
			required: true
		},
		p1: {
			type: Number,
			required: true
		},
		p2: {
			type: Number,
			required: true
		},
		p3: {
			type: Number,
			required: true
		},
		p4: {
			type: Number,
			required: true
		},
		total_new_testcases: {
			type: Number,
			required: true
		}
	},
	testcases_updated: {
		p0: {
			type: Number,
			required: true
		},
		p1: {
			type: Number,
			required: true
		},
		p2: {
			type: Number,
			required: true
		},
		p3: {
			type: Number,
			required: true
		},
		p4: {
			type: Number,
			required: true
		},
		total_updated_testcases: {
			type: Number,
			required: true
		}
	},
	defect_rejected_data: {
		blockers: {
			type: Number,
			required: true
		},
		critical_defects: {
			type: Number,
			required: true
		},
		major_defects: {
			type: Number,
			required: true
		},
		minor_defects: {
			type: Number,
			required: true
		}
	}
},
{ timestamps: true }
);
manualLaunchSchema.post('save', async function(doc) {
	await ProjectRun.findByIdAndUpdate(doc.run, { $push: { mlaunches: doc._id } },
		{ new: true, upsert: true });
	await ProjectBuild.findByIdAndUpdate(doc.build, { $push: { mlaunches: doc._id } },
		{ new: true, upsert: true });
	await Activity.findByIdAndUpdate(doc.activity, { $push: { mlaunches: doc._id }, $inc: { actual_time: (doc.metrics.execution_time) } },
		{ new: true, upsert: true });
});
manualLaunchSchema.pre('updateOne', async function(next) {
	const id = this.getQuery();
	const updateData = this.getUpdate();
	const mlaunch = await ManualLaunch.findById(id);
	await Activity.findByIdAndUpdate(mlaunch.activity, { $inc: { actual_time: ((updateData.metrics.execution_time) - (mlaunch.metrics.execution_time)) } },
		{ new: true, upsert: true });
	next();
});
manualLaunchSchema.post('findOneAndDelete', async function(doc) {
	await ProjectRun.findByIdAndUpdate(doc.run, { $pull: { mlaunches: doc._id } },
		{ new: true, upsert: true });
	await ProjectBuild.findByIdAndUpdate(doc.build, { $pull: { mlaunches: doc._id } },
		{ new: true, upsert: true });
	await Activity.findByIdAndUpdate(doc.activity, { $pull: { mlaunches: doc._id }, $inc: { actual_time: -(doc.metrics.execution_time) } },
		{ new: true, upsert: true });
});
export const ManualLaunch = mongoose.model('manuallaunch', manualLaunchSchema);
