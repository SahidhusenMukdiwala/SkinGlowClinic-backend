import multer from 'multer';

// Memory storage to stream directly to Cloudinary without writing to disk
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, and PNG images are allowed.'), false);
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3 MB max limit
  },
  fileFilter,
});
