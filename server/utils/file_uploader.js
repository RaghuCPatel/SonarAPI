import multer from 'multer';
import multerS3 from 'multer-s3';
import aws from '../setup/aws';

export const uploadProfileImageToS3 = (baseKey) => {
	const s3 = new aws.S3();
	let imageKey;
	return multer({
		storage: multerS3({
			s3: s3,
			bucket: process.env.S3_BUCKET_NAME,
			metadata: function(req, file, cb) {
				cb(null, { fieldName: file.fieldname });
			},
			key: async function(req, file, cb) {
				imageKey = `${baseKey}` + `/${req.params.id}/` + file.originalname;
				cb(null, imageKey);
			}
		}),
		fileFilter: function(req, file, callback) {
			const ext = file.mimetype;
			if (ext !== 'image/jpeg' && ext !== 'image/jpg') {
				const res = {
					status: 'false',
					message: 'Only images are allowed'
				};
				return callback(new Error(JSON.stringify(res)));
			}
			callback(null, true);
		}
	});
};
