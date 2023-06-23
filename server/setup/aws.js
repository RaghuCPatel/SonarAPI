'use strict';
import aws from 'aws-sdk';

aws.config.update({
	secretAccessKey: process.env.SECRET_ACCESS_KEY,
	accessKeyId: process.env.ACCESS_KEY_ID,
	region: process.env.REGION
});
export default aws;
