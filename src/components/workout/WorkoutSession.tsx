'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CameraView } from './CameraView';
import { RepCounter } from './RepCounter';
import { ExerciseType, ExerciseState, RepPhase, createDefaultExerciseState, EXERCISE_CONFIGS } from '@/lib/workout/exerciseDetector';
import { Landmark } from '@/lib/workout/poseUtils';
import { useAudioFeedback } from '@/hooks/useAudioFeedback';
import {
    Play,
    Pause,
    RotateCcw,
    Camera,
    CameraOff,
    CheckCircle,
    XCircle,
    ArrowLeft,
    Check,
    X,
    Trophy,
    Target,
    PartyPopper,
    Smartphone,
    MonitorPlay,
    ZoomIn,
    ZoomOut
} from 'lucide-react';

interface WorkoutSessionProps {
    exerciseType: ExerciseType;
    onComplete: (stats: WorkoutStats) => void;
    onExit: () => void;
    exerciseDuration?: number; // in seconds, 0 = unlimited
    targetReps?: number; // target rep count, 0 = unlimited
    exerciseConfig?: {
        difficulty: 'beginner' | 'intermediate' | 'advanced';
        targetType: 'reps' | 'time';
        targetValue: number;
    };
}

export interface WorkoutStats {
    exerciseType: ExerciseType;
    repCount: number;
    duration: number;
    calories: number;
    timestamp: Date;
}

// MediaPipe types
declare global {
    interface Window {
        Pose: any;
    }
}

export function WorkoutSession({
    exerciseType,
    onComplete,
    onExit,
    exerciseDuration = 0,
    targetReps = 0,
    exerciseConfig,
}: WorkoutSessionProps) {
    // Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const poseRef = useRef<any>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationFrameRef = useRef<number>(0);
    const startTimeRef = useRef<number>(0);

    // State
    const [isRunning, setIsRunning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [landmarks, setLandmarks] = useState<Landmark[] | null>(null);
    const [exerciseState, setExerciseState] = useState<ExerciseState>(createDefaultExerciseState());
    const [duration, setDuration] = useState(0);
    const [calories, setCalories] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [showSkeleton, setShowSkeleton] = useState(true);
    const [isCompleted, setIsCompleted] = useState(false);
    const [targetReached, setTargetReached] = useState(false);
    // Auto-detect mobile and set default orientation
    const [orientation, setOrientation] = useState<'landscape' | 'portrait'>(
        typeof window !== 'undefined' && window.innerWidth < 768 ? 'portrait' : 'landscape'
    );
    const [zoom, setZoom] = useState(1);

    // Refs for state values to avoid stale closures in callbacks
    const isRunningRef = useRef<boolean>(isRunning);
    const isPausedRef = useRef<boolean>(isPaused);
    const exerciseStateRef = useRef<ExerciseState>(exerciseState);
    const landmarksRef = useRef<Landmark[] | null>(null);
    const detectExerciseRef = useRef<((landmarks: Landmark[]) => void) | null>(null);
    const lastLandmarksUpdateRef = useRef<number>(0);

    // Keep refs in sync with state
    useEffect(() => {
        isRunningRef.current = isRunning;
    }, [isRunning]);

    useEffect(() => {
        isPausedRef.current = isPaused;
    }, [isPaused]);

    useEffect(() => {
        exerciseStateRef.current = exerciseState;
    }, [exerciseState]);

    useEffect(() => {
        landmarksRef.current = landmarks;
    }, [landmarks]);

    // Audio feedback
    const { speakCount, speakFeedback, speak, isEnabled, setEnabled } = useAudioFeedback({
        enabled: true,
    });

    // Exercise config - use passed config or fallback to default
    const config = exerciseConfig ?? EXERCISE_CONFIGS[exerciseType];

    // Ref for orientation to avoid stale closures
    const orientationRef = useRef(orientation);
    useEffect(() => {
        orientationRef.current = orientation;
    }, [orientation]);

    // Initialize camera
    const initCamera = useCallback(async () => {
        if (!videoRef.current) return false;

        try {
            // Auto-detect mobile and use portrait mode
            const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
            const currentOrientation = isMobile ? 'portrait' : orientationRef.current;

            // Use 1280x720 for landscape, 720x1280 for portrait (9:16 ratio)
            const videoWidth = currentOrientation === 'landscape' ? 1280 : 720;
            const videoHeight = currentOrientation === 'landscape' ? 720 : 1280;

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: videoWidth },
                    height: { ideal: videoHeight },
                    facingMode: 'user',
                },
                audio: false,
            });

            videoRef.current.srcObject = stream;
            streamRef.current = stream;

            await new Promise<void>((resolve) => {
                if (videoRef.current) {
                    videoRef.current.onloadedmetadata = () => {
                        resolve();
                    };
                }
            });

            if (videoRef.current) {
                await videoRef.current.play();
            }

            return true;
        } catch (err) {
            console.error('Camera error:', err);
            setError('Camera access denied. Please allow camera access to use this feature.');
            return false;
        }
    }, []);

    // Simple exercise detection - defined before initPose to avoid hoisting issues
    const detectExercise = useCallback((poseLandmarks: Landmark[]) => {
        // Use refs to get current values to avoid stale closures
        if (!isRunningRef.current || isPausedRef.current) return;

        // Get key angles
        const getAngle = (p1: number, p2: number, p3: number) => {
            const a = poseLandmarks[p1];
            const b = poseLandmarks[p2];
            const c = poseLandmarks[p3];

            if (!a || !b || !c) return 0;

            const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
            let angle = Math.abs(radians * 180.0 / Math.PI);

            if (angle > 180.0) {
                angle = 360.0 - angle;
            }

            return angle;
        };

        // Indices from MediaPipe Pose
        const LEFT_HIP = 23;
        const LEFT_KNEE = 25;
        const LEFT_ANKLE = 27;
        const RIGHT_HIP = 24;
        const RIGHT_KNEE = 26;
        const RIGHT_ANKLE = 28;
        const LEFT_SHOULDER = 11;
        const LEFT_ELBOW = 13;
        const LEFT_WRIST = 15;
        const RIGHT_SHOULDER = 12;
        const RIGHT_ELBOW = 14;
        const RIGHT_WRIST = 16;

        // Use ref to get current exercise state
        const currentExerciseState = exerciseStateRef.current;
        let repCount = currentExerciseState.repCount;
        let phase: RepPhase | string = currentExerciseState.phase;
        let feedback = '';
        let isGood = true;

        switch (exerciseType) {
            case 'squat': {
                const leftKneeAngle = getAngle(LEFT_HIP, LEFT_KNEE, LEFT_ANKLE);
                const rightKneeAngle = getAngle(RIGHT_HIP, RIGHT_KNEE, RIGHT_ANKLE);
                const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;

                // State machine: waiting -> down -> up -> waiting
                if (phase === 'waiting' && avgKneeAngle < 100) {
                    phase = 'down';
                    feedback = 'Go down!';
                } else if (phase === 'down' && avgKneeAngle > 160) {
                    repCount++;
                    phase = 'up';
                    feedback = 'Good!';
                    speakCount(repCount);
                } else if (phase === 'up' && avgKneeAngle < 100) {
                    // Transition back to down for next rep
                    phase = 'down';
                    feedback = 'Go down!';
                }

                if (avgKneeAngle < 70 && phase === 'down') {
                    feedback = 'Too low!';
                    isGood = false;
                } else if (avgKneeAngle > 160 && phase === 'waiting') {
                    feedback = 'Start squatting';
                }
                break;
            }

            case 'pushup': {
                const leftElbowAngle = getAngle(LEFT_SHOULDER, LEFT_ELBOW, LEFT_WRIST);
                const rightElbowAngle = getAngle(RIGHT_SHOULDER, RIGHT_ELBOW, RIGHT_WRIST);
                const avgElbowAngle = (leftElbowAngle + rightElbowAngle) / 2;

                // State machine: waiting -> down -> up -> waiting
                if (phase === 'waiting' && avgElbowAngle < 120) {
                    phase = 'down';
                    feedback = 'Go down!';
                } else if (phase === 'down' && avgElbowAngle > 160) {
                    repCount++;
                    phase = 'up';
                    feedback = 'Good!';
                    speakCount(repCount);
                } else if (phase === 'up' && avgElbowAngle < 120) {
                    // Transition back to down for next rep
                    phase = 'down';
                    feedback = 'Go down!';
                }

                if (avgElbowAngle < 60 && phase === 'down') {
                    feedback = 'Too deep!';
                    isGood = false;
                }
                break;
            }

            case 'jumpingJack': {
                const leftArmAngle = getAngle(LEFT_SHOULDER, LEFT_ELBOW, LEFT_WRIST);
                const rightArmAngle = getAngle(RIGHT_SHOULDER, RIGHT_ELBOW, RIGHT_WRIST);
                const avgArmAngle = (leftArmAngle + rightArmAngle) / 2;
                const legSpread = Math.abs(
                    (poseLandmarks[LEFT_ANKLE]?.x || 0) - (poseLandmarks[RIGHT_ANKLE]?.x || 0)
                );

                const isArmsUp = avgArmAngle > 150;
                const isLegsWide = legSpread > 0.3;

                // State machine: waiting -> down -> up -> waiting
                if (phase === 'waiting' && !isArmsUp) {
                    phase = 'down';
                    feedback = 'Jump!';
                } else if (phase === 'down' && isArmsUp && isLegsWide) {
                    repCount++;
                    phase = 'up';
                    feedback = 'Good!';
                    speakCount(repCount);
                } else if (phase === 'up' && !isArmsUp) {
                    // Transition back to down for next rep
                    phase = 'down';
                    feedback = 'Jump!';
                }

                if (!isLegsWide && phase !== 'waiting') {
                    feedback = 'Spread legs wider';
                    isGood = false;
                }
                break;
            }

            case 'plank': {
                const leftHipAngle = getAngle(LEFT_SHOULDER, LEFT_HIP, LEFT_KNEE);
                const rightHipAngle = getAngle(RIGHT_SHOULDER, RIGHT_HIP, RIGHT_KNEE);
                const avgHipAngle = (leftHipAngle + rightHipAngle) / 2;

                if (avgHipAngle < 160) {
                    feedback = 'Lift hips higher';
                    isGood = false;
                } else if (avgHipAngle > 200) {
                    feedback = 'Lower hips';
                    isGood = false;
                } else {
                    feedback = 'Hold!';
                    repCount = Math.floor((Date.now() - startTimeRef.current) / 1000); // Use time as rep count for plank
                }
                break;
            }

            case 'lunge': {
                const leftKneeAngle = getAngle(LEFT_HIP, LEFT_KNEE, LEFT_ANKLE);
                const rightKneeAngle = getAngle(RIGHT_HIP, RIGHT_KNEE, RIGHT_ANKLE);

                // State machine: waiting -> down -> up -> waiting
                if (phase === 'waiting' && (leftKneeAngle < 100 || rightKneeAngle < 100)) {
                    phase = 'down';
                    feedback = 'Go down!';
                } else if (phase === 'down' && leftKneeAngle > 160 && rightKneeAngle > 160) {
                    repCount++;
                    phase = 'up';
                    feedback = 'Good!';
                    speakCount(repCount);
                } else if (phase === 'up' && (leftKneeAngle < 100 || rightKneeAngle < 100)) {
                    // Transition back to down for next rep
                    phase = 'down';
                    feedback = 'Go down!';
                }
                break;
            }

            case 'situp': {
                const leftHipAngle = getAngle(LEFT_SHOULDER, LEFT_HIP, LEFT_KNEE);
                const rightHipAngle = getAngle(RIGHT_SHOULDER, RIGHT_HIP, RIGHT_KNEE);
                const avgHipAngle = (leftHipAngle + rightHipAngle) / 2;

                const hipY = (poseLandmarks[LEFT_HIP]?.y || 0 + poseLandmarks[RIGHT_HIP]?.y || 0) / 2;

                // State machine: waiting -> down -> up -> waiting
                if (phase === 'waiting' && hipY > 0.7) {
                    phase = 'down';
                    feedback = 'Lie back!';
                } else if (phase === 'down' && avgHipAngle > 140) {
                    repCount++;
                    phase = 'up';
                    feedback = 'Good!';
                    speakCount(repCount);
                } else if (phase === 'up' && hipY > 0.7) {
                    // Transition back to down for next rep
                    phase = 'down';
                    feedback = 'Lie back!';
                }
                break;
            }

            case 'mountainClimber': {
                const leftKneeAngle = getAngle(LEFT_HIP, LEFT_KNEE, LEFT_ANKLE);
                const rightKneeAngle = getAngle(RIGHT_HIP, RIGHT_KNEE, RIGHT_ANKLE);

                const leftKneeUp = leftKneeAngle < 80;
                const rightKneeUp = rightKneeAngle < 80;

                if (phase === 'left' && rightKneeUp) {
                    repCount++;
                    phase = 'right';
                    feedback = 'Good!';
                    speakCount(repCount);
                } else if (phase === 'right' && leftKneeUp) {
                    repCount++;
                    phase = 'left';
                    feedback = 'Good!';
                    speakCount(repCount);
                } else if (phase === 'waiting') {
                    phase = leftKneeUp ? 'left' : 'right';
                }
                break;
            }

            case 'highKnees': {
                const leftKneeAngle = getAngle(LEFT_HIP, LEFT_KNEE, LEFT_ANKLE);
                const rightKneeAngle = getAngle(RIGHT_HIP, RIGHT_KNEE, RIGHT_ANKLE);

                const leftKneeUp = leftKneeAngle < 80;
                const rightKneeUp = rightKneeAngle < 80;

                if (phase === 'left' && rightKneeUp) {
                    repCount++;
                    phase = 'right';
                    feedback = 'Good!';
                    speakCount(repCount);
                } else if (phase === 'right' && leftKneeUp) {
                    repCount++;
                    phase = 'left';
                    feedback = 'Good!';
                    speakCount(repCount);
                } else if (phase === 'waiting') {
                    phase = leftKneeUp ? 'left' : 'right';
                }
                break;
            }

            case 'gluteBridge': {
                const leftHipAngle = getAngle(LEFT_SHOULDER, LEFT_HIP, LEFT_KNEE);
                const rightHipAngle = getAngle(RIGHT_SHOULDER, RIGHT_HIP, RIGHT_KNEE);
                const avgHipAngle = (leftHipAngle + rightHipAngle) / 2;

                const hipY = (poseLandmarks[LEFT_HIP]?.y || 0 + poseLandmarks[RIGHT_HIP]?.y || 0) / 2;

                // State machine: waiting -> down -> up -> waiting
                if (phase === 'waiting' && hipY > 0.7) {
                    phase = 'down';
                    feedback = 'Lower hips!';
                } else if (phase === 'down' && avgHipAngle > 150) {
                    repCount++;
                    phase = 'up';
                    feedback = 'Good!';
                    speakCount(repCount);
                } else if (phase === 'up' && hipY > 0.7) {
                    // Transition back to down for next rep
                    phase = 'down';
                    feedback = 'Lower hips!';
                }
                break;
            }

            case 'burpee': {
                const leftKneeAngle = getAngle(LEFT_HIP, LEFT_KNEE, LEFT_ANKLE);
                const rightKneeAngle = getAngle(RIGHT_HIP, RIGHT_KNEE, RIGHT_ANKLE);
                const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;

                const hipY = (poseLandmarks[LEFT_HIP]?.y || 0 + poseLandmarks[RIGHT_HIP]?.y || 0) / 2;
                const isOnFloor = hipY > 0.7;

                // State machine: waiting -> squat -> plank -> jump -> waiting
                if (phase === 'waiting' && avgKneeAngle < 100) {
                    phase = 'squat';
                    feedback = 'Squat down!';
                } else if (phase === 'squat' && isOnFloor) {
                    phase = 'plank';
                    feedback = 'Jump back!';
                } else if (phase === 'plank' && !isOnFloor && avgKneeAngle > 160) {
                    phase = 'jump';
                    feedback = 'Jump up!';
                } else if (phase === 'jump' && avgKneeAngle < 100) {
                    repCount++;
                    phase = 'squat';  // Go back to squat for next rep
                    feedback = 'Good!';
                    speakCount(repCount);
                }
                break;
            }

            default:
                break;
        }

        setExerciseState({
            repCount,
            phase: phase as RepPhase,
            formFeedback: feedback,
            isFormGood: isGood,
            confidence: poseLandmarks ? 1 : 0,
        });
    }, [exerciseType, speakCount]);

    // Keep detectExerciseRef in sync
    useEffect(() => {
        detectExerciseRef.current = detectExercise;
    }, [detectExercise]);

    // Initialize MediaPipe Pose
    const initPose = useCallback(async () => {
        try {
            // Add retry logic for chunk loading
            let Pose;
            try {
                const poseModule = await import('@mediapipe/pose');
                Pose = poseModule.Pose;
            } catch (chunkError: any) {
                // ChunkLoadError - try to reload the page or retry
                console.error('Chunk load error, retrying:', chunkError);

                // Wait a moment and retry once
                await new Promise(resolve => setTimeout(resolve, 1000));
                try {
                    const poseModule = await import('@mediapipe/pose');
                    Pose = poseModule.Pose;
                } catch (retryError) {
                    // If retry also fails, show a more helpful error
                    setError('Failed to load AI tracker. Please refresh the page and try again. If the problem persists, check your internet connection.');
                    throw retryError;
                }
            }

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
                if (results.poseLandmarks) {
                    // Update landmarks ref immediately for drawing
                    landmarksRef.current = results.poseLandmarks;

                    // Throttle state updates to avoid infinite loops (max 10 updates per second)
                    const now = Date.now();
                    if (now - lastLandmarksUpdateRef.current > 100) {
                        lastLandmarksUpdateRef.current = now;
                        // Create a new array to ensure React detects the change
                        setLandmarks([...results.poseLandmarks]);
                    }

                    // Call detectExercise via ref to avoid stale closures
                    if (detectExerciseRef.current) {
                        detectExerciseRef.current(results.poseLandmarks);
                    }
                }
            });

            poseRef.current = pose;
            return pose;
        } catch (err) {
            console.error('Pose initialization error:', err);
            setError('Failed to initialize pose detection.');
            return null;
        }
    }, []);

    // Process frames
    const processFrame = useCallback(async () => {
        if (!poseRef.current || !videoRef.current || !isRunningRef.current || isPausedRef.current) {
            return;
        }

        try {
            if (videoRef.current.readyState >= 2) {
                await poseRef.current.send({ image: videoRef.current });
            }
        } catch (err) {
            console.error('Frame processing error:', err);
        }

        if (isRunningRef.current && !isPausedRef.current) {
            animationFrameRef.current = requestAnimationFrame(processFrame);
        }
    }, []);

    // Start workout
    const startWorkout = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        const cameraSuccess = await initCamera();
        if (!cameraSuccess) {
            setIsLoading(false);
            return;
        }

        const poseSuccess = await initPose();
        if (!poseSuccess) {
            setIsLoading(false);
            return;
        }

        // Update refs immediately before setting state
        isRunningRef.current = true;
        setIsRunning(true);
        setIsLoading(false);
        startTimeRef.current = Date.now();

        // Start processing frames
        processFrame();
    }, [initCamera, initPose, processFrame]);

    // Stop workout
    const stopWorkout = useCallback(() => {
        setIsRunning(false);

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
    }, []);

    // Reset workout
    const resetWorkout = useCallback(() => {
        stopWorkout();
        setExerciseState(createDefaultExerciseState());
        setDuration(0);
        setCalories(0);
        setIsCompleted(false);
        setTargetReached(false);
        setLandmarks(null);
    }, [stopWorkout]);

    // Exit workout
    const handleExit = useCallback(() => {
        stopWorkout();

        // Calculate final stats
        const stats: WorkoutStats = {
            exerciseType,
            repCount: exerciseState.repCount,
            duration,
            calories,
            timestamp: new Date(),
        };

        onComplete(stats);
    }, [stopWorkout, exerciseType, exerciseState.repCount, duration, calories, onComplete]);

    // Cancel workout - discards current workout without saving
    const cancelWorkout = useCallback(() => {
        if (window.confirm('Are you sure you want to cancel this workout? All progress will be lost.')) {
            resetWorkout();
        }
    }, [resetWorkout]);

    // Timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isRunning && !isPaused) {
            interval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
                setDuration(elapsed);

                // Estimate calories (rough estimate)
                const caloriesPerMinute = 5; // ~300 cal/hour for active exercise
                setCalories(Math.floor((elapsed / 60) * caloriesPerMinute));

                // Check duration limit
                if (exerciseDuration > 0 && elapsed >= exerciseDuration) {
                    handleExit();
                }
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRunning, isPaused, exerciseDuration, handleExit]);

    // Auto-stop when target reached (reps or time)
    useEffect(() => {
        let targetReachedCondition = false;

        if (config && 'targetType' in config) {
            if (config.targetType === 'reps' && config.targetValue > 0) {
                targetReachedCondition = exerciseState.repCount >= config.targetValue;
            } else if (config.targetType === 'time' && config.targetValue > 0) {
                targetReachedCondition = duration >= config.targetValue;
            }
        } else {
            // Fallback to legacy targetReps
            targetReachedCondition = targetReps > 0 && exerciseState.repCount >= targetReps;
        }

        if (targetReachedCondition && isRunning && !targetReached) {
            setTargetReached(true);
            setIsPaused(true);
            const targetMessage = config && 'targetType' in config && config.targetType === 'time'
                ? `Congratulations! You completed ${config.targetValue} seconds!`
                : `Congratulations! You reached your target!`;
            speak(targetMessage);
        }
    }, [exerciseState.repCount, duration, config, targetReps, isRunning, targetReached, speak]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    return (
        <div className="space-y-4 lg:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-4">
                    <Button variant="ghost" size="sm" onClick={handleExit}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900">{'Exercise'}</h2>
                        <p className="text-sm text-slate-500 hidden sm:block">AI Workout Tracker</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Target indicator */}
                    {config && 'targetType' in config && (
                        <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 bg-emerald-100 rounded-lg">
                            <Target className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                            <span className="text-xs sm:text-sm font-medium text-emerald-700">
                                {config.targetValue} {config.targetType === 'reps' ? 'reps' : 'sec'}
                            </span>
                            {(config.targetType === 'reps' && exerciseState.repCount >= config.targetValue) ||
                                (config.targetType === 'time' && duration >= config.targetValue) && (
                                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                                )}
                        </div>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSkeleton(!showSkeleton)}
                        title={showSkeleton ? 'Hide skeleton' : 'Show skeleton'}
                        className="h-8 w-8 p-0"
                    >
                        {showSkeleton ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                    </Button>
                </div>
            </div>

            {/* Error message */}
            {error && (
                <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <XCircle className="w-5 h-5 text-red-500" />
                            <p className="text-red-700">{error}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Target Reached Celebration */}
            {targetReached && (
                <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 border-0 overflow-hidden relative">
                    <CardContent className="p-6 text-white text-center relative z-10">
                        <div className="flex justify-center mb-4">
                            <div className="relative">
                                <Trophy className="w-16 h-16 text-yellow-300 animate-bounce" />
                                <PartyPopper className="w-8 h-8 text-yellow-200 absolute -top-2 -right-2 animate-pulse" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-2">🎉 Target Reached! 🎉</h3>
                        <p className="text-emerald-100 mb-4">
                            Congratulations! You completed your target!
                        </p>
                        <div className="flex justify-center gap-4 mt-4">
                            <Button
                                onClick={handleExit}
                                className="bg-white text-emerald-600 hover:bg-emerald-50"
                            >
                                <Check className="w-5 h-5 mr-2" />
                                Complete Session
                            </Button>
                            <Button
                                onClick={() => {
                                    setTargetReached(false);
                                    setIsPaused(false);
                                }}
                                variant="outline"
                                className="border-white text-white hover:bg-emerald-600"
                            >
                                <Play className="w-5 h-5 mr-2" />
                                Continue
                            </Button>
                        </div>
                    </CardContent>
                    {/* Confetti effect with CSS */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {[...Array(20)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-ping"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 2}s`,
                                    animationDuration: `${1 + Math.random() * 2}s`,
                                }}
                            />
                        ))}
                    </div>
                </Card>
            )}

            <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
                {/* Camera View */}
                <div>
                    {/* Orientation and Zoom Controls */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
                        {/* Orientation Toggle */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-400 hidden sm:inline">Orientation</span>
                            <Button
                                onClick={() => setOrientation(orientation === 'landscape' ? 'portrait' : 'landscape')}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                {orientation === 'landscape' ? (
                                    <>
                                        <MonitorPlay className="w-4 h-4" />
                                        <span className="hidden sm:inline">Landscape</span>
                                    </>
                                ) : (
                                    <>
                                        <Smartphone className="w-4 h-4" />
                                        <span className="hidden sm:inline">Portrait</span>
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Zoom Controls */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-400 hidden sm:inline">Zoom</span>
                            <div className="flex items-center gap-1">
                                <Button
                                    onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    disabled={zoom <= 0.5}
                                >
                                    <ZoomOut className="w-4 h-4" />
                                </Button>
                                <span className="text-sm text-slate-600 dark:text-white min-w-[3rem] text-center">{zoom}x</span>
                                <Button
                                    onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    disabled={zoom >= 3}
                                >
                                    <ZoomIn className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <CameraView
                        videoRef={videoRef}
                        canvasRef={canvasRef}
                        landmarks={landmarks}
                        isRunning={isRunning && !isPaused}
                        showSkeleton={showSkeleton}
                        orientation={orientation}
                        zoom={zoom}
                    />

                    {/* Camera Controls */}
                    <div className="mt-3 lg:mt-4 flex flex-wrap justify-center gap-2 lg:gap-3">
                        {!isRunning ? (
                            <Button
                                onClick={startWorkout}
                                disabled={isLoading}
                                className="bg-emerald-500 hover:bg-emerald-600 w-full sm:w-auto min-w-[140px]"
                            >
                                {isLoading ? (
                                    <span>Loading...</span>
                                ) : (
                                    <>
                                        <Play className="w-5 h-5 mr-2" />
                                        Start
                                    </>
                                )}
                            </Button>
                        ) : (
                            <>
                                <Button
                                    onClick={() => setIsPaused(!isPaused)}
                                    variant="outline"
                                    size="sm"
                                >
                                    {isPaused ? (
                                        <>
                                            <Play className="w-4 h-4 mr-1" />
                                            <span className="hidden sm:inline">Resume</span>
                                        </>
                                    ) : (
                                        <>
                                            <Pause className="w-4 h-4 mr-1" />
                                            <span className="hidden sm:inline">Pause</span>
                                        </>
                                    )}
                                </Button>

                                <Button onClick={resetWorkout} variant="outline" size="sm">
                                    <RotateCcw className="w-4 h-4 mr-1" />
                                    <span className="hidden sm:inline">Reset</span>
                                </Button>

                                <Button onClick={cancelWorkout} variant="danger" size="sm">
                                    <X className="w-4 h-4 mr-1" />
                                    <span className="hidden sm:inline">Cancel</span>
                                </Button>

                                <Button onClick={handleExit} variant="danger" size="sm">
                                    <Check className="w-4 h-4 mr-1" />
                                    <span className="hidden sm:inline">Finish</span>
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Rep Counter */}
                <RepCounter
                    exerciseState={exerciseState}
                    exerciseType={exerciseType}
                    duration={duration}
                    calories={calories}
                    isAudioEnabled={isEnabled}
                    onToggleAudio={() => setEnabled(!isEnabled)}
                />
            </div>

            {/* Instructions */}
            {isRunning && (
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Instructions</h4>
                        <p className="text-blue-700 text-sm">{'description' in (config ?? {}) ? (config as any).description : 'Follow the on-screen instructions to perform the exercise correctly.'}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
