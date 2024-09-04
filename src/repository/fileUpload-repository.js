const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

async function uploadImage(imageBuffer, fileName) {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `${fileName}`,
    Body: imageBuffer,
    ContentType: 'image/jpeg',
    ACL: 'public-read'
  };

  try {
    const result = await s3.upload(params).promise();
    return result;
  } catch (error) {
    throw new Error('Failed to upload image to S3');
  }
}

module.exports = { uploadImage };