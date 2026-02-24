import path from 'path';
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const router = express.Router();

// Memory storage for multer (since we're uploading to Cloudinary)
const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  const filetypes = /jpe?g|png|webp/;
  const mimetypes = /image\/jpe?g|image\/png|image\/webp/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = mimetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Images only!'), false);
  }
}

const upload = multer({ storage, fileFilter });
const uploadSingleImage = upload.single('image');

router.post('/', (req, res) => {
  uploadSingleImage(req, res, async function (err) {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).send({ message: err.message || 'Image upload failed' });
    }

    if (!req.file) {
      return res.status(400).send({ message: 'No file provided' });
    }

    try {
      // Upload to Cloudinary
      const streamUpload = (req) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              resource_type: 'auto',
              folder: 'proshop',
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(req.file.buffer);
        });
      };

      const result = await streamUpload(req);

      console.log('Cloudinary upload result:', result);
      console.log('Secure URL:', result.secure_url);

      res.status(200).send({
        message: 'Image uploaded successfully',
        image: result.secure_url,
      });
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      res.status(500).send({ message: 'Failed to upload image to cloud storage' });
    }
  });
});

export default router;
