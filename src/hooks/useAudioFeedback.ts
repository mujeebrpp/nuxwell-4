'use client';

import { useCallback, useRef, useEffect } from 'react';

interface UseAudioFeedbackOptions {
    enabled?: boolean;
    volume?: number;
}

interface UseAudioFeedbackReturn {
    speak: (text: string) => void;
    speakCount: (count: number) => void;
    speakFeedback: (feedback: string) => void;
    announceExercise: (exerciseName: string) => void;
    setEnabled: (enabled: boolean) => void;
    isEnabled: boolean;
}

export function useAudioFeedback({
    enabled = true,
    volume = 1.0,
}: UseAudioFeedbackOptions = {}): UseAudioFeedbackReturn {
    const synthesisRef = useRef<SpeechSynthesis | null>(null);
    const enabledRef = useRef(enabled);

    // Initialize speech synthesis
    useEffect(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            synthesisRef.current = window.speechSynthesis;
        }

        return () => {
            if (synthesisRef.current) {
                synthesisRef.current.cancel();
            }
        };
    }, []);

    // Update enabled ref when prop changes
    useEffect(() => {
        enabledRef.current = enabled;
    }, [enabled]);

    // Speak text
    const speak = useCallback((text: string) => {
        if (!synthesisRef.current || !enabledRef.current || !text) return;

        // Cancel any ongoing speech
        synthesisRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.volume = volume;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        // Try to get a natural voice
        const voices = synthesisRef.current.getVoices();
        const englishVoice = voices.find(
            (v) => v.lang.startsWith('en') && v.name.includes('Google')
        ) || voices.find((v) => v.lang.startsWith('en'));

        if (englishVoice) {
            utterance.voice = englishVoice;
        }

        synthesisRef.current.speak(utterance);
    }, [volume]);

    // Speak rep count
    const speakCount = useCallback(
        (count: number) => {
            if (!enabledRef.current) return;

            // Only speak every 5th rep or at milestones
            if (count % 5 === 0 || count === 1 || count === 10 || count === 15 || count === 20 || count === 25 || count === 30) {
                speak(count.toString());
            }
        },
        [speak]
    );

    // Speak form feedback
    const speakFeedback = useCallback(
        (feedback: string) => {
            if (!enabledRef.current || !feedback) return;
            speak(feedback);
        },
        [speak]
    );

    // Announce exercise name
    const announceExercise = useCallback(
        (exerciseName: string) => {
            if (!enabledRef.current || !exerciseName) return;

            // Wait a moment before announcing
            setTimeout(() => {
                speak(`Starting ${exerciseName}`);
            }, 500);
        },
        [speak]
    );

    // Set enabled state
    const setEnabled = useCallback((enabled: boolean) => {
        enabledRef.current = enabled;
    }, []);

    return {
        speak,
        speakCount,
        speakFeedback,
        announceExercise,
        setEnabled,
        isEnabled: enabled,
    };
}
