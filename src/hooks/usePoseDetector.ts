'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Landmark } from '@/lib/workout/poseUtils';

declare global {
    interface Window {
        Pose: any;
    }
}

interface UsePoseDetectorOptions {
    videoElement: HTMLVideoElement | null;
    onPoseDetected?: (landmarks: Landmark[]) => void;
    running?: boolean;
    settings?: {
        cameraFacingMode?: string;
        modelComplexity?: number;
        minDetectionConfidence?: number;
        minTrackingConfidence?: number;
        smoothLandmarks?: boolean;
        enableSegmentation?: boolean;
    };
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
    settings = {},
}: UsePoseDetectorOptions): UsePoseDetectorReturn {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRunning, setIsRunning] = useState(false);

    const poseRef = useRef<any>(null);
    const animationFrameRef = useRef<number>(0);
    const streamRef = useRef<MediaStream | null>(null);
    const videoElementRef = useRef<HTMLVideoElement | null>(null);
    const isRunningRef = useRef(isRunning);

    const cameraFacingMode = settings.cameraFacingMode || 'user';
    const modelComplexity = settings.modelComplexity ?? 1;
    const minDetectionConfidence = settings.minDetectionConfidence ?? 0.5;
    const minTrackingConfidence = settings.minTrackingConfidence ?? 0.5;
    const smoothLandmarks = settings.smoothLandmarks ?? true;
    const enableSegmentation = settings.enableSegmentation ?? false;

    useEffect(() => {
        videoElementRef.current = videoElement;
    }, [videoElement]);

    const initCamera = useCallback(async () => {
        const el = videoElementRef.current;
        if (!el) return null;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: 640,
                    height: 480,
                    facingMode: cameraFacingMode,
                },
                audio: false,
            });

            el.srcObject = stream;
            streamRef.current = stream;

            await new Promise<void>((resolve) => {
                el.onloadedmetadata = () => {
                    el.play();
                    resolve();
                };
            });

            return stream;
        } catch (err) {
            console.error('Camera error:', err);
            setError('Camera access denied. Please allow camera access to use this feature.');
            return null;
        }
    }, [cameraFacingMode]);

    const initPose = useCallback(async () => {
        if (typeof window === 'undefined') return null;

        try {
            const { PoseLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');

            const vision = await FilesetResolver.forVisionTasks(
                'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm'
            );

            const pose = await PoseLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task',
                    delegate: 'GPU',
                },
                runningMode: 'VIDEO',
                numPoses: 1,
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
    }, []);

    const processFrame = useCallback(async () => {
        if (!poseRef.current || !videoElementRef.current || !isRunningRef.current) return;

        try {
            const timestamp = performance.now();
            const results = await poseRef.current.detectForVideo(videoElementRef.current, timestamp);
            if (results.landmarks && results.landmarks.length > 0 && onPoseDetected) {
                onPoseDetected(results.landmarks[0]);
            }
        } catch (err) {
            console.error('Frame processing error:', err);
        }

        if (isRunningRef.current) {
            animationFrameRef.current = requestAnimationFrame(processFrame);
        }
    }, [onPoseDetected]);

    const startPoseDetection = useCallback(async () => {
        if (!videoElementRef.current) return;

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

        isRunningRef.current = true;
        setIsRunning(true);
        setIsLoading(false);

        animationFrameRef.current = requestAnimationFrame(processFrame);
    }, [initCamera, initPose, processFrame]);

    const stopPoseDetection = useCallback(() => {
        isRunningRef.current = false;
        setIsRunning(false);

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = 0;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        if (videoElementRef.current) {
            videoElementRef.current.srcObject = null;
        }
    }, []);

    useEffect(() => {
        return () => {
            stopPoseDetection();
        };
    }, [stopPoseDetection]);

    useEffect(() => {
        if (running && videoElementRef.current && !isRunningRef.current) {
            startPoseDetection();
        }
    }, [running, startPoseDetection]);

    return {
        isLoading,
        error,
        pose: poseRef.current,
        startPoseDetection,
        stopPoseDetection,
        isRunning,
    };
}
