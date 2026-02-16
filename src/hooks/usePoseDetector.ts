'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Landmark, PoseLandmarks } from '@/lib/workout/poseUtils';

declare global {
    interface Window {
        Pose: any;
    }
}

interface UsePoseDetectorOptions {
    videoElement: HTMLVideoElement | null;
    onPoseDetected?: (landmarks: Landmark[]) => void;
    running?: boolean;
}

interface UsePoseDetectorReturn {
    isLoading: boolean;
    error: string | null;
    pose: any;
    startPoseDetection: () => void;
    stopPoseDetection: () => void;
    isRunning: boolean;
}

export function usePoseDetector({
    videoElement,
    onPoseDetected,
    running = true,
}: UsePoseDetectorOptions): UsePoseDetectorReturn {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRunning, setIsRunning] = useState(false);

    const poseRef = useRef<any>(null);
    const animationFrameRef = useRef<number>(0);
    const streamRef = useRef<MediaStream | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Initialize camera stream
    const initCamera = useCallback(async () => {
        if (!videoElement) return null;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: 640,
                    height: 480,
                    facingMode: 'user',
                },
                audio: false,
            });

            videoElement.srcObject = stream;
            streamRef.current = stream;

            await new Promise<void>((resolve) => {
                videoElement.onloadedmetadata = () => {
                    videoElement.play();
                    resolve();
                };
            });

            return stream;
        } catch (err) {
            console.error('Camera error:', err);
            setError('Camera access denied. Please allow camera access to use this feature.');
            return null;
        }
    }, [videoElement]);

    // Initialize MediaPipe Pose
    const initPose = useCallback(async () => {
        if (typeof window === 'undefined') return null;

        try {
            // Dynamic import for client-side only
            const { Pose } = await import('@mediapipe/pose');

            const pose = new Pose({
                locateFile: (file: string) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
                },
            });

            pose.setOptions({
                modelComplexity: 1,
                smoothLandmarks: true,
                enableSegmentation: false,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5,
            });

            pose.onResults((results: any) => {
                if (results.poseLandmarks && onPoseDetected) {
                    onPoseDetected(results.poseLandmarks);
                }
            });

            poseRef.current = pose;
            setIsLoading(false);
            return pose;
        } catch (err) {
            console.error('Pose initialization error:', err);
            setError('Failed to initialize pose detection.');
            setIsLoading(false);
            return null;
        }
    }, [onPoseDetected]);

    // Process frame
    const processFrame = useCallback(async () => {
        if (!poseRef.current || !videoElement || !isRunning) return;

        try {
            await poseRef.current.send({ image: videoElement });
        } catch (err) {
            console.error('Frame processing error:', err);
        }

        if (isRunning) {
            animationFrameRef.current = requestAnimationFrame(processFrame);
        }
    }, [videoElement, isRunning]);

    // Start pose detection
    const startPoseDetection = useCallback(async () => {
        if (!videoElement) return;

        setIsLoading(true);
        setError(null);

        const stream = await initCamera();
        if (!stream) {
            setIsLoading(false);
            return;
        }

        const pose = await initPose();
        if (!pose) {
            setIsLoading(false);
            return;
        }

        setIsRunning(true);
        setIsLoading(false);

        // Start processing frames
        processFrame();
    }, [videoElement, initCamera, initPose, processFrame]);

    // Stop pose detection
    const stopPoseDetection = useCallback(() => {
        setIsRunning(false);

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = 0;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        if (videoElement) {
            videoElement.srcObject = null;
        }
    }, [videoElement]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopPoseDetection();
        };
    }, [stopPoseDetection]);

    // Auto-start when running changes to true
    useEffect(() => {
        if (running && videoElement && !isRunning) {
            startPoseDetection();
        }
    }, [running, videoElement, isRunning, startPoseDetection]);

    return {
        isLoading,
        error,
        pose: poseRef.current,
        startPoseDetection,
        stopPoseDetection,
        isRunning,
    };
}
