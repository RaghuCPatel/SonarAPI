import { mongoose } from '../../setup/mongo';

const defectSchema = new mongoose.Schema({
	display_id: {
		type: String,
		required: true
	},
	display_name: {
		type: String,
		required: false
	},
	entry_date: {
		type: Date,
		required: true
	},
	reported_date: {
		type: Date,
		required: true
	},
	closed_date: {
		type: Date,
		required: false
	},
	defect_age: {
		type: Number,
		required: false
	},
	status: {
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
	sprint: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'sprint'
	},
	build: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'build'
	}
},
{ timestamps: true }
);
export const Defect = mongoose.model('defect', defectSchema);
