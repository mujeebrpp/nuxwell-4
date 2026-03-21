'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExerciseType, EXERCISE_CONFIGS } from '@/lib/workout/exerciseDetector';
import * as React from 'react';

// Define the exercise configuration type
interface ExerciseConfiguration {
    exerciseType: ExerciseType;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    targetType: 'reps' | 'time';
    targetValue: number;
}

interface ExerciseSelectorProps {
    onSelectExercise: (exercise: ExerciseType) => void;
    onStartWorkout?: (exercises: ExerciseType[]) => void;
    selectedExercises?: ExerciseType[];
    mode?: 'single' | 'workout';
    onConfigureExercise?: (exercise: ExerciseType, config: ExerciseConfiguration) => void;
}

export function ExerciseSelector({
    onSelectExercise,
    onStartWorkout,
    selectedExercises = [],
    mode = 'single',
    onConfigureExercise,
}: ExerciseSelectorProps) {
    const exercises = Object.entries(EXERCISE_CONFIGS).map(([key, config]) => ({
        type: key as ExerciseType,
        ...config,
    }));

    const isSelected = (type: ExerciseType) => selectedExercises.includes(type);

    // State for configuration (only used in single mode)
    const [difficulty, setDifficulty] = React.useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
    const [targetType, setTargetType] = React.useState<'reps' | 'time'>('reps');
    const [targetValue, setTargetValue] = React.useState<number>(10);

    const handleSelect = (type: ExerciseType) => {
        if (mode === 'workout') {
            if (isSelected(type)) {
                onSelectExercise(type); // Toggle off
            } else {
                onSelectExercise(type); // Toggle on
            }
        } else {
            // In single mode, configure and start workout
            const exerciseConfig = EXERCISE_CONFIGS[type];
            const difficultySettings = exerciseConfig.difficultySettings[difficulty];

            // Determine target value based on type
            let finalTargetValue = targetValue;
            if (targetType === 'reps') {
                finalTargetValue = difficultySettings.targetReps;
            } else {
                finalTargetValue = difficultySettings.targetTime;
            }

            // Create configuration object
            const config: ExerciseConfiguration = {
                exerciseType: type,
                difficulty,
                targetType,
                targetValue: finalTargetValue
            };

            // Call the configure exercise callback if provided
            onConfigureExercise?.(type, config);

            // Also call the original select exercise callback for backward compatibility
            onSelectExercise(type);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        {mode === 'single' ? 'Choose an Exercise' : 'Build Your Workout'}
                    </h2>
                    <p className="text-slate-600 mt-1">
                        {mode === 'single'
                            ? 'Select an exercise to start tracking'
                            : `${selectedExercises.length} exercise${selectedExercises.length !== 1 ? 's' : ''} selected`}
                    </p>
                </div>

                {mode === 'workout' && selectedExercises.length > 1 && onStartWorkout && (
                    <Button
                        onClick={() => onStartWorkout(selectedExercises)}
                        className="bg-emerald-500 hover:bg-emerald-600"
                    >
                        Start Workout
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {exercises.map((exercise) => (
                    <Card
                        key={exercise.type}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${isSelected(exercise.type)
                                ? 'ring-2 ring-emerald-500 bg-emerald-50'
                                : 'hover:border-emerald-300'
                            }`}
                        onClick={() => handleSelect(exercise.type)}
                    >
                        <CardContent className="p-4 text-center">
                            <div className="text-4xl mb-2">{exercise.icon}</div>
                            <h3 className="font-semibold text-slate-900 text-sm">{exercise.name}</h3>
                            {mode === 'workout' && (
                                <div className="mt-2">
                                    {isSelected(exercise.type) ? (
                                        <span className="text-emerald-600 text-xs">✓ Selected</span>
                                    ) : (
                                        <span className="text-slate-400 text-xs">+ Add</span>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {mode === 'single' && (
                <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-2">How to do each exercise:</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        {exercises.map((exercise) => (
                            <div key={exercise.type} className="flex items-start gap-3">
                                <span className="text-2xl">{exercise.icon}</span>
                                <div>
                                    <h4 className="font-medium text-slate-900">{exercise.name}</h4>
                                    <p className="text-sm text-slate-600">{exercise.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {mode === 'single' && (
                <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-4">Configure Your Workout</h3>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Difficulty Level
                        </label>
                        <div className="flex space-x-4">
                            {['beginner', 'intermediate', 'advanced'].map((level) => (
                                <label key={level} className={`flex items-center gap-2 p-3 rounded-lg border ${difficulty === level
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}>
                                    <input
                                        type="radio"
                                        checked={difficulty === level}
                                        onChange={() => setDifficulty(level as 'beginner' | 'intermediate' | 'advanced')}
                                        className="h-4 w-4 text-emerald-600"
                                        aria-label={`Set difficulty to ${level}`}
                                    />
                                    <span className="text-sm font-medium text-slate-900">
                                        {level.charAt(0).toUpperCase() + level.slice(1)}
                                    </span>
                                </label>
                            ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            Select difficulty level to adjust workout intensity
                        </p>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Target Type
                        </label>
                        <div className="flex space-x-4">
                            {['reps', 'time'].map((type) => (
                                <label key={type} className={`flex items-center gap-2 p-3 rounded-lg border ${targetType === type
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}>
                                    <input
                                        type="radio"
                                        checked={targetType === type}
                                        onChange={() => setTargetType(type as 'reps' | 'time')}
                                        className="h-4 w-4 text-emerald-600"
                                        aria-label={`Set target type to ${type}`}
                                    />
                                    <span className="text-sm font-medium text-slate-900">
                                        {type === 'reps' ? 'Repetitions' : 'Time (seconds)'}
                                    </span>
                                </label>
                            ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            Choose between rep-based or time-based goals
                        </p>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            {targetType === 'reps' ? 'Target Repetitions' : 'Target Time (seconds)'}
                        </label>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setTargetValue(Math.max(0, targetValue - 5))}
                                className="w-10 h-10 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-lg"
                            >
                                -
                            </button>
                            <input
                                type="number"
                                value={targetValue}
                                onChange={(e) => setTargetValue(Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-20 text-center px-3 py-2 border border-slate-200 rounded-lg text-lg font-semibold"
                                min="0"
                                max={targetType === 'reps' ? 100 : 300}
                            />
                            <button
                                onClick={() => setTargetValue(targetValue + 5)}
                                className="w-10 h-10 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-lg"
                            >
                                +
                            </button>
                            <span className="text-sm text-slate-500">
                                {targetType === 'reps' ? 'reps' : 'seconds'}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            Set to 0 for unlimited (manual stop)
                        </p>
                    </div>

                    <div className="mt-4">
                        <p className="text-sm font-medium text-slate-700 mb-2">Quick Select:</p>
                        <div className="flex flex-wrap gap-2">
                            {targetType === 'reps' ? (
                                <>
                                    <button
                                        onClick={() => setTargetValue(0)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${targetValue === 0 ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        Unlimited
                                    </button>
                                    <button
                                        onClick={() => setTargetValue(5)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${targetValue === 5 ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        5 reps
                                    </button>
                                    <button
                                        onClick={() => setTargetValue(10)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${targetValue === 10 ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        10 reps (Beginner)
                                    </button>
                                    <button
                                        onClick={() => setTargetValue(15)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${targetValue === 15 ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        15 reps
                                    </button>
                                    <button
                                        onClick={() => setTargetValue(20)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${targetValue === 20 ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        20 reps (Intermediate)
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setTargetValue(0)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${targetValue === 0 ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        Unlimited
                                    </button>
                                    <button
                                        onClick={() => setTargetValue(20)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${targetValue === 20 ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        20 seconds
                                    </button>
                                    <button
                                        onClick={() => setTargetValue(30)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${targetValue === 30 ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        30 seconds (Beginner)
                                    </button>
                                    <button
                                        onClick={() => setTargetValue(45)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${targetValue === 45 ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        45 seconds (Intermediate)
                                    </button>
                                    <button
                                        onClick={() => setTargetValue(60)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${targetValue === 60 ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        60 seconds (Advanced)
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="mt-6">
                        <Button
                            onClick={() => {
                                const exerciseType = exercises.find(ex => !isSelected(ex.type))?.type || exercises[0].type;
                                handleSelect(exerciseType);
                            }}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-lg"
                        >
                            Start Workout
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
