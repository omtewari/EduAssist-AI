import cloudinary from "../config/cloudinary.js";

const uploadPdfBuffer = (fileBuffer, originalFileName) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "eduassist/documents",
        resource_type: "raw",
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        filename_override: originalFileName,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });

const deletePdfByPublicId = async (publicId) => {
  if (!publicId) return;

  await cloudinary.uploader.destroy(publicId, {
    resource_type: "raw",
    invalidate: true,
  });
};

export default {
  uploadPdfBuffer,
  deletePdfByPublicId,
};
