import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, RotateCcw, Zap, ZapOff, X, Check, RefreshCw } from 'lucide-react';
import { useDeviceDetection } from '../../utils/mobileDetection';
import TouchButton from './TouchButton';

interface MobileCameraProps {
  onCapture: (imageData: string, metadata?: CaptureMetadata) => void;
  onClose?: () => void;
  aspectRatio?: 'square' | '4:3' | '16:9' | 'free';
  quality?: number; // 0.1 to 1.0
  maxWidth?: number;
  maxHeight?: number;
  showPreview?: boolean;
  enableFlash?: boolean;
  enableFrontCamera?: boolean;
  overlayText?: string;
  className?: string;
}

interface CaptureMetadata {
  timestamp: Date;
  location?: GeolocationPosition;
  deviceInfo: {
    userAgent: string;
    screenSize: string;
    pixelRatio: number;
  };
  cameraInfo: {
    facingMode: 'user' | 'environment';
    resolution: {
      width: number;
      height: number;
    };
  };
}

const MobileCamera: React.FC<MobileCameraProps> = ({
  onCapture,
  onClose,
  aspectRatio = '4:3',
  quality = 0.8,
  maxWidth = 1920,
  maxHeight = 1080,
  showPreview = true,
  enableFlash = true,
  enableFrontCamera = true,
  overlayText,
  className = ''
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const deviceInfo = useDeviceDetection();

  // Initialize camera
  useEffect(() => {
    if (deviceInfo.hasCamera) {
      initializeCamera();
    } else {
      setError('Camera not available on this device');
      setIsLoading(false);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const initializeCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Stop existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: maxWidth },
          height: { ideal: maxHeight }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !stream) return;

    setIsCapturing(true);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Unable to get canvas context');
      }

      // Set canvas dimensions based on aspect ratio
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      let canvasWidth = videoWidth;
      let canvasHeight = videoHeight;

      // Apply aspect ratio constraints
      if (aspectRatio === 'square') {
        const size = Math.min(videoWidth, videoHeight);
        canvasWidth = size;
        canvasHeight = size;
      } else if (aspectRatio === '4:3') {
        if (videoWidth / videoHeight > 4 / 3) {
          canvasWidth = videoHeight * (4 / 3);
          canvasHeight = videoHeight;
        } else {
          canvasWidth = videoWidth;
          canvasHeight = videoWidth * (3 / 4);
        }
      } else if (aspectRatio === '16:9') {
        if (videoWidth / videoHeight > 16 / 9) {
          canvasWidth = videoHeight * (16 / 9);
          canvasHeight = videoHeight;
        } else {
          canvasWidth = videoWidth;
          canvasHeight = videoWidth * (9 / 16);
        }
      }

      // Limit maximum dimensions
      if (canvasWidth > maxWidth) {
        canvasHeight = (canvasHeight * maxWidth) / canvasWidth;
        canvasWidth = maxWidth;
      }
      if (canvasHeight > maxHeight) {
        canvasWidth = (canvasWidth * maxHeight) / canvasHeight;
        canvasHeight = maxHeight;
      }

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Calculate crop area
      const cropX = (videoWidth - canvasWidth) / 2;
      const cropY = (videoHeight - canvasHeight) / 2;

      // Draw the image
      context.drawImage(
        video,
        cropX, cropY, canvasWidth, canvasHeight,
        0, 0, canvasWidth, canvasHeight
      );

      // Convert to data URL
      const imageData = canvas.toDataURL('image/jpeg', quality);

      // Get location if available
      let location: GeolocationPosition | undefined;
      try {
        location = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            enableHighAccuracy: true
          });
        });
      } catch (err) {
        console.warn('Location not available:', err);
      }

      // Create metadata
      const metadata: CaptureMetadata = {
        timestamp: new Date(),
        location,
        deviceInfo: {
          userAgent: navigator.userAgent,
          screenSize: deviceInfo.screenSize,
          pixelRatio: deviceInfo.pixelRatio
        },
        cameraInfo: {
          facingMode,
          resolution: {
            width: canvasWidth,
            height: canvasHeight
          }
        }
      };

      if (showPreview) {
        setCapturedImage(imageData);
      } else {
        onCapture(imageData, metadata);
      }

      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    } catch (err) {
      console.error('Error capturing photo:', err);
      setError('Failed to capture photo');
    } finally {
      setIsCapturing(false);
    }
  }, [stream, aspectRatio, quality, maxWidth, maxHeight, facingMode, deviceInfo, showPreview, onCapture]);

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const toggleFlash = async () => {
    if (!stream) return;

    try {
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();

      if (capabilities.torch) {
        await track.applyConstraints({
          advanced: [{ torch: !flashEnabled } as any]
        });
        setFlashEnabled(!flashEnabled);
      }
    } catch (err) {
      console.warn('Flash not supported:', err);
    }
  };

  const confirmCapture = () => {
    if (capturedImage) {
      // Get metadata from the last capture
      const metadata: CaptureMetadata = {
        timestamp: new Date(),
        deviceInfo: {
          userAgent: navigator.userAgent,
          screenSize: deviceInfo.screenSize,
          pixelRatio: deviceInfo.pixelRatio
        },
        cameraInfo: {
          facingMode,
          resolution: {
            width: maxWidth,
            height: maxHeight
          }
        }
      };

      onCapture(capturedImage, metadata);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 ${className}`}>
        <Camera className="w-16 h-16 mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">Camera Error</h3>
        <p className="text-center text-gray-300 mb-6">{error}</p>
        <TouchButton onClick={onClose} variant="outline">
          Close
        </TouchButton>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 bg-black z-50 flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black bg-opacity-50 text-white">
        <TouchButton
          onClick={onClose}
          variant="ghost"
          size="sm"
          icon={<X className="w-5 h-5" />}
        />

        <div className="flex items-center space-x-2">
          {enableFlash && (
            <TouchButton
              onClick={toggleFlash}
              variant="ghost"
              size="sm"
              icon={flashEnabled ? <Zap className="w-5 h-5" /> : <ZapOff className="w-5 h-5" />}
            />
          )}

          {enableFrontCamera && (
            <TouchButton
              onClick={switchCamera}
              variant="ghost"
              size="sm"
              icon={<RotateCcw className="w-5 h-5" />}
            />
          )}
        </div>
      </div>

      {/* Camera view */}
      <div className="flex-1 relative overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <RefreshCw className="w-8 h-8 text-white animate-spin" />
          </div>
        ) : capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}

        {/* Overlay text */}
        {overlayText && !capturedImage && (
          <div className="absolute top-4 left-4 right-4 bg-black bg-opacity-50 rounded-lg p-3">
            <p className="text-white text-center text-sm">{overlayText}</p>
          </div>
        )}

        {/* Aspect ratio guide */}
        {aspectRatio === 'square' && !capturedImage && (
          <div className="absolute inset-4 border-2 border-white border-opacity-50 rounded-lg pointer-events-none"
            style={{ aspectRatio: '1/1', margin: 'auto' }} />
        )}
      </div>

      {/* Controls */}
      <div className="p-6 bg-black bg-opacity-50">
        {capturedImage ? (
          <div className="flex items-center justify-center space-x-6">
            <TouchButton
              onClick={retakePhoto}
              variant="outline"
              size="lg"
              icon={<RotateCcw className="w-6 h-6" />}
            >
              Retake
            </TouchButton>

            <TouchButton
              onClick={confirmCapture}
              variant="primary"
              size="lg"
              icon={<Check className="w-6 h-6" />}
            >
              Use Photo
            </TouchButton>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <TouchButton
              onClick={capturePhoto}
              disabled={isCapturing || isLoading}
              loading={isCapturing}
              variant="primary"
              size="xl"
              className="rounded-full w-20 h-20"
              icon={<Camera className="w-8 h-8" />}
              hapticFeedback={true}
            />
          </div>
        )}
      </div>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default MobileCamera;