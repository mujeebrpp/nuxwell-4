'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Landmark, normalizedToCanvas, POSE_LANDMARKS } from '@/lib/workout/poseUtils';

interface CameraViewProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    landmarks: Landmark[] | null;
    isRunning: boolean;
    width?: number;
    height?: number;
    showSkeleton?: boolean;
    orientation?: 'landscape' | 'portrait';
    zoom?: number;
}

export function CameraView({
    videoRef,
    canvasRef,
    landmarks,
    isRunning,
    width = 640,
    height = 480,
    showSkeleton = true,
    orientation = 'portrait',
    zoom = 1,
}: CameraViewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [canvasSize, setCanvasSize] = useState({ width, height });
    const landmarksRef = useRef<Landmark[] | null>(landmarks);

    // Keep landmarksRef in sync with props
    useEffect(() => {
        landmarksRef.current = landmarks;
    }, [landmarks]);

    // Update canvas size to match container
    useEffect(() => {
        if (!containerRef.current) return;

        const updateSize = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setCanvasSize({
                    width: rect.width,
                    height: rect.height,
                });
            }
        };

        updateSize();

        const resizeObserver = new ResizeObserver(updateSize);
        resizeObserver.observe(containerRef.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    // Draw skeleton using requestAnimationFrame loop
    useEffect(() => {
        let animationFrameId: number;
        let isDrawing = false;

        const drawSkeleton = () => {
            if (isDrawing) return;
            isDrawing = true;

            const canvas = canvasRef.current;
            if (!canvas) {
                isDrawing = false;
                return;
            }

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                isDrawing = false;
                return;
            }

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Get landmarks from ref
            const currentLandmarks = landmarksRef.current;

            // Only draw skeleton when running and landmarks exist
            if (!isRunning || !currentLandmarks || currentLandmarks.length === 0) {
                if (!isRunning) {
                    // Draw test pattern when not running
                    ctx.fillStyle = '#10B981';
                    ctx.strokeStyle = '#10B981';
                    ctx.lineWidth = 3;

                    ctx.beginPath();
                    ctx.moveTo(50, 50);
                    ctx.lineTo(200, 150);
                    ctx.moveTo(200, 50);
                    ctx.lineTo(50, 150);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.arc(125, 100, 30, 0, 2 * Math.PI);
                    ctx.stroke();
                }
                isDrawing = false;
                return;
            }

            if (!showSkeleton) {
                isDrawing = false;
                return;
            }

            // Draw all connections (lines)
            ctx.strokeStyle = '#10B981';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';

            const connections = [
                // Torso
                [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER],
                [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_HIP],
                [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_HIP],
                [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP],

                // Left arm
                [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW],
                [POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST],

                // Right arm
                [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW],
                [POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST],

                // Left leg
                [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE],
                [POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.LEFT_ANKLE],

                // Right leg
                [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE],
                [POSE_LANDMARKS.RIGHT_KNEE, POSE_LANDMARKS.RIGHT_ANKLE],
            ];

            connections.forEach(([start, end]) => {
                const startLandmark = currentLandmarks[start];
                const endLandmark = currentLandmarks[end];

                if (startLandmark && endLandmark) {
                    const startPoint = normalizedToCanvas(startLandmark, canvas.width, canvas.height);
                    const endPoint = normalizedToCanvas(endLandmark, canvas.width, canvas.height);

                    ctx.beginPath();
                    ctx.moveTo(startPoint.x, startPoint.y);
                    ctx.lineTo(endPoint.x, endPoint.y);
                    ctx.stroke();
                }
            });

            // Draw key points (circles)
            ctx.fillStyle = '#F59E0B'; // Amber color for points

            const keyPoints = [
                POSE_LANDMARKS.NOSE,
                POSE_LANDMARKS.LEFT_SHOULDER,
                POSE_LANDMARKS.RIGHT_SHOULDER,
                POSE_LANDMARKS.LEFT_ELBOW,
                POSE_LANDMARKS.RIGHT_ELBOW,
                POSE_LANDMARKS.LEFT_WRIST,
                POSE_LANDMARKS.RIGHT_WRIST,
                POSE_LANDMARKS.LEFT_HIP,
                POSE_LANDMARKS.RIGHT_HIP,
                POSE_LANDMARKS.LEFT_KNEE,
                POSE_LANDMARKS.RIGHT_KNEE,
                POSE_LANDMARKS.LEFT_ANKLE,
                POSE_LANDMARKS.RIGHT_ANKLE,
            ];

            keyPoints.forEach((idx) => {
                const landmark = currentLandmarks[idx];
                if (landmark) {
                    const point = normalizedToCanvas(landmark, canvas.width, canvas.height);

                    ctx.beginPath();
                    ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
                    ctx.fill();
                }
            });

            isDrawing = false;
        };

        const animate = () => {
            drawSkeleton();
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [isRunning, showSkeleton, canvasRef, canvasSize]);

    return (
        <div
            ref={containerRef}
            className="relative rounded-xl overflow-hidden bg-slate-900 w-full h-full"
            style={{
                aspectRatio: orientation === 'landscape' ? '16/9' : '9/16',
                maxHeight: '900px'
            }}
        >
            {/* Video element */}
            <video
                ref={videoRef}
                className={`absolute top-0 left-0 w-full h-full object-contain ${isRunning ? 'block' : 'hidden'}`}
                playsInline
                muted
                autoPlay
                style={{ transform: `scaleX(-1) scale(${zoom})` }}
            />

            {/* Canvas for skeleton - always rendered */}
            <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                style={{ transform: 'scaleX(-1)', zIndex: 10, objectFit: 'contain' }}
            />

            {/* Status overlay when not running */}
            {!isRunning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-20">
                    <div className="text-6xl mb-4">📹</div>
                    <p className="text-xl font-semibold text-white">Camera Preview</p>
                    <p className="text-sm text-slate-400 mt-2">Click Start to begin</p>
                    <p className="text-xs text-slate-500 mt-4">Canvas test pattern shown</p>
                </div>
            )}

            {/* Camera indicator */}
            {isRunning && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full z-20">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-white text-sm">Camera Active</span>
                </div>
            )}
        </div>
    );
}
