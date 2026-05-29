import {
    Landmark,
    getPoseAngles,
    isPoseVisible,
    clamp,
    average,
} from './poseUtils';

// Exercise types
export type ExerciseType =
    | 'squat'
    | 'jumping_jack'
    | 'bicep_curl'
    | 'front_raise'
    | 'lateral_raise'
    | 'overhead_press'
    | 'upright_row'
    | 'side_leg_raise'
    | 'side_step'
    | 'torso_twist'
    | 'standing_oblique_crunch'
    | 'cross_body_knee_drive'
    | 'wood_chop'
    | 'twist_reach'
    // Posture Assessment
    | 'forward_head_posture'
    | 'rounded_shoulders'
    | 'shoulder_asymmetry'
    // Upper Body Mobility Assessment
    | 'neck_rom'
    | 'shoulder_rom'
    | 'arm_rom'
    // Balance Assessment
    | 'double_leg_balance'
    | 'single_leg_balance'
    | 'tandem_stand'
    // Swimming Assessment
    | 'swimming_readiness';

// Rep phase state
export type RepPhase = 'up' | 'down' | 'waiting' | 'left' | 'right' | 'holding' | 'neutral' | 'center' | 'ready' | 'open' | 'closed' | 'twisting' | 'crunch' | 'drive' | 'chop' | 'raised' | 'reach';

// Exercise state
export interface ExerciseState {
    repCount: number;
    phase: RepPhase;
    formFeedback: string;
    isFormGood: boolean;
    confidence: number;
    formScore?: number;
    rangeOfMotion?: number;
    tempo?: number;
    posture?: number;
    stability?: number;
}

// Form feedback messages
export const FORM_FEEDBACK = {
    GOOD: 'Good form!',
    DEEPER: 'Go lower',
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
    minConfidence: number;
    difficultySettings: {
        beginner: {
            targetReps: number;
            targetTime: number;
        };
        intermediate: {
            targetReps: number;
            targetTime: number;
        };
        advanced: {
            targetReps: number;
            targetTime: number;
        };
    };
}

export const EXERCISE_CONFIGS: Record<ExerciseType, ExerciseConfig> = {
    squat: {
        name: 'Squat',
        description: 'Lower your hips and stand tall again while keeping both knees steady.',
        icon: '🦵',
        minConfidence: 0.6,
        difficultySettings: {
            beginner: { targetReps: 10, targetTime: 30 },
            intermediate: { targetReps: 20, targetTime: 45 },
            advanced: { targetReps: 30, targetTime: 60 },
        },
    },
    jumping_jack: {
        name: 'Jumping Jack',
        description: 'Open arms and feet, then return to center.',
        icon: '⭐',
        minConfidence: 0.5,
        difficultySettings: {
            beginner: { targetReps: 20, targetTime: 30 },
            intermediate: { targetReps: 40, targetTime: 45 },
            advanced: { targetReps: 60, targetTime: 60 },
        },
    },
    bicep_curl: {
        name: 'Bicep Curl',
        description: 'Curl both hands toward the shoulders, then lower fully.',
        icon: '💪',
        minConfidence: 0.6,
        difficultySettings: {
            beginner: { targetReps: 10, targetTime: 30 },
            intermediate: { targetReps: 20, targetTime: 45 },
            advanced: { targetReps: 30, targetTime: 60 },
        },
    },
    front_raise: {
        name: 'Front Raise',
        description: 'Start with hands low, then raise both hands to shoulder height and lower with control.',
        icon: '🙌',
        minConfidence: 0.6,
        difficultySettings: {
            beginner: { targetReps: 10, targetTime: 25 },
            intermediate: { targetReps: 20, targetTime: 40 },
            advanced: { targetReps: 30, targetTime: 50 },
        },
    },
    lateral_raise: {
        name: 'Lateral Raise',
        description: 'Lift both hands out to the sides until they reach shoulder height, then lower smoothly.',
        icon: '🤲',
        minConfidence: 0.6,
        difficultySettings: {
            beginner: { targetReps: 10, targetTime: 25 },
            intermediate: { targetReps: 20, targetTime: 40 },
            advanced: { targetReps: 30, targetTime: 50 },
        },
    },
    overhead_press: {
        name: 'Overhead Press',
        description: 'Press both hands overhead until the arms extend, then lower back to the rack position.',
        icon: '🙆',
        minConfidence: 0.6,
        difficultySettings: {
            beginner: { targetReps: 8, targetTime: 30 },
            intermediate: { targetReps: 15, targetTime: 45 },
            advanced: { targetReps: 20, targetTime: 60 },
        },
    },
    upright_row: {
        name: 'Upright Row',
        description: 'Pull both hands upward toward chest height with elbows leading, then lower with control.',
        icon: '🤝',
        minConfidence: 0.6,
        difficultySettings: {
            beginner: { targetReps: 10, targetTime: 30 },
            intermediate: { targetReps: 18, targetTime: 45 },
            advanced: { targetReps: 25, targetTime: 60 },
        },
    },
    side_leg_raise: {
        name: 'Side Leg Raise',
        description: 'Lift one leg out to the side, return to center, and repeat with control.',
        icon: '🦵',
        minConfidence: 0.5,
        difficultySettings: {
            beginner: { targetReps: 10, targetTime: 30 },
            intermediate: { targetReps: 15, targetTime: 45 },
            advanced: { targetReps: 20, targetTime: 60 },
        },
    },
    side_step: {
        name: 'Side Step',
        description: 'Step wide, then bring the feet back together to finish each rep.',
        icon: '👣',
        minConfidence: 0.6,
        difficultySettings: {
            beginner: { targetReps: 10, targetTime: 25 },
            intermediate: { targetReps: 20, targetTime: 40 },
            advanced: { targetReps: 30, targetTime: 50 },
        },
    },
    torso_twist: {
        name: 'Torso Twist',
        description: 'Rotate your chest left and right while keeping your hips mostly steady.',
        icon: '🔄',
        minConfidence: 0.5,
        difficultySettings: {
            beginner: { targetReps: 10, targetTime: 20 },
            intermediate: { targetReps: 20, targetTime: 35 },
            advanced: { targetReps: 30, targetTime: 50 },
        },
    },
    standing_oblique_crunch: {
        name: 'Standing Oblique Crunch',
        description: 'Bring the same-side elbow and knee together, then open back up.',
        icon: '🦵',
        minConfidence: 0.5,
        difficultySettings: {
            beginner: { targetReps: 10, targetTime: 25 },
            intermediate: { targetReps: 20, targetTime: 40 },
            advanced: { targetReps: 30, targetTime: 50 },
        },
    },
    cross_body_knee_drive: {
        name: 'Cross Body Knee Drive',
        description: 'Drive a knee up toward the opposite elbow, then return to center.',
        icon: '🏃',
        minConfidence: 0.5,
        difficultySettings: {
            beginner: { targetReps: 10, targetTime: 25 },
            intermediate: { targetReps: 20, targetTime: 40 },
            advanced: { targetReps: 30, targetTime: 50 },
        },
    },
    wood_chop: {
        name: 'Wood Chop',
        description: 'Reach high on one side and chop down across the body.',
        icon: '🪵',
        minConfidence: 0.5,
        difficultySettings: {
            beginner: { targetReps: 8, targetTime: 30 },
            intermediate: { targetReps: 12, targetTime: 45 },
            advanced: { targetReps: 16, targetTime: 60 },
        },
    },
    twist_reach: {
        name: 'Twist Reach',
        description: 'Reach your hands across the body from side to side with a twisting motion.',
        icon: '🌀',
        minConfidence: 0.5,
        difficultySettings: {
            beginner: { targetReps: 10, targetTime: 25 },
            intermediate: { targetReps: 15, targetTime: 40 },
            advanced: { targetReps: 20, targetTime: 50 },
        },
    },
    // Posture Assessment
    forward_head_posture: {
        name: 'Forward Head Posture Assessment',
        description: 'Assess head position relative to shoulder alignment for neck and upper spine health.',
        icon: '📏',
        minConfidence: 0.7,
        difficultySettings: {
            beginner: { targetReps: 1, targetTime: 30 },
            intermediate: { targetReps: 1, targetTime: 30 },
            advanced: { targetReps: 1, targetTime: 30 },
        },
    },
    rounded_shoulders: {
        name: 'Rounded Shoulders Assessment',
        description: 'Evaluate shoulder position and upper back posture for mobility improvement.',
        icon: '🔍',
        minConfidence: 0.7,
        difficultySettings: {
            beginner: { targetReps: 1, targetTime: 30 },
            intermediate: { targetReps: 1, targetTime: 30 },
            advanced: { targetReps: 1, targetTime: 30 },
        },
    },
    shoulder_asymmetry: {
        name: 'Shoulder Asymmetry Assessment',
        description: 'Check for height and rotation differences between left and right shoulders.',
        icon: '⚖️',
        minConfidence: 0.7,
        difficultySettings: {
            beginner: { targetReps: 1, targetTime: 30 },
            intermediate: { targetReps: 1, targetTime: 30 },
            advanced: { targetReps: 1, targetTime: 30 },
        },
    },
    // Upper Body Mobility Assessment
    neck_rom: {
        name: 'Neck ROM Assessment',
        description: 'Assess cervical spine mobility for safe swimming and daily activities.',
        icon: '🦴',
        minConfidence: 0.7,
        difficultySettings: {
            beginner: { targetReps: 1, targetTime: 20 },
            intermediate: { targetReps: 1, targetTime: 20 },
            advanced: { targetReps: 1, targetTime: 20 },
        },
    },
    shoulder_rom: {
        name: 'Shoulder ROM Assessment',
        description: 'Evaluate shoulder flexion, abduction, and external rotation range of motion.',
        icon: '💪',
        minConfidence: 0.7,
        difficultySettings: {
            beginner: { targetReps: 1, targetTime: 30 },
            intermediate: { targetReps: 1, targetTime: 30 },
            advanced: { targetReps: 1, targetTime: 30 },
        },
    },
    arm_rom: {
        name: 'Arm ROM Assessment',
        description: 'Assess shoulder and elbow mobility for overhead reaching and swimming strokes.',
        icon: '💪',
        minConfidence: 0.7,
        difficultySettings: {
            beginner: { targetReps: 1, targetTime: 20 },
            intermediate: { targetReps: 1, targetTime: 20 },
            advanced: { targetReps: 1, targetTime: 20 },
        },
    },
    // Balance Assessment
    double_leg_balance: {
        name: 'Double-Leg Balance Assessment',
        description: 'Test static balance with both feet on the ground.',
        icon: '🦶',
        minConfidence: 0.6,
        difficultySettings: {
            beginner: { targetReps: 1, targetTime: 30 },
            intermediate: { targetReps: 1, targetTime: 60 },
            advanced: { targetReps: 1, targetTime: 90 },
        },
    },
    single_leg_balance: {
        name: 'Single-Leg Balance Assessment',
        description: 'Test balance on one leg to assess stability and proprioception.',
        icon: '🦶',
        minConfidence: 0.6,
        difficultySettings: {
            beginner: { targetReps: 1, targetTime: 20 },
            intermediate: { targetReps: 1, targetTime: 45 },
            advanced: { targetReps: 1, targetTime: 60 },
        },
    },
    tandem_stand: {
        name: 'Tandem Stand Assessment',
        description: 'Semi-tandem or full tandem stance to assess balance and fall risk.',
        icon: '🦶',
        minConfidence: 0.6,
        difficultySettings: {
            beginner: { targetReps: 1, targetTime: 20 },
            intermediate: { targetReps: 1, targetTime: 40 },
            advanced: { targetReps: 1, targetTime: 60 },
        },
    },
    // Swimming Assessment
    swimming_readiness: {
        name: 'Swimming Readiness Assessment',
        description: 'Comprehensive assessment for shoulder mobility, overhead reach, and rotation for swimming.',
        icon: '🏊',
        minConfidence: 0.7,
        difficultySettings: {
            beginner: { targetReps: 1, targetTime: 60 },
            intermediate: { targetReps: 1, targetTime: 90 },
            advanced: { targetReps: 1, targetTime: 120 },
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
    cues: string[];
}

// Helper to generate score template
function scoreTemplate(
    rangeScore: number,
    controlScore: number,
    symmetryScore: number,
    durationMs: number,
    targetMs: number,
    successCue: string,
    issueCues: [number, string][]
): FormScoreResult {
    const tempoScore = clamp(100 - Math.abs(durationMs - targetMs) / 24, 55, 100);
    const formScore = Math.round(
        rangeScore * 0.34 + controlScore * 0.24 + symmetryScore * 0.22 + tempoScore * 0.2
    );
    const cues: string[] = [];
    issueCues.forEach(([score, message]) => {
        if (score < 72) cues.push(message);
    });
    return {
        score: formScore,
        rangeOfMotion: Math.round(rangeScore),
        posture: Math.round(controlScore),
        symmetry: Math.round(symmetryScore),
        tempo: Math.round(tempoScore),
        cues: cues.length ? cues : [successCue],
    };
}

// Scoring functions for each exercise
export function scoreSquat(metrics: NonNullable<ReturnType<typeof getPoseAngles>>, durationMs: number): FormScoreResult {
    const depthScore = clamp(100 - Math.max(metrics.avgKneeAngle - 90, 0) * 1.4, 35, 100);
    const postureScore = clamp(metrics.torsoMetric * 100, 45, 100);
    const stabilityScore = clamp(metrics.symmetryMetric * 100, 45, 100);
    const tempoScore = clamp(100 - Math.abs(durationMs - 1700) / 26, 55, 100);

    const cues: string[] = [];
    if (depthScore < 72) cues.push('Go lower');
    if (postureScore < 72) cues.push('Keep your chest taller');
    if (stabilityScore < 72) cues.push('Keep both knees moving evenly');
    if (tempoScore < 72) cues.push('Control the descent');

    return {
        score: Math.round(depthScore * 0.34 + postureScore * 0.28 + stabilityScore * 0.2 + tempoScore * 0.18),
        rangeOfMotion: Math.round(depthScore),
        posture: Math.round(postureScore),
        symmetry: Math.round(stabilityScore),
        tempo: Math.round(tempoScore),
        cues: cues.length ? cues : ['Strong squat rep'],
    };
}

export function scoreJumpingJack(metrics: NonNullable<ReturnType<typeof getPoseAngles>>, durationMs: number): FormScoreResult {
    const armScore = clamp(metrics.armsUpMetric * 100, 45, 100);
    const legScore = clamp(metrics.legSpreadMetric * 100, 45, 100);
    const stabilityScore = clamp(metrics.symmetryMetric * 100, 45, 100);

    const cues: string[] = [];
    if (armScore < 72) cues.push('Reach higher with your arms');
    if (legScore < 72) cues.push('Open your stance wider');
    if (stabilityScore < 72) cues.push('Keep movements balanced');

    return {
        score: Math.round(armScore * 0.3 + legScore * 0.3 + stabilityScore * 0.2 + clamp(100 - Math.abs(durationMs - 1300) / 24, 55, 100) * 0.2),
        rangeOfMotion: Math.round(average(armScore, legScore)),
        posture: Math.round(armScore),
        symmetry: Math.round(stabilityScore),
        tempo: Math.round(clamp(100 - Math.abs(durationMs - 1300) / 24, 55, 100)),
        cues: cues.length ? cues : ['Smooth jumping jack rep'],
    };
}

export function scoreBicepCurl(metrics: NonNullable<ReturnType<typeof getPoseAngles>>, durationMs: number): FormScoreResult {
    const curlDepthScore = clamp(100 - Math.max(metrics.avgElbowAngle - 55, 0) * 1.1, 35, 100);
    const elbowControlScore = clamp(metrics.elbowStabilityMetric * 100, 40, 100);
    const symmetryScore = clamp(100 - Math.abs(metrics.leftElbowAngle - metrics.rightElbowAngle) * 1.6, 45, 100);

    return scoreTemplate(
        curlDepthScore,
        elbowControlScore,
        symmetryScore,
        durationMs,
        1450,
        'Clean curl rep',
        [
            [curlDepthScore, 'Curl higher toward your shoulders'],
            [elbowControlScore, 'Keep your elbows tucked'],
            [symmetryScore, 'Move both hands evenly'],
        ]
    );
}

export function scoreFrontRaise(metrics: NonNullable<ReturnType<typeof getPoseAngles>>, durationMs: number): FormScoreResult {
    const heightScore = clamp(metrics.wristLiftMetric * 100, 35, 100);
    const extensionScore = clamp(metrics.elbowExtensionMetric * 100, 45, 100);
    const symmetryScore = clamp(100 - Math.abs(metrics.leftElbowAngle - metrics.rightElbowAngle) * 1.2, 45, 100);

    return scoreTemplate(
        heightScore,
        extensionScore,
        symmetryScore,
        durationMs,
        1600,
        'Strong front raise rep',
        [
            [heightScore, 'Lift to shoulder height'],
            [extensionScore, 'Keep your arms longer'],
            [symmetryScore, 'Raise both hands together'],
        ]
    );
}

export function scoreLateralRaise(metrics: NonNullable<ReturnType<typeof getPoseAngles>>, durationMs: number): FormScoreResult {
    const heightScore = clamp(metrics.wristShoulderLevelMetric * 100, 35, 100);
    const widthScore = clamp((metrics.wristWidthMetric / 2.05) * 100, 40, 100);
    const controlScore = clamp(metrics.elbowExtensionMetric * 100, 45, 100);

    return scoreTemplate(
        average(heightScore, widthScore),
        controlScore,
        clamp(100 - Math.abs(metrics.leftElbowAngle - metrics.rightElbowAngle) * 1.2, 45, 100),
        durationMs,
        1550,
        'Balanced lateral raise rep',
        [
            [heightScore, 'Lift both hands to shoulder height'],
            [widthScore, 'Reach wider through the sides'],
            [controlScore, 'Keep your arms longer'],
        ]
    );
}

export function scoreOverheadPress(metrics: NonNullable<ReturnType<typeof getPoseAngles>>, durationMs: number): FormScoreResult {
    const heightScore = clamp(metrics.wristAboveHeadMetric * 100, 40, 100);
    const extensionScore = clamp(metrics.elbowExtensionMetric * 100, 45, 100);
    const symmetryScore = clamp(100 - Math.abs(metrics.leftElbowAngle - metrics.rightElbowAngle) * 1.1, 45, 100);

    return scoreTemplate(
        heightScore,
        extensionScore,
        symmetryScore,
        durationMs,
        1650,
        'Strong overhead press rep',
        [
            [heightScore, 'Press a little higher overhead'],
            [extensionScore, 'Finish with fuller arm extension'],
            [symmetryScore, 'Keep both hands pressing together'],
        ]
    );
}

export function scoreUprightRow(metrics: NonNullable<ReturnType<typeof getPoseAngles>>, durationMs: number): FormScoreResult {
    const liftScore = clamp(metrics.wristLiftMetric * 100, 35, 100);
    const elbowWidthScore = clamp((metrics.elbowWidthMetric / 1.75) * 100, 40, 100);
    const symmetryScore = clamp(100 - Math.abs(metrics.leftElbowAngle - metrics.rightElbowAngle) * 1.2, 45, 100);

    return scoreTemplate(
        average(liftScore, elbowWidthScore),
        clamp(metrics.elbowStabilityMetric * 100, 40, 100),
        symmetryScore,
        durationMs,
        1500,
        'Clean upright row rep',
        [
            [liftScore, 'Pull the hands a little higher'],
            [elbowWidthScore, 'Lead with your elbows wider'],
            [symmetryScore, 'Raise both arms evenly'],
        ]
    );
}

export function scoreSideLegRaise(metrics: NonNullable<ReturnType<typeof getPoseAngles>>, durationMs: number): FormScoreResult {
    const rangeScore = clamp(Math.max(metrics.leftAnkleLateralMetric, metrics.rightAnkleLateralMetric) * 100, 35, 100);
    const controlScore = clamp(metrics.torsoMetric * 100, 45, 100);

    return scoreTemplate(
        rangeScore,
        controlScore,
        clamp(metrics.symmetryMetric * 100, 40, 100),
        durationMs,
        1500,
        'Controlled side leg raise',
        [
            [rangeScore, 'Lift the leg farther to the side'],
            [controlScore, 'Keep your torso steadier'],
        ]
    );
}

export function scoreSideStep(metrics: NonNullable<ReturnType<typeof getPoseAngles>>, durationMs: number): FormScoreResult {
    const widthScore = clamp((metrics.ankleSpread / 2) * 100, 35, 100);
    const controlScore = clamp(metrics.torsoMetric * 100, 45, 100);

    return scoreTemplate(
        widthScore,
        controlScore,
        clamp(metrics.symmetryMetric * 100, 45, 100),
        durationMs,
        1300,
        'Strong side step rep',
        [
            [widthScore, 'Step a bit wider'],
            [controlScore, 'Stay balanced through the center'],
        ]
    );
}

export function scoreTorsoTwist(metrics: NonNullable<ReturnType<typeof getPoseAngles>>, durationMs: number): FormScoreResult {
    const twistScore = clamp(Math.abs(metrics.noseOffsetMetric) * 120, 35, 100);
    const controlScore = clamp(metrics.torsoMetric * 100, 45, 100);

    return scoreTemplate(
        twistScore,
        controlScore,
        clamp(100 - Math.abs(metrics.wristSideOffsetMetric) * 20, 45, 100),
        durationMs,
        1200,
        'Smooth torso twist rep',
        [
            [twistScore, 'Rotate a little farther through the chest'],
            [controlScore, 'Keep your hips quieter while twisting'],
        ]
    );
}

export function scoreStandingObliqueCrunch(metrics: NonNullable<ReturnType<typeof getPoseAngles>>, durationMs: number): FormScoreResult {
    const rangeScore = clamp((1 - Math.min(metrics.leftElbowKneeDistance, metrics.rightElbowKneeDistance)) * 100, 35, 100);
    const controlScore = clamp(metrics.torsoMetric * 100, 45, 100);

    return scoreTemplate(
        rangeScore,
        controlScore,
        clamp(100 - Math.abs(metrics.leftKneeLiftMetric - metrics.rightKneeLiftMetric) * 70, 45, 100),
        durationMs,
        1350,
        'Compact oblique crunch rep',
        [
            [rangeScore, 'Bring the elbow and knee closer together'],
            [controlScore, 'Stay taller before you crunch'],
        ]
    );
}

export function scoreCrossBodyKneeDrive(metrics: NonNullable<ReturnType<typeof getPoseAngles>>, durationMs: number): FormScoreResult {
    const rangeScore = clamp((1 - Math.min(metrics.leftCrossDistance, metrics.rightCrossDistance)) * 100, 35, 100);
    const controlScore = clamp(metrics.maxKneeLiftMetric * 100, 40, 100);

    return scoreTemplate(
        rangeScore,
        controlScore,
        clamp(metrics.torsoMetric * 100, 45, 100),
        durationMs,
        1250,
        'Sharp cross-body drive rep',
        [
            [rangeScore, 'Drive the knee closer to the opposite elbow'],
            [controlScore, 'Lift the knee higher'],
        ]
    );
}

export function scoreWoodChop(metrics: NonNullable<ReturnType<typeof getPoseAngles>>, durationMs: number): FormScoreResult {
    const diagonalScore = clamp((Math.abs(metrics.wristSideOffsetMetric) + metrics.wristLiftMetric) * 60, 35, 100);
    const controlScore = clamp(metrics.torsoMetric * 100, 45, 100);

    return scoreTemplate(
        diagonalScore,
        controlScore,
        clamp(metrics.elbowExtensionMetric * 100, 45, 100),
        durationMs,
        1500,
        'Powerful wood chop rep',
        [
            [diagonalScore, 'Reach farther across the diagonal'],
            [controlScore, 'Rotate without collapsing the chest'],
        ]
    );
}

export function scoreTwistReach(metrics: NonNullable<ReturnType<typeof getPoseAngles>>, durationMs: number): FormScoreResult {
    const reachScore = clamp(Math.abs(metrics.wristSideOffsetMetric) * 130, 35, 100);
    const controlScore = clamp(metrics.wristLiftMetric * 100, 35, 100);

    return scoreTemplate(
        reachScore,
        controlScore,
        clamp(metrics.torsoMetric * 100, 45, 100),
        durationMs,
        1300,
        'Clean twist reach rep',
        [
            [reachScore, 'Reach farther across your body'],
            [controlScore, 'Keep the hands active through the twist'],
        ]
    );
}

// Detect exercise type in auto-detect mode
export function detectExercise(metrics: NonNullable<ReturnType<typeof getPoseAngles>>): 'squat' | 'jumping_jack' | 'idle' {
    const squatSignal = clamp((155 - metrics.avgKneeAngle) / 55, 0, 1);
    const jackSignal = average(metrics.armsUpMetric, metrics.legSpreadMetric);

    if (jackSignal > 0.56 && jackSignal > squatSignal + 0.08) {
        return 'jumping_jack';
    }
    if (squatSignal > 0.16) {
        return 'squat';
    }

    return 'idle';
}

function detectSide(value: number, threshold = 0.18): 'left' | 'right' | null {
    if (value < -threshold) return 'left';
    if (value > threshold) return 'right';
    return null;
}

// Exercise state machine states
interface SquatState {
    phase: 'top' | 'descending' | 'bottom';
    bottomMetrics: ReturnType<typeof getPoseAngles> | null;
    lastRepTime: number;
    lastBottomAt: number;
}

interface JackState {
    phase: 'closed' | 'open';
    openMetrics: ReturnType<typeof getPoseAngles> | null;
    lastRepTime: number;
}

interface CurlState {
    phase: 'down' | 'up';
    peakMetrics: ReturnType<typeof getPoseAngles> | null;
    lastRepTime: number;
    lastPeakAt: number;
}

interface RaiseState {
    phase: 'down' | 'up';
    peakMetrics: ReturnType<typeof getPoseAngles> | null;
    lastRepTime: number;
    lastPeakAt: number;
}

interface LungeState {
    phase: 'standing' | 'bottom';
    bottomMetrics: ReturnType<typeof getPoseAngles> | null;
    lastRepTime: number;
    lastBottomAt: number;
}

interface KneesState {
    phase: 'neutral' | 'up';
    side: 'left' | 'right' | null;
    peakMetrics: ReturnType<typeof getPoseAngles> | null;
    lastRepTime: number;
}

interface SideLegState {
    phase: 'center' | 'raised';
    side: 'left' | 'right' | null;
    peakMetrics: ReturnType<typeof getPoseAngles> | null;
    lastRepTime: number;
}

interface SideStepState {
    phase: 'closed' | 'open';
    peakMetrics: ReturnType<typeof getPoseAngles> | null;
    lastRepTime: number;
}

interface TwistState {
    phase: 'center' | 'twisting' | 'ready';
    side: 'left' | 'right' | null;
    lastRepTime: number;
}

interface ObliqueState {
    phase: 'open' | 'crunch';
    side: 'left' | 'right' | null;
    peakMetrics: ReturnType<typeof getPoseAngles> | null;
    lastRepTime: number;
}

interface CrossDriveState {
    phase: 'open' | 'drive';
    side: 'left' | 'right' | null;
    peakMetrics: ReturnType<typeof getPoseAngles> | null;
    lastRepTime: number;
}

interface WoodChopState {
    phase: 'neutral' | 'chop';
    diagonal: 'left_high' | 'right_high' | 'left_low' | 'right_low' | null;
    peakMetrics: ReturnType<typeof getPoseAngles> | null;
    lastRepTime: number;
}

interface TwistReachState {
    phase: 'center' | 'reach' | 'ready';
    side: 'left' | 'right' | null;
    peakMetrics: ReturnType<typeof getPoseAngles> | null;
    lastRepTime: number;
}

// Enhanced detection function with state machines
export function detectExerciseWithState(
    exerciseType: ExerciseType,
    landmarks: Landmark[],
    states: {
        squat: SquatState;
        jack: JackState;
        curl: CurlState;
        raise: RaiseState;
        lateralRaise: RaiseState;
        press: RaiseState;
        row: RaiseState;
        lunge: LungeState;
        knees: KneesState;
        sideLeg: SideLegState;
        sideStep: SideStepState;
        twist: TwistState;
        oblique: ObliqueState;
        crossDrive: CrossDriveState;
        woodChop: WoodChopState;
        twistReach: TwistReachState;
    },
    now: number,
    addRepCallback: (exercise: ExerciseType, score: FormScoreResult) => void
): ExerciseState {
    if (!isPoseVisible(landmarks)) {
        return {
            repCount: states.squat.phase === 'bottom' || states.squat.phase === 'descending' ? 0 : 0,
            phase: 'waiting',
            formFeedback: 'Step into frame',
            isFormGood: false,
            confidence: 0,
            formScore: 0,
        };
    }

    const metrics = getPoseAngles(landmarks);
    if (!metrics) return createDefaultExerciseState();

    switch (exerciseType) {
        case 'squat': {
            const squat = states.squat;
            if (metrics.avgKneeAngle < 145 && squat.phase === 'top') {
                squat.phase = 'descending';
            }
            if (metrics.avgKneeAngle < 105) {
                squat.phase = 'bottom';
                squat.bottomMetrics = metrics;
                squat.lastBottomAt = now;
            }
            if (metrics.avgKneeAngle > 155 && squat.phase === 'bottom' && now - squat.lastRepTime > 700) {
                const durationMs = squat.lastBottomAt ? now - squat.lastBottomAt + 850 : 1700;
                const score = scoreSquat(squat.bottomMetrics || metrics, durationMs);
                addRepCallback('squat', score);
                squat.phase = 'top';
                squat.lastRepTime = now;
            } else if (metrics.avgKneeAngle > 155 && squat.phase === 'descending') {
                squat.phase = 'top';
            }
            return {
                repCount: 0,
                phase: squat.phase === 'top' ? 'up' : 'down',
                formFeedback: squat.phase === 'bottom' ? 'Drive back up through your heels.' : 'Sit back and keep your knees tracking evenly.',
                isFormGood: true,
                confidence: 1,
                formScore: scoreSquat(metrics, 1700).score,
            };
        }

        case 'jumping_jack': {
            const jack = states.jack;
            const isOpen = metrics.armsUpMetric > 0.75 && metrics.legSpreadMetric > 0.55;
            const isClosed = metrics.armsUpMetric < 0.35 && metrics.legSpreadMetric < 0.2;

            if (isOpen && jack.phase === 'closed') {
                jack.phase = 'open';
                jack.openMetrics = metrics;
            }
            if (isClosed && jack.phase === 'open' && now - jack.lastRepTime > 550) {
                addRepCallback('jumping_jack', scoreJumpingJack(jack.openMetrics || metrics, 1200));
                jack.phase = 'closed';
                jack.lastRepTime = now;
            }
            return {
                repCount: 0,
                phase: jack.phase === 'closed' ? 'up' : 'down',
                formFeedback: jack.phase === 'open' ? 'Snap back to center to finish the rep.' : 'Open your arms and feet together.',
                isFormGood: true,
                confidence: 1,
                formScore: Math.round(average(metrics.armsUpMetric * 100, metrics.legSpreadMetric * 100)),
            };
        }

        case 'bicep_curl': {
            const curl = states.curl;
            if (metrics.avgElbowAngle < 82 && curl.phase === 'down') {
                curl.phase = 'up';
                curl.peakMetrics = metrics;
                curl.lastPeakAt = now;
            }
            if (metrics.avgElbowAngle > 145 && curl.phase === 'up' && now - curl.lastRepTime > 650) {
                const durationMs = curl.lastPeakAt ? now - curl.lastPeakAt + 700 : 1450;
                addRepCallback('bicep_curl', scoreBicepCurl(curl.peakMetrics || metrics, durationMs));
                curl.phase = 'down';
                curl.lastRepTime = now;
            }
            return {
                repCount: 0,
                phase: curl.phase,
                formFeedback: metrics.avgElbowAngle < 85 ? 'Lower all the way down to finish the curl.' : 'Curl both hands up while keeping elbows tucked.',
                isFormGood: true,
                confidence: 1,
                formScore: scoreBicepCurl(metrics, 1450).score,
            };
        }

        case 'front_raise': {
            const raise = states.raise;
            if (metrics.wristLiftMetric > 0.85 && raise.phase === 'down') {
                raise.phase = 'up';
                raise.peakMetrics = metrics;
                raise.lastPeakAt = now;
            }
            if (metrics.wristLiftMetric < 0.28 && raise.phase === 'up' && now - raise.lastRepTime > 700) {
                const durationMs = raise.lastPeakAt ? now - raise.lastPeakAt + 750 : 1600;
                addRepCallback('front_raise', scoreFrontRaise(raise.peakMetrics || metrics, durationMs));
                raise.phase = 'down';
                raise.lastRepTime = now;
            }
            return {
                repCount: 0,
                phase: raise.phase,
                formFeedback: metrics.wristLiftMetric > 0.8 ? 'Pause briefly at shoulder height, then lower slowly.' : 'Raise both hands to shoulder height together.',
                isFormGood: true,
                confidence: 1,
                formScore: scoreFrontRaise(metrics, 1600).score,
            };
        }

        case 'lateral_raise': {
            const movement = states.lateralRaise;
            const isUp = metrics.wristShoulderLevelMetric > 0.78 && metrics.wristWidthMetric > 1.85;
            const isDown = metrics.wristLiftMetric < 0.32;
            if (isUp && movement.phase === 'down') {
                movement.phase = 'up';
                movement.peakMetrics = metrics;
                movement.lastPeakAt = now;
            }
            if (isDown && movement.phase === 'up' && now - movement.lastRepTime > 700) {
                const durationMs = movement.lastPeakAt ? now - movement.lastPeakAt + 700 : 1550;
                addRepCallback('lateral_raise', scoreLateralRaise(movement.peakMetrics || metrics, durationMs));
                movement.phase = 'down';
                movement.lastRepTime = now;
            }
            return {
                repCount: 0,
                phase: movement.phase,
                formFeedback: movement.phase === 'up' ? 'Lower smoothly to complete the rep.' : 'Lift both hands wide to shoulder height.',
                isFormGood: true,
                confidence: 1,
                formScore: scoreLateralRaise(metrics, 1550).score,
            };
        }

        case 'overhead_press': {
            const movement = states.press;
            const isDown = metrics.wristLiftMetric > 0.3 && metrics.avgElbowAngle < 118;
            const isUp = metrics.wristAboveHeadMetric > 0.55 && metrics.avgElbowAngle > 145;
            if (isUp && movement.phase === 'down') {
                movement.phase = 'up';
                movement.peakMetrics = metrics;
                movement.lastPeakAt = now;
            }
            if (isDown && movement.phase === 'up' && now - movement.lastRepTime > 750) {
                const durationMs = movement.lastPeakAt ? now - movement.lastPeakAt + 800 : 1650;
                addRepCallback('overhead_press', scoreOverheadPress(movement.peakMetrics || metrics, durationMs));
                movement.phase = 'down';
                movement.lastRepTime = now;
            }
            return {
                repCount: 0,
                phase: movement.phase,
                formFeedback: movement.phase === 'up' ? 'Bring the hands back down to shoulder level.' : 'Press both hands overhead together.',
                isFormGood: true,
                confidence: 1,
                formScore: scoreOverheadPress(metrics, 1650).score,
            };
        }

        case 'upright_row': {
            const movement = states.row;
            const isUp = metrics.wristLiftMetric > 0.55 && metrics.elbowWidthMetric > 1.1;
            const isDown = metrics.wristLiftMetric < 0.28;
            if (isUp && movement.phase === 'down') {
                movement.phase = 'up';
                movement.peakMetrics = metrics;
                movement.lastPeakAt = now;
            }
            if (isDown && movement.phase === 'up' && now - movement.lastRepTime > 700) {
                const durationMs = movement.lastPeakAt ? now - movement.lastPeakAt + 650 : 1500;
                addRepCallback('upright_row', scoreUprightRow(movement.peakMetrics || metrics, durationMs));
                movement.phase = 'down';
                movement.lastRepTime = now;
            }
            return {
                repCount: 0,
                phase: movement.phase,
                formFeedback: movement.phase === 'up' ? 'Lower with control to finish the row.' : 'Pull the hands up with elbows leading.',
                isFormGood: true,
                confidence: 1,
                formScore: scoreUprightRow(metrics, 1500).score,
            };
        }

        case 'side_leg_raise': {
            const movement = states.sideLeg;
            const leftRaised = metrics.leftAnkleLateralMetric > 0.7 && metrics.ankleHeightDelta < -0.08;
            const rightRaised = metrics.rightAnkleLateralMetric > 0.7 && metrics.ankleHeightDelta > 0.08;
            const side = leftRaised ? 'left' : rightRaised ? 'right' : null;
            if (side && movement.phase === 'center') {
                movement.phase = 'raised';
                movement.side = side;
                movement.peakMetrics = metrics;
            }
            if (!side && movement.phase === 'raised' && now - movement.lastRepTime > 700) {
                addRepCallback('side_leg_raise', scoreSideLegRaise(movement.peakMetrics || metrics, 1500));
                movement.phase = 'center';
                movement.lastRepTime = now;
                movement.side = null;
            }
            return {
                repCount: 0,
                phase: movement.phase === 'center' ? 'waiting' : movement.phase as RepPhase,
                formFeedback: movement.phase === 'raised' ? 'Return to center with control.' : 'Lift one leg out to the side.',
                isFormGood: true,
                confidence: 1,
                formScore: scoreSideLegRaise(metrics, 1500).score,
            };
        }

        case 'side_step': {
            const movement = states.sideStep;
            const isOpen = metrics.ankleSpread > 1.85;
            const isClosed = metrics.ankleSpread < 1.28;
            if (isOpen && movement.phase === 'closed') {
                movement.phase = 'open';
                movement.peakMetrics = metrics;
            }
            if (isClosed && movement.phase === 'open' && now - movement.lastRepTime > 600) {
                addRepCallback('side_step', scoreSideStep(movement.peakMetrics || metrics, 1300));
                movement.phase = 'closed';
                movement.lastRepTime = now;
            }
            return {
                repCount: 0,
                phase: movement.phase,
                formFeedback: movement.phase === 'open' ? 'Bring your feet back together.' : 'Step wide and keep your balance centered.',
                isFormGood: true,
                confidence: 1,
                formScore: scoreSideStep(metrics, 1300).score,
            };
        }

        case 'torso_twist': {
            const movement = states.twist;
            const side = detectSide(metrics.noseOffsetMetric, 0.18);
            const centered = Math.abs(metrics.noseOffsetMetric) < 0.08;

            if (side && movement.phase === 'center') {
                movement.side = side;
                movement.phase = 'twisting';
                return {
                    repCount: 0,
                    phase: 'down',
                    formFeedback: 'Rotate through the other side to complete the twist.',
                    isFormGood: true,
                    confidence: 1,
                    formScore: scoreTorsoTwist(metrics, 1200).score,
                };
            }
            if (centered && movement.phase === 'twisting') {
                movement.phase = 'ready';
                return {
                    repCount: 0,
                    phase: 'down',
                    formFeedback: 'Rotate through the other side to complete the twist.',
                    isFormGood: true,
                    confidence: 1,
                    formScore: scoreTorsoTwist(metrics, 1200).score,
                };
            }
            if (side && movement.phase === 'ready' && movement.side && side !== movement.side && now - movement.lastRepTime > 650) {
                addRepCallback('torso_twist', scoreTorsoTwist(metrics, 1200));
                movement.lastRepTime = now;
                movement.side = side;
                movement.phase = 'twisting';
            }
            return {
                repCount: 0,
                phase: movement.phase,
                formFeedback: 'Turn your chest left and right while hips stay quieter.',
                isFormGood: true,
                confidence: 1,
                formScore: scoreTorsoTwist(metrics, 1200).score,
            };
        }

        case 'standing_oblique_crunch': {
            const movement = states.oblique;
            const leftCrunch = metrics.leftElbowKneeDistance < 0.5 && metrics.leftKneeLiftMetric > 0.16;
            const rightCrunch = metrics.rightElbowKneeDistance < 0.5 && metrics.rightKneeLiftMetric > 0.16;
            const side = leftCrunch ? 'left' : rightCrunch ? 'right' : null;
            if (side && movement.phase === 'open') {
                movement.phase = 'crunch';
                movement.side = side;
                movement.peakMetrics = metrics;
            }
            if (!side && movement.phase === 'crunch' && now - movement.lastRepTime > 600) {
                addRepCallback('standing_oblique_crunch', scoreStandingObliqueCrunch(movement.peakMetrics || metrics, 1350));
                movement.phase = 'open';
                movement.lastRepTime = now;
                movement.side = null;
            }
            return {
                repCount: 0,
                phase: movement.phase,
                formFeedback: movement.phase === 'crunch' ? 'Open back up before the next crunch.' : 'Bring the same-side elbow and knee together.',
                isFormGood: true,
                confidence: 1,
                formScore: scoreStandingObliqueCrunch(metrics, 1350).score,
            };
        }

        case 'cross_body_knee_drive': {
            const movement = states.crossDrive;
            const leftDrive = metrics.leftCrossDistance < 0.56 && metrics.rightKneeLiftMetric > 0.18;
            const rightDrive = metrics.rightCrossDistance < 0.56 && metrics.leftKneeLiftMetric > 0.18;
            const side = leftDrive ? 'left' : rightDrive ? 'right' : null;
            if (side && movement.phase === 'open') {
                movement.phase = 'drive';
                movement.side = side;
                movement.peakMetrics = metrics;
            }
            if (!side && movement.phase === 'drive' && now - movement.lastRepTime > 550) {
                addRepCallback('cross_body_knee_drive', scoreCrossBodyKneeDrive(movement.peakMetrics || metrics, 1250));
                movement.phase = 'open';
                movement.lastRepTime = now;
                movement.side = null;
            }
            return {
                repCount: 0,
                phase: movement.phase,
                formFeedback: movement.phase === 'drive' ? 'Reset to center and drive the other side.' : 'Drive the knee toward the opposite elbow.',
                isFormGood: true,
                confidence: 1,
                formScore: scoreCrossBodyKneeDrive(metrics, 1250).score,
            };
        }

        case 'wood_chop': {
            const movement = states.woodChop;
            const leftHigh = metrics.wristSideOffsetMetric < -0.16 && metrics.wristLiftMetric > 0.72;
            const rightHigh = metrics.wristSideOffsetMetric > 0.16 && metrics.wristLiftMetric > 0.72;
            const leftLow = metrics.wristSideOffsetMetric < -0.16 && metrics.wristLiftMetric < 0.38;
            const rightLow = metrics.wristSideOffsetMetric > 0.16 && metrics.wristLiftMetric < 0.38;

            let diagonal: 'left_high' | 'right_high' | 'left_low' | 'right_low' | null = null;
            if (leftHigh) diagonal = 'left_high';
            else if (rightHigh) diagonal = 'right_high';
            else if (leftLow) diagonal = 'left_low';
            else if (rightLow) diagonal = 'right_low';

            const validPair =
                (movement.diagonal === 'left_high' && diagonal === 'right_low') ||
                (movement.diagonal === 'right_high' && diagonal === 'left_low');

            if (validPair && now - movement.lastRepTime > 700) {
                addRepCallback('wood_chop', scoreWoodChop(metrics, 1500));
                movement.lastRepTime = now;
                movement.phase = 'neutral';
                movement.diagonal = null;
            }

            if (diagonal) {
                movement.diagonal = diagonal;
                movement.phase = 'chop';
                movement.peakMetrics = metrics;
            }

            return {
                repCount: 0,
                phase: movement.phase,
                formFeedback: movement.phase === 'chop' ? 'Chop down across your body with control.' : 'Reach high on one side, then cut diagonally down.',
                isFormGood: true,
                confidence: 1,
                formScore: scoreWoodChop(metrics, 1500).score,
            };
        }

        case 'twist_reach': {
            const movement = states.twistReach;
            const side = detectSide(metrics.wristSideOffsetMetric, 0.2);
            const centered = Math.abs(metrics.wristSideOffsetMetric) < 0.08;
            const activeReach = side && metrics.wristLiftMetric > 0.2;

            if (activeReach && movement.phase === 'center') {
                movement.side = side;
                movement.phase = 'reach';
                movement.peakMetrics = metrics;
            }
            if (centered && movement.phase === 'reach') {
                movement.phase = 'ready';
            }
            if (activeReach && movement.phase === 'ready' && movement.side && side !== movement.side && now - movement.lastRepTime > 600) {
                addRepCallback('twist_reach', scoreTwistReach(metrics, 1300));
                movement.lastRepTime = now;
                movement.side = side;
                movement.phase = 'reach';
                movement.peakMetrics = metrics;
            }
            if (!activeReach && centered) {
                movement.phase = 'center';
            }
            return {
                repCount: 0,
                phase: movement.phase,
                formFeedback: movement.phase === 'reach' ? 'Reach across to the other side next.' : 'Reach your hands across your body as you twist.',
                isFormGood: true,
                confidence: 1,
                formScore: scoreTwistReach(metrics, 1300).score,
            };
        }

        default:
            return createDefaultExerciseState();
    }
}

// Get all exercises as array
export function getAllExercises(): ExerciseType[] {
    return [
        'squat',
        'jumping_jack',
        'bicep_curl',
        'front_raise',
        'lateral_raise',
        'overhead_press',
        'upright_row',
        'side_leg_raise',
        'side_step',
        'torso_twist',
        'standing_oblique_crunch',
        'cross_body_knee_drive',
        'wood_chop',
        'twist_reach',
        // Posture Assessment
        'forward_head_posture',
        'rounded_shoulders',
        'shoulder_asymmetry',
        // Upper Body Mobility Assessment
        'neck_rom',
        'shoulder_rom',
        'arm_rom',
        // Balance Assessment
        'double_leg_balance',
        'single_leg_balance',
        'tandem_stand',
        // Swimming Assessment
        'swimming_readiness',
    ];
}

// Get exercise config
export function getExerciseConfig(type: ExerciseType): ExerciseConfig {
    return EXERCISE_CONFIGS[type];
}