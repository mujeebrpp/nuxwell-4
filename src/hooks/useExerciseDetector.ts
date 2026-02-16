'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
    ExerciseType,
    ExerciseState,
    createDefaultExerciseState,
    detectExercise,
    getExerciseConfig,
    EXERCISE_CONFIGS,
} from '@/lib/workout/exerciseDetector';
import { Landmark } from '@/lib/workout/poseUtils';

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

export function useExerciseDetector({
    exerciseType,
    onRepComplete,
    onFormFeedback,
}: UseExerciseDetectorOptions): UseExerciseDetectorReturn {
    const [exerciseState, setExerciseState] = useState<ExerciseState>(() =>
        createDefaultExerciseState()
    );
    const [currentExercise, setCurrentExercise] = useState<ExerciseType>(exerciseType);

    // Additional state for exercise-specific tracking
    const additionalStateRef = useRef<any>({
        prevKneeAngle: 0,
        prevSide: 'left' as 'left' | 'right',
        holdTimeRef: { current: 0 },
        burpeeState: { phase: 'start' },
    });

    // Update when exercise type changes
    useEffect(() => {
        setCurrentExercise(exerciseType);
        setExerciseState(createDefaultExerciseState());
        additionalStateRef.current = {
            prevKneeAngle: 0,
            prevSide: 'left',
            holdTimeRef: { current: 0 },
            burpeeState: { phase: 'start' },
        };
    }, [exerciseType]);

    // Reset exercise state
    const resetExercise = useCallback(() => {
        setExerciseState(createDefaultExerciseState());
        additionalStateRef.current = {
            prevKneeAngle: 0,
            prevSide: 'left',
            holdTimeRef: { current: 0 },
            burpeeState: { phase: 'start' },
        };
    }, []);

    // Update exercise detection with new landmarks
    const updateExercise = useCallback(
        (landmarks: Landmark[]) => {
            const newState = detectExercise(
                currentExercise,
                landmarks,
                exerciseState,
                additionalStateRef.current
            );

            // Update additional state
            if (currentExercise === 'squat' || currentExercise === 'mountainClimber') {
                const angles = landmarks ? (require('@/lib/workout/poseUtils') as any).getPoseAngles(landmarks) : null;
                if (angles) {
                    additionalStateRef.current.prevKneeAngle =
                        (angles.leftKneeAngle + angles.rightKneeAngle) / 2;
                }
            }

            if (
                currentExercise === 'lunge' ||
                currentExercise === 'mountainClimber' ||
                currentExercise === 'highKnees'
            ) {
                // Track side for alternating exercises
            }

            if (currentExercise === 'plank') {
                additionalStateRef.current.holdTimeRef.current += 1;
            }

            // Check for rep completion
            if (newState.repCount > exerciseState.repCount) {
                onRepComplete?.(newState.repCount);
            }

            // Check for form feedback changes
            if (newState.formFeedback !== exerciseState.formFeedback) {
                onFormFeedback?.(newState.formFeedback, newState.isFormGood);
            }

            setExerciseState(newState);
        },
        [currentExercise, exerciseState, onRepComplete, onFormFeedback]
    );

    // Set exercise type
    const setExerciseType = useCallback((type: ExerciseType) => {
        setCurrentExercise(type);
        setExerciseState(createDefaultExerciseState());
        additionalStateRef.current = {
            prevKneeAngle: 0,
            prevSide: 'left',
            holdTimeRef: { current: 0 },
            burpeeState: { phase: 'start' },
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
