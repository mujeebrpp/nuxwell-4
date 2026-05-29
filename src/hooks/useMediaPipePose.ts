'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Landmark } from '@/lib/workout/poseUtils';
import { loadMediaPipeSettings, defaultMediaPipeSettings } from '@/lib/mediapipe-settings';

interface UseMediaPipePoseOptions {
    onPoseDetected?: (landmarks: Landmark[]) => void;
    running?: boolean;
    autoLoadSettings?: boolean;
    videoRef?: React.RefObject<HTMLVideoElement | null>;
}

interface UseMediaPipePoseReturn {
    isLoading: boolean;
    error: string | null;
    isRunning: boolean;
    settings: typeof defaultMediaPipeSettings;
    reloadSettings: () => void;
}

export function useMediaPipePose({
    onPoseDetected,
    running = true,
    autoLoadSettings = true,
    videoRef,
}: UseMediaPipePoseOptions): UseMediaPipePoseReturn {
    const [settings, setSettings] = useState<typeof defaultMediaPipeSettings>(defaultMediaPipeSettings);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRunning, setIsRunning] = useState(false);

    const poseRef = useRef<any>(null);
    const internalVideoRef = useRef<HTMLVideoElement | null>(null);
    const animationFrameRef = useRef<number>(0);
    const streamRef = useRef<MediaStream | null>(null);
    const isRunningRef = useRef(false);
    const landmarksRef = useRef<Landmark[] | null>(null);

    const activeVideoRef = videoRef || internalVideoRef;

    const loadSettings = useCallback(() => {
        setSettings(loadMediaPipeSettings());
    }, []);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        if (autoLoadSettings) {
            timeoutId = setTimeout(() => {
                loadSettings();
            }, 0);
        }
        return () => clearTimeout(timeoutId);
    }, [autoLoadSettings, loadSettings]);

    const reloadSettings = useCallback(() => {
        loadSettings();
    }, [loadSettings]);

    const initPose = useCallback(async () => {
        try {
            const { PoseLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');

            const filesetResolver = await FilesetResolver.forVisionTasks(
                'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0'
            );

            const poseLandmarker = await PoseLandmarker.createFromOptions(filesetResolver, {
                baseOptions: {
                    modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.json',
                    delegate: 'GPU'
                },
                runningMode: 'VIDEO',
                numPoses: 1,
                minPoseDetectionConfidence: settings.minDetectionConfidence,
                minTrackingConfidence: settings.minTrackingConfidence,
            });

            poseRef.current = poseLandmarker;
            return poseLandmarker;
        } catch (err) {
            console.error('Pose initialization error:', err);
            setError('Failed to initialize pose detection.');
            return null;
        }
    }, [settings]);

    const processFrame = useCallback(async () => {
        if (!poseRef.current || !activeVideoRef.current || !isRunningRef.current) return;

        try {
            if (activeVideoRef.current.readyState >= 2) {
                const results = await poseRef.current.detectForVideoSolution(activeVideoRef.current);

                if (results.landmarks && results.landmarks.length > 0) {
                    const landmarks = results.landmarks[0];
                    landmarksRef.current = landmarks;

                    if (onPoseDetected) {
                        onPoseDetected(landmarks);
                    }
                }
            }
        } catch (err) {
            console.error('Frame processing error:', err);
        }

        if (isRunningRef.current) {
            animationFrameRef.current = requestAnimationFrame(processFrame);
        }
    }, [onPoseDetected]);

    const startPoseDetection = useCallback(async () => {
        if (!activeVideoRef.current) return;

        setIsLoading(true);
        setError(null);

        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: 'user',
            },
            audio: false,
        });

        activeVideoRef.current.srcObject = stream;
        streamRef.current = stream;

        try {
            await activeVideoRef.current.play();
        } catch (err) {
            console.error('Video play error:', err);
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
    }, [initPose, processFrame]);

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

        if (activeVideoRef.current) {
            activeVideoRef.current.srcObject = null;
        }
    }, []);

    useEffect(() => {
        return () => {
            stopPoseDetection();
        };
    }, [stopPoseDetection]);

    useEffect(() => {
        if (running && !isRunningRef.current) {
            startPoseDetection();
        } else if (!running && isRunningRef.current) {
            stopPoseDetection();
        }
    }, [running, startPoseDetection, stopPoseDetection]);

    return {
        isLoading,
        error,
        isRunning,
        settings,
        reloadSettings,
    };
}