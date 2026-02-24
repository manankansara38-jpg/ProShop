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
  console.log('Upload route called');
  console.log('Cloudinary config:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    has_api_key: !!process.env.CLOUDINARY_API_KEY,
    has_api_secret: !!process.env.CLOUDINARY_API_SECRET,
  });
  
  uploadSingleImage(req, res, async function (err) {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).send({ message: err.message || 'Image upload failed' });
    }

    if (!req.file) {
      console.error('No file provided');
      return res.status(400).send({ message: 'No file provided' });
    }

    console.log('File received:', {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

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
              if (error) {
                console.error('Cloudinary error:', error);
                reject(error);
              } else {
                console.log('Cloudinary upload successful:', result.secure_url);
                resolve(result);
              }
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
      res.status(500).send({ message: `Failed to upload image: ${error.message}` });
    }
  });
});

export default router;
