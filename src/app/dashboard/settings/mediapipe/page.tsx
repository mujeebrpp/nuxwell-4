'use client'

import { useState, useEffect, useRef } from 'react'
import {
    Camera,
    Video,
    Settings as SettingsIcon,
    Save,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    Monitor,
    Smartphone,
    Zap,
    Eye,
    Activity,
    ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

// MediaPipe Pose model complexity options
const modelComplexityOptions = [
    { value: 0, label: 'Lightweight (0)', description: 'Fastest performance, lowest accuracy' },
    { value: 1, label: 'Balanced (1)', description: 'Good balance between speed and accuracy (default)' },
    { value: 2, label: 'Full (2)', description: 'Highest accuracy, slower performance' },
]

// Camera facing mode options
const cameraFacingModes = [
    { value: 'user', label: 'Front Camera', icon: Smartphone, description: 'Use the front-facing camera (selfie view)' },
    { value: 'environment', label: 'Back Camera', icon: Camera, description: 'Use the rear-facing camera' },
]

// Resolution options
const resolutionOptions = [
    { value: '640x480', label: '640 x 480', aspect: '4:3', orientation: 'landscape' },
    { value: '1280x720', label: '1280 x 720', aspect: '16:9', orientation: 'landscape' },
    { value: '1920x1080', label: '1920 x 1080', aspect: '16:9', orientation: 'landscape' },
    { value: '720x1280', label: '720 x 1280', aspect: '9:16', orientation: 'portrait' },
    { value: '1080x1920', label: '1080 x 1920', aspect: '9:16', orientation: 'portrait' },
]

// Default settings
const defaultSettings = {
    cameraFacingMode: 'user',
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
    smoothLandmarks: true,
    enableSegmentation: false,
    resolution: '720x1280', // Default to portrait 9:16
    showSkeleton: true,
    audioFeedback: true,
    repCountDisplay: true,
}

export default function MediaPipeSettingsPage() {
    const [saving, setSaving] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([])
    const [testingCamera, setTestingCamera] = useState(false)
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
    const videoRef = useRef<HTMLVideoElement | null>(null)

    const [settings, setSettings] = useState(defaultSettings)

    // Load settings from localStorage on mount
    useEffect(() => {
        const savedSettings = localStorage.getItem('mediapipePoseSettings')
        if (savedSettings) {
            try {
                setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) })
            } catch (e) {
                console.error('Failed to parse saved settings:', e)
            }
        }

        // Get available cameras
        getAvailableCameras()
    }, [])

    // Cleanup camera stream on unmount
    useEffect(() => {
        return () => {
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop())
            }
        }
    }, [cameraStream])

    const getAvailableCameras = async () => {
        try {
            // Request permission first
            await navigator.mediaDevices.getUserMedia({ video: true })
            const devices = await navigator.mediaDevices.enumerateDevices()
            const cameras = devices.filter(device => device.kind === 'videoinput')
            setAvailableCameras(cameras)
        } catch (error) {
            console.error('Error getting cameras:', error)
            setErrorMessage('Could not access camera. Please grant camera permission.')
        }
    }

    const testCamera = async () => {
        setTestingCamera(true)
        setErrorMessage('')

        // Stop existing stream
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop())
        }

        try {
            const [width, height] = settings.resolution.split('x').map(Number)
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: width,
                    height: height,
                    facingMode: settings.cameraFacingMode,
                }
            })
            setCameraStream(stream)

            // Use setTimeout to wait for React to render the video element
            setTimeout(() => {
                const video = document.getElementById('camera-preview') as HTMLVideoElement
                if (video) {
                    video.srcObject = stream
                    video.play().catch((e) => console.log('Play error:', e))
                }
            }, 100)
        } catch (error) {
            console.error('Camera test error:', error)
            setErrorMessage('Failed to access camera. Please check your camera settings.')
        } finally {
            setTestingCamera(false)
        }
    }

    const stopCameraTest = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop())
            setCameraStream(null)
        }
    }

    const handleSettingChange = (key: keyof typeof settings, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }))
        setSuccessMessage('')
    }

    const handleSave = async () => {
        setSaving(true)
        setSuccessMessage('')
        setErrorMessage('')

        try {
            // Save to localStorage
            localStorage.setItem('mediapipePoseSettings', JSON.stringify(settings))

            // Also save to user preferences via Supabase if available
            const { createClient } = await import('@/lib/supabase/client')
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                await supabase.auth.updateUser({
                    data: {
                        mediapipe_pose_settings: settings
                    }
                })
            }

            setSuccessMessage('MediaPipe Pose settings saved successfully!')
        } catch (error) {
            console.error('Error saving settings:', error)
            setErrorMessage('Failed to save settings. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const handleReset = () => {
        setSettings(defaultSettings)
        setSuccessMessage('Settings reset to defaults!')
    }

    const renderToggle = (key: keyof typeof settings, label: string, description?: string) => (
        <div className="flex items-center justify-between py-3">
            <div>
                <p className="font-medium">{label}</p>
                {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
            <button
                onClick={() => handleSettingChange(key, !settings[key])}
                className={`w-12 h-6 rounded-full transition-colors ${settings[key] ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
            >
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${settings[key] ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
            </button>
        </div>
    )

    const renderSlider = (key: keyof typeof settings, label: string, min: number, max: number, step: number = 0.1) => (
        <div className="py-3">
            <div className="flex items-center justify-between mb-2">
                <p className="font-medium">{label}</p>
                <span className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">
                    {settings[key]}
                </span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={settings[key] as number}
                onChange={(e) => handleSettingChange(key, parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{min}</span>
                <span>{max}</span>
            </div>
        </div>
    )

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link
                            href="/dashboard/settings"
                            className="text-muted-foreground hover:text-foreground"
                        >
                            Settings
                        </Link>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">MediaPipe Pose</span>
                    </div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Video className="h-8 w-8" />
                        MediaPipe Pose Settings
                    </h1>
                    <p className="text-muted-foreground">
                        Configure camera and pose detection settings for workout tracking
                    </p>
                </div>
            </div>

            {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    {successMessage}
                </div>
            )}

            {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    {errorMessage}
                </div>
            )}

            {/* Camera Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Camera className="h-5 w-5" />
                        Camera Settings
                    </CardTitle>
                    <CardDescription>
                        Configure camera selection and resolution
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Camera Selection */}
                    <div>
                        <label className="font-medium block mb-3">Camera Selection</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {cameraFacingModes.map((mode) => (
                                <button
                                    key={mode.value}
                                    onClick={() => handleSettingChange('cameraFacingMode', mode.value)}
                                    className={`p-4 rounded-lg border-2 text-left transition-all ${settings.cameraFacingMode === mode.value
                                        ? 'border-emerald-500 bg-emerald-50'
                                        : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <mode.icon className={`h-5 w-5 ${settings.cameraFacingMode === mode.value
                                            ? 'text-emerald-500'
                                            : 'text-slate-400'
                                            }`} />
                                        <div>
                                            <p className="font-medium">{mode.label}</p>
                                            <p className="text-sm text-muted-foreground">{mode.description}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Available Cameras */}
                    {availableCameras.length > 0 && (
                        <div>
                            <label className="font-medium block mb-3">Available Cameras ({availableCameras.length})</label>
                            <select
                                value={settings.cameraFacingMode}
                                onChange={(e) => handleSettingChange('cameraFacingMode', e.target.value)}
                                className="w-full p-3 border border-slate-200 rounded-lg bg-white"
                            >
                                {availableCameras.map((camera, index) => (
                                    <option key={camera.deviceId} value={camera.deviceId}>
                                        {camera.label || `Camera ${index + 1}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Resolution */}
                    <div>
                        <label className="font-medium block mb-3">Resolution</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {resolutionOptions.map((res) => (
                                <button
                                    key={res.value}
                                    onClick={() => handleSettingChange('resolution', res.value)}
                                    className={`p-3 rounded-lg border-2 text-center transition-all ${settings.resolution === res.value
                                        ? 'border-emerald-500 bg-emerald-50'
                                        : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <Monitor className={`h-5 w-5 mx-auto mb-2 ${settings.resolution === res.value
                                        ? 'text-emerald-500'
                                        : 'text-slate-400'
                                        }`} />
                                    <p className="font-medium">{res.label}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Camera Test */}
                    <div className="border-t pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="font-medium">Camera Preview</p>
                                <p className="text-sm text-muted-foreground">Test your camera with current settings</p>
                            </div>
                            <div className="flex gap-2">
                                {!cameraStream ? (
                                    <Button onClick={testCamera} disabled={testingCamera}>
                                        <Video className="h-4 w-4 mr-2" />
                                        {testingCamera ? 'Testing...' : 'Test Camera'}
                                    </Button>
                                ) : (
                                    <Button onClick={stopCameraTest} variant="outline">
                                        <Video className="h-4 w-4 mr-2" />
                                        Stop
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Always render video element */}
                        <div className={`relative bg-slate-900 rounded-lg overflow-hidden ${!cameraStream ? 'hidden' : ''}`} style={{ aspectRatio: '9/16', maxHeight: '400px' }}>
                            <video
                                id="camera-preview"
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                                Live Preview
                            </div>
                        </div>

                        {!cameraStream && (
                            <div className="bg-slate-100 rounded-lg flex items-center justify-center" style={{ aspectRatio: '9/16', maxHeight: '400px' }}>
                                <p className="text-muted-foreground text-sm">Click "Test Camera" to preview</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Model Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Model Settings
                    </CardTitle>
                    <CardDescription>
                        Configure MediaPipe Pose detection model
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Model Complexity */}
                    <div>
                        <label className="font-medium block mb-3">Model Complexity</label>
                        <div className="space-y-3">
                            {modelComplexityOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleSettingChange('modelComplexity', option.value)}
                                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${settings.modelComplexity === option.value
                                        ? 'border-emerald-500 bg-emerald-50'
                                        : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{option.label}</p>
                                            <p className="text-sm text-muted-foreground">{option.description}</p>
                                        </div>
                                        {settings.modelComplexity === option.value && (
                                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Detection Confidence */}
                    {renderSlider('minDetectionConfidence', 'Minimum Detection Confidence', 0.1, 1.0, 0.05)}
                    <p className="text-sm text-muted-foreground -mt-2">
                        Higher values require clearer poses for detection
                    </p>

                    {/* Tracking Confidence */}
                    {renderSlider('minTrackingConfidence', 'Minimum Tracking Confidence', 0.1, 1.0, 0.05)}
                    <p className="text-sm text-muted-foreground -mt-2">
                        Higher values require more consistent tracking
                    </p>
                </CardContent>
            </Card>

            {/* Display Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Display Settings
                    </CardTitle>
                    <CardDescription>
                        Configure visual feedback during workouts
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {renderToggle('showSkeleton', 'Show Pose Skeleton', 'Display skeleton overlay on video')}
                    {renderToggle('repCountDisplay', 'Show Rep Counter', 'Display rep count overlay during exercises')}
                    {renderToggle('audioFeedback', 'Audio Feedback', 'Play sound effects for rep counting')}
                </CardContent>
            </Card>

            {/* Advanced Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Advanced Settings
                    </CardTitle>
                    <CardDescription>
                        Advanced pose detection options
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {renderToggle('smoothLandmarks', 'Smooth Landmarks', 'Reduce jitter in landmark positions')}
                    {renderToggle('enableSegmentation', 'Enable Segmentation', 'Detect person segmentation mask (higher CPU usage)')}
                </CardContent>
            </Card>

            {/* Save Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
                <Button variant="outline" onClick={handleReset}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset to Defaults
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Settings'}
                </Button>
            </div>

            {/* Info Section */}
            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                            <p className="font-medium text-blue-800">About MediaPipe Pose</p>
                            <p className="text-sm text-blue-700 mt-1">
                                MediaPipe Pose is a Google ML solution for high-fidelity body pose tracking.
                                These settings affect the accuracy and performance of pose detection during workouts.
                                For best results, ensure good lighting and position your camera at a good angle.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
