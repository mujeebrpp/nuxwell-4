'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
    ExerciseType,
    ExerciseState,
    createDefaultExerciseState,
    getExerciseConfig,
    EXERCISE_CONFIGS,
} from '@/lib/workout/exerciseDetector';
import { Landmark } from '@/lib/workout/poseUtils';
import * as poseUtils from '@/lib/workout/poseUtils';

interface UseExerciseDetectorOptions {
    exerciseType: ExerciseType;
    onRepComplete?: (repCount: number) => void;
    onFormFeedback?: (feedback: string, isGood: boolean) => void;
}

interface UseExerciseDetectorReturn {
    exerciseState: ExerciseState;
    exerciseConfig: typeof EXERCISE_CONFIGS[ExerciseType];
    resetExercise: () => void;
    updateExercise: (landmarks: Landmark[]) => void;
    setExerciseType: (type: ExerciseType) => void;
}

// Exercise state tracking (internal)
interface DetectionStates {
    squat: { phase: 'top' | 'descending' | 'bottom'; bottomMetrics: any; lastRepTime: number; lastBottomAt: number };
    jack: { phase: 'closed' | 'open'; openMetrics: any; lastRepTime: number };
    curl: { phase: 'down' | 'up'; peakMetrics: any; lastRepTime: number; lastPeakAt: number };
    raise: { phase: 'down' | 'up'; peakMetrics: any; lastRepTime: number; lastPeakAt: number };
    lateralRaise: { phase: 'down' | 'up'; peakMetrics: any; lastRepTime: number; lastPeakAt: number };
    press: { phase: 'down' | 'up'; peakMetrics: any; lastRepTime: number; lastPeakAt: number };
    row: { phase: 'down' | 'up'; peakMetrics: any; lastRepTime: number; lastPeakAt: number };
    lunge: { phase: 'standing' | 'bottom'; bottomMetrics: any; lastRepTime: number; lastBottomAt: number };
    knees: { phase: 'neutral' | 'up'; side: 'left' | 'right' | null; peakMetrics: any; lastRepTime: number };
    sideLeg: { phase: 'center' | 'raised'; side: 'left' | 'right' | null; peakMetrics: any; lastRepTime: number };
    sideStep: { phase: 'closed' | 'open'; peakMetrics: any; lastRepTime: number };
    twist: { phase: 'center' | 'twisting' | 'ready'; side: 'left' | 'right' | null; lastRepTime: number };
    oblique: { phase: 'open' | 'crunch'; side: 'left' | 'right' | null; peakMetrics: any; lastRepTime: number };
    crossDrive: { phase: 'open' | 'drive'; side: 'left' | 'right' | null; peakMetrics: any; lastRepTime: number };
    woodChop: { phase: 'neutral' | 'chop'; diagonal: 'left_high' | 'right_high' | 'left_low' | 'right_low' | null; peakMetrics: any; lastRepTime: number };
    twistReach: { phase: 'center' | 'reach' | 'ready'; side: 'left' | 'right' | null; peakMetrics: any; lastRepTime: number };
}

import { detectExerciseWithState } from '@/lib/workout/exerciseDetector';

export function useExerciseDetector({
    exerciseType,
    onRepComplete,
    onFormFeedback,
}: UseExerciseDetectorOptions): UseExerciseDetectorReturn {
    const [exerciseState, setExerciseState] = useState<ExerciseState>(() =>
        createDefaultExerciseState()
    );
    const [currentExercise, setCurrentExercise] = useState<ExerciseType>(exerciseType);

    const detectionStatesRef = useRef<DetectionStates>({
        squat: { phase: 'top', bottomMetrics: null, lastRepTime: 0, lastBottomAt: 0 },
        jack: { phase: 'closed', openMetrics: null, lastRepTime: 0 },
        curl: { phase: 'down', peakMetrics: null, lastRepTime: 0, lastPeakAt: 0 },
        raise: { phase: 'down', peakMetrics: null, lastRepTime: 0, lastPeakAt: 0 },
        lateralRaise: { phase: 'down', peakMetrics: null, lastRepTime: 0, lastPeakAt: 0 },
        press: { phase: 'down', peakMetrics: null, lastRepTime: 0, lastPeakAt: 0 },
        row: { phase: 'down', peakMetrics: null, lastRepTime: 0, lastPeakAt: 0 },
        lunge: { phase: 'standing', bottomMetrics: null, lastRepTime: 0, lastBottomAt: 0 },
        knees: { phase: 'neutral', side: null, peakMetrics: null, lastRepTime: 0 },
        sideLeg: { phase: 'center', side: null, peakMetrics: null, lastRepTime: 0 },
        sideStep: { phase: 'closed', peakMetrics: null, lastRepTime: 0 },
        twist: { phase: 'center', side: null, lastRepTime: 0 },
        oblique: { phase: 'open', side: null, peakMetrics: null, lastRepTime: 0 },
        crossDrive: { phase: 'open', side: null, peakMetrics: null, lastRepTime: 0 },
        woodChop: { phase: 'neutral', diagonal: null, peakMetrics: null, lastRepTime: 0 },
        twistReach: { phase: 'center', side: null, peakMetrics: null, lastRepTime: 0 },
    });

    const prevExerciseTypeRef = useRef(exerciseType);
    useEffect(() => {
        if (prevExerciseTypeRef.current !== exerciseType) {
            prevExerciseTypeRef.current = exerciseType;
            setCurrentExercise(exerciseType);
            setExerciseState(createDefaultExerciseState());
            detectionStatesRef.current = {
                squat: { phase: 'top', bottomMetrics: null, lastRepTime: 0, lastBottomAt: 0 },
                jack: { phase: 'closed', openMetrics: null, lastRepTime: 0 },
                curl: { phase: 'down', peakMetrics: null, lastRepTime: 0, lastPeakAt: 0 },
                raise: { phase: 'down', peakMetrics: null, lastRepTime: 0, lastPeakAt: 0 },
                lateralRaise: { phase: 'down', peakMetrics: null, lastRepTime: 0, lastPeakAt: 0 },
                press: { phase: 'down', peakMetrics: null, lastRepTime: 0, lastPeakAt: 0 },
                row: { phase: 'down', peakMetrics: null, lastRepTime: 0, lastPeakAt: 0 },
                lunge: { phase: 'standing', bottomMetrics: null, lastRepTime: 0, lastBottomAt: 0 },
                knees: { phase: 'neutral', side: null, peakMetrics: null, lastRepTime: 0 },
                sideLeg: { phase: 'center', side: null, peakMetrics: null, lastRepTime: 0 },
                sideStep: { phase: 'closed', peakMetrics: null, lastRepTime: 0 },
                twist: { phase: 'center', side: null, lastRepTime: 0 },
                oblique: { phase: 'open', side: null, peakMetrics: null, lastRepTime: 0 },
                crossDrive: { phase: 'open', side: null, peakMetrics: null, lastRepTime: 0 },
                woodChop: { phase: 'neutral', diagonal: null, peakMetrics: null, lastRepTime: 0 },
                twistReach: { phase: 'center', side: null, peakMetrics: null, lastRepTime: 0 },
            };
        }
    }, [exerciseType]);

    // Reset exercise state
    const resetExercise = useCallback(() => {
        setExerciseState(createDefaultExerciseState());
        detectionStatesRef.current = {
            squat: { phase: 'top', bottomMetrics: null, lastRepTime: 0, lastBottomAt: 0 },
            jack: { phase: 'closed', openMetrics: null, lastRepTime: 0 },
            curl: { phase: 'down', peakMetrics: null, lastRepTime: 0, lastPeakAt: 0 },
            raise: { phase: 'down', peakMetrics: null, lastRepTime: 0, lastPeakAt: 0 },
            lateralRaise: { phase: 'down', peakMetrics: null, lastRepTime: 0, lastPeakAt: 0 },
            press: { phase: 'down', peakMetrics: null, lastRepTime: 0, lastPeakAt: 0 },
            row: { phase: 'down', peakMetrics: null, lastRepTime: 0, lastPeakAt: 0 },
            lunge: { phase: 'standing', bottomMetrics: null, lastRepTime: 0, lastBottomAt: 0 },
            knees: { phase: 'neutral', side: null, peakMetrics: null, lastRepTime: 0 },
            sideLeg: { phase: 'center', side: null, peakMetrics: null, lastRepTime: 0 },
            sideStep: { phase: 'closed', peakMetrics: null, lastRepTime: 0 },
            twist: { phase: 'center', side: null, lastRepTime: 0 },
            oblique: { phase: 'open', side: null, peakMetrics: null, lastRepTime: 0 },
            crossDrive: { phase: 'open', side: null, peakMetrics: null, lastRepTime: 0 },
            woodChop: { phase: 'neutral', diagonal: null, peakMetrics: null, lastRepTime: 0 },
            twistReach: { phase: 'center', side: null, peakMetrics: null, lastRepTime: 0 },
        };
    }, []);

    // Update exercise detection with new landmarks
    const updateExercise = useCallback(
        (landmarks: Landmark[]) => {
            const now = performance.now();
            let incrementRep = false;
            let feedbackMsg = '';

            detectExerciseWithState(
                currentExercise,
                landmarks,
                detectionStatesRef.current,
                now,
                (_exercise: ExerciseType, _score: any) => {
                    incrementRep = true;
                    feedbackMsg = _score.cues?.[0] || '';
                }
            );

            setExerciseState((prev) => ({
                ...prev,
                repCount: incrementRep ? prev.repCount + 1 : prev.repCount,
                formFeedback: feedbackMsg || prev.formFeedback,
            }));

            if (incrementRep && onRepComplete) {
                onRepComplete(exerciseState.repCount + 1);
            }
        },
        [currentExercise, exerciseState.repCount, onRepComplete]
    );

    // Set exercise type
    const setExerciseType = useCallback((type: ExerciseType) => {
        setCurrentExercise(type);
        setExerciseState(createDefaultExerciseState());
        detectionStatesRef.current = {
            squat: { phase: 'top', bottomMetrics: null, lastRepTime: 0, lastBottomAt: 0 },
            jack: { phase: 'closed', openMetrics: null, lastRepTime: 0 },
            curl: { phase: 'down', peakMetrics: null, lastRepTime: 0, lastPeakAt: 0 },
            raise: { phase: 'down', peakMetrics: null, lastRepTime: 0, lastPeakAt: 0 },
            lateralRaise: { phase: 'down', peakMetrics: null, lastRepTime: 0, lastPeakAt: 0 },
            press: { phase: 'down', peakMetrics: null, lastRepTime: 0, lastPeakAt: 0 },
            row: { phase: 'down', peakMetrics: null, lastRepTime: 0, lastPeakAt: 0 },
            lunge: { phase: 'standing', bottomMetrics: null, lastRepTime: 0, lastBottomAt: 0 },
            knees: { phase: 'neutral', side: null, peakMetrics: null, lastRepTime: 0 },
            sideLeg: { phase: 'center', side: null, peakMetrics: null, lastRepTime: 0 },
            sideStep: { phase: 'closed', peakMetrics: null, lastRepTime: 0 },
            twist: { phase: 'center', side: null, lastRepTime: 0 },
            oblique: { phase: 'open', side: null, peakMetrics: null, lastRepTime: 0 },
            crossDrive: { phase: 'open', side: null, peakMetrics: null, lastRepTime: 0 },
            woodChop: { phase: 'neutral', diagonal: null, peakMetrics: null, lastRepTime: 0 },
            twistReach: { phase: 'center', side: null, peakMetrics: null, lastRepTime: 0 },
        };
    }, []);

    return {
        exerciseState,
        exerciseConfig: getExerciseConfig(currentExercise),
        resetExercise,
        updateExercise,
        setExerciseType,
    };
}

// Get all available exercises
export function useExerciseLibrary() {
    const exercises = Object.entries(EXERCISE_CONFIGS).map(([key, config]) => ({
        type: key as ExerciseType,
        ...config,
    }));

    return exercises;
}