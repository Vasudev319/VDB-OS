import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera as CameraIcon, Video, RefreshCw, Circle, Square, User, AlertTriangle, QrCode } from 'lucide-react';
import { CapturedMedia, CameraAction, CameraMode } from './types';
import jsQR from 'jsqr';

interface CameraAppProps {
    onCapture: (media: Omit<CapturedMedia, 'id' | 'timestamp' | 'isVaulted'>) => void;
    lastCapture?: CapturedMedia;
    onThumbnailClick: () => void;
    action: CameraAction | null;
    onActionComplete: () => void;
    mode: CameraMode;
    setMode: (mode: CameraMode) => void;
}

type FacingMode = 'user' | 'environment';

const CameraApp: React.FC<CameraAppProps> = ({ onCapture, lastCapture, onThumbnailClick, action, onActionComplete, mode, setMode }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const [facingMode, setFacingMode] = useState<FacingMode>('environment');
    const [isRecording, setIsRecording] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const startCamera = useCallback(async (fMode: FacingMode) => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        setError(null);
        setStream(null);
        try {
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: fMode,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = newStream;
            }
            setStream(newStream);
// FIX: Corrected invalid '->' syntax in the catch block to a standard '{'. This was causing a cascade of parsing errors.
        } catch (err: any) {
            console.error("Error accessing camera:", err);
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setError('CAMERA PERMISSION DENIED. Please enable it in your browser settings.');
            } else {
                setError('Failed to access camera. It may be in use by another application.');
            }
        }
    }, [stream]);

    useEffect(() => {
        startCamera(facingMode);
        return () => {
            stream?.getTracks().forEach(track => track.stop());
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [facingMode]);

    const handleFlipCamera = useCallback(() => {
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    }, []);

    const handleTakePhoto = useCallback(() => {
        if (!videoRef.current || !stream) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        onCapture({ type: 'photo', dataUrl });
    }, [onCapture, stream]);

    const handleStartRecording = useCallback(() => {
        if (!stream || isRecording) return;
        setIsRecording(true);
        const recordedChunks: Blob[] = [];
        try {
            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) recordedChunks.push(event.data);
            };
            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(recordedChunks, { type: 'video/webm' });
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => {
                    onCapture({ type: 'video', dataUrl: reader.result as string });
                };
                setIsRecording(false);
            };
            mediaRecorderRef.current.start();
        } catch (e) {
            console.error("Failed to start media recorder:", e);
            setError("Video recording is not supported on this device/browser.");
            setIsRecording(false);
        }
    }, [stream, isRecording, onCapture]);

    const handleStopRecording = useCallback(() => {
        mediaRecorderRef.current?.stop();
    }, []);

    const handleShutterClick = useCallback(() => {
        if (error || mode === 'qr') return;
        if (mode === 'photo') handleTakePhoto();
        else if (mode === 'video') {
            if (isRecording) handleStopRecording();
            else handleStartRecording();
        }
    }, [mode, isRecording, handleTakePhoto, handleStartRecording, handleStopRecording, error]);

    useEffect(() => {
        if (!action) return;
        switch(action) {
            case 'take-photo': setMode('photo'); handleTakePhoto(); break;
            case 'start-video': setMode('video'); handleStartRecording(); break;
            case 'stop-video': handleStopRecording(); break;
            case 'flip-camera': handleFlipCamera(); break;
        }
        onActionComplete();
    }, [action, onActionComplete, handleTakePhoto, handleStartRecording, handleStopRecording, handleFlipCamera, setMode]);

    useEffect(() => {
        let animationFrameId: number;
        if (mode === 'qr' && videoRef.current && !error && stream) {
            const video = videoRef.current;
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) return;

            const scan = () => {
                if (video.readyState === video.HAVE_ENOUGH_DATA) {
                    canvas.height = video.videoHeight;
                    canvas.width = video.videoWidth;
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQR(imageData.data, imageData.width, imageData.height);
                    setQrCode(code ? code.data : null);
                }
                animationFrameId = requestAnimationFrame(scan);
            };
            scan();
        } else {
            setQrCode(null);
        }
        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        }
    }, [mode, error, stream]);

    return (
        <div className="app-window w-full h-full">
            <div className="app-header flex items-center justify-center gap-2">
                <CameraIcon size={14}/>
                <span>Camera</span>
            </div>
            <div className="app-content flex-1 relative bg-black flex items-center justify-center">
                <video ref={videoRef} className="w-full h-full object-contain" autoPlay playsInline muted />

                {error && (
                     <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-4">
                        <AlertTriangle size={48} className="text-red-500 mb-4" />
                        <h3 className="font-semibold text-lg text-red-400">Camera Error</h3>
                        <p className="text-sm text-text-secondary">{error}</p>
                    </div>
                )}

                {mode === 'qr' && !error && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-2/3 max-w-xs aspect-square border-4 border-white/50 rounded-lg" />
                    </div>
                )}
                {qrCode && (
                    <div className="absolute bottom-28 bg-black/80 p-3 rounded-lg text-center text-white border border-border-color">
                        <p className="font-bold text-sm">QR Code Detected:</p>
                        <p className="break-all text-accent-blue">{qrCode}</p>
                    </div>
                )}
            </div>
            <div className="h-28 bg-bg-tertiary border-t border-border-color flex items-center justify-around z-10 relative">
                <div className="w-24 flex justify-center">
                    <button
                        onClick={handleFlipCamera}
                        className="w-12 h-12 flex items-center justify-center rounded-full bg-bg-secondary text-text-secondary hover:bg-opacity-80 disabled:opacity-50"
                        title={`Switch to ${facingMode === 'user' ? 'Back' : 'Front'} Camera`}
                        disabled={!!error}
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>

                <div className="flex flex-col items-center">
                    <button onClick={handleShutterClick} disabled={!!error || mode === 'qr'} className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-white/20 disabled:border-gray-600 disabled:cursor-not-allowed">
                        {mode === 'video' && isRecording ? (
                            <div className="w-6 h-6 rounded bg-red-500 animate-pulse" />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-white"/>
                        )}
                    </button>
                    <div className="flex items-center gap-6 mt-2">
                        <button onClick={() => setMode('photo')} className={`font-semibold text-xs ${mode === 'photo' ? 'text-accent-blue' : 'text-text-secondary'}`} disabled={!!error}>PHOTO</button>
                        <button onClick={() => setMode('video')} className={`font-semibold text-xs ${mode === 'video' ? 'text-accent-blue' : 'text-text-secondary'}`} disabled={!!error}>VIDEO</button>
                        <button onClick={() => setMode('qr')} className={`font-semibold text-xs ${mode === 'qr' ? 'text-accent-blue' : 'text-text-secondary'}`} disabled={!!error}>QR</button>
                    </div>
                </div>

                <div className="w-24 flex justify-center">
                    {lastCapture && (
                        <button onClick={onThumbnailClick} className="w-12 h-12 rounded-lg border-2 border-border-color overflow-hidden relative bg-black hover:border-accent-blue">
                            {lastCapture.type === 'photo' ? (
                                <img src={lastCapture.dataUrl} alt="Last capture" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-cover bg-center flex items-center justify-center">
                                    <Video size={16} className="text-white"/>
                                </div>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CameraApp;