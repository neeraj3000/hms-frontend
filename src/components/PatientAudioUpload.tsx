'use client';

import React, { useRef, useState } from 'react';
import { Mic, StopCircle, X } from 'lucide-react';

interface PatientAudioUploadProps {
  audioUrl: string | null;
  onAudioUpload: (url: string) => void;        // called when uploaded (if Cloudinary upload is used later)
  onAudioRemove: () => void;                   // clear audio
  onAudioRecorded?: (blob: Blob) => void;      // pass Blob to parent (for backend upload on Save)
}

const PatientAudioUpload: React.FC<PatientAudioUploadProps> = ({
  audioUrl,
  onAudioUpload,
  onAudioRemove,
  onAudioRecorded
}) => {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        onAudioRecorded?.(blob); // ✅ send blob to parent
        if (audioRef.current) {
          audioRef.current.src = URL.createObjectURL(blob);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch {
      alert('Microphone access denied or unavailable.');
    }
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    setRecording(false);
  };

  const handleRemoveAudio = () => {
    setAudioBlob(null);
    onAudioRemove();
  };

  return (
    <div className="border-t border-gray-200 pt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Mic className="w-5 h-5 mr-2 text-pink-600" />
        Doctor Audio (Optional)
      </h3>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {!recording ? (
            <button
              type="button"
              onClick={startRecording}
              className="flex items-center justify-center space-x-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-3 rounded-lg"
              disabled={recording}
            >
              <Mic className="w-5 h-5" />
              <span>Start Recording</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg"
            >
              <StopCircle className="w-5 h-5" />
              <span>Stop Recording</span>
            </button>
          )}
        </div>

        {(audioUrl || audioBlob) && (
          <div className="relative inline-block">
            <audio
              ref={audioRef}
              controls
              src={audioUrl || (audioBlob ? URL.createObjectURL(audioBlob) : undefined)}
              className="w-64"
            />
            <button
              type="button"
              onClick={handleRemoveAudio}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <p className="text-sm text-gray-500">
          Record your voice note. It will be automatically uploaded when you save the prescription.
        </p>
      </div>
    </div>
  );
};

export default PatientAudioUpload;
