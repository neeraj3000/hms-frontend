'use client';

import React, { useRef, useState } from 'react';
import { Upload, Camera, X, Image as ImageIcon } from 'lucide-react';
import DocumentScanner from './DocumentScanner';

interface PatientImageUploadProps {
  selectedImage: File | null;
  imagePreview: string | null;
  onImageSelect: (file: File, preview: string) => void;
  onImageRemove: () => void;
}

const PatientImageUpload: React.FC<PatientImageUploadProps> = ({
  selectedImage,
  imagePreview,
  onImageSelect,
  onImageRemove,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showScanner, setShowScanner] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      onImageSelect(file, ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileUpload = () => fileInputRef.current?.click();
  const triggerCameraCapture = () => setShowScanner(true);

  const handleScannerCapture = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => onImageSelect(file, e.target?.result as string);
    reader.readAsDataURL(file);
    setShowScanner(false);
  };

  return (
    <>
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ImageIcon className="w-5 h-5 mr-2 text-orange-600" />
          Patient Image (Optional)
        </h3>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={triggerFileUpload}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg"
            >
              <Upload className="w-5 h-5" />
              <span>Upload Image</span>
            </button>

            <button
              type="button"
              onClick={triggerCameraCapture}
              className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg"
              title="Open document scanner with edge detection"
            >
              <Camera className="w-5 h-5" />
              <span>Document Scanner</span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {imagePreview && (
            <div className="relative inline-block">
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Patient preview"
                  className="w-48 h-48 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={onImageRemove}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {selectedImage?.name} ({selectedImage && (selectedImage.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            </div>
          )}

          <p className="text-sm text-gray-500">
            Upload a patient photo or use the document scanner. Max: 5MB. Supported: JPG / PNG / GIF.
            <br />
            <span className="text-blue-600 font-medium">Note:</span> Scanner works on laptops & mobiles with edge detection and perspective correction.
          </p>
        </div>
      </div>

      {showScanner && (
        <DocumentScanner
          onCapture={handleScannerCapture}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  );
};

export default PatientImageUpload;
