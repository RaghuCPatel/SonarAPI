import { mongoose } from '../../setup/mongo';
const testCaseSchema = new mongoose.Schema({
	tag: {
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
	launch: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'automationlaunch',
		required: true
	},
	metrics: {
		start_time: Date,
		end_time: Date,
		duration: Number,
		status: String
	},
	trace: {
		type: Object,
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
export const TestCase = mongoose.model('testcase', testCaseSchema);
