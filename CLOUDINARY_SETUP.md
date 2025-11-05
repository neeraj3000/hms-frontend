# Cloudinary Setup Instructions

This guide explains how to set up Cloudinary for image uploads in the Patient Registration form.

## What Changed

The PatientRegistration component has been refactored:
- **Reduced from 1071 lines to ~350 lines** (67% reduction)
- Extracted reusable components:
  - `DocumentScanner` - Handles camera document scanning with edge detection
  - `PatientImageUpload` - Manages image upload UI
  - `PatientVitalSigns` - Handles vital signs input form
- Extracted utilities:
  - `src/lib/cloudinary.ts` - Cloudinary upload functionality
  - `src/utils/edgeDetection.ts` - Document edge detection algorithms

## Setup Steps

### 1. Create a Cloudinary Account

1. Go to [Cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Verify your email

### 2. Get Your Credentials

1. Log in to your Cloudinary dashboard
2. Go to **Settings** → **Upload** tab
3. Create an Upload Preset:
   - Click "Add upload preset"
   - Name it (e.g., `hms-upload`)
   - Set signing mode to **Unsigned** (for public uploads)
   - Save the preset
4. Note your **Cloud Name** (visible in the dashboard)

### 3. Add Environment Variables

Create a `.env.local` file in the root of your project:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset_name

# Your existing environment variables
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

**Important:** Replace `your_cloud_name_here` and `your_upload_preset_name` with your actual values.

### 4. How It Works

1. **User selects or captures an image** (optional field)
2. **Image is uploaded to Cloudinary** before form submission
3. **Cloudinary URL is saved** to the backend along with patient data
4. **If upload fails**, the form still submits without the image

### 5. Image Upload Flow

```
User Action → Image Selected → Upload to Cloudinary → Get URL → Send to Backend
```

The image upload happens in the `handleSubmit` function before creating the prescription.

### 6. Backend Integration

Your backend should expect an optional `image` field in the prescription payload:

```json
{
  "student_id": 123,
  "nurse_id": 456,
  "notes": "Patient consultation notes",
  "weight": "70",
  "bp": "120/80",
  "temperature": "98.6",
  "image": "https://res.cloudinary.com/.../image.jpg"  // Optional Cloudinary URL
}
```

### 7. Security Notes

- The upload preset should be set to **Unsigned** for client-side uploads
- Images are stored in the `hms/patient-images` folder on Cloudinary
- Maximum file size is 10MB (configurable in `cloudinary.ts`)
- Only image files are accepted

### 8. Testing

1. Start your development server: `npm run dev`
2. Navigate to Patient Registration page
3. Fill in the form
4. Optionally upload an image
5. Submit the form
6. Check the console for Cloudinary URL
7. Verify the image URL is saved to your backend

## Troubleshooting

### Image Upload Fails
- Check your `.env.local` file has correct credentials
- Verify the upload preset is set to **Unsigned**
- Check browser console for specific error messages

### Camera Not Working
- Ensure HTTPS (camera requires secure context)
- Check browser permissions for camera access
- Fall back to file upload if camera unavailable

### Backend Not Receiving Image URL
- Verify the `image` field is included in your backend schema
- Check the Cloudinary URL is being sent in the request payload
- Review browser network tab for API call details

## Summary of Changes

### New Files Created
- `src/lib/cloudinary.ts` - Cloudinary upload utility
- `src/utils/edgeDetection.ts` - Edge detection algorithms
- `src/components/DocumentScanner.tsx` - Camera document scanner
- `src/components/PatientImageUpload.tsx` - Image upload component
- `src/components/PatientVitalSigns.tsx` - Vital signs form section

### Refactored Files
- `src/app/(nurse)/nurse/PatientRegistration.tsx` - Now 67% smaller and more maintainable

### Benefits
- ✅ Cleaner, more maintainable code
- ✅ Reusable components
- ✅ Better code organization
- ✅ Easier to test individual components
- ✅ Image uploads to Cloudinary instead of FormData
- ✅ Optional image field (graceful degradation)
