'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Landmark, normalizedToCanvas, POSE_LANDMARKS } from '@/lib/workout/poseUtils';

// Pose connections for skeleton drawing (matches reference)
const POSE_CONNECTIONS: [number, number][] = [
    [11, 13], [13, 15],
    [12, 14], [14, 16],
    [11, 12], [11, 23],
    [12, 24], [23, 24],
    [23, 25], [25, 27],
    [24, 26], [26, 28],
];

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
    cameraFacing?: 'user' | 'environment';
}

export function CameraView({
    videoRef,
    canvasRef,
    landmarks,
    isRunning,
    width = 720,
    height = 1280,
    showSkeleton = true,
    orientation = 'portrait',
    zoom = 1,
    cameraFacing = 'user',
}: CameraViewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [canvasSize, setCanvasSize] = useState({ width, height });
    const landmarksRef = useRef<Landmark[] | null>(landmarks);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

    // Keep landmarksRef in sync with props
    useEffect(() => {
        landmarksRef.current = landmarks;
    }, [landmarks]);

    // Get canvas context
    useEffect(() => {
        if (canvasRef.current) {
            ctxRef.current = canvasRef.current.getContext('2d');
        }
    }, [canvasRef]);

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
            const ctx = ctxRef.current;

            if (!canvas || !ctx) {
                isDrawing = false;
                return;
            }

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Get landmarks from ref
            const currentLandmarks = landmarksRef.current;

            // Only draw skeleton when running and landmarks exist
            if (!isRunning || !currentLandmarks || currentLandmarks.length === 0) {
                isDrawing = false;
                return;
            }

            if (!showSkeleton) {
                isDrawing = false;
                return;
            }

            // Draw connections (lines)
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.strokeStyle = 'rgba(84, 242, 193, 0.82)';

            for (const [start, end] of POSE_CONNECTIONS) {
                const a = currentLandmarks[start];
                const b = currentLandmarks[end];
                if (!a || !b || (a.visibility ?? 1) <= 0.45 || (b.visibility ?? 1) <= 0.45) continue;
                ctx.beginPath();
                ctx.moveTo(a.x * canvas.width, a.y * canvas.height);
                ctx.lineTo(b.x * canvas.width, b.y * canvas.height);
                ctx.stroke();
            }

            // Draw landmarks as circles
            ctx.fillStyle = 'rgba(255, 141, 109, 0.95)';
            for (const point of currentLandmarks) {
                if ((point.visibility ?? 1) <= 0.45) continue;
                ctx.beginPath();
                ctx.arc(point.x * canvas.width, point.y * canvas.height, 4.5, 0, Math.PI * 2);
                ctx.fill();
            }

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

    // Mirror transform for front camera
    const mirror = cameraFacing === 'user' ? -1 : 1;

    return (
        <div
            ref={containerRef}
            className="relative rounded-xl overflow-hidden bg-slate-900 w-full h-full max-h-[70vh] lg:max-h-[900px]"
            style={{
                aspectRatio: orientation === 'landscape' ? '16/9' : '9/16'
            }}
        >
            {/* Video element */}
            <video
                ref={videoRef}
                className={`absolute top-0 left-0 w-full h-full ${orientation === 'portrait' ? 'object-cover' : 'object-contain'} ${isRunning ? 'block' : 'hidden'}`}
                playsInline
                muted
                autoPlay
                style={{ transform: `scaleX(${mirror}) scale(${zoom})` }}
            />

            {/* Canvas for skeleton */}
            <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                className={`absolute top-0 left-0 w-full h-full pointer-events-none ${orientation === 'portrait' ? 'object-cover' : 'object-contain'}`}
                style={{ transform: `scaleX(${mirror})`, zIndex: 10 }}
            />

            {/* Status overlay when not running */}
            {!isRunning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-20">
                    <div className="text-6xl mb-4">📹</div>
                    <p className="text-xl font-semibold text-white">Camera Preview</p>
                    <p className="text-sm text-slate-400 mt-2">Click Start to begin</p>
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