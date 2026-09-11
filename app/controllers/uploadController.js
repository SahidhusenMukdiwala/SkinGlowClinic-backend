import { uploadBufferToCloudinary } from '../utils/cloudinary.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

export const uploadMedia = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      return errorResponse(res, 'No image file uploaded.', 400);
    }

    const folder = req.body.folder || req.query.folder || 'skinglowclinic/general';
    const result = await uploadBufferToCloudinary(req.file.buffer, folder);

    return successResponse(
      res,
      {
        url: result.secure_url,
        public_id: result.public_id,
      },
      'Image uploaded successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};
