'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CameraView } from './CameraView';
import { RepCounter } from './RepCounter';
import { detectExercise, ExerciseType, ExerciseState, RepPhase, createDefaultExerciseState, EXERCISE_CONFIGS } from '@/lib/workout/exerciseDetector';
import { Landmark } from '@/lib/workout/poseUtils';
import { useAudioFeedback } from '@/hooks/useAudioFeedback';
import { useMediaPipePose } from '@/hooks/useMediaPipePose';
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
    exerciseDuration?: number;
    targetReps?: number;
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
    formScore?: number;
}

export function WorkoutSession({
    exerciseType,
    onComplete,
    onExit,
    exerciseDuration = 0,
    targetReps = 0,
    exerciseConfig,
}: WorkoutSessionProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationFrameRef = useRef<number>(0);
    const startTimeRef = useRef<number>(0);

    const [isRunning, setIsRunning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [landmarks, setLandmarks] = useState<Landmark[] | null>(null);
    const [exerciseState, setExerciseState] = useState<ExerciseState>(createDefaultExerciseState());
    const [duration, setDuration] = useState(0);
    const [calories, setCalories] = useState(0);
const [isPaused, setIsPaused] = useState(false);
    const [showSkeleton, setShowSkeleton] = useState(true);
    const [targetReached, setTargetReached] = useState(false);
    const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
    const [zoom, setZoom] = useState(1);

    const isRunningRef = useRef<boolean>(isRunning);
    const isPausedRef = useRef<boolean>(isPaused);
    const exerciseStateRef = useRef<ExerciseState>(exerciseState);
    const landmarksRef = useRef<Landmark[] | null>(null);
    const lastLandmarksUpdateRef = useRef<number>(0);

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

    const { speak, speakCount, isEnabled, setEnabled } = useAudioFeedback({
        enabled: true,
    });

    const config = exerciseConfig ?? EXERCISE_CONFIGS[exerciseType];

    const initCamera = useCallback(async () => {
        if (!videoRef.current) return false;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
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

    const detectExerciseCallback = useCallback((poseLandmarks: Landmark[]) => {
        if (!isRunningRef.current || isPausedRef.current) return;

        const now = Date.now();
        if (now - lastLandmarksUpdateRef.current < 100) return;
        lastLandmarksUpdateRef.current = now;

        setLandmarks([...poseLandmarks]);

        const newState = detectExercise(exerciseType, poseLandmarks, exerciseStateRef.current);

        setExerciseState(newState);
    }, [exerciseType]);

    const {
        isLoading: poseLoading,
        error: poseError,
        isRunning: poseRunning,
        settings,
        reloadSettings,
    } = useMediaPipePose({
        onPoseDetected: detectExerciseCallback,
        running: isRunning && !isPaused,
        videoRef: localVideoRef,
    });

    const startWorkout = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        isRunningRef.current = true;
        setIsRunning(true);
        setIsLoading(false);
        startTimeRef.current = Date.now();
    }, []);

    const stopWorkout = useCallback(() => {
        setIsRunning(false);
        isRunningRef.current = false;

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
    }, []);

    const resetWorkout = useCallback(() => {
        stopWorkout();
        setExerciseState(createDefaultExerciseState());
        setDuration(0);
        setCalories(0);
        setTargetReached(false);
        setLandmarks(null);
    }, [stopWorkout]);

    const handleExit = useCallback(() => {
        stopWorkout();

        const stats: WorkoutStats = {
            exerciseType,
            repCount: exerciseState.repCount,
            duration,
            calories,
            timestamp: new Date(),
            formScore: exerciseState.formScore,
        };

        onComplete(stats);
    }, [stopWorkout, exerciseType, exerciseState.repCount, duration, calories, onComplete]);

    const cancelWorkout = useCallback(() => {
        if (window.confirm('Are you sure you want to cancel this workout? All progress will be lost.')) {
            resetWorkout();
        }
    }, [resetWorkout]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isRunning && !isPaused) {
            interval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
                setDuration(elapsed);

                const caloriesPerMinute = 5;
                setCalories(Math.floor((elapsed / 60) * caloriesPerMinute));

                if (exerciseDuration > 0 && elapsed >= exerciseDuration) {
                    handleExit();
                }
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRunning, isPaused, exerciseDuration, handleExit]);

    useEffect(() => {
        let targetReachedCondition = false;

        if (config && 'targetType' in config) {
            if (config.targetType === 'reps' && config.targetValue > 0) {
                targetReachedCondition = exerciseState.repCount >= config.targetValue;
            } else if (config.targetType === 'time' && config.targetValue > 0) {
                targetReachedCondition = duration >= config.targetValue;
            }
        } else {
            targetReachedCondition = targetReps > 0 && exerciseState.repCount >= targetReps;
        }

        if (targetReachedCondition && isRunning && !targetReached) {
            const targetMessage = config && 'targetType' in config && config.targetType === 'time'
                ? `Congratulations! You completed ${config.targetValue} seconds!`
                : `Congratulations! You reached your target!`;
            speak(targetMessage);
            setTargetReached(true);
            setIsPaused(true);
        }
    }, [exerciseState.repCount, duration, config, targetReps, isRunning, targetReached, speak]);

    const confettiColors = ['bg-yellow-300', 'bg-orange-300', 'bg-red-300', 'bg-pink-300', 'bg-purple-300'];
    const confettiStyles = Array.from({ length: 20 }).map((_, i) => ({
        left: `${(i * 5 + 13) % 100}%`,
        top: `${(i * 7 + 23) % 100}%`,
        animationDelay: `${(i * 0.1) % 2}s`,
        animationDuration: `${1 + (i % 2)}s`,
    }));

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

            {(error || poseError) && (
                <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <XCircle className="w-5 h-5 text-red-500" />
                            <p className="text-red-700">{error || poseError}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

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
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {confettiStyles.map((style, i) => (
                            <div
                                key={i}
                                className={`absolute w-2 h-2 rounded-full animate-ping ${confettiColors[i % confettiColors.length]}`}
                                style={style}
                            />
                        ))}
                    </div>
                </Card>
            )}

            <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
                <div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
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
                    videoRef={localVideoRef}
                    canvasRef={canvasRef}
                    landmarks={landmarks}
                    isRunning={isRunning && !isPaused}
                    showSkeleton={showSkeleton}
                    orientation={orientation}
                    zoom={zoom}
                />

                    <div className="mt-3 lg:mt-4 flex flex-wrap justify-center gap-2 lg:gap-3">
                        {!isRunning ? (
                            <Button
                                onClick={startWorkout}
                                disabled={isLoading || poseLoading}
                                className="bg-emerald-500 hover:bg-emerald-600 w-full sm:w-auto min-w-[140px]"
                            >
                                {isLoading || poseLoading ? (
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

                <RepCounter
                    exerciseState={exerciseState}
                    exerciseType={exerciseType}
                    duration={duration}
                    calories={calories}
                    isAudioEnabled={isEnabled}
                    onToggleAudio={() => setEnabled(!isEnabled)}
                />
            </div>

            {isRunning && (
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Instructions</h4>
                        <p className="text-blue-700 text-sm">
                            {config && 'description' in config
                                ? (config as any).description
                                : EXERCISE_CONFIGS[exerciseType]?.description || 'Follow the on-screen instructions to perform the exercise correctly.'}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}