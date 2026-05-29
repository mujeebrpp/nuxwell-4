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
    | 'burpee'
    | 'bicepCurl'
    | 'frontRaise'
    | 'lateralRaise'
    | 'overheadPress'
    | 'uprightRow'
    | 'sideLegRaise'
    | 'sideStep'
    | 'torsoTwist'
    | 'standingObliqueCrunch'
    | 'crossBodyKneeDrive'
    | 'woodChop'
    | 'twistReach';

// Rep phase state
export type RepPhase = 'up' | 'down' | 'waiting' | 'left' | 'right' | 'holding';

// Exercise state
export interface ExerciseState {
    repCount: number;
    phase: RepPhase;
    formFeedback: string;
    isFormGood: boolean;
    confidence: number;
    formScore?: number;
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
        formScore: 0,
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
    // Difficulty levels
    difficultySettings: {
        beginner: {
            targetReps: number;
            targetTime: number; // in seconds
        };
        intermediate: {
            targetReps: number;
            targetTime: number; // in seconds
        };
        advanced: {
            targetReps: number;
            targetTime: number; // in seconds
        };
    };
}

export const EXERCISE_CONFIGS: Record<ExerciseType, ExerciseConfig> = {
    squat: {
        name: 'Squat',
        description: 'Stand with feet shoulder-width apart, lower your body by bending knees and hips',
        icon: '🦵',
        primaryAngles: { down: 90, up: 160 },
        minConfidence: 0.6,
        difficultySettings: {
            beginner: { targetReps: 10, targetTime: 30 },
            intermediate: { targetReps: 20, targetTime: 45 },
            advanced: { targetReps: 30, targetTime: 60 },
        },
    },
    pushup: {
        name: 'Push-up',
        description: 'Start in plank position, lower body by bending elbows, push back up',
        icon: '💪',
        primaryAngles: { down: 90, up: 160 },
        minConfidence: 0.6,
        difficultySettings: {
            beginner: { targetReps: 5, targetTime: 20 },
            intermediate: { targetReps: 15, targetTime: 30 },
            advanced: { targetReps: 25, targetTime: 45 },
        },
    },
    jumpingJack: {
        name: 'Jumping Jack',
        description: 'Jump while spreading legs and raising arms overhead, return to start',
        icon: '⭐',
        primaryAngles: { down: 30, up: 170 },
        minConfidence: 0.5,
        difficultySettings: {
            beginner: { targetReps: 20, targetTime: 30 },
            intermediate: { targetReps: 40, targetTime: 45 },
            advanced: { targetReps: 60, targetTime: 60 },
        },
    },
    plank: {
        name: 'Plank',
        description: 'Hold a straight line position on your forearms and toes',
        icon: '📏',
        primaryAngles: { down: 180, up: 180 },
        minConfidence: 0.7,
        difficultySettings: {
            beginner: { targetReps: 0, targetTime: 20 },
            intermediate: { targetReps: 0, targetTime: 45 },
            advanced: { targetReps: 0, targetTime: 60 },
        },
    },
    lunge: {
        name: 'Lunge',
        description: 'Step forward and lower your hips until both knees are bent at 90 degrees',
        icon: '🚶',
        primaryAngles: { down: 90, up: 160 },
        minConfidence: 0.6,
        difficultySettings: {
            beginner: { targetReps: 10, targetTime: 30 },
            intermediate: { targetReps: 20, targetTime: 45 },
            advanced: { targetReps: 30, targetTime: 60 },
        },
    },
    situp: {
        name: 'Sit-up',
        description: 'Lie on your back, raise your torso to sitting position',
        icon: '🧘',
        primaryAngles: { down: 30, up: 150 },
        minConfidence: 0.5,
        difficultySettings: {
            beginner: { targetReps: 15, targetTime: 30 },
            intermediate: { targetReps: 25, targetTime: 45 },
            advanced: { targetReps: 35, targetTime: 60 },
        },
    },
    mountainClimber: {
        name: 'Mountain Climber',
        description: 'In plank position, alternate driving knees toward chest',
        icon: '⛰️',
        primaryAngles: { down: 60, up: 170 },
        minConfidence: 0.5,
        difficultySettings: {
            beginner: { targetReps: 20, targetTime: 30 },
            intermediate: { targetReps: 40, targetTime: 45 },
            advanced: { targetReps: 60, targetTime: 60 },
        },
    },
    highKnees: {
        name: 'High Knees',
        description: 'Run in place, lifting knees as high as possible',
        icon: '🏃',
        primaryAngles: { down: 60, up: 170 },
        minConfidence: 0.5,
        difficultySettings: {
            beginner: { targetReps: 30, targetTime: 30 },
            intermediate: { targetReps: 50, targetTime: 45 },
            advanced: { targetReps: 70, targetTime: 60 },
        },
    },
    gluteBridge: {
        name: 'Glute Bridge',
        description: 'Lie on back, lift hips toward ceiling while squeezing glutes',
        icon: '🍑',
        primaryAngles: { down: 30, up: 160 },
        minConfidence: 0.5,
        difficultySettings: {
            beginner: { targetReps: 15, targetTime: 30 },
            intermediate: { targetReps: 25, targetTime: 45 },
            advanced: { targetReps: 35, targetTime: 60 },
        },
    },
    burpee: {
        name: 'Burpee',
        description: 'Squat down, kick feet back to plank, do push-up, jump feet forward, jump up',
        icon: '🔥',
        primaryAngles: { down: 90, up: 170 },
        minConfidence: 0.6,
        difficultySettings: {
            beginner: { targetReps: 5, targetTime: 20 },
            intermediate: { targetReps: 15, targetTime: 30 },
            advanced: { targetReps: 25, targetTime: 45 },
        },
    },
    bicepCurl: {
        name: 'Bicep Curl',
        description: 'Stand with feet shoulder-width apart, curl dumbbells toward shoulders',
        icon: '💪',
        primaryAngles: { down: 45, up: 160 },
        minConfidence: 0.6,
        difficultySettings: {
            beginner: { targetReps: 10, targetTime: 30 },
            intermediate: { targetReps: 20, targetTime: 45 },
            advanced: { targetReps: 30, targetTime: 60 },
        },
    },
    frontRaise: {
        name: 'Front Raise',
        description: 'Raise arms straight in front of you to shoulder height',
        icon: '🙌',
        primaryAngles: { down: 30, up: 160 },
        minConfidence: 0.6,
        difficultySettings: {
            beginner: { targetReps: 10, targetTime: 25 },
            intermediate: { targetReps: 20, targetTime: 40 },
            advanced: { targetReps: 30, targetTime: 50 },
        },
    },
    lateralRaise: {
        name: 'Lateral Raise',
        description: 'Raise arms out to sides until they reach shoulder height',
        icon: '🤲',
        primaryAngles: { down: 30, up: 170 },
        minConfidence: 0.6,
        difficultySettings: {
            beginner: { targetReps: 10, targetTime: 25 },
            intermediate: { targetReps: 20, targetTime: 40 },
            advanced: { targetReps: 30, targetTime: 50 },
        },
    },
    overheadPress: {
        name: 'Overhead Press',
        description: 'Press hands overhead from shoulder position',
        icon: '🙆',
        primaryAngles: { down: 45, up: 170 },
        minConfidence: 0.6,
        difficultySettings: {
            beginner: { targetReps: 8, targetTime: 30 },
            intermediate: { targetReps: 15, targetTime: 45 },
            advanced: { targetReps: 20, targetTime: 60 },
        },
    },
    uprightRow: {
        name: 'Upright Row',
        description: 'Pull hands up toward chest while keeping elbows high',
        icon: '🤝',
        primaryAngles: { down: 60, up: 150 },
        minConfidence: 0.6,
        difficultySettings: {
            beginner: { targetReps: 10, targetTime: 30 },
            intermediate: { targetReps: 18, targetTime: 45 },
            advanced: { targetReps: 25, targetTime: 60 },
        },
    },
    sideLegRaise: {
        name: 'Side Leg Raise',
        description: 'Stand on one leg and lift the other leg to the side',
        icon: '🦵',
        primaryAngles: { down: 170, up: 30 },
        minConfidence: 0.5,
        difficultySettings: {
            beginner: { targetReps: 10, targetTime: 30 },
            intermediate: { targetReps: 15, targetTime: 45 },
            advanced: { targetReps: 20, targetTime: 60 },
        },
    },
    sideStep: {
        name: 'Side Step',
        description: 'Step side to side with controlled movement',
        icon: '👣',
        primaryAngles: { down: 170, up: 170 },
        minConfidence: 0.6,
        difficultySettings: {
            beginner: { targetReps: 10, targetTime: 25 },
            intermediate: { targetReps: 20, targetTime: 40 },
            advanced: { targetReps: 30, targetTime: 50 },
        },
    },
    torsoTwist: {
        name: 'Torso Twist',
        description: 'Rotate your torso left and right from standing position',
        icon: '🔄',
        primaryAngles: { down: 30, up: 150 },
        minConfidence: 0.5,
        difficultySettings: {
            beginner: { targetReps: 10, targetTime: 20 },
            intermediate: { targetReps: 20, targetTime: 35 },
            advanced: { targetReps: 30, targetTime: 50 },
        },
    },
    standingObliqueCrunch: {
        name: 'Standing Oblique Crunch',
        description: 'Lift knee toward opposite elbow while standing',
        icon: '🦵',
        primaryAngles: { down: 160, up: 60 },
        minConfidence: 0.5,
        difficultySettings: {
            beginner: { targetReps: 10, targetTime: 25 },
            intermediate: { targetReps: 20, targetTime: 40 },
            advanced: { targetReps: 30, targetTime: 50 },
        },
    },
    crossBodyKneeDrive: {
        name: 'Cross Body Knee Drive',
        description: 'Drive knee across body toward opposite elbow',
        icon: '🏃',
        primaryAngles: { down: 170, up: 70 },
        minConfidence: 0.5,
        difficultySettings: {
            beginner: { targetReps: 10, targetTime: 25 },
            intermediate: { targetReps: 20, targetTime: 40 },
            advanced: { targetReps: 30, targetTime: 50 },
        },
    },
    woodChop: {
        name: 'Wood Chop',
        description: 'Diagonal reaching motion from low to high or high to low',
        icon: '🪵',
        primaryAngles: { down: 30, up: 170 },
        minConfidence: 0.5,
        difficultySettings: {
            beginner: { targetReps: 8, targetTime: 30 },
            intermediate: { targetReps: 12, targetTime: 45 },
            advanced: { targetReps: 16, targetTime: 60 },
        },
    },
    twistReach: {
        name: 'Twist Reach',
        description: 'Reach across body with alternating arms in a twisting motion',
        icon: '🌀',
        primaryAngles: { down: 160, up: 170 },
        minConfidence: 0.5,
        difficultySettings: {
            beginner: { targetReps: 10, targetTime: 25 },
            intermediate: { targetReps: 15, targetTime: 40 },
            advanced: { targetReps: 20, targetTime: 50 },
        },
    },
};

// Form scoring algorithm (0-100)
export interface FormScoreResult {
    score: number;
    rangeOfMotion: number;
    posture: number;
    symmetry: number;
    tempo: number;
}

export function calculateFormScore(
    exerciseType: ExerciseType,
    angles: ReturnType<typeof getPoseAngles> | null,
    prevState: ExerciseState,
    landmarks: Landmark[]
): FormScoreResult {
    if (!angles) {
        return { score: 0, rangeOfMotion: 0, posture: 0, symmetry: 0, tempo: 0 };
    }

    const config = EXERCISE_CONFIGS[exerciseType];
    const metrics = {
        rangeOfMotion: 0,
        posture: 0,
        symmetry: 0,
        tempo: 0,
    };

    switch (exerciseType) {
        case 'squat': {
            const kneeAngle = (angles.leftKneeAngle + angles.rightKneeAngle) / 2;
            const hipAngle = (angles.leftHipAngle + angles.rightHipAngle) / 2;
            const targetDown = config.primaryAngles.down;
            const targetUp = config.primaryAngles.up;

            metrics.rangeOfMotion = Math.min(100, (kneeAngle / targetDown) * 50);
            metrics.posture = hipAngle > 150 ? 50 : Math.max(0, (hipAngle / 150) * 50);
            metrics.symmetry = 100 - Math.abs(angles.leftKneeAngle - angles.rightKneeAngle);
            metrics.tempo = 50;
            break;
        }
        case 'pushup': {
            const elbowAngle = (angles.leftElbowAngle + angles.rightElbowAngle) / 2;
            const shoulderAngle = (angles.leftShoulderAngle + angles.rightShoulderAngle) / 2;

            metrics.rangeOfMotion = Math.min(100, (elbowAngle / 160) * 50);
            metrics.posture = shoulderAngle > 150 ? 50 : Math.max(0, (shoulderAngle / 150) * 50);
            metrics.symmetry = 100 - Math.abs(angles.leftElbowAngle - angles.rightElbowAngle);
            metrics.tempo = 50;
            break;
        }
        case 'jumpingJack': {
            const armAngle = (angles.leftArmAngle + angles.rightArmAngle) / 2;
            const legSpread = angles.legSpread;

            metrics.rangeOfMotion = Math.min(100, (legSpread / 0.5) * 50);
            metrics.posture = armAngle > 150 ? 50 : Math.max(0, (armAngle / 150) * 50);
            metrics.symmetry = 100 - Math.abs(angles.leftArmAngle - angles.rightArmAngle);
            metrics.tempo = 50;
            break;
        }
        case 'bicepCurl': {
            const elbowAngle = (angles.leftElbowAngle + angles.rightElbowAngle) / 2;

            metrics.rangeOfMotion = Math.min(100, (elbowAngle / 160) * 50);
            metrics.posture = 40;
            metrics.symmetry = 100 - Math.abs(angles.leftElbowAngle - angles.rightElbowAngle);
            metrics.tempo = 50;
            break;
        }
        case 'frontRaise': {
            const wristY = landmarks[POSE_LANDMARKS.LEFT_WRIST]?.y || 1;
            const elbowAngle = (angles.leftElbowAngle + angles.rightElbowAngle) / 2;

            metrics.rangeOfMotion = Math.min(100, ((0.7 - wristY) / 0.5) * 50);
            metrics.posture = elbowAngle > 150 ? 50 : 25;
            metrics.symmetry = 100 - Math.abs(angles.leftElbowAngle - angles.rightElbowAngle);
            metrics.tempo = 50;
            break;
        }
        case 'lateralRaise': {
            const wristX = landmarks[POSE_LANDMARKS.LEFT_WRIST]?.x || 0;

            metrics.rangeOfMotion = Math.min(100, (wristX / 0.7) * 50);
            metrics.posture = 30;
            metrics.symmetry = 100 - Math.abs(angles.leftElbowAngle - angles.rightElbowAngle);
            metrics.tempo = 50;
            break;
        }
        case 'overheadPress': {
            const wristY = landmarks[POSE_LANDMARKS.LEFT_WRIST]?.y || 1;
            const elbowAngle = (angles.leftElbowAngle + angles.rightElbowAngle) / 2;

            metrics.rangeOfMotion = Math.min(100, ((0.3 - wristY) / 0.3) * 50);
            metrics.posture = elbowAngle > 150 ? 50 : 30;
            metrics.symmetry = 100 - Math.abs(angles.leftElbowAngle - angles.rightElbowAngle);
            metrics.tempo = 50;
            break;
        }
        case 'uprightRow': {
            const wristY = landmarks[POSE_LANDMARKS.LEFT_WRIST]?.y || 1;
            const elbowAngle = (angles.leftElbowAngle + angles.rightElbowAngle) / 2;

            metrics.rangeOfMotion = Math.min(100, ((0.4 - wristY) / 0.4) * 50);
            metrics.posture = elbowAngle > 150 ? 50 : 30;
            metrics.symmetry = 100 - Math.abs(angles.leftElbowAngle - angles.rightElbowAngle);
            metrics.tempo = 50;
            break;
        }
        case 'sideLegRaise': {
            const leftHipY = landmarks[POSE_LANDMARKS.LEFT_HIP]?.y || 0.5;
            const rightHipY = landmarks[POSE_LANDMARKS.RIGHT_HIP]?.y || 0.5;

            metrics.rangeOfMotion = 40;
            metrics.posture = 30;
            metrics.symmetry = 100 - Math.abs(leftHipY - rightHipY) * 100;
            metrics.tempo = 50;
            break;
        }
        case 'sideStep': {
            metrics.rangeOfMotion = 40;
            metrics.posture = 30;
            metrics.symmetry = 80;
            metrics.tempo = 50;
            break;
        }
        case 'torsoTwist': {
            const shoulderAngle = Math.abs(angles.leftShoulderAngle - angles.rightShoulderAngle);

            metrics.rangeOfMotion = Math.min(100, (shoulderAngle / 45) * 50);
            metrics.posture = 30;
            metrics.symmetry = 80;
            metrics.tempo = 50;
            break;
        }
        case 'standingObliqueCrunch': {
            metrics.rangeOfMotion = 40;
            metrics.posture = 30;
            metrics.symmetry = 80;
            metrics.tempo = 50;
            break;
        }
        case 'crossBodyKneeDrive': {
            metrics.rangeOfMotion = 40;
            metrics.posture = 30;
            metrics.symmetry = 80;
            metrics.tempo = 50;
            break;
        }
        case 'woodChop': {
            metrics.rangeOfMotion = 40;
            metrics.posture = 30;
            metrics.symmetry = 80;
            metrics.tempo = 50;
            break;
        }
        case 'twistReach': {
            metrics.rangeOfMotion = 40;
            metrics.posture = 30;
            metrics.symmetry = 80;
            metrics.tempo = 50;
            break;
        }
        default: {
            metrics.rangeOfMotion = 30;
            metrics.posture = 20;
            metrics.symmetry = 30;
            metrics.tempo = 20;
        }
    }

    const score = (metrics.rangeOfMotion + metrics.posture + metrics.symmetry + metrics.tempo) / 4;
    return { score, ...metrics };
}

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

    if (avgHipAngle < 70) {
        feedback = 'Keep chest up';
        isGood = false;
    } else if (avgKneeAngle > 100 && prevPhase === 'down') {
        feedback = FORM_FEEDBACK.DEEPER;
    } else if (avgKneeAngle < 45 && prevPhase === 'down') {
        feedback = 'Too low!';
        isGood = false;
    }

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
    const legSpread = Math.abs(landmarks[POSE_LANDMARKS.LEFT_ANKLE].x - landmarks[POSE_LANDMARKS.RIGHT_ANKLE].x);

    let rep = false;
    let feedback = '';
    let isGood = true;

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
        return { rep: false, phase: 'down', feedback: 'Start position', isGood: true };
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

    let feedback = '';
    let isGood = true;

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

    return { rep: false, phase: 'holding', feedback, isGood, holdTime: holdTimeRef.current + 1 };
}

// Detect Lunge
function detectLunge(
    angles: ReturnType<typeof getPoseAngles>,
    prevPhase: RepPhase,
    prevSide: 'left' | 'right'
): { rep: boolean; phase: RepPhase; feedback: string; isGood: boolean; side: 'left' | 'right' } {
    if (!angles) return { rep: false, phase: 'waiting', feedback: '', isGood: true, side: 'left' };

    const avgKneeAngle = (angles.leftKneeAngle + angles.rightKneeAngle) / 2;
    const avgHipAngle = (angles.leftHipAngle + angles.rightHipAngle) / 2;

    let rep = false;
    let feedback = '';
    const isGood = true;
    let side = prevSide;

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

    const leftKneeUp = angles.leftKneeAngle < 70;
    const rightKneeUp = angles.rightKneeAngle < 70;

    const avgHipAngle = (angles.leftHipAngle + angles.rightHipAngle) / 2;

    let rep = false;
    let feedback = '';
    let isGood = true;
    let side = prevSide;

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

    const hipY = (landmarks[POSE_LANDMARKS.LEFT_HIP].y + landmarks[POSE_LANDMARKS.RIGHT_HIP].y) / 2;
    const isOnFloor = hipY > 0.7;

    let feedback = '';
    const isGood = true;
    let newPhase = prevState.phase;

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
            return { rep: true, phase: 'up', feedback: FORM_FEEDBACK.GOOD, isGood: true, burpeePhase: 'start' };
    }

    return { rep: false, phase: 'down', feedback, isGood, burpeePhase: newPhase };
}

// Detect Bicep Curl
function detectBicepCurl(
    angles: ReturnType<typeof getPoseAngles>,
    prevPhase: RepPhase,
    prevElbowAngle: number
): { rep: boolean; phase: RepPhase; feedback: string; isGood: boolean; prevElbowAngle: number } {
    if (!angles) return { rep: false, phase: 'waiting', feedback: '', isGood: true, prevElbowAngle: 0 };

    const elbowAngle = (angles.leftElbowAngle + angles.rightElbowAngle) / 2;

    let rep = false;
    let feedback = '';
    const isGood = true;

    if (prevPhase === 'down' && elbowAngle > 150) {
        rep = true;
        feedback = FORM_FEEDBACK.GOOD;
    } else if (elbowAngle < 60) {
        return { rep: false, phase: 'down', feedback: 'Lower weights', isGood, prevElbowAngle: elbowAngle };
    }

    return { rep, phase: elbowAngle > 150 ? 'up' : prevPhase, feedback, isGood, prevElbowAngle: elbowAngle };
}

// Detect Front Raise
function detectFrontRaise(
    angles: ReturnType<typeof getPoseAngles>,
    prevPhase: RepPhase,
    landmarks: Landmark[]
): { rep: boolean; phase: RepPhase; feedback: string; isGood: boolean } {
    if (!angles) return { rep: false, phase: 'waiting', feedback: '', isGood: true };

    const wristY = landmarks[POSE_LANDMARKS.LEFT_WRIST]?.y ?? 1;
    const avgElbowAngle = (angles.leftElbowAngle + angles.rightElbowAngle) / 2;

    let rep = false;
    let feedback = '';
    const isGood = true;

    if (prevPhase === 'down' && wristY < 0.5) {
        rep = true;
        feedback = FORM_FEEDBACK.GOOD;
    } else if (wristY > 0.7) {
        return { rep: false, phase: 'down', feedback: 'Raise arms forward', isGood, };
    }

    return { rep, phase: wristY < 0.5 ? 'up' : prevPhase, feedback, isGood };
}

// Detect Lateral Raise
function detectLateralRaise(
    angles: ReturnType<typeof getPoseAngles>,
    prevPhase: RepPhase,
    landmarks: Landmark[]
): { rep: boolean; phase: RepPhase; feedback: string; isGood: boolean } {
    if (!angles) return { rep: false, phase: 'waiting', feedback: '', isGood: true };

    const wristX = landmarks[POSE_LANDMARKS.LEFT_WRIST]?.x ?? 0;
    const avgElbowAngle = (angles.leftElbowAngle + angles.rightElbowAngle) / 2;

    let rep = false;
    let feedback = '';
    const isGood = true;

    if (prevPhase === 'down' && wristX > 0.6) {
        rep = true;
        feedback = FORM_FEEDBACK.GOOD;
    } else if (wristX < 0.3) {
        return { rep: false, phase: 'down', feedback: 'Raise arms to sides', isGood };
    }

    return { rep, phase: wristX > 0.6 ? 'up' : prevPhase, feedback, isGood };
}

// Detect Overhead Press
function detectOverheadPress(
    angles: ReturnType<typeof getPoseAngles>,
    prevPhase: RepPhase,
    landmarks: Landmark[]
): { rep: boolean; phase: RepPhase; feedback: string; isGood: boolean } {
    if (!angles) return { rep: false, phase: 'waiting', feedback: '', isGood: true };

    const wristY = landmarks[POSE_LANDMARKS.LEFT_WRIST]?.y ?? 1;
    const avgElbowAngle = (angles.leftElbowAngle + angles.rightElbowAngle) / 2;

    let rep = false;
    let feedback = '';
    const isGood = true;

    if (prevPhase === 'down' && wristY < 0.3) {
        rep = true;
        feedback = FORM_FEEDBACK.GOOD;
    } else if (wristY > 0.6) {
        return { rep: false, phase: 'down', feedback: 'Press arms up', isGood };
    }

    return { rep, phase: wristY < 0.3 ? 'up' : prevPhase, feedback, isGood };
}

// Detect Upright Row
function detectUprightRow(
    angles: ReturnType<typeof getPoseAngles>,
    prevPhase: RepPhase,
    landmarks: Landmark[]
): { rep: boolean; phase: RepPhase; feedback: string; isGood: boolean } {
    if (!angles) return { rep: false, phase: 'waiting', feedback: '', isGood: true };

    const wristY = landmarks[POSE_LANDMARKS.LEFT_WRIST]?.y ?? 1;
    const avgElbowAngle = (angles.leftElbowAngle + angles.rightElbowAngle) / 2;

    let rep = false;
    let feedback = '';
    const isGood = true;

    if (prevPhase === 'down' && wristY < 0.4) {
        rep = true;
        feedback = FORM_FEEDBACK.GOOD;
    } else if (wristY > 0.7) {
        return { rep: false, phase: 'down', feedback: 'Pull up higher', isGood };
    }

    return { rep, phase: wristY < 0.4 ? 'up' : prevPhase, feedback, isGood };
}

// Detect Side Leg Raise
function detectSideLegRaise(
    angles: ReturnType<typeof getPoseAngles>,
    prevPhase: RepPhase,
    prevSide: 'left' | 'right',
    landmarks: Landmark[]
): { rep: boolean; phase: RepPhase; feedback: string; isGood: boolean; side: 'left' | 'right' } {
    if (!angles) return { rep: false, phase: 'waiting', feedback: '', isGood: true, side: 'left' };

    const leftHipY = landmarks[POSE_LANDMARKS.LEFT_HIP]?.y ?? 0.5;
    const rightHipY = landmarks[POSE_LANDMARKS.RIGHT_HIP]?.y ?? 0.5;
    const leftKneeAngle = angles.leftKneeAngle;
    const rightKneeAngle = angles.rightKneeAngle;

    let rep = false;
    let feedback = '';
    const isGood = true;
    let side = prevSide;

    if (prevSide === 'left' && rightKneeAngle < 80 && prevPhase === 'left') {
        rep = true;
        feedback = FORM_FEEDBACK.GOOD;
        side = 'right';
    } else if (prevSide === 'right' && leftKneeAngle < 80 && prevPhase === 'right') {
        rep = true;
        feedback = FORM_FEEDBACK.GOOD;
        side = 'left';
    }

    return { rep, phase: prevPhase, feedback, isGood, side };
}

// Detect Side Step
function detectSideStep(
    angles: ReturnType<typeof getPoseAngles>,
    prevPhase: RepPhase,
    landmarks: Landmark[]
): { rep: boolean; phase: RepPhase; feedback: string; isGood: boolean } {
    if (!angles) return { rep: false, phase: 'waiting', feedback: '', isGood: true };

    const leftFootX = landmarks[POSE_LANDMARKS.LEFT_FOOT]?._x ?? 0.5;
    const rightFootX = landmarks[POSE_LANDMARKS.RIGHT_FOOT]?._x ?? 0.5;
    const footSpread = Math.abs(leftFootX - rightFootX);

    let rep = false;
    let feedback = '';
    const isGood = true;

    if (prevPhase === 'down' && footSpread > 0.3) {
        rep = true;
        feedback = FORM_FEEDBACK.GOOD;
    } else if (footSpread < 0.15) {
        return { rep: false, phase: 'down', feedback: 'Step wider', isGood };
    }

    return { rep, phase: footSpread > 0.3 ? 'up' : prevPhase, feedback, isGood };
}

// Detect Torso Twist
function detectTorsoTwist(
    angles: ReturnType<typeof getPoseAngles>,
    prevPhase: RepPhase,
    landmarks: Landmark[]
): { rep: boolean; phase: RepPhase; feedback: string; isGood: boolean } {
    if (!angles) return { rep: false, phase: 'waiting', feedback: '', isGood: true };

    const shoulderAngle = Math.abs(angles.leftShoulderAngle - angles.rightShoulderAngle);

    let rep = false;
    let feedback = '';
    const isGood = true;

    if (prevPhase === 'down' && shoulderAngle > 30) {
        rep = true;
        feedback = FORM_FEEDBACK.GOOD;
    } else if (shoulderAngle < 10) {
        return { rep: false, phase: 'down', feedback: 'Twist torso', isGood };
    }

    return { rep, phase: shoulderAngle > 30 ? 'up' : prevPhase, feedback, isGood };
}

// Detect Standing Oblique Crunch
function detectStandingObliqueCrunch(
    angles: ReturnType<typeof getPoseAngles>,
    prevPhase: RepPhase,
    prevSide: 'left' | 'right',
    landmarks: Landmark[]
): { rep: boolean; phase: RepPhase; feedback: string; isGood: boolean; side: 'left' | 'right' } {
    if (!angles) return { rep: false, phase: 'waiting', feedback: '', isGood: true, side: 'left' };

    const leftKnee = landmarks[POSE_LANDMARKS.LEFT_KNEE]?.y ?? 0.5;
    const rightKnee = landmarks[POSE_LANDMARKS.RIGHT_KNEE]?.y ?? 0.5;

    let rep = false;
    let feedback = '';
    const isGood = true;
    let side = prevSide;

    if (prevSide === 'left' && rightKnee < 0.5 && prevPhase === 'left') {
        rep = true;
        feedback = FORM_FEEDBACK.GOOD;
        side = 'right';
    } else if (prevSide === 'right' && leftKnee < 0.5 && prevPhase === 'right') {
        rep = true;
        feedback = FORM_FEEDBACK.GOOD;
        side = 'left';
    }

    return { rep, phase: prevPhase, feedback, isGood, side };
}

// Detect Cross Body Knee Drive
function detectCrossBodyKneeDrive(
    angles: ReturnType<typeof getPoseAngles>,
    prevPhase: RepPhase,
    prevSide: 'left' | 'right',
    landmarks: Landmark[]
): { rep: boolean; phase: RepPhase; feedback: string; isGood: boolean; side: 'left' | 'right' } {
    if (!angles) return { rep: false, phase: 'waiting', feedback: '', isGood: true, side: 'left' };

    const leftWristX = landmarks[POSE_LANDMARKS.LEFT_WRIST]?._x ?? 0.5;
    const rightWristX = landmarks[POSE_LANDMARKS.RIGHT_WRIST]?._x ?? 0.5;

    let rep = false;
    let feedback = '';
    const isGood = true;
    let side = prevSide;

    if (prevSide === 'left' && rightWristX < 0.3 && prevPhase === 'left') {
        rep = true;
        feedback = FORM_FEEDBACK.GOOD;
        side = 'right';
    } else if (prevSide === 'right' && leftWristX < 0.3 && prevPhase === 'right') {
        rep = true;
        feedback = FORM_FEEDBACK.GOOD;
        side = 'left';
    }

    return { rep, phase: prevPhase, feedback, isGood, side };
}

// Detect Wood Chop
function detectWoodChop(
    angles: ReturnType<typeof getPoseAngles>,
    prevPhase: RepPhase,
    prevSide: 'left' | 'right',
    landmarks: Landmark[]
): { rep: boolean; phase: RepPhase; feedback: string; isGood: boolean; side: 'left' | 'right' } {
    if (!angles) return { rep: false, phase: 'waiting', feedback: '', isGood: true, side: 'left' };

    const leftWrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];
    const rightWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];

    let rep = false;
    let feedback = '';
    const isGood = true;
    let side = prevSide;

    if (prevSide === 'left' && rightWrist?._x !== undefined && rightWrist?._y !== undefined && prevPhase === 'left') {
        rep = true;
        feedback = FORM_FEEDBACK.GOOD;
        side = 'right';
    } else if (prevSide === 'right' && leftWrist?._x !== undefined && leftWrist?._y !== undefined && prevPhase === 'right') {
        rep = true;
        feedback = FORM_FEEDBACK.GOOD;
        side = 'left';
    }

    return { rep, phase: prevPhase, feedback, isGood, side };
}

// Detect Twist Reach
function detectTwistReach(
    angles: ReturnType<typeof getPoseAngles>,
    prevPhase: RepPhase,
    prevSide: 'left' | 'right',
    landmarks: Landmark[]
): { rep: boolean; phase: RepPhase; feedback: string; isGood: boolean; side: 'left' | 'right' } {
    if (!angles) return { rep: false, phase: 'waiting', feedback: '', isGood: true, side: 'left' };

    const leftShoulderX = landmarks[POSE_LANDMARKS.LEFT_SHOULDER]?._x ?? 0.5;
    const rightShoulderX = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER]?._x ?? 0.5;

    let rep = false;
    let feedback = '';
    const isGood = true;
    let side = prevSide;

    if (prevSide === 'left' && rightShoulderX < 0.4 && prevPhase === 'left') {
        rep = true;
        feedback = FORM_FEEDBACK.GOOD;
        side = 'right';
    } else if (prevSide === 'right' && leftShoulderX < 0.4 && prevPhase === 'right') {
        rep = true;
        feedback = FORM_FEEDBACK.GOOD;
        side = 'left';
    }

    return { rep, phase: prevPhase, feedback, isGood, side };
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

        case 'bicepCurl':
            result = detectBicepCurl(angles, prevState.phase, additionalState?.prevElbowAngle || 0);
            break;

        case 'frontRaise': {
            const frontResult = detectFrontRaise(angles, prevState.phase, landmarks);
            result = frontResult;
            break;
        }

        case 'lateralRaise': {
            const lateralResult = detectLateralRaise(angles, prevState.phase, landmarks);
            result = lateralResult;
            break;
        }

        case 'overheadPress': {
            const pressResult = detectOverheadPress(angles, prevState.phase, landmarks);
            result = pressResult;
            break;
        }

        case 'uprightRow': {
            const rowResult = detectUprightRow(angles, prevState.phase, landmarks);
            result = rowResult;
            break;
        }

        case 'sideLegRaise':
            result = detectSideLegRaise(angles, prevState.phase, additionalState?.prevSide || 'left', landmarks);
            break;

        case 'sideStep': {
            const stepResult = detectSideStep(angles, prevState.phase, landmarks);
            result = stepResult;
            break;
        }

        case 'torsoTwist': {
            const twistResult = detectTorsoTwist(angles, prevState.phase, landmarks);
            result = twistResult;
            break;
        }

        case 'standingObliqueCrunch':
            result = detectStandingObliqueCrunch(angles, prevState.phase, additionalState?.prevSide || 'left', landmarks);
            break;

        case 'crossBodyKneeDrive':
            result = detectCrossBodyKneeDrive(angles, prevState.phase, additionalState?.prevSide || 'left', landmarks);
            break;

        case 'woodChop':
            result = detectWoodChop(angles, prevState.phase, additionalState?.prevSide || 'left', landmarks);
            break;

        case 'twistReach':
            result = detectTwistReach(angles, prevState.phase, additionalState?.prevSide || 'left', landmarks);
            break;
    }

    const newRepCount = result.rep ? prevState.repCount + 1 : prevState.repCount;

    // Calculate form score
    const formScoreResult = calculateFormScore(exerciseType, angles, prevState, landmarks);

    return {
        repCount: newRepCount,
        phase: result.phase || prevState.phase,
        formFeedback: result.feedback || prevState.formFeedback,
        isFormGood: result.isGood !== undefined ? result.isGood : prevState.isFormGood,
        confidence: 1,
        formScore: formScoreResult.score,
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
        'bicepCurl',
        'frontRaise',
        'lateralRaise',
        'overheadPress',
        'uprightRow',
        'sideLegRaise',
        'sideStep',
        'torsoTwist',
        'standingObliqueCrunch',
        'crossBodyKneeDrive',
        'woodChop',
        'twistReach',
    ];
}

// Get exercise config
export function getExerciseConfig(type: ExerciseType): ExerciseConfig {
    return EXERCISE_CONFIGS[type];
}