// Default MediaPipe Pose settings
export const defaultMediaPipeSettings = {
    cameraFacingMode: 'user',
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
    smoothLandmarks: true,
    enableSegmentation: false,
    resolution: '720x1280', // Default to portrait 9:16
    showSkeleton: true,
    audioFeedback: true,
    repCountDisplay: true,
};

// Load MediaPipe Pose settings from localStorage
export function loadMediaPipeSettings(): typeof defaultMediaPipeSettings {
    if (typeof window === 'undefined') {
        return defaultMediaPipeSettings;
    }

    try {
        const saved = localStorage.getItem('mediapipePoseSettings');
        if (saved) {
            return { ...defaultMediaPipeSettings, ...JSON.parse(saved) };
        }
    } catch (e) {
        console.error('Failed to load MediaPipe settings:', e);
    }

    return defaultMediaPipeSettings;
}

// Save MediaPipe Pose settings to localStorage
export function saveMediaPipeSettings(settings: Partial<typeof defaultMediaPipeSettings>): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        const current = loadMediaPipeSettings();
        const updated = { ...current, ...settings };
        localStorage.setItem('mediapipePoseSettings', JSON.stringify(updated));
    } catch (e) {
        console.error('Failed to save MediaPipe settings:', e);
    }
}
