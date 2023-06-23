import { mongoose } from '../../setup/mongo';
const apiMatrixSchema = new mongoose.Schema({
	module: {
		type: String,
		required: true
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
	priority: {
		type: String,
		required: true
	},
	total_apis: {
		type: Number,
		required: true
	},
	total_TCs: {
		type: Number,
		required: true
	},
	total_TCs_exec: {
		type: Number,
		required: true
	},
	total_TCs_pass: {
		type: Number,
		required: true
	},
	total_TCs_fail: {
		type: Number,
		required: true
	},
	blocked_tests: {
		type: Number,
		required: true
	},
	total_defects: {
		type: Number,
		required: true
	},
	open_defects: {
		type: Number,
		required: true
	},
	total_feasible_TCs: {
		type: Number,
		required: true
	},
	total_TCs_automated: {
		type: Number,
		required: true
	},
	MT_coverage: {
		type: Number,
		required: true
	},
	blocked_execution: {
		type: Number,
		required: true
	},
	AT_coverage: {
		type: Number,
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
	total_executable: {
		type: Number,
		required: true
	}
},
{ timestamps: true }
);
export const ApiMatrix = mongoose.model('apimatrix', apiMatrixSchema);
