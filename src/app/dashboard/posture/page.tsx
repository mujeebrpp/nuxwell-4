'use client';

import { useState, useRef } from 'react';
import { CheckCircle, ArrowLeft, MonitorPlay, Smartphone, ZoomIn, ZoomOut, Camera, CameraOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMediaPipePose } from '@/hooks/useMediaPipePose';
import { getPoseAngles } from '@/lib/workout/poseUtils';
import { CameraView } from '@/components/workout/CameraView';

interface PostureAssessment {
    id: 'forward_head_posture' | 'rounded_shoulders' | 'shoulder_asymmetry';
    name: string;
    description: string;
    icon: string;
    instruction: string;
}

const postureAssessments: PostureAssessment[] = [
    {
        id: 'forward_head_posture',
        name: 'Forward Head Posture',
        description: 'Assess head position relative to shoulder alignment for neck and upper spine health.',
        icon: '📏',
        instruction: 'Stand tall with your back against a wall. Position your heels, buttocks, upper back, and head against the wall.',
    },
    {
        id: 'rounded_shoulders',
        name: 'Rounded Shoulders',
        description: 'Evaluate shoulder position and upper back posture for mobility improvement.',
        icon: '🔍',
        instruction: 'Stand naturally with arms at your sides. Look for shoulders that curve forward.',
    },
    {
        id: 'shoulder_asymmetry',
        name: 'Shoulder Asymmetry',
        description: 'Check for height and rotation differences between left and right shoulders.',
        icon: '⚖️',
        instruction: 'Stand naturally and look for uneven shoulder height or rotation.',
    },
];

export default function PosturePage() {
    const [selectedAssessment, setSelectedAssessment] = useState<PostureAssessment | null>(null);
    const [isAssessing, setIsAssessing] = useState(false);
    const [results, setResults] = useState<Record<string, { score: number }>>({});
    const [postureScore, setPostureScore] = useState(100);
    const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('portrait');
    const [zoom, setZoom] = useState(1);
    const [showSkeleton, setShowSkeleton] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const { isLoading, error, landmarks } = useMediaPipePose({
        videoRef,
        running: isAssessing,
        onPoseDetected: (landmarks) => {
            const metrics = getPoseAngles(landmarks);
            if (metrics) {
                const newScore = Math.min(100, Math.max(0, Math.round(
                    ((metrics.torsoMetric + metrics.symmetryMetric) / 2) * 100
                )));
                setPostureScore(newScore);
            }
        },
    });

    const startAssessment = (assessment: PostureAssessment) => {
        setSelectedAssessment(assessment);
        setIsAssessing(true);
        setPostureScore(100);
    };

    const stopAssessment = () => {
        setResults({ ...results, [selectedAssessment!.id]: { score: postureScore } });
        setIsAssessing(false);
        setSelectedAssessment(null);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Posture Assessment</h1>
                <p className="text-slate-600 mt-1">Phase 1: Evaluate your posture for safe movement</p>
            </div>

            {!isAssessing ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {postureAssessments.map((assessment) => (
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
                            <div className="flex items-center gap-2 mb-4">
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
                                    <span className="text-sm text-slate-600 min-w-[2rem] text-center">{zoom}x</span>
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

                            <div className="relative mb-4">
                                <CameraView
                                    videoRef={videoRef}
                                    canvasRef={canvasRef}
                                    landmarks={landmarks}
                                    isRunning={isAssessing}
                                    showSkeleton={showSkeleton}
                                    orientation={orientation}
                                    zoom={zoom}
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
                                    <p className="text-sm font-medium text-emerald-700">Posture Score: {postureScore}%</p>
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