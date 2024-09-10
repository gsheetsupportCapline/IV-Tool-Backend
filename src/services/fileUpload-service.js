 

const fileUploadRepository = require('../repository/fileUpload-repository');
const multerS3 = require('multer-s3');
const multer = require('multer');
 
const s3 = require('../utils/s3.util');

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: 'public-read',
    
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + '-' + file.originalname);
    }
  })
});

const uploadImage = async (file) => {
  console.log("file in file upload service", file);
  try {
      // Since we're using multer-s3, the file is already uploaded to S3
      // We don't need to upload it again, we just need to return the URL
      return {
          Location: file.location,
          Bucket: file.bucket,
          Key: file.key,
          ETag: file.etag
      };
  } catch (error) {
      console.error('Error processing image:', error);
      throw error;
  }
};



module.exports = {upload, uploadImage };