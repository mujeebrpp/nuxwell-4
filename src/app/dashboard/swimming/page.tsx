'use client';

import { useState, useRef, useEffect } from 'react';
import { CheckCircle, ArrowLeft, Shield, MonitorPlay, Smartphone, ZoomIn, ZoomOut, Camera, CameraOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMediaPipePose } from '@/hooks/useMediaPipePose';
import { getPoseAngles } from '@/lib/workout/poseUtils';
import { CameraView } from '@/components/workout/CameraView';

interface SwimmingAssessment {
    id: 'shoulder_mobility' | 'overhead_reach' | 'rotation';
    name: string;
    description: string;
    icon: string;
    instruction: string;
}

const swimmingAssessments: SwimmingAssessment[] = [
    {
        id: 'shoulder_mobility',
        name: 'Shoulder Mobility',
        description: 'Range of motion for freestyle and butterfly strokes.',
        icon: '💪',
        instruction: 'Raise arms overhead and behind your back.',
    },
    {
        id: 'overhead_reach',
        name: 'Overhead Reach',
        description: 'Ability to reach arms overhead for backstroke and starts.',
        icon: '🙆',
        instruction: 'Reach both arms straight up overhead as high as possible.',
    },
    {
        id: 'rotation',
        name: 'Rotation',
        description: 'Torso rotation for freestyle and backstroke efficiency.',
        icon: '🔄',
        instruction: 'Rotate your torso left and right while keeping hips stable.',
    },
];

export default function SwimmingPage() {
    const [selectedAssessment, setSelectedAssessment] = useState<SwimmingAssessment | null>(null);
    const [isAssessing, setIsAssessing] = useState(false);
    const [timer, setTimer] = useState(0);
    const [swimScore, setSwimScore] = useState(100);
    const [results, setResults] = useState<Record<string, { score: number; time: number }>>({});
    const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('portrait');
    const [zoom, setZoom] = useState(1);
    const [showSkeleton, setShowSkeleton] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const { isLoading, isRunning, error, landmarks } = useMediaPipePose({
        videoRef,
        running: isAssessing,
        onPoseDetected: (landmarks) => {
            const metrics = getPoseAngles(landmarks);
            if (metrics) {
                const newScore = Math.min(100, Math.max(0, Math.round(
                    ((metrics.torsoMetric + metrics.wristAboveHeadMetric) / 2) * 100
                )));
                setSwimScore(newScore);
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

    const readinessScore = results.shoulder_mobility?.score !== undefined
        ? Math.round((Object.values(results).reduce((sum, r) => sum + r.score, 0) / swimmingAssessments.length))
        : null;

    const startAssessment = (assessment: SwimmingAssessment) => {
        setSelectedAssessment(assessment);
        setIsAssessing(true);
        setTimer(0);
        setSwimScore(100);
    };

    const stopAssessment = () => {
        setResults({ ...results, [selectedAssessment!.id]: { score: swimScore, time: timer } });
        setIsAssessing(false);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Swimming Readiness Assessment</h1>
                <p className="text-slate-600 mt-1">Phase 5: Evaluate your preparedness for swimming activities</p>
            </div>

            {readinessScore !== null && (
                <Card className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-0">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Shield className="w-10 h-10" />
                                <div>
                                    <h2 className="text-2xl font-bold">Swimming Readiness Score</h2>
                                    <p className="text-blue-100">Your overall swimming preparedness</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-5xl font-bold">{readinessScore}%</p>
                                <p className="text-sm text-blue-100">
                                    {readinessScore >= 80 ? 'Excellent - Ready for all strokes!' :
                                     readinessScore >= 60 ? 'Good - Some limitations noted' :
                                     'Needs attention - Consider mobility work'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {!isAssessing ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {swimmingAssessments.map((assessment) => (
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
                                    isRunning={isRunning}
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
                                <div className="flex-1 bg-slate-100 rounded-lg p-3">
                                    <p className="text-sm font-medium text-slate-700">Time: {timer}s</p>
                                </div>
                                <div className="flex-1 bg-blue-100 rounded-lg p-3">
                                    <p className="text-sm font-medium text-blue-700">Swimming Score: {swimScore}%</p>
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