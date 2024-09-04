const fileUploadRepository = require('../repository/fileUpload-repository');

async function uploadImage(imageFile) {
  const buffer = Buffer.from(imageFile.data, 'base64');
  const fileName = Date.now() + '-' + imageFile.originalname;

  try {
    const result = await fileUploadRepository.uploadImage(buffer, fileName);
    return result;
  } catch (error) {
    throw new Error('Failed to upload image');
  }
}

module.exports = { uploadImage };