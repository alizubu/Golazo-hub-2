'use server';

import { v2 as cloudinary } from 'cloudinary';
import { getSession } from '@/app/actions/auth';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(base64Data) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    const result = await cloudinary.uploader.upload(base64Data, {
      folder: 'golazo_avatars',
      transformation: [
        { quality: "auto", fetch_format: "auto", width: 800 }
      ]
    });
    
    return { url: result.secure_url };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return { error: 'Failed to upload image' };
  }
}
