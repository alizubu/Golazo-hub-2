import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { paramsToSign } = body;
    
    // Generate the signature using the API secret
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign, 
      process.env.CLOUDINARY_API_SECRET
    );
    
    return Response.json({ signature });
  } catch (error) {
    console.error('Error generating Cloudinary signature:', error);
    return Response.json({ error: 'Failed to sign request' }, { status: 500 });
  }
}
