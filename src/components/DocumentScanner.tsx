'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, X, Square, Power } from 'lucide-react';
import { detectDocumentEdges, applyPerspectiveCorrection, type Point } from '@/utils/edgeDetection';

interface DocumentScannerProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

/**
 * DocumentScanner
 * - Modal UI
 * - Toggle edge detection at top
 * - Starts camera, waits for playback, then begins efficient edge detection
 * - Accurate detection: uses full video frame but throttles processing
 */
const DocumentScanner: React.FC<DocumentScannerProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [edgeDetectionEnabled, setEdgeDetectionEnabled] = useState(true);
  const [corners, setCorners] = useState<Point[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Throttle detection: process at most ~8-12 fps
  const FRAME_INTERVAL_MS = 120;
  const lastProcessedRef = useRef<number>(0);

  // Start camera
  useEffect(() => {
    let mounted = true;

    const start = async () => {
      try {
        // prefer environment facing camera for mobile
        const constraints: MediaStreamConstraints = {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: { ideal: 'environment' }
          },
          audio: false
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!mounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current!;
        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;

        // Wait for video metadata then play and start detection
        const onLoadedMeta = async () => {
          try {
            // ensure play completes
            await video.play();
            setIsCameraActive(true);

            // small delay so video dimensions are stable
            setTimeout(() => {
              if (edgeDetectionEnabled) startDetectLoop();
            }, 150);
          } catch (err) {
            console.warn('Video play interrupted:', err);
            setIsCameraActive(false);
          }
        };

        video.addEventListener('loadedmetadata', onLoadedMeta, { once: true });
      } catch (err) {
        console.error('Camera access error:', err);
        alert('Unable to access camera. Please allow camera permissions or use Upload instead.');
        onClose();
      }
    };

    start();

    return () => {
      mounted = false;
      stopDetection();
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // Start detection loop
  const startDetectLoop = useCallback(() => {
    if (!edgeDetectionEnabled) return;
    if (rafRef.current) return;
    setIsDetecting(true);

    const loop = () => {
      const now = performance.now();
      if (now - lastProcessedRef.current >= FRAME_INTERVAL_MS && !isProcessing) {
        lastProcessedRef.current = now;
        processFrame();
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
  }, [edgeDetectionEnabled, isProcessing]);

  // Stop detection
  const stopDetection = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setIsDetecting(false);
    setCorners([]);
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // Toggle detection
  const toggleEdgeDetection = () => {
    setEdgeDetectionEnabled(prev => {
      const next = !prev;
      if (!next) stopDetection();
      else startDetectLoop();
      return next;
    });
  };

  // Frame processing
  const processFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) return;

    setIsProcessing(true);
    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // draw current video frame to canvas at native resolution
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // get image data
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // run detection (implementations should be optimized)
      const detected = detectDocumentEdges(imgData); // returns array of points with x,y
      if (detected && detected.length === 4) {
        setCorners(detected);
      } else {
        setCorners([]);
      }
    } catch (err) {
      console.error('Edge detection error:', err);
      setCorners([]);
    } finally {
      setIsProcessing(false);
    }
  };

  // capture document (apply perspective correction if corners present)
  const capture = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // ensure canvas matches current video frame
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    let outCanvas = canvas;
    if (edgeDetectionEnabled && corners.length === 4) {
      try {
        outCanvas = applyPerspectiveCorrection(canvas, corners);
      } catch (err) {
        console.warn('Perspective correction failed, using raw capture', err);
        outCanvas = canvas;
      }
    }

    outCanvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `prescription_${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
        // close everything after capture
        stopDetection();
        stopCamera();
      } else {
        alert('Failed to capture image. Please try again.');
      }
    }, 'image/jpeg', 0.9);
  };

  const handleClose = () => {
    stopDetection();
    stopCamera();
    onClose();
  };

  // ensure we start/stop detection when user toggles or camera becomes active
  useEffect(() => {
    if (!edgeDetectionEnabled) {
      stopDetection();
    } else if (edgeDetectionEnabled && isCameraActive) {
      startDetectLoop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edgeDetectionEnabled, isCameraActive]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-3xl mx-auto overflow-hidden">
        {/* Header with toggle */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold">Document Scanner</h3>
            <span className="text-sm text-gray-500 ml-2">Snap prescription / paper</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
              <Power className={`w-4 h-4 ${edgeDetectionEnabled ? 'text-green-600' : 'text-gray-400'}`} />
              <button
                onClick={toggleEdgeDetection}
                className={`text-sm font-medium ${edgeDetectionEnabled ? 'text-green-700' : 'text-gray-600'}`}
              >
                {edgeDetectionEnabled ? 'Edge Detection ON' : 'Edge Detection OFF'}
              </button>
            </div>

            <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Video area */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={(el) => {videoRef.current = el}}
            className="w-full h-auto max-h-[60vh] object-contain bg-black"
            autoPlay
            muted
            playsInline
          />

          {/* overlay drawing */}
          {corners.length === 4 && (
            <div className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full">
                <polygon
                  points={corners.map(c => `${c.x},${c.y}`).join(' ')}
                  fill="none"
                  stroke="#00ff00"
                  strokeWidth="3"
                  strokeDasharray="6,6"
                />
                {corners.map((c, i) => (
                  <circle key={i} cx={c.x} cy={c.y} r="6" fill="#00ff00" stroke="#fff" strokeWidth="2" />
                ))}
              </svg>
            </div>
          )}

          {/* status pill */}
          <div className="absolute top-3 left-3 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-xs">
            {isDetecting && edgeDetectionEnabled ? 'Detecting edges...' : 'Position document'}
          </div>
        </div>

        {/* controls */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            onClick={capture}
            disabled={!isCameraActive}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-5 py-2 rounded-lg"
            title="Capture the document"
          >
            <Square className="w-4 h-4" />
            <span>Capture</span>
          </button>

          <button
            onClick={handleClose}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-lg"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-3">
          Tip: Hold steady and fill the screen with the prescription. If detection fails, try toggling detection OFF and capture manually.
        </p>

        {/* hidden canvas used for processing frames */}
        <canvas ref={el => { canvasRef.current = el }} className="hidden" />
      </div>
    </div>
  );
};

export default DocumentScanner;
