'use client';

import { useState, useRef, useEffect } from 'react';
import { CheckCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMediaPipePose } from '@/hooks/useMediaPipePose';
import { getPoseAngles } from '@/lib/workout/poseUtils';
import { CameraView } from '@/components/workout/CameraView';

interface MobilityAssessment {
    id: 'neck_rom' | 'shoulder_rom' | 'arm_rom';
    name: string;
    description: string;
    icon: string;
    instruction: string;
}

const mobilityAssessments: MobilityAssessment[] = [
    {
        id: 'neck_rom',
        name: 'Neck ROM',
        description: 'Assess cervical spine mobility for safe swimming and daily activities.',
        icon: '🦴',
        instruction: 'Slowly tilt your head side to side, then forward and backward.',
    },
    {
        id: 'shoulder_rom',
        name: 'Shoulder ROM',
        description: 'Evaluate shoulder flexion, abduction, and external rotation range of motion.',
        icon: '💪',
        instruction: 'Raise both arms overhead, then out to the sides.',
    },
    {
        id: 'arm_rom',
        name: 'Arm ROM',
        description: 'Assess shoulder and elbow mobility for overhead reaching.',
        icon: '💪',
        instruction: 'Extend arms forward, then reach overhead.',
    },
];

export default function MobilityPage() {
    const [selectedAssessment, setSelectedAssessment] = useState<MobilityAssessment | null>(null);
    const [isAssessing, setIsAssessing] = useState(false);
    const [mobilityScore, setMobilityScore] = useState(100);
    const [results, setResults] = useState<Record<string, { score: number }>>({});
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const { isLoading, error, landmarks } = useMediaPipePose({
        videoRef,
        running: isAssessing,
        onPoseDetected: (landmarks) => {
            const metrics = getPoseAngles(landmarks);
            if (metrics) {
                // Calculate mobility score based on shoulder and elbow range of motion
                const newScore = Math.min(100, Math.max(0, Math.round(
                    ((metrics.wristLiftMetric + metrics.elbowExtensionMetric) / 2) * 100
                )));
                setMobilityScore(newScore);
            }
        },
    });

    const startAssessment = (assessment: MobilityAssessment) => {
        setSelectedAssessment(assessment);
        setIsAssessing(true);
        setMobilityScore(100);
    };

    const stopAssessment = () => {
        setResults({ ...results, [selectedAssessment!.id]: { score: mobilityScore } });
        setIsAssessing(false);
        setSelectedAssessment(null);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Upper Body Mobility Assessment</h1>
                <p className="text-slate-600 mt-1">Phase 2: Evaluate joint mobility for safe movement</p>
            </div>

            {!isAssessing ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {mobilityAssessments.map((assessment) => (
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
                                        <span className="font-medium">Score: {results[assessment.id].score}%</span>
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
                                    isRunning={isAssessing}
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
                                <div className="flex-1 bg-emerald-100 rounded-lg p-3">
                                    <p className="text-sm font-medium text-emerald-700">Mobility Score: {mobilityScore}%</p>
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