'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExerciseType, EXERCISE_CONFIGS } from '@/lib/workout/exerciseDetector';

interface ExerciseSelectorProps {
    onSelectExercise: (exercise: ExerciseType) => void;
    onStartWorkout?: (exercises: ExerciseType[]) => void;
    selectedExercises?: ExerciseType[];
    mode?: 'single' | 'workout';
}

export function ExerciseSelector({
    onSelectExercise,
    onStartWorkout,
    selectedExercises = [],
    mode = 'single',
}: ExerciseSelectorProps) {
    const exercises = Object.entries(EXERCISE_CONFIGS).map(([key, config]) => ({
        type: key as ExerciseType,
        ...config,
    }));

    const isSelected = (type: ExerciseType) => selectedExercises.includes(type);

    const handleSelect = (type: ExerciseType) => {
        if (mode === 'workout') {
            if (isSelected(type)) {
                onSelectExercise(type); // Toggle off
            } else {
                onSelectExercise(type); // Toggle on
            }
        } else {
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
                        className={`
              cursor-pointer transition-all duration-200 hover:shadow-lg
              ${isSelected(exercise.type)
                                ? 'ring-2 ring-emerald-500 bg-emerald-50'
                                : 'hover:border-emerald-300'
                            }
            `}
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

            {/* Exercise Details */}
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
        </div>
    );
}
