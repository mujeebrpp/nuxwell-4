'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Landmark } from '@/lib/workout/poseUtils';
import { defaultMediaPipeSettings } from '@/lib/mediapipe-settings';

interface PoseLandmarkerType {
    detectForVideo: (video: HTMLVideoElement, timestamp: number) => { landmarks: { x: number; y: number; z: number; visibility: number }[][] };
}

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
    landmarks: Landmark[] | null;
    reloadSettings: () => void;
    startPoseDetection: () => Promise<void>;
    stopPoseDetection: () => void;
}

export function useMediaPipePose({
    onPoseDetected,
    running = true,
    autoLoadSettings = true,
    videoRef,
}: UseMediaPipePoseOptions): UseMediaPipePoseReturn {
    const [settings, setSettings] = useState(typeof defaultMediaPipeSettings);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [landmarks, setLandmarks] = useState<Landmark[] | null>(null);

    const poseRef = useRef<PoseLandmarkerType | null>(null);
    const animationFrameRef = useRef<number>(0);
    const streamRef = useRef<MediaStream | null>(null);
    const isRunningRef = useRef(false);
    const lastVideoTimeRef = useRef(-1);
    const processFrameRef = useRef<(() => void) | null>(null);
    const onPoseDetectedRef = useRef(onPoseDetected);

    // Keep callback ref updated
    useEffect(() => {
        onPoseDetectedRef.current = onPoseDetected;
    }, [onPoseDetected]);

    // Load settings
    const loadSettings = useCallback(() => {
        setSettings(defaultMediaPipeSettings);
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

    // Get base URL for local assets
    const getBasePath = useCallback(() => {
        if (typeof window !== 'undefined') {
            return window.location.origin;
        }
        return '';
    }, []);

    // Initialize pose with PoseLandmarker
    const initPose = useCallback(async () => {
        try {
            // Use CDN to load the package and its WASM files properly
            const { PoseLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');

            const basePath = getBasePath();
            const wasmPath = basePath ? `${basePath}/wasm/` : '/wasm/';
            const filesetResolver = await FilesetResolver.forVisionTasks(wasmPath);

            const poseLandmarker = await PoseLandmarker.createFromOptions(filesetResolver, {
                baseOptions: {
                    modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task',
                    delegate: 'GPU',
                },
                runningMode: 'VIDEO',
                numPoses: 1,
            });

            poseRef.current = poseLandmarker as PoseLandmarkerType;
            return poseLandmarker;
        } catch (err) {
            console.error('Pose initialization error:', err);
            const errorMsg = err instanceof Error ? err.message : String(err);
            setError('Failed to initialize pose detection. ' + errorMsg);
            return null;
        }
    }, [settings, getBasePath]);

    // Process frame using detectForVideo - defined once in useEffect
    useEffect(() => {
        const frameCallback = () => {
            const videoEl = videoRef?.current;
            const pose = poseRef.current;
            if (!pose || !videoEl || !isRunningRef.current) return;

            // Skip if video time hasn't changed
            if (videoEl.currentTime === lastVideoTimeRef.current) {
                if (isRunningRef.current) {
                    animationFrameRef.current = requestAnimationFrame(frameCallback);
                }
                return;
            }
            lastVideoTimeRef.current = videoEl.currentTime;

            // Detect pose - check readyState and ensure model is initialized
            if (videoEl.readyState >= 2) {
                try {
                    // Ensure we have a valid video element with dimensions
                    if (videoEl.videoWidth <= 0 || videoEl.videoHeight <= 0) {
                        animationFrameRef.current = requestAnimationFrame(frameCallback);
                        return;
                    }
                    // Ensure model is initialized before detection
                    if (!pose || typeof pose.detectForVideo !== 'function') {
                        animationFrameRef.current = requestAnimationFrame(frameCallback);
                        return;
                    }
                    const results = pose.detectForVideo(videoEl, performance.now());

                    if (results?.landmarks?.length > 0) {
                        const landmarks = results.landmarks[0];
                        if (onPoseDetectedRef.current && landmarks && landmarks.length > 0) {
                            onPoseDetectedRef.current(landmarks as Landmark[]);
                        }
                        setLandmarks(landmarks as Landmark[]);
                    }
                } catch (detectErr) {
                    console.error('Pose detection error:', detectErr);
                    // Stop the loop on error to prevent console spam
                    isRunningRef.current = false;
                    return;
                }
            }

            if (isRunningRef.current) {
                animationFrameRef.current = requestAnimationFrame(frameCallback);
            }
        };
        processFrameRef.current = frameCallback;
    }, [videoRef]);

    // Start camera and pose detection
    const startPoseDetection = useCallback(async () => {
        const videoEl = videoRef?.current;
        if (!videoEl) return;

        setIsLoading(true);
        setError(null);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 720 },
                    height: { ideal: 1280 },
                    facingMode: 'user',
                },
                audio: false,
            });

            // eslint-disable-next-line react-hooks/immutability
            (videoEl as HTMLVideoElement).srcObject = stream;
            streamRef.current = stream;

            // Wait for video to be playable
            await new Promise<void>((resolve) => {
                videoEl.onloadedmetadata = () => {
                    videoEl.play().then(() => {
                        // Additional wait for video dimensions to be available
                        const checkDimensions = () => {
                            if (videoEl.videoWidth > 0 && videoEl.videoHeight > 0) {
                                resolve();
                            } else {
                                setTimeout(checkDimensions, 50);
                            }
                        };
                        checkDimensions();
                    });
                };
            });

            const pose = await initPose();
            if (!pose) {
                setIsLoading(false);
                return;
            }

            isRunningRef.current = true;
            setIsRunning(true);
            setIsLoading(false);

            if (processFrameRef.current) {
                animationFrameRef.current = requestAnimationFrame(processFrameRef.current);
            }
        } catch (err) {
            console.error('Camera error:', err);
            setError('Camera access denied. Please allow camera access to use this feature.');
            setIsLoading(false);
        }
    }, [initPose, videoRef]);

    // Stop pose detection
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
        if (videoRef?.current) {
            videoRef.current.srcObject = null;
        }
    }, [videoRef]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopPoseDetection();
        };
    }, [stopPoseDetection]);

    // Handle running state changes
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
        landmarks,
        reloadSettings,
        startPoseDetection,
        stopPoseDetection,
    };
}