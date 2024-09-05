 

const s3 = require('../utils/s3.util');

const uploadFileToS3 = async (file) => {
  const uploadParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: Date.now().toString() + '-' + file.originalname,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read',
  };

  try {
    const result = await s3.upload(uploadParams).promise();
    return result.Location;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
};

module.exports = { uploadFileToS3 };