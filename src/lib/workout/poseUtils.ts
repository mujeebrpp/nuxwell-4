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
    LEFT_FOOT: 31,
    RIGHT_FOOT: 32,
} as const;

// Landmark type
export interface Landmark {
    x: number;
    y: number;
    z: number;
    visibility: number;
}

export interface PoseLandmarks {
    landmarks: Landmark[];
    worldLandmarks: Landmark[];
}

// Helper functions (exported for use in exercise detector)
export function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

export function average(...values: number[]): number {
    const valid = values.filter((v) => Number.isFinite(v));
    return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
}

export function normalizedDistance(a: Landmark, b: Landmark, scale: number): number {
    return Math.hypot(a.x - b.x, a.y - b.y) / Math.max(scale, 0.05);
}

// Calculate angle between three points (in degrees) - using dot product method
export function angle(
    a: Landmark,
    b: Landmark,
    c: Landmark
): number {
    const abX = a.x - b.x;
    const abY = a.y - b.y;
    const cbX = c.x - b.x;
    const cbY = c.y - b.y;
    const dot = abX * cbX + abY * cbY;
    const magAB = Math.hypot(abX, abY);
    const magCB = Math.hypot(cbX, cbY);
    if (!magAB || !magCB) {
        return 180;
    }
    const cosine = Math.min(1, Math.max(-1, dot / (magAB * magCB)));
    return (Math.acos(cosine) * 180) / Math.PI;
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
    const calculatedAngle = Math.acos(Math.max(-1, Math.min(1, cosAngle)));

    return calculatedAngle * 180.0 / Math.PI;
}

// Get key angles for pose analysis (matches reference implementation)
export function getPoseAngles(landmarks: Landmark[]) {
    if (!landmarks || landmarks.length < 33) return null;

    const nose = landmarks[POSE_LANDMARKS.NOSE];
    const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
    const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
    const leftElbow = landmarks[POSE_LANDMARKS.LEFT_ELBOW];
    const rightElbow = landmarks[POSE_LANDMARKS.RIGHT_ELBOW];
    const leftWrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];
    const rightWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];
    const leftKnee = landmarks[POSE_LANDMARKS.LEFT_KNEE];
    const rightKnee = landmarks[POSE_LANDMARKS.RIGHT_KNEE];
    const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];
    const rightAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];

    const leftElbowAngle = angle(leftShoulder, leftElbow, leftWrist);
    const rightElbowAngle = angle(rightShoulder, rightElbow, rightWrist);
    const leftKneeAngle = angle(leftHip, leftKnee, leftAnkle);
    const rightKneeAngle = angle(rightHip, rightKnee, rightAnkle);

    const avgElbowAngle = (leftElbowAngle + rightElbowAngle) / 2;
    const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;
    const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x) || 0.001;

    const wristWidthMetric = Math.abs(leftWrist.x - rightWrist.x) / shoulderWidth;
    const elbowWidthMetric = Math.abs(leftElbow.x - rightElbow.x) / shoulderWidth;
    const ankleSpread = Math.abs(leftAnkle.x - rightAnkle.x) / shoulderWidth;
    const wristsAboveShoulders =
        Number(leftWrist.y < leftShoulder.y) + Number(rightWrist.y < rightShoulder.y);
    const armsUpMetric = clamp(
        (wristsAboveShoulders / 2) * 0.85 +
        clamp(average(leftWrist.y - leftShoulder.y, rightWrist.y - rightShoulder.y) * 1.2 - 0.8, -1, 1), 0, 1
    );
    const legSpreadMetric = clamp((ankleSpread - 1.1) / 1.2, 0, 1);

    const hipCenterX = average(leftHip.x, rightHip.x);
    const hipCenterY = average(leftHip.y, rightHip.y);
    const shoulderCenterX = average(leftShoulder.x, rightShoulder.x);
    const shoulderCenterY = average(leftShoulder.y, rightShoulder.y);
    const wristCenterX = average(leftWrist.x, rightWrist.x);
    const wristCenterY = average(leftWrist.y, rightWrist.y);
    const torsoOffset = Math.abs(hipCenterX - shoulderCenterX);
    const torsoHeight = Math.max(Math.abs(hipCenterY - shoulderCenterY), 0.05);

    return {
        noseOffsetMetric: clamp((nose.x - shoulderCenterX) / shoulderWidth, -1.2, 1.2),
        wristSideOffsetMetric: clamp((wristCenterX - shoulderCenterX) / shoulderWidth, -1.2, 1.2),
        wristLiftMetric: clamp((hipCenterY - wristCenterY) / torsoHeight, 0, 1.35),
        wristShoulderLevelMetric: clamp(
            1 - Math.abs(wristCenterY - shoulderCenterY) / (torsoHeight * 0.35),
            0,
            1
        ),
        wristAboveHeadMetric: clamp((shoulderCenterY - wristCenterY) / torsoHeight - 0.45, 0, 1.2),
        wristWidthMetric,
        elbowWidthMetric,
        elbowStabilityMetric: clamp(
            1 - average(
                Math.abs(leftElbow.x - leftShoulder.x),
                Math.abs(rightElbow.x - rightShoulder.x)
            ) / 0.22,
            0,
            1
        ),
        elbowExtensionMetric: clamp((avgElbowAngle - 120) / 50, 0, 1),
        ankleSpread,
        legSpreadMetric,
        armsUpMetric,
        leftAnkleLateralMetric: clamp(Math.abs(leftAnkle.x - leftHip.x) / shoulderWidth, 0, 1.4),
        rightAnkleLateralMetric: clamp(Math.abs(rightAnkle.x - rightHip.x) / shoulderWidth, 0, 1.4),
        ankleHeightDelta: (rightAnkle.y - leftAnkle.y) / torsoHeight,
        leftKneeLiftMetric: clamp((leftHip.y - leftKnee.y) / torsoHeight, 0, 1.2),
        rightKneeLiftMetric: clamp((rightHip.y - rightKnee.y) / torsoHeight, 0, 1.2),
        maxKneeLiftMetric: Math.max(
            clamp((leftHip.y - leftKnee.y) / torsoHeight, 0, 1.2),
            clamp((rightHip.y - rightKnee.y) / torsoHeight, 0, 1.2)
        ),
        leftElbowKneeDistance: normalizedDistance(leftElbow, leftKnee, torsoHeight),
        rightElbowKneeDistance: normalizedDistance(rightElbow, rightKnee, torsoHeight),
        leftCrossDistance: normalizedDistance(leftElbow, rightKnee, torsoHeight),
        rightCrossDistance: normalizedDistance(rightElbow, leftKnee, torsoHeight),
        torsoMetric: clamp(1 - torsoOffset * 9, 0, 1),
        symmetryMetric: clamp(1 - Math.abs(leftKneeAngle - rightKneeAngle) / 50, 0, 1),
        depthMetric: clamp((160 - avgKneeAngle) / 70, 0, 1),
        leftElbowAngle,
        rightElbowAngle,
        leftKneeAngle,
        rightKneeAngle,
        avgElbowAngle,
        avgKneeAngle,
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

// Check if landmark is visible
export function visible(point: Landmark | undefined): boolean {
    return !!(point && (point.visibility ?? 1) > 0.45);
}

// Get body alignment for plank detection
export function getBodyAlignment(landmarks: Landmark[]): number | null {
    if (!landmarks || landmarks.length < 33) return null;

    const shoulderY = (landmarks[POSE_LANDMARKS.LEFT_SHOULDER].y + landmarks[POSE_LANDMARKS.RIGHT_SHOULDER].y) / 2;
    const hipY = (landmarks[POSE_LANDMARKS.LEFT_HIP].y + landmarks[POSE_LANDMARKS.RIGHT_HIP].y) / 2;
    const ankleY = (landmarks[POSE_LANDMARKS.LEFT_ANKLE].y + landmarks[POSE_LANDMARKS.RIGHT_ANKLE].y) / 2;

    const torsoLength = Math.abs(hipY - shoulderY);
    const legLength = Math.abs(ankleY - hipY);

    const alignment = torsoLength / (torsoLength + legLength);

    return alignment;
}

// Check if person is in standing position
export function isStanding(landmarks: Landmark[]): boolean {
    const angles = getPoseAngles(landmarks);
    if (!angles) return false;

    return angles.leftKneeAngle > 150 && angles.rightKneeAngle > 150;
}

// Check if person is in floor position
export function isOnFloor(landmarks: Landmark[]): boolean {
    const hipY = (landmarks[POSE_LANDMARKS.LEFT_HIP].y + landmarks[POSE_LANDMARKS.RIGHT_HIP].y) / 2;
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