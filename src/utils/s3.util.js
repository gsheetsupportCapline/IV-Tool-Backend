const { S3Client , PutObjectCommand } = require('@aws-sdk/client-s3');


const config = {
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
}
const s3 = new S3Client(config);

// Create a PutObjectCommand
const putObjectCommand = new PutObjectCommand;

// Modify the upload method
s3.upload = async (params) => {
    return await s3.send( new PutObjectCommand(params));
};
module.exports = s3;