// MediaPipe BlazePose landmark indices
export const POSE_LANDMARKS = {
    NOSE: 0,
    LEFT_EYE: 1,
    RIGHT_EYE: 2,
    LEFT_EAR: 3,
    RIGHT_EAR: 4,
    LEFT_SHOULDER: 11,
    RIGHT_SHOULDER: 12,
    LEFT_ELBOW: 13,
    RIGHT_ELBOW: 14,
    LEFT_WRIST: 15,
    RIGHT_WRIST: 16,
    LEFT_HIP: 23,
    RIGHT_HIP: 24,
    LEFT_KNEE: 25,
    RIGHT_KNEE: 26,
    LEFT_ANKLE: 27,
    RIGHT_ANKLE: 28,
} as const;

// Landmark type
export interface Landmark {
    x: number;
    y: number;
    z: number;
    visibility?: number;
}

export interface PoseLandmarks {
    landmarks: Landmark[];
    worldLandmarks: Landmark[];
}

// Calculate angle between three points (in degrees)
export function calculateAngle(
    a: Landmark,
    b: Landmark,
    c: Landmark
): number {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);

    if (angle > 180.0) {
        angle = 360.0 - angle;
    }

    return angle;
}

// Calculate angle between two vectors from a center point
export function calculateAngleFromPoints(
    point1: Landmark,
    center: Landmark,
    point2: Landmark
): number {
    const v1 = { x: point1.x - center.x, y: point1.y - center.y };
    const v2 = { x: point2.x - center.x, y: point2.y - center.y };

    const dot = v1.x * v2.x + v1.y * v2.y;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

    const cosAngle = dot / (mag1 * mag2);
    const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle)));

    return angle * 180.0 / Math.PI;
}

// Get key angles for pose analysis
export function getPoseAngles(landmarks: Landmark[]) {
    if (!landmarks || landmarks.length < 33) return null;

    // Left side angles
    const leftShoulderAngle = calculateAngleFromPoints(
        landmarks[POSE_LANDMARKS.LEFT_ELBOW],
        landmarks[POSE_LANDMARKS.LEFT_SHOULDER],
        landmarks[POSE_LANDMARKS.LEFT_HIP]
    );

    const leftHipAngle = calculateAngleFromPoints(
        landmarks[POSE_LANDMARKS.LEFT_SHOULDER],
        landmarks[POSE_LANDMARKS.LEFT_HIP],
        landmarks[POSE_LANDMARKS.LEFT_KNEE]
    );

    const leftKneeAngle = calculateAngleFromPoints(
        landmarks[POSE_LANDMARKS.LEFT_HIP],
        landmarks[POSE_LANDMARKS.LEFT_KNEE],
        landmarks[POSE_LANDMARKS.LEFT_ANKLE]
    );

    const leftElbowAngle = calculateAngleFromPoints(
        landmarks[POSE_LANDMARKS.LEFT_SHOULDER],
        landmarks[POSE_LANDMARKS.LEFT_ELBOW],
        landmarks[POSE_LANDMARKS.LEFT_WRIST]
    );

    // Right side angles
    const rightShoulderAngle = calculateAngleFromPoints(
        landmarks[POSE_LANDMARKS.RIGHT_ELBOW],
        landmarks[POSE_LANDMARKS.RIGHT_SHOULDER],
        landmarks[POSE_LANDMARKS.RIGHT_HIP]
    );

    const rightHipAngle = calculateAngleFromPoints(
        landmarks[POSE_LANDMARKS.RIGHT_SHOULDER],
        landmarks[POSE_LANDMARKS.RIGHT_HIP],
        landmarks[POSE_LANDMARKS.RIGHT_KNEE]
    );

    const rightKneeAngle = calculateAngleFromPoints(
        landmarks[POSE_LANDMARKS.RIGHT_HIP],
        landmarks[POSE_LANDMARKS.RIGHT_KNEE],
        landmarks[POSE_LANDMARKS.RIGHT_ANKLE]
    );

    const rightElbowAngle = calculateAngleFromPoints(
        landmarks[POSE_LANDMARKS.RIGHT_SHOULDER],
        landmarks[POSE_LANDMARKS.RIGHT_ELBOW],
        landmarks[POSE_LANDMARKS.RIGHT_WRIST]
    );

    // Arm angles (for jumping jacks)
    const leftArmAngle = calculateAngleFromPoints(
        landmarks[POSE_LANDMARKS.LEFT_SHOULDER],
        landmarks[POSE_LANDMARKS.LEFT_ELBOW],
        landmarks[POSE_LANDMARKS.LEFT_WRIST]
    );

    const rightArmAngle = calculateAngleFromPoints(
        landmarks[POSE_LANDMARKS.RIGHT_SHOULDER],
        landmarks[POSE_LANDMARKS.RIGHT_ELBOW],
        landmarks[POSE_LANDMARKS.RIGHT_WRIST]
    );

    // Overall arm span (for jumping jacks)
    const armSpan = Math.abs(landmarks[POSE_LANDMARKS.LEFT_WRIST].x - landmarks[POSE_LANDMARKS.RIGHT_WRIST].x);

    // Leg spread (for jumping jacks)
    const legSpread = Math.abs(landmarks[POSE_LANDMARKS.LEFT_ANKLE].x - landmarks[POSE_LANDMARKS.RIGHT_ANKLE].x);

    return {
        leftShoulderAngle,
        leftHipAngle,
        leftKneeAngle,
        leftElbowAngle,
        rightShoulderAngle,
        rightHipAngle,
        rightKneeAngle,
        rightElbowAngle,
        leftArmAngle,
        rightArmAngle,
        armSpan,
        legSpread,
    };
}

// Check if pose is visible (minimum visibility threshold)
export function isPoseVisible(landmarks: Landmark[], threshold = 0.5): boolean {
    const keyPoints = [
        POSE_LANDMARKS.LEFT_SHOULDER,
        POSE_LANDMARKS.RIGHT_SHOULDER,
        POSE_LANDMARKS.LEFT_HIP,
        POSE_LANDMARKS.RIGHT_HIP,
        POSE_LANDMARKS.LEFT_KNEE,
        POSE_LANDMARKS.RIGHT_KNEE,
    ];

    return keyPoints.every(
        (idx) => landmarks[idx] && (landmarks[idx].visibility || 0) > threshold
    );
}

// Get body alignment for plank detection
export function getBodyAlignment(landmarks: Landmark[]): number | null {
    if (!landmarks || landmarks.length < 33) return null;

    // Get key points for body alignment
    const shoulderY = (landmarks[POSE_LANDMARKS.LEFT_SHOULDER].y + landmarks[POSE_LANDMARKS.RIGHT_SHOULDER].y) / 2;
    const hipY = (landmarks[POSE_LANDMARKS.LEFT_HIP].y + landmarks[POSE_LANDMARKS.RIGHT_HIP].y) / 2;
    const ankleY = (landmarks[POSE_LANDMARKS.LEFT_ANKLE].y + landmarks[POSE_LANDMARKS.RIGHT_ANKLE].y) / 2;

    // Calculate vertical distance ratio
    const torsoLength = Math.abs(hipY - shoulderY);
    const legLength = Math.abs(ankleY - hipY);

    // Ideal plank: torso and legs should be roughly aligned
    // A small ratio indicates good plank form
    const alignment = torsoLength / (torsoLength + legLength);

    return alignment;
}

// Check if person is in standing position
export function isStanding(landmarks: Landmark[]): boolean {
    const angles = getPoseAngles(landmarks);
    if (!angles) return false;

    // Standing: both hips are above or level with knees
    return angles.leftHipAngle > 150 && angles.rightHipAngle > 150;
}

// Check if person is in floor position
export function isOnFloor(landmarks: Landmark[]): boolean {
    const hipY = (landmarks[POSE_LANDMARKS.LEFT_HIP].y + landmarks[POSE_LANDMARKS.RIGHT_HIP].y) / 2;
    // If hip Y is very high (close to 1 in normalized coordinates), they're on the floor
    return hipY > 0.8;
}

// Get direction of movement (up/down)
export type MovementDirection = 'up' | 'down' | 'neutral';

export function getMovementDirection(
    currentY: number,
    previousY: number
): MovementDirection {
    const threshold = 0.01;
    const diff = currentY - previousY;

    if (diff < -threshold) return 'down';
    if (diff > threshold) return 'up';
    return 'neutral';
}

// Convert normalized coordinates to canvas coordinates
export function normalizedToCanvas(
    landmark: Landmark,
    canvasWidth: number,
    canvasHeight: number
): { x: number; y: number } {
    return {
        x: landmark.x * canvasWidth,
        y: landmark.y * canvasHeight,
    };
}

// Calculate distance between two points
export function calculateDistance(
    p1: { x: number; y: number },
    p2: { x: number; y: number }
): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}
