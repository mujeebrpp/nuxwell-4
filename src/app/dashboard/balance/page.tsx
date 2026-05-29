'use client';

import { useState, useRef, useEffect } from 'react';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMediaPipePose } from '@/hooks/useMediaPipePose';
import { getPoseAngles } from '@/lib/workout/poseUtils';
import { CameraView } from '@/components/workout/CameraView';

interface BalanceAssessment {
    id: 'double_leg_balance' | 'single_leg_balance' | 'tandem_stand';
    name: string;
    description: string;
    icon: string;
    instruction: string;
}

const balanceAssessments: BalanceAssessment[] = [
    {
        id: 'double_leg_balance',
        name: 'Double-Leg Balance',
        description: 'Test static balance with both feet on the ground.',
        icon: '🦶',
        instruction: 'Stand with feet hip-width apart, arms at sides. Maintain stable position for 30 seconds.',
    },
    {
        id: 'single_leg_balance',
        name: 'Single-Leg Balance',
        description: 'Test balance on one leg to assess stability and proprioception.',
        icon: '🦶',
        instruction: 'Lift one foot slightly off the ground, balance on the other leg. Hold for 20 seconds each side.',
    },
    {
        id: 'tandem_stand',
        name: 'Tandem Stand',
        description: 'Semi-tandem or full tandem stance to assess balance and fall risk.',
        icon: '🦶',
        instruction: 'Place one foot directly in front of the other, heel-to-toe. Maintain balance for 20 seconds.',
    },
];

export default function BalancePage() {
    const [selectedAssessment, setSelectedAssessment] = useState<BalanceAssessment | null>(null);
    const [isAssessing, setIsAssessing] = useState(false);
    const [timer, setTimer] = useState(0);
    const [results, setResults] = useState<Record<string, { time: number; score: number }>>({});
    const [stabilityScore, setStabilityScore] = useState(100);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const { isLoading, isRunning, error, landmarks } = useMediaPipePose({
        videoRef,
        running: isAssessing,
        onPoseDetected: (landmarks) => {
            const metrics = getPoseAngles(landmarks);
            if (metrics) {
                // Calculate stability based on torso movement and symmetry
                const newStability = Math.min(100, Math.max(0, Math.round(
                    (metrics.torsoMetric + metrics.symmetryMetric) * 50
                )));
                setStabilityScore(newStability);
            }
        },
    });

    useEffect(() => {
        if (isAssessing && isRunning) {
            timerRef.current = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isAssessing, isRunning]);

    const startAssessment = (assessment: BalanceAssessment) => {
        setSelectedAssessment(assessment);
        setIsAssessing(true);
        setTimer(0);
        setStabilityScore(100);
    };

    const stopAssessment = () => {
        const score = Math.round((stabilityScore / 100) * 100);
        setResults({ ...results, [selectedAssessment!.id]: { time: timer, score } });
        setIsAssessing(false);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Balance Assessment</h1>
                <p className="text-slate-600 mt-1">Phase 3: Evaluate stability and proprioception</p>
            </div>

            {!isAssessing ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {balanceAssessments.map((assessment) => (
                        <Card
                            key={assessment.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${results[assessment.id] ? 'border-emerald-200 bg-emerald-50' : ''}`}
                            onClick={() => startAssessment(assessment)}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-4xl">{assessment.icon}</span>
                                    <h3 className="font-semibold text-slate-900">{assessment.name}</h3>
                                </div>
                                <p className="text-sm text-slate-600 mb-4">{assessment.description}</p>
                                {results[assessment.id] ? (
                                    <div className="flex items-center gap-2 text-emerald-600">
                                        <CheckCircle className="w-5 h-5" />
                                        <span className="font-medium">
                                            Score: {results[assessment.id].score}% ({results[assessment.id].time}s)
                                        </span>
                                    </div>
                                ) : (
                                    <Button className="w-full bg-emerald-500 hover:bg-emerald-600">
                                        Start Assessment
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" onClick={() => stopAssessment()}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h2 className="text-2xl font-bold text-slate-900">
                            {selectedAssessment?.icon} {selectedAssessment?.name}
                        </h2>
                    </div>

                    <Card>
                        <CardContent className="p-6">
                            <div className="relative mb-4">
                                <CameraView
                                    videoRef={videoRef}
                                    canvasRef={canvasRef}
                                    landmarks={landmarks}
                                    isRunning={isRunning}
                                    width={720}
                                    height={1280}
                                    showSkeleton={true}
                                    orientation="portrait"
                                />
                                {isLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-lg">
                                        <p className="text-white">Loading camera...</p>
                                    </div>
                                )}
                                {error && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-red-500/50 rounded-lg">
                                        <p className="text-white text-sm">{error}</p>
                                    </div>
                                )}
                            </div>

                            <p className="text-slate-600 mb-4">{selectedAssessment?.instruction}</p>
                            
                            <div className="flex gap-3 mb-4">
                                <div className="flex-1 bg-slate-100 rounded-lg p-3">
                                    <p className="text-sm font-medium text-slate-700">Time: {timer}s</p>
                                </div>
                                <div className="flex-1 bg-emerald-100 rounded-lg p-3">
                                    <p className="text-sm font-medium text-emerald-700">Stability: {stabilityScore}%</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-3">
                                <Button
                                    onClick={stopAssessment}
                                    className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Complete Assessment
                                </Button>
                                <Button variant="outline" onClick={() => {
                                    stopAssessment();
                                    setSelectedAssessment(null);
                                }}>
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}