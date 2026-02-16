'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ExerciseState, ExerciseType, EXERCISE_CONFIGS } from '@/lib/workout/exerciseDetector';
import { Flame, Clock, CheckCircle, AlertCircle, Volume2, VolumeX } from 'lucide-react';

interface RepCounterProps {
    exerciseState: ExerciseState;
    exerciseType: ExerciseType;
    duration: number;
    calories?: number;
    isAudioEnabled: boolean;
    onToggleAudio: () => void;
}

export function RepCounter({
    exerciseState,
    exerciseType,
    duration,
    calories = 0,
    isAudioEnabled,
    onToggleAudio,
}: RepCounterProps) {
    const exerciseConfig = EXERCISE_CONFIGS[exerciseType];
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Card className="bg-white shadow-lg">
            <CardContent className="p-6">
                {/* Exercise Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl">{exerciseConfig?.icon || '🏋️'}</span>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">
                                {exerciseConfig?.name || 'Exercise'}
                            </h3>
                            <p className="text-sm text-slate-500">AI Tracking Active</p>
                        </div>
                    </div>

                    <button
                        onClick={onToggleAudio}
                        className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                        title={isAudioEnabled ? 'Mute audio' : 'Enable audio'}
                    >
                        {isAudioEnabled ? (
                            <Volume2 className="w-5 h-5 text-slate-600" />
                        ) : (
                            <VolumeX className="w-5 h-5 text-slate-400" />
                        )}
                    </button>
                </div>

                {/* Rep Count Display */}
                <div className="text-center mb-6">
                    <div className="relative inline-block">
                        <div className="text-8xl font-bold text-slate-900">
                            {exerciseState.repCount}
                        </div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-sm font-medium text-slate-500 bg-white px-2">
                            REPS
                        </div>
                    </div>
                </div>

                {/* Form Feedback */}
                <div
                    className={`
            flex items-center justify-center gap-2 p-3 rounded-lg mb-6
            ${exerciseState.isFormGood
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }
          `}
                >
                    {exerciseState.isFormGood ? (
                        <CheckCircle className="w-5 h-5" />
                    ) : (
                        <AlertCircle className="w-5 h-5" />
                    )}
                    <span className="font-medium">
                        {exerciseState.formFeedback || (exerciseState.isFormGood ? 'Good form!' : 'Adjust position')}
                    </span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Duration */}
                    <div className="bg-slate-50 rounded-lg p-4 text-center">
                        <Clock className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                        <div className="text-2xl font-bold text-slate-900">{formatTime(duration)}</div>
                        <div className="text-xs text-slate-500">Duration</div>
                    </div>

                    {/* Calories */}
                    <div className="bg-slate-50 rounded-lg p-4 text-center">
                        <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                        <div className="text-2xl font-bold text-slate-900">{calories}</div>
                        <div className="text-xs text-slate-500">Calories</div>
                    </div>
                </div>

                {/* Confidence Indicator */}
                <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-slate-500">Detection Confidence</span>
                        <span className="text-slate-700 font-medium">
                            {Math.round(exerciseState.confidence * 100)}%
                        </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                            className={`
                h-2 rounded-full transition-all
                ${exerciseState.confidence > 0.7
                                    ? 'bg-emerald-500'
                                    : exerciseState.confidence > 0.4
                                        ? 'bg-amber-500'
                                        : 'bg-red-500'
                                }
              `}
                            style={{ width: `${exerciseState.confidence * 100}%` }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
