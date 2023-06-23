import aws from '../setup/aws';
export async function getS3ReadImageUrl(imageKey, fileExt = '*') {
	const s3 = new aws.S3();
	const url = s3.getSignedUrl('getObject', {
		Bucket: process.env.S3_BUCKET_NAME,
		Key: imageKey,
		Expires: parseInt(process.env.S3_IMAGE_EXPIRY),
		ResponseContentType: 'image/' + fileExt
	});
	return url;
}
