import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer with Cloudinary storage for images
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'chat-images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 800, height: 600, crop: 'limit' },
      { quality: 'auto' }
    ]
  },
});

// Configure multer with Cloudinary storage for videos
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'chat-videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
    transformation: [
      { width: 640, height: 480, crop: 'limit' },
      { quality: 'auto' },
      { format: 'mp4' }
    ]
  },
});

export const uploadImage = multer({ 
  storage: imageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for images
  }
});

export const uploadVideo = multer({ 
  storage: videoStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for videos
  }
});

export { cloudinary };