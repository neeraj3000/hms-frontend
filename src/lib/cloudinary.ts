/**
 * Cloudinary utility for uploading images
 */

export interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
}

/**
 * Uploads an image file to Cloudinary
 * @param file - The image file to upload
 * @returns The uploaded image URL
 */
export async function uploadImageToCloudinary(
  file: File
): Promise<string> {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  // Validate file size (max 10MB for Cloudinary)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image size should be less than 10MB');
  }

  // Create form data for upload
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');
  formData.append('folder', 'hms/patient-images'); // Organize images in a folder

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to upload image');
    }

    const data: CloudinaryUploadResponse = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}

/**
 * Uploads a base64 image to Cloudinary
 * @param base64String - The base64 encoded image
 * @param filename - Optional filename for the image
 * @returns The uploaded image URL
 */
export async function uploadBase64ToCloudinary(
  base64String: string,
  filename: string = 'image.jpg'
): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', base64String);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');
    formData.append('folder', 'hms/patient-images');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to upload image');
    }

    const data: CloudinaryUploadResponse = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading base64 to Cloudinary:', error);
    throw error;
  }
}
