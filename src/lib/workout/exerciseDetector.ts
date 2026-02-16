import {
    Landmark,
    getPoseAngles,
    isPoseVisible,
    POSE_LANDMARKS
} from './poseUtils';

// Exercise types
export type ExerciseType =
    | 'squat'
    | 'pushup'
    | 'jumpingJack'
    | 'plank'
    | 'lunge'
    | 'situp'
    | 'mountainClimber'
    | 'highKnees'
    | 'gluteBridge'
    | 'burpee';

// Rep phase state
export type RepPhase = 'up' | 'down' | 'waiting' | 'left' | 'right' | 'holding';

// Exercise state
export interface ExerciseState {
    repCount: number;
    phase: RepPhase;
    formFeedback: string;
    isFormGood: boolean;
    confidence: number;
}

// Form feedback messages
export const FORM_FEEDBACK = {
    GOOD: 'Good form!',
    DEEPER: 'Go deeper',
    FULL_RANGE: 'Complete the full range',
    KEEP_STRAIGHT: 'Keep your back straight',
    WIDER_STANCE: 'Wider stance',
    LOWER_ARMS: 'Lower your arms',
    HIGHER_KNEES: 'Lift knees higher',
    KEEP_PLANK: 'Hold plank position',
    ALTERNATE: 'Alternate legs',
    KEEP_CORE_TIGHT: 'Keep core tight',
};

// Default exercise state
export function createDefaultExerciseState(): ExerciseState {
    return {
        repCount: 0,
        phase: 'waiting',
        formFeedback: '',
        isFormGood: true,
        confidence: 0,
    };
}

// Exercise configurations
export interface ExerciseConfig {
    name: string;
    description: string;
    icon: string;
    primaryAngles: {
        down: number;
        up: number;
    };
    minConfidence: number;
}

export const EXERCISE_CONFIGS: Record<ExerciseType, ExerciseConfig> = {
    squat: {
        name: 'Squat',
        description: 'Stand with feet shoulder-width apart, lower your body by bending knees and hips',
        icon: '🦵',
        primaryAngles: { down: 90, up: 160 },
        minConfidence: 0.6,
    },
    pushup: {
        name: 'Push-up',
        description: 'Start in plank position, lower body by bending elbows, push back up',
        icon: '💪',
        primaryAngles: { down: 90, up: 160 },
        minConfidence: 0.6,
    },
    jumpingJack: {
        name: 'Jumping Jack',
        description: 'Jump while spreading legs and raising arms overhead, return to start',
        icon: '⭐',
        primaryAngles: { down: 30, up: 170 },
        minConfidence: 0.5,
    },
    plank: {
        name: 'Plank',
        description: 'Hold a straight line position on your forearms and toes',
        icon: '📏',
        primaryAngles: { down: 180, up: 180 },
        minConfidence: 0.7,
    },
    lunge: {
        name: 'Lunge',
        description: 'Step forward and lower your hips until both knees are bent at 90 degrees',
        icon: '🚶',
        primaryAngles: { down: 90, up: 160 },
        minConfidence: 0.6,
    },
    situp: {
        name: 'Sit-up',
        description: 'Lie on your back, raise your torso to sitting position',
        icon: '🧘',
        primaryAngles: { down: 30, up: 150 },
        minConfidence: 0.5,
    },
    mountainClimber: {
        name: 'Mountain Climber',
        description: 'In plank position, alternate driving knees toward chest',
        icon: '⛰️',
        primaryAngles: { down: 60, up: 170 },
        minConfidence: 0.5,
    },
    highKnees: {
        name: 'High Knees',
        description: 'Run in place, lifting knees as high as possible',
        icon: '🏃',
        primaryAngles: { down: 60, up: 170 },
        minConfidence: 0.5,
    },
    gluteBridge: {
        name: 'Glute Bridge',
        description: 'Lie on back, lift hips toward ceiling while squeezing glutes',
        icon: '🍑',
        primaryAngles: { down: 30, up: 160 },
        minConfidence: 0.5,
    },
    burpee: {
        name: 'Burpee',
        description: 'Squat down, kick feet back to plank, do push-up, jump feet forward, jump up',
        icon: '🔥',
        primaryAngles: { down: 90, up: 170 },
        minConfidence: 0.6,
    },
};

// Detect Squat
function detectSquat(
    angles: ReturnType<typeof getPoseAngles>,
    prevPhase: RepPhase,
    prevKneeAngle: number
): { rep: boolean; phase: RepPhase; feedback: string; isGood: boolean; kneeAngle: number } {
    if (!angles) return { rep: false, phase: 'waiting', feedback: '', isGood: true, kneeAngle: 0 };

    const avgKneeAngle = (angles.leftKneeAngle + angles.rightKneeAngle) / 2;
    const avgHipAngle = (angles.leftHipAngle + angles.rightHipAngle) / 2;

    let rep = false;
    let feedback = '';
    let isGood = true;

    // Check form - knees should track over toes
    if (avgHipAngle < 70) {
        feedback = 'Keep chest up';
        isGood = false;
    } else if (avgKneeAngle > 100 && prevPhase === 'down') {
        feedback = FORM_FEEDBACK.DEEPER;
    } else if (avgKneeAngle < 45 && prevPhase === 'down') {
        feedback = 'Too low!';
        isGood = false;
    }

    // Rep detection - complete squat cycle
    if (prevPhase === 'down' && avgKneeAngle > 150) {
        rep = true;
        feedback = FORM_FEEDBACK.GOOD;
    } else if (avgKneeAngle < 100) {
        return { rep: false, phase: 'down', feedback, isGood, kneeAngle: avgKneeAngle };
    }

    return { rep, phase: prevPhase === 'down' && avgKneeAngle > 150 ? 'up' : prevPhase, feedback, isGood, kneeAngle: avgKneeAngle };
}

// Detect Push-up
function detectPushup(
    angles: ReturnType<typeof getPoseAngles>,
    prevPhase: RepPhase
): { rep: boolean; phase: RepPhase; feedback: string; isGood: boolean } {
    if (!angles) return { rep: false, phase: 'waiting', feedback: '', isGood: true };

    const avgElbowAngle = (angles.leftElbowAngle + angles.rightElbowAngle) / 2;
    const avgShoulderAngle = (angles.leftShoulderAngle + angles.rightShoulderAngle) / 2;

    let rep = false;
    let feedback = '';
    let isGood = true;

    // Check body alignment
    if (avgShoulderAngle < 150) {
        feedback = FORM_FEEDBACK.KEEP_STRAIGHT;
        isGood = false;
    } else if (avgElbowAngle < 70) {
        feedback = 'Elbows too close';
        isGood = false;
    } else if (prevPhase === 'down' && avgElbowAngle > 160) {
        rep = true;
        feedback = FORM_FEEDBACK.GOOD;
    } else if (avgElbowAngle < 100) {
        return { rep: false, phase: 'down', feedback, isGood };
    }

    return { rep, phase: prevPhase === 'down' && avgElbowAngle > 160 ? 'up' : prevPhase, feedback, isGood };
}

// Detect Jumping Jack
function detectJumpingJack(
    angles: ReturnType<typeof getPoseAngles>,
    prevPhase: RepPhase,
    landmarks: Landmark[]
): { rep: boolean; phase: RepPhase; feedback: string; isGood: boolean } {
    if (!angles) return { rep: false, phase: 'waiting', feedback: '', isGood: true };

    const avgArmAngle = (angles.leftArmAngle + angles.rightArmAngle) / 2;
    const armSpan = angles.armSpan;
    const legSpread = angles.legSpread;

    let rep = false;
    let feedback = '';
    let isGood = true;

    // Arms should be above shoulders (high position)
    // Legs should be spread wide
    const isArmsUp = avgArmAngle > 160;
    const isLegsWide = legSpread > 0.4;
    const isArmsDown = avgArmAngle < 45;
    const isLegsTogether = legSpread < 0.2;

    if (prevPhase === 'down' && isArmsUp && isLegsWide) {
        rep = true;
        feedback = FORM_FEEDBACK.GOOD;
    } else if (isArmsDown && isLegsTogether) {
        return { rep: false, phase: 'down', feedback, isGood };
    } else if (!isArmsUp && !isLegsWide && prevPhase === 'waiting') {
        return { rep: false, phase: 'down', feedback: 'Start position', isGood };
    }

    if (!isLegsWide && prevPhase !== 'waiting') {
        feedback = 'Spread legs wider';
        isGood = false;
    }

    return { rep, phase: isArmsUp && isLegsWide ? 'up' : prevPhase, feedback, isGood };
}

// Detect Plank
function detectPlank(
    angles: ReturnType<typeof getPoseAngles>,
    prevPhase: RepPhase,
    holdTimeRef: React.MutableRefObject<number>
): { rep: boolean; phase: RepPhase; feedback: string; isGood: boolean; holdTime: number } {
    if (!angles) return { rep: false, phase: 'waiting', feedback: '', isGood: true, holdTime: 0 };

    const avgHipAngle = (angles.leftHipAngle + angles.rightHipAngle) / 2;
    const avgShoulderAngle = (angles.leftShoulderAngle + angles.rightShoulderAngle) / 2;
    const avgKneeAngle = (angles.leftKneeAngle + angles.rightKneeAngle) / 2;

    let feedback = '';
    let isGood = true;

    // For plank, check body alignment
    // Good plank: hip angle should be around 180 (straight)
    // Too low: hip angle < 170 (sagging)
    // Too high: hip angle > 200 (piking)

    if (avgHipAngle < 160) {
        feedback = 'Lift hips higher';
        isGood = false;
    } else if (avgHipAngle > 200) {
        feedback = 'Lower hips';
        isGood = false;
    } else if (avgShoulderAngle < 70) {
        feedback = 'Shoulders too low';
        isGood = false;
    } else {
        feedback = FORM_FEEDBACK.KEEP_PLANK;
        isGood = true;
    }

    // Plank is a hold, increment hold time
    return { rep: false, phase: 'holding', feedback, isGood, holdTime: holdTimeRef.current + 1 };
}

// Detect Lunge
function detectLunge(
    angles: ReturnType<typeof getPoseAngles>,
    prevPhase: RepPhase,
    prevSide: 'left' | 'right'
): { rep: boolean; phase: RepPhase; feedback: string; isGood: boolean; side: 'left' | 'right' } {
    if (!angles) return { rep: false, phase: 'waiting', feedback: '', isGood: true, side: 'left' };

    // Check which leg is forward
    const leftKneeY = angles.leftKneeAngle < 100 ? 1 : 0;
    const rightKneeY = angles.rightKneeAngle < 100 ? 1 : 0;

    const avgKneeAngle = (angles.leftKneeAngle + angles.rightKneeAngle) / 2;
    const avgHipAngle = (angles.leftHipAngle + angles.rightHipAngle) / 2;

    let rep = false;
    let feedback = '';
    let isGood = true;
    let side = prevSide;

    // Alternate legs
    if (prevPhase === 'down' && avgHipAngle > 150) {
        rep = true;
        feedback = FORM_FEEDBACK.GOOD;
        side = prevSide === 'left' ? 'right' : 'left';
    } else if (avgKneeAngle < 100) {
        return { rep: false, phase: 'down', feedback, isGood, side };
    }

    if (avgKneeAngle > 110 && prevPhase === 'waiting') {
        return { rep: false, phase: 'down', feedback: 'Step forward more', isGood, side };
    }

    return { rep, phase: prevPhase, feedback, isGood, side };
}

// Detect Sit-up
function detectSitup(
    angles: ReturnType<typeof getPoseAngles>,
    prevPhase: RepPhase,
    landmarks: Landmark[]
): { rep: boolean; phase: RepPhase; feedback: string; isGood: boolean } {
    if (!angles) return { rep: false, phase: 'waiting', feedback: '', isGood: true };

    const avgHipAngle = (angles.leftHipAngle + angles.rightHipAngle) / 2;
    const avgShoulderAngle = (angles.leftShoulderAngle + angles.rightShoulderAngle) / 2;

    // Get hip Y position to determine if on floor
    const hipY = (landmarks[POSE_LANDMARKS.LEFT_HIP].y + landmarks[POSE_LANDMARKS.RIGHT_HIP].y) / 2;
    const isOnFloor = hipY > 0.7;

    let rep = false;
    let feedback = '';
    let isGood = true;

    if (prevPhase === 'down' && avgHipAngle > 140 && avgShoulderAngle > 140) {
        rep = true;
        feedback = FORM_FEEDBACK.GOOD;
    } else if (isOnFloor) {
        return { rep: false, phase: 'down', feedback, isGood };
    }

    if (!isOnFloor && avgHipAngle < 100) {
        feedback = 'Lie down properly';
        isGood = false;
    }

    return { rep, phase: isOnFloor ? 'down' : prevPhase, feedback, isGood };
}

// Detect Mountain Climber
function detectMountainClimber(
    angles: ReturnType<typeof getPoseAngles>,
    prevPhase: RepPhase,
    prevSide: 'left' | 'right',
    prevKneeAngle: number
): { rep: boolean; phase: RepPhase; feedback: string; isGood: boolean; side: 'left' | 'right' } {
    if (!angles) return { rep: false, phase: 'waiting', feedback: '', isGood: true, side: 'left' };

    // Check which knee is up
    const leftKneeUp = angles.leftKneeAngle < 70;
    const rightKneeUp = angles.rightKneeAngle < 70;

    const avgHipAngle = (angles.leftHipAngle + angles.rightHipAngle) / 2;

    let rep = false;
    let feedback = '';
    let isGood = true;
    let side = prevSide;

    // Detect rep when switching sides
    if (prevSide === 'left' && rightKneeUp && prevPhase === 'left') {
        rep = true;
        feedback = FORM_FEEDBACK.GOOD;
        side = 'right';
    } else if (prevSide === 'right' && leftKneeUp && prevPhase === 'right') {
        rep = true;
        feedback = FORM_FEEDBACK.GOOD;
        side = 'left';
    }

    if (!leftKneeUp && !rightKneeUp && avgHipAngle > 170) {
        feedback = 'Drive knees up';
        isGood = false;
    }

    const currentSide = leftKneeUp ? 'left' : (rightKneeUp ? 'right' : prevPhase === 'waiting' ? 'left' : prevSide);

    return {
        rep,
        phase: leftKneeUp || rightKneeUp ? currentSide : prevPhase,
        feedback,
        isGood,
        side
    };
}

// Detect High Knees
function detectHighKnees(
    angles: ReturnType<typeof getPoseAngles>,
    prevPhase: RepPhase,
    prevSide: 'left' | 'right'
): { rep: boolean; phase: RepPhase; feedback: string; isGood: boolean; side: 'left' | 'right' } {
    if (!angles) return { rep: false, phase: 'waiting', feedback: '', isGood: true, side: 'left' };

    const leftKneeUp = angles.leftKneeAngle < 80;
    const rightKneeUp = angles.rightKneeAngle < 80;

    let rep = false;
    let feedback = '';
    let isGood = true;
    let side = prevSide;

    // Alternate legs
    if (prevSide === 'left' && rightKneeUp && prevPhase === 'left') {
        rep = true;
        feedback = FORM_FEEDBACK.GOOD;
        side = 'right';
    } else if (prevSide === 'right' && leftKneeUp && prevPhase === 'right') {
        rep = true;
        feedback = FORM_FEEDBACK.GOOD;
        side = 'left';
    }

    if (!leftKneeUp && !rightKneeUp && prevPhase !== 'waiting') {
        feedback = FORM_FEEDBACK.HIGHER_KNEES;
        isGood = false;
    }

    const currentSide = leftKneeUp ? 'left' : (rightKneeUp ? 'right' : prevPhase === 'waiting' ? 'left' : prevSide);

    return { rep, phase: currentSide, feedback, isGood, side };
}

// Detect Glute Bridge
function detectGluteBridge(
    angles: ReturnType<typeof getPoseAngles>,
    prevPhase: RepPhase,
    landmarks: Landmark[]
): { rep: boolean; phase: RepPhase; feedback: string; isGood: boolean } {
    if (!angles) return { rep: false, phase: 'waiting', feedback: '', isGood: true };

    const avgHipAngle = (angles.leftHipAngle + angles.rightHipAngle) / 2;
    const avgKneeAngle = (angles.leftKneeAngle + angles.rightKneeAngle) / 2;

    // Get hip Y position
    const hipY = (landmarks[POSE_LANDMARKS.LEFT_HIP].y + landmarks[POSE_LANDMARKS.RIGHT_HIP].y) / 2;
    const isOnFloor = hipY > 0.7;

    let rep = false;
    let feedback = '';
    let isGood = true;

    if (prevPhase === 'down' && avgHipAngle > 150) {
        rep = true;
        feedback = FORM_FEEDBACK.GOOD;
    } else if (isOnFloor) {
        return { rep: false, phase: 'down', feedback, isGood };
    }

    if (!isOnFloor && avgHipAngle < 100) {
        feedback = 'Lift hips higher';
        isGood = false;
    }

    return { rep, phase: isOnFloor ? 'down' : prevPhase, feedback, isGood };
}

// Burpee state machine
interface BurpeeState {
    phase: 'start' | 'squat' | 'plank' | 'pushup' | 'jumpBack' | 'jumpUp' | 'stand';
}

function detectBurpee(
    angles: ReturnType<typeof getPoseAngles>,
    prevState: BurpeeState,
    landmarks: Landmark[]
): { rep: boolean; phase: RepPhase; feedback: string; isGood: boolean; burpeePhase: string } {
    if (!angles) return { rep: false, phase: 'waiting', feedback: '', isGood: true, burpeePhase: 'start' };

    const avgKneeAngle = (angles.leftKneeAngle + angles.rightKneeAngle) / 2;
    const avgHipAngle = (angles.leftHipAngle + angles.rightHipAngle) / 2;
    const avgElbowAngle = (angles.leftElbowAngle + angles.rightElbowAngle) / 2;
    const avgShoulderAngle = (angles.leftShoulderAngle + angles.rightShoulderAngle) / 2;

    const hipY = (landmarks[POSE_LANDMARKS.LEFT_HIP].y + landmarks[POSE_LANDMARKS.RIGHT_HIP].y) / 2;
    const isOnFloor = hipY > 0.7;

    let feedback = '';
    let isGood = true;
    let newPhase = prevState.phase;

    // State machine for burpee
    switch (prevState.phase) {
        case 'start':
            if (avgKneeAngle < 100) {
                newPhase = 'squat';
                feedback = 'Hands on floor';
            }
            break;

        case 'squat':
            if (isOnFloor && avgHipAngle < 90) {
                newPhase = 'plank';
                feedback = 'Jump feet back';
            }
            break;

        case 'plank':
            if (avgElbowAngle < 100) {
                newPhase = 'pushup';
                feedback = 'Lower down';
            }
            break;

        case 'pushup':
            if (avgElbowAngle > 160 && !isOnFloor) {
                newPhase = 'jumpBack';
                feedback = 'Jump feet forward';
            }
            break;

        case 'jumpBack':
            if (avgKneeAngle > 150) {
                newPhase = 'jumpUp';
                feedback = 'Jump up!';
            }
            break;

        case 'jumpUp':
            if (avgHipAngle > 170 && !isOnFloor) {
                newPhase = 'stand';
                feedback = 'Arms overhead';
            }
            break;

        case 'stand':
            if (avgKneeAngle < 100) {
                newPhase = 'squat';
                feedback = 'Next rep';
            }
            // Complete burpee
            return { rep: true, phase: 'up', feedback: FORM_FEEDBACK.GOOD, isGood: true, burpeePhase: 'start' };
    }

    return { rep: false, phase: 'down', feedback, isGood, burpeePhase: newPhase };
}

// Main detection function
export function detectExercise(
    exerciseType: ExerciseType,
    landmarks: Landmark[],
    prevState: ExerciseState,
    additionalState?: any
): ExerciseState {
    if (!isPoseVisible(landmarks)) {
        return {
            ...prevState,
            formFeedback: 'Step into frame',
            isFormGood: false,
            confidence: 0,
        };
    }

    const angles = getPoseAngles(landmarks);
    if (!angles) return prevState;

    let result: any = { rep: false, phase: prevState.phase, feedback: '', isGood: true };

    switch (exerciseType) {
        case 'squat':
            result = detectSquat(angles, prevState.phase, additionalState?.prevKneeAngle || 0);
            break;

        case 'pushup':
            result = detectPushup(angles, prevState.phase);
            break;

        case 'jumpingJack':
            result = detectJumpingJack(angles, prevState.phase, landmarks);
            break;

        case 'plank':
            result = detectPlank(angles, prevState.phase, additionalState?.holdTimeRef || { current: 0 });
            break;

        case 'lunge':
            result = detectLunge(angles, prevState.phase, additionalState?.prevSide || 'left');
            break;

        case 'situp':
            result = detectSitup(angles, prevState.phase, landmarks);
            break;

        case 'mountainClimber':
            result = detectMountainClimber(angles, prevState.phase, additionalState?.prevSide || 'left', additionalState?.prevKneeAngle || 0);
            break;

        case 'highKnees':
            result = detectHighKnees(angles, prevState.phase, additionalState?.prevSide || 'left');
            break;

        case 'gluteBridge':
            result = detectGluteBridge(angles, prevState.phase, landmarks);
            break;

        case 'burpee':
            result = detectBurpee(angles, additionalState?.burpeeState || { phase: 'start' }, landmarks);
            break;
    }

    const newRepCount = result.rep ? prevState.repCount + 1 : prevState.repCount;

    return {
        repCount: newRepCount,
        phase: result.phase || prevState.phase,
        formFeedback: result.feedback || prevState.formFeedback,
        isFormGood: result.isGood !== undefined ? result.isGood : prevState.isFormGood,
        confidence: 1,
    };
}

// Get all exercises as array
export function getAllExercises(): ExerciseType[] {
    return [
        'squat',
        'pushup',
        'jumpingJack',
        'plank',
        'lunge',
        'situp',
        'mountainClimber',
        'highKnees',
        'gluteBridge',
        'burpee',
    ];
}

// Get exercise config
export function getExerciseConfig(type: ExerciseType): ExerciseConfig {
    return EXERCISE_CONFIGS[type];
}
