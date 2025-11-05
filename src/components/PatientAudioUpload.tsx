'use client';

import React, { useRef, useState } from 'react';
import { Mic, StopCircle, X, UploadCloud } from 'lucide-react';

interface PatientAudioUploadProps {
  audioUrl: string | null;
  onAudioUpload: (url: string) => void;
  onAudioRemove: () => void;
}

const PatientAudioUpload: React.FC<PatientAudioUploadProps> = ({ audioUrl, onAudioUpload, onAudioRemove }) => {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [uploading, setUploading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        // Optionally, play the audio
        if (audioRef.current) {
          audioRef.current.src = URL.createObjectURL(blob);
        }
      };
      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (err) {
      alert('Microphone access denied or not available.');
    }
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    setRecording(false);
  };

  const uploadAudio = async () => {
    if (!audioBlob) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');
      formData.append('folder', 'hms/patient-audio');
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      if (!response.ok) {
        throw new Error('Failed to upload audio');
      }
      const data = await response.json();
      onAudioUpload(data.secure_url);
      setAudioBlob(null);
    } catch (err) {
      alert('Audio upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border-t border-gray-200 pt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Mic className="w-5 h-5 mr-2 text-pink-600" />
        Doctor Audio (Optional)
      </h3>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {!recording && (
            <button
              type="button"
              onClick={startRecording}
              className="flex items-center justify-center space-x-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-3 rounded-lg"
              disabled={recording}
            >
              <Mic className="w-5 h-5" />
              <span>Start Recording</span>
            </button>
          )}
          {recording && (
            <button
              type="button"
              onClick={stopRecording}
              className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg"
            >
              <StopCircle className="w-5 h-5" />
              <span>Stop Recording</span>
            </button>
          )}
          {audioBlob && !audioUrl && (
            <button
              type="button"
              onClick={uploadAudio}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg"
              disabled={uploading}
            >
              <UploadCloud className="w-5 h-5" />
              <span>{uploading ? 'Uploading...' : 'Upload Audio'}</span>
            </button>
          )}
        </div>
        {(audioUrl || audioBlob) && (
          <div className="relative inline-block">
            <audio ref={audioRef} controls src={audioUrl || (audioBlob ? URL.createObjectURL(audioBlob) : undefined)} className="w-64" />
            {audioUrl && (
              <button
                type="button"
                onClick={onAudioRemove}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
        <p className="text-sm text-gray-500">
          Record and upload a short audio message for the student. Max: 60s. Supported: webm/mp3.
        </p>
      </div>
    </div>
  );
};

export default PatientAudioUpload;
