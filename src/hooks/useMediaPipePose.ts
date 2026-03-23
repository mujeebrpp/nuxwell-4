'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePoseDetector } from '@/hooks/usePoseDetector';
import { loadMediaPipeSettings, defaultMediaPipeSettings } from '@/lib/mediapipe-settings';
import { Landmark } from '@/lib/workout/poseUtils';

interface UseMediaPipePoseOptions {
    videoElement: HTMLVideoElement | null;
    onPoseDetected?: (landmarks: Landmark[]) => void;
    running?: boolean;
    autoLoadSettings?: boolean;
}

interface UseMediaPipePoseReturn {
    isLoading: boolean;
    error: string | null;
    pose: any;
    startPoseDetection: () => void;
    stopPoseDetection: () => void;
    isRunning: boolean;
    settings: typeof defaultMediaPipeSettings;
    reloadSettings: () => void;
}

/**
 * Custom hook that wraps usePoseDetector with automatic settings loading
 * from localStorage. This provides a seamless integration with the
 * MediaPipe Pose settings page.
 */
export function useMediaPipePose({
    videoElement,
    onPoseDetected,
    running = true,
    autoLoadSettings = true,
}: UseMediaPipePoseOptions): UseMediaPipePoseReturn {
    const [settings, setSettings] = useState<typeof defaultMediaPipeSettings>(defaultMediaPipeSettings);

    // Load settings on mount
    useEffect(() => {
        if (autoLoadSettings) {
            setSettings(loadMediaPipeSettings());
        }
    }, [autoLoadSettings]);

    // Reload settings (can be called to refresh settings)
    const reloadSettings = useCallback(() => {
        setSettings(loadMediaPipeSettings());
    }, []);

    // Extract relevant settings for usePoseDetector
    const poseDetectorSettings = {
        cameraFacingMode: settings.cameraFacingMode,
        modelComplexity: settings.modelComplexity,
        minDetectionConfidence: settings.minDetectionConfidence,
        minTrackingConfidence: settings.minTrackingConfidence,
        smoothLandmarks: settings.smoothLandmarks,
        enableSegmentation: settings.enableSegmentation,
    };

    const {
        isLoading,
        error,
        pose,
        startPoseDetection,
        stopPoseDetection,
        isRunning,
    } = usePoseDetector({
        videoElement,
        onPoseDetected,
        running,
        settings: poseDetectorSettings,
    });

    return {
        isLoading,
        error,
        pose,
        startPoseDetection,
        stopPoseDetection,
        isRunning,
        settings,
        reloadSettings,
    };
}
