import React, { useRef, useState, useEffect } from 'react';

import { useAppStore } from '../store/appStore';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';
import { analyzeFace, initializeFaceAnalyzer } from '../lib/faceAnalyzer';

export const PhotoCapturePage: React.FC = () => {
  const { setFaceAnalysis, setPhotoSkipped, setStep } = useAppStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'idle' | 'granted' | 'denied'>('idle');
  const [statusMessage, setStatusMessage] = useState('Initializing camera...');

  // Start analyzer in background
  useEffect(() => {
    const loadAnalyzer = async () => {
      try {
        const success = await initializeFaceAnalyzer();
        console.log('FaceLandmarker loaded in background:', success);
      } catch (error) {
        console.warn('Could not initialize face analyzer in background:', error);
      }
    };
    loadAnalyzer();
  }, []);

  const startCamera = async () => {
    try {
      setLoading(true);
      setStatusMessage('Requesting camera access...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      });
      setStream(mediaStream);
      setCameraPermission('granted');
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Camera access failed:', error);
      setCameraPermission('denied');
      setStatusMessage('Camera access was denied. You can upload an image instead.');
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const handleCapture = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    setLoading(true);
    setStatusMessage('Analyzing facial expressions...');

    const ctx = canvas.getContext('2d');
    if (ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      // Mirror flip for natural selfie look
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Reset transform
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      // Create an image element for the landmarker
      const dataUrl = canvas.toDataURL('image/jpeg');
      const tempImg = new Image();
      tempImg.onload = async () => {
        const result = await analyzeFace(tempImg);
        
        if (result.detected) {
          console.log('Face cues extracted successfully:', result);
          setFaceAnalysis(result);
          setPhotoSkipped(false);
        } else {
          console.log('No face detected in capture, setting default.');
          setPhotoSkipped(true);
        }
        
        stopCamera();
        setStep('conversation');
      };
      tempImg.src = dataUrl;
    }
  };

  const handleSkip = () => {
    setPhotoSkipped(true);
    setFaceAnalysis(null);
    stopCamera();
    setStep('conversation');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setStatusMessage('Loading upload image...');

    const reader = new FileReader();
    reader.onload = (event) => {
      const tempImg = new Image();
      tempImg.onload = async () => {
        const result = await analyzeFace(tempImg);
        if (result.detected) {
          setFaceAnalysis(result);
          setPhotoSkipped(false);
        } else {
          alert('Could not detect a face in the uploaded image. Proceeding to conversation.');
          setPhotoSkipped(true);
        }
        stopCamera();
        setStep('conversation');
      };
      tempImg.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto min-h-[90vh] relative z-10">
      <GlassCard className="w-full relative overflow-hidden">
        <h2 className="text-2xl md:text-3xl font-bold font-display text-white mb-2">
          Facial Expression Analysis
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          (Optional) Analyze expression cues for personality mapping.
        </p>

        {/* Video / Camera View */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-black/60 border border-white/5 mb-6 flex items-center justify-center">
          {cameraPermission === 'granted' && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          )}

          {cameraPermission === 'denied' && (
            <div className="p-6 flex flex-col items-center gap-4">
              <span className="text-4xl">📷</span>
              <p className="text-sm text-gray-400">{statusMessage}</p>
              <label className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 cursor-pointer text-xs transition-all">
                Upload image instead
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {cameraPermission === 'idle' && (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-brand-purple border-t-transparent animate-spin" />
              <p className="text-xs text-gray-400">{statusMessage}</p>
            </div>
          )}

          {/* Loader Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-brand-purple border-t-transparent animate-spin" />
              <p className="text-xs text-brand-purple font-medium uppercase tracking-wider animate-pulse">
                {statusMessage}
              </p>
            </div>
          )}
        </div>

        {/* Buttons / Controls */}
        <div className="flex flex-col gap-3">
          {cameraPermission === 'granted' && !loading && (
            <Button variant="primary" onClick={handleCapture} fullWidth>
              Analyze Face
            </Button>
          )}

          <div className="flex justify-between gap-4">
            {cameraPermission === 'denied' ? (
              <Button variant="primary" onClick={handleSkip} fullWidth>
                Continue without photo
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={handleSkip} className="flex-1">
                  Skip Step
                </Button>
                {cameraPermission === 'granted' && (
                  <label className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 cursor-pointer text-sm font-medium flex items-center justify-center transition-all">
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </>
            )}
          </div>
        </div>

        {/* Canvas for rendering frames/capturing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Privacy Note */}
        <p className="text-[10px] text-gray-500 mt-6 leading-relaxed">
          🔒 Privacy Guarantee: Photo analysis is fully client-side. The image is processed in WebAssembly and deleted immediately. We do not store or transmit your face data.
        </p>
      </GlassCard>
    </div>
  );
};

export default PhotoCapturePage;
