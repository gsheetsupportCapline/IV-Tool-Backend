const { S3Client } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const uploadFileToS3 = async (file) => {
  console.log("in repository ", file);
  
  if (file.location) {
      // File is already uploaded to S3, just return the existing data
      return {
          Location: file.location,
          Bucket: file.bucket,
          Key: file.key,
          ETag: file.etag
      };
  }

  const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: Date.now().toString() + '-' + file.originalname,
      Body: file.buffer || file.stream,
      ContentType: file.mimetype,
      ACL: 'public-read',
  };
  
  console.log("Upload Params", uploadParams);

  try {
      const result = await s3Client.putObject(uploadParams);
      console.log("File uploaded successfully", result);
      return result;
  } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw error;
  }
};

module.exports = { uploadFileToS3 };