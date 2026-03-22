'use client';

import { useState, useEffect, useMemo } from 'react';
import { Dumbbell, Plus, Calendar, Clock, Flame, Trash2, Edit, Save, X, Sparkles, List, Bot, Target, TrendingUp, BarChart3, Filter, ChevronDown, ChevronUp, Activity, Bookmark, FolderOpen, Play, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExerciseSelector } from '@/components/workout/ExerciseSelector';
import { WorkoutSession, WorkoutStats } from '@/components/workout/WorkoutSession';
import { ExerciseType, EXERCISE_CONFIGS } from '@/lib/workout/exerciseDetector';
import { useAuth } from '@/lib/hooks/use-auth';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from 'recharts';

const workoutTypes = [
    { id: 'cardio', label: 'Cardio', icon: '🏃', color: '#3B82F6' },
    { id: 'strength', label: 'Strength', icon: '🏋️', color: '#EF4444' },
    { id: 'yoga', label: 'Yoga', icon: '🧘', color: '#8B5CF6' },
    { id: 'hiit', label: 'HIIT', icon: '⚡', color: '#F59E0B' },
    { id: 'flexibility', label: 'Flexibility', icon: '🤸', color: '#10B981' },
];

const mockWorkouts = [
    { id: 1, name: 'Morning Cardio', type: 'cardio', duration: 30, calories: 250, exercises: ['Running', 'Jumping Jacks', 'Burpees'], date: '2026-02-15', reps: 45, startTime: '07:00', endTime: '07:30' },
    { id: 2, name: 'Upper Body Strength', type: 'strength', duration: 45, calories: 320, exercises: ['Bench Press', 'Pull-ups', 'Rows'], date: '2026-02-14', reps: 60, startTime: '18:00', endTime: '18:45' },
    { id: 3, name: 'Yoga Flow', type: 'yoga', duration: 60, calories: 180, exercises: ['Sun Salutation', 'Warrior Pose', 'Tree Pose'], date: '2026-02-13', reps: 0, startTime: '06:30', endTime: '07:30' },
    { id: 4, name: 'HIIT Session', type: 'hiit', duration: 20, calories: 280, exercises: ['Sprints', 'Mountain Climbers', 'Jump Squats'], date: '2026-02-12', reps: 80, startTime: '19:00', endTime: '19:20' },
    { id: 5, name: 'Lower Body', type: 'strength', duration: 40, calories: 290, exercises: ['Squats', 'Lunges', 'Deadlifts'], date: '2026-02-11', reps: 55, startTime: '17:30', endTime: '18:10' },
    { id: 6, name: 'Morning Run', type: 'cardio', duration: 35, calories: 310, exercises: ['Running', 'Jogging'], date: '2026-02-10', reps: 0, startTime: '07:00', endTime: '07:35' },
    { id: 7, name: 'Power Yoga', type: 'yoga', duration: 45, calories: 150, exercises: ['Downward Dog', 'Warrior', 'Tree Pose'], date: '2026-02-09', reps: 0, startTime: '08:00', endTime: '08:45' },
    { id: 8, name: 'Full Body HIIT', type: 'hiit', duration: 25, calories: 320, exercises: ['Burpees', 'Jump Squats', 'Push-ups'], date: '2026-02-08', reps: 100, startTime: '19:00', endTime: '19:25' },
    { id: 9, name: 'Chest & Triceps', type: 'strength', duration: 50, calories: 340, exercises: ['Bench Press', 'Flyes', 'Tricep Dips'], date: '2026-02-07', reps: 75, startTime: '18:00', endTime: '18:50' },
    { id: 10, name: 'Evening Walk', type: 'cardio', duration: 20, calories: 120, exercises: ['Walking'], date: '2026-02-06', reps: 0, startTime: '20:00', endTime: '20:20' },
    { id: 11, name: 'Core Workout', type: 'strength', duration: 30, calories: 200, exercises: ['Planks', 'Crunches', 'Leg Raises'], date: '2026-02-05', reps: 90, startTime: '07:30', endTime: '08:00' },
    { id: 12, name: 'Stretching', type: 'flexibility', duration: 15, calories: 60, exercises: ['Hip Flexor', 'Hamstring', 'Shoulder Stretch'], date: '2026-02-04', reps: 0, startTime: '09:00', endTime: '09:15' },
    { id: 13, name: 'Tabata', type: 'hiit', duration: 20, calories: 290, exercises: ['Sprints', 'Jump Lunges', 'Burpees'], date: '2026-02-03', reps: 120, startTime: '19:00', endTime: '19:20' },
    { id: 14, name: 'Back & Biceps', type: 'strength', duration: 45, calories: 310, exercises: ['Pull-ups', 'Rows', 'Curls'], date: '2026-02-02', reps: 65, startTime: '18:00', endTime: '18:45' },
    { id: 15, name: 'Swimming', type: 'cardio', duration: 40, calories: 380, exercises: ['Freestyle', 'Backstroke', 'Breaststroke'], date: '2026-02-01', reps: 0, startTime: '07:00', endTime: '07:40' },
];

type ViewMode = 'ai-tracker' | 'log';

// Detailed workout type
interface WorkoutDetail {
    id: number;
    name: string;
    type: string;
    duration: number;
    calories: number;
    exercises: string[];
    date: string;
    reps: number;
    startTime: string;
    endTime: string;
}

// Workout Plan type - saved workout configurations
interface WorkoutPlan {
    id: string;
    name: string;
    exercises: {
        type: string;
        targetReps?: number;
        targetTime?: number;
        difficulty: 'beginner' | 'intermediate' | 'advanced';
    }[];
    createdAt: string;
    updatedAt: string;
}

export default function WorkoutsPage() {
    const [showAddForm, setShowAddForm] = useState(false);
    const [workouts, setWorkouts] = useState<WorkoutDetail[]>(mockWorkouts);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [editingWorkoutId, setEditingWorkoutId] = useState<number | null>(null);
    const [editedExercises, setEditedExercises] = useState<string>('');
    const [viewMode, setViewMode] = useState<ViewMode>('log'); // Default to log view for history

    // Detailed view state
    const [selectedWorkout, setSelectedWorkout] = useState<WorkoutDetail | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Date range filter state
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
    const [showDateFilter, setShowDateFilter] = useState(false);

    // Chart view state
    const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');
    const [showCharts, setShowCharts] = useState(true);

    // AI Tracker state
    const [selectedExercise, setSelectedExercise] = useState<ExerciseType | null>(null);
    const [isWorkoutActive, setIsWorkoutActive] = useState(false);
    const [workoutHistory, setWorkoutHistory] = useState<WorkoutStats[]>([]);
    const [exerciseConfig, setExerciseConfig] = useState<{
        difficulty: 'beginner' | 'intermediate' | 'advanced';
        targetType: 'reps' | 'time';
        targetValue: number;
    } | undefined>(undefined);
    const [showConfig, setShowConfig] = useState(false);
    const [targetReps, setTargetReps] = useState(10);

    // API state
    const { user, profile } = useAuth();
    const [isSavingWorkout, setIsSavingWorkout] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    // Workout Plans state
    const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);
    const [newPlanName, setNewPlanName] = useState('');
    const [fitnessGoal, setFitnessGoal] = useState<string | null>(null);
    const [isLoadingPlans, setIsLoadingPlans] = useState(false);

    // Fetch workout plans and profile on mount
    useEffect(() => {
        if (profile) {
            fetchWorkoutPlans();
            fetchProfileFitnessGoal();
        }
    }, [profile]);

    // Fetch user's workout plans
    const fetchWorkoutPlans = async () => {
        if (!profile) return;
        setIsLoadingPlans(true);
        try {
            const response = await fetch(`/api/workout-plans?userId=${profile.id}`);
            if (response.ok) {
                const plans = await response.json();
                setWorkoutPlans(plans);
            }
        } catch (error) {
            console.error('Error fetching workout plans:', error);
        } finally {
            setIsLoadingPlans(false);
        }
    };

    // Fetch profile to get fitness goal
    const fetchProfileFitnessGoal = async () => {
        if (!profile) return;
        try {
            const response = await fetch(`/api/profile?userId=${profile.id}`);
            if (response.ok) {
                const data = await response.json();
                if (data.profile?.fitnessGoal) {
                    setFitnessGoal(data.profile.fitnessGoal);
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    // Save current workout configuration as a plan
    const handleSaveAsPlan = async () => {
        if (!profile || !newPlanName || !selectedExercise || !exerciseConfig) return;

        try {
            const exercises = [{
                type: selectedExercise,
                targetReps: exerciseConfig.targetType === 'reps' ? exerciseConfig.targetValue : undefined,
                targetTime: exerciseConfig.targetType === 'time' ? exerciseConfig.targetValue : undefined,
                difficulty: exerciseConfig.difficulty
            }];

            const response = await fetch('/api/workout-plans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: profile.id,
                    name: newPlanName,
                    exercises
                })
            });

            if (response.ok) {
                const newPlan = await response.json();
                setWorkoutPlans([newPlan, ...workoutPlans]);
                setNewPlanName('');
                setShowPlanModal(false);
            }
        } catch (error) {
            console.error('Error saving workout plan:', error);
        }
    };

    // Load a saved workout plan
    const handleLoadPlan = (plan: WorkoutPlan) => {
        if (plan.exercises && plan.exercises.length > 0) {
            const firstExercise = plan.exercises[0];
            setSelectedExercise(firstExercise.type as ExerciseType);
            setExerciseConfig({
                difficulty: firstExercise.difficulty,
                targetType: firstExercise.targetReps ? 'reps' : 'time',
                targetValue: firstExercise.targetReps || firstExercise.targetTime || 10
            });
            setTargetReps(firstExercise.targetReps || firstExercise.targetTime || 10);
        }
    };

    // Delete a workout plan
    const handleDeletePlan = async (planId: string) => {
        try {
            const response = await fetch(`/api/workout-plans?id=${planId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setWorkoutPlans(workoutPlans.filter(p => p.id !== planId));
            }
        } catch (error) {
            console.error('Error deleting workout plan:', error);
        }
    };

    // Update a workout plan
    const handleUpdatePlan = async () => {
        if (!editingPlan || !profile || !newPlanName) return;

        try {
            const response = await fetch('/api/workout-plans', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingPlan.id,
                    name: newPlanName,
                    exercises: editingPlan.exercises
                })
            });

            if (response.ok) {
                const updatedPlan = await response.json();
                setWorkoutPlans(workoutPlans.map(p => p.id === updatedPlan.id ? updatedPlan : p));
                setEditingPlan(null);
                setNewPlanName('');
            }
        } catch (error) {
            console.error('Error updating workout plan:', error);
        }
    };

    // Get workout recommendations based on fitness goal
    const getRecommendedExercises = useMemo(() => {
        if (!fitnessGoal) return [];

        const recommendations: { type: ExerciseType; reason: string }[] = [];

        if (fitnessGoal === 'weight_loss') {
            recommendations.push(
                { type: 'jumpingJack', reason: 'Great cardio for burning calories' },
                { type: 'squat', reason: 'High-intensity for fat burning' },
                { type: 'lunge', reason: 'Full body HIIT movement' }
            );
        } else if (fitnessGoal === 'muscle_gain') {
            recommendations.push(
                { type: 'squat', reason: 'Build lower body strength' },
                { type: 'pushup', reason: 'Upper body muscle building' },
                { type: 'lunge', reason: 'Leg strength and muscle' }
            );
        } else if (fitnessGoal === 'endurance') {
            recommendations.push(
                { type: 'jumpingJack', reason: 'Sustained cardio for endurance' },
                { type: 'squat', reason: 'Long duration strength' },
                { type: 'pushup', reason: 'Build stamina' }
            );
        }

        return recommendations;
    }, [fitnessGoal]);

    // Filtered workouts based on type and date range
    const filteredWorkouts = useMemo(() => {
        let result = selectedType
            ? workouts.filter(w => w.type === selectedType)
            : workouts;

        if (dateRange.start) {
            result = result.filter(w => w.date >= dateRange.start);
        }
        if (dateRange.end) {
            result = result.filter(w => w.date <= dateRange.end);
        }

        // Sort by date descending
        return result.sort((a, b) => b.date.localeCompare(a.date));
    }, [workouts, selectedType, dateRange]);

    const totalDuration = filteredWorkouts.reduce((acc, w) => acc + w.duration, 0);
    const totalCalories = filteredWorkouts.reduce((acc, w) => acc + (w.calories || 0), 0);
    const totalReps = filteredWorkouts.reduce((acc, w) => acc + (w.reps || 0), 0);

    // Prepare chart data
    const chartData = useMemo(() => {
        return filteredWorkouts.slice(0, 14).reverse().map(w => ({
            date: w.date,
            duration: w.duration,
            calories: w.calories,
            reps: w.reps,
            name: w.name,
            type: w.type,
        }));
    }, [filteredWorkouts]);

    // Weekly summary data
    const weeklyData = useMemo(() => {
        const weeks: { [key: string]: { duration: number; calories: number; reps: number; count: number } } = {};

        filteredWorkouts.forEach(w => {
            const weekStart = getWeekStart(w.date);
            if (!weeks[weekStart]) {
                weeks[weekStart] = { duration: 0, calories: 0, reps: 0, count: 0 };
            }
            weeks[weekStart].duration += w.duration;
            weeks[weekStart].calories += w.calories;
            weeks[weekStart].reps += w.reps;
            weeks[weekStart].count += 1;
        });

        return Object.entries(weeks)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-8)
            .map(([week, data]) => ({
                week: formatWeek(week),
                ...data,
            }));
    }, [filteredWorkouts]);

    // Exercise type distribution
    const exerciseDistribution = useMemo(() => {
        const dist: { [key: string]: number } = {};
        filteredWorkouts.forEach(w => {
            dist[w.type] = (dist[w.type] || 0) + 1;
        });

        return workoutTypes.map(type => ({
            name: type.label,
            value: dist[type.id] || 0,
            color: type.color,
        })).filter(d => d.value > 0);
    }, [filteredWorkouts]);

    // Helper functions
    function getWeekStart(dateStr: string): string {
        const date = new Date(dateStr);
        const day = date.getDay();
        const diff = date.getDate() - day;
        const weekStart = new Date(date.setDate(diff));
        return weekStart.toISOString().split('T')[0];
    }

    function formatWeek(weekStr: string): string {
        const date = new Date(weekStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    const handleEditExercises = (workoutId: number, exercises: string[]) => {
        setEditingWorkoutId(workoutId);
        setEditedExercises(exercises.join(', '));
    };

    const handleSaveExercises = (workoutId: number) => {
        const exerciseList = editedExercises
            .split(',')
            .map(e => e.trim())
            .filter(e => e.length > 0);

        setWorkouts(workouts.map(w =>
            w.id === workoutId ? { ...w, exercises: exerciseList } : w
        ));
        setEditingWorkoutId(null);
        setEditedExercises('');
    };

    const handleCancelEdit = () => {
        setEditingWorkoutId(null);
        setEditedExercises('');
    };

    // Handle clicking on a workout to show details
    const handleWorkoutClick = (workout: WorkoutDetail) => {
        setSelectedWorkout(workout);
        setShowDetailModal(true);
    };

    // Clear date filters
    const clearDateFilters = () => {
        setDateRange({ start: '', end: '' });
    };

    // Handle exercise selection for AI tracker
    const handleSelectExercise = (exercise: ExerciseType) => {
        setSelectedExercise(exercise);
        setShowConfig(true);
    };

    // Handle exercise configuration
    const handleConfigureExercise = (exercise: ExerciseType, config: {
        difficulty: 'beginner' | 'intermediate' | 'advanced';
        targetType: 'reps' | 'time';
        targetValue: number;
    }) => {
        setExerciseConfig(config);
        setTargetReps(config.targetValue || 10);
    };

    // Start workout with configured target
    const handleStartWorkout = () => {
        setShowConfig(false);
        setIsWorkoutActive(true);
    };

    // Handle workout completion
    const handleWorkoutComplete = async (stats: WorkoutStats) => {
        setIsSavingWorkout(true);
        setSaveError(null);

        try {
            setWorkoutHistory([...workoutHistory, stats]);
            setIsWorkoutActive(false);
            setSelectedExercise(null);

            if (user && profile) {
                const workoutData = {
                    userId: profile.id,
                    name: `${stats.exerciseType} Session`,
                    type: stats.exerciseType.toLowerCase() as 'cardio' | 'strength' | 'flexibility' | 'hiit' | 'yoga',
                    durationMinutes: Math.ceil(stats.duration / 60),
                    caloriesBurned: stats.calories,
                    exercises: [stats.exerciseType],
                };

                const response = await fetch('/api/workouts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(workoutData),
                });

                if (!response.ok) throw new Error('Failed to save workout');

                const savedWorkout = await response.json();

                const newWorkout: WorkoutDetail = {
                    id: savedWorkout.id,
                    name: savedWorkout.name,
                    type: savedWorkout.type,
                    duration: savedWorkout.durationMinutes,
                    calories: savedWorkout.caloriesBurned || 0,
                    exercises: Array.isArray(savedWorkout.exercises) ? savedWorkout.exercises : [stats.exerciseType],
                    date: new Date(savedWorkout.completedAt).toISOString().split('T')[0],
                    reps: stats.repCount,
                    startTime: new Date(savedWorkout.completedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    endTime: new Date(Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                };

                setWorkouts([newWorkout, ...workouts]);
            }
        } catch (error) {
            console.error('Error saving workout:', error);
            setSaveError('Failed to save workout. Please try again.');
            setWorkoutHistory([...workoutHistory, stats]);
            setIsWorkoutActive(false);
            setSelectedExercise(null);
        } finally {
            setIsSavingWorkout(false);
        }
    };

    const handleExitWorkout = () => {
        setIsWorkoutActive(false);
        setSelectedExercise(null);
        setShowConfig(false);
    };

    // Render detailed workout modal
    const renderDetailModal = () => {
        if (!selectedWorkout) return null;

        const typeInfo = workoutTypes.find(t => t.id === selectedWorkout.type);

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div
                                    className="p-3 rounded-xl"
                                    style={{ backgroundColor: typeInfo?.color + '20' }}
                                >
                                    <Dumbbell
                                        className="w-6 h-6"
                                        style={{ color: typeInfo?.color }}
                                    />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">{selectedWorkout.name}</h2>
                                    <p className="text-sm text-slate-500">{typeInfo?.icon} {typeInfo?.label}</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowDetailModal(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Date and Time */}
                        <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                            <div className="flex items-center gap-2 text-slate-700 mb-2">
                                <Calendar className="w-4 h-4" />
                                <span className="font-medium">
                                    {new Date(selectedWorkout.date).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-600">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {selectedWorkout.startTime} - {selectedWorkout.endTime}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Activity className="w-4 h-4" />
                                    {selectedWorkout.duration} min
                                </span>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-blue-50 rounded-xl p-4 text-center">
                                <Clock className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-blue-600">{selectedWorkout.duration}</p>
                                <p className="text-xs text-blue-600/70">minutes</p>
                            </div>
                            <div className="bg-orange-50 rounded-xl p-4 text-center">
                                <Flame className="w-5 h-5 text-orange-600 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-orange-600">{selectedWorkout.calories}</p>
                                <p className="text-xs text-orange-600/70">calories</p>
                            </div>
                            <div className="bg-emerald-50 rounded-xl p-4 text-center">
                                <Target className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-emerald-600">{selectedWorkout.reps}</p>
                                <p className="text-xs text-emerald-600/70">reps</p>
                            </div>
                        </div>

                        {/* Exercises List */}
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-slate-700 mb-3">Exercises Performed</h3>
                            <div className="space-y-2">
                                {selectedWorkout.exercises.map((exercise, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                                    >
                                        <span className="text-slate-700">{exercise}</span>
                                        <span className="text-xs text-slate-500">
                                            {selectedWorkout.reps > 0 ? `${Math.floor(selectedWorkout.reps / selectedWorkout.exercises.length)} reps` : '-'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Performance Metrics */}
                        {selectedWorkout.reps > 0 && (
                            <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
                                <h3 className="text-sm font-semibold text-slate-700 mb-3">Performance Summary</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Avg reps per exercise:</span>
                                        <span className="font-medium text-slate-900">
                                            {Math.floor(selectedWorkout.reps / selectedWorkout.exercises.length)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Calories/minute:</span>
                                        <span className="font-medium text-slate-900">
                                            {(selectedWorkout.calories / selectedWorkout.duration).toFixed(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Render charts section
    const renderCharts = () => {
        if (chartData.length === 0) return null;

        return (
            <div className="space-y-6">
                {/* Chart Type Toggle */}
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Workout Analytics
                    </h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setChartType('line')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${chartType === 'line' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'}`}
                        >
                            Line
                        </button>
                        <button
                            onClick={() => setChartType('bar')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${chartType === 'bar' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'}`}
                        >
                            Bar
                        </button>
                        <button
                            onClick={() => setChartType('area')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${chartType === 'area' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'}`}
                        >
                            Area
                        </button>
                    </div>
                </div>

                {/* Performance Over Time Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                            Performance Over Time
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                {chartType === 'line' ? (
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 12 }}
                                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'white',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="duration"
                                            name="Duration (min)"
                                            stroke="#3B82F6"
                                            strokeWidth={2}
                                            dot={{ fill: '#3B82F6', r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="calories"
                                            name="Calories"
                                            stroke="#F59E0B"
                                            strokeWidth={2}
                                            dot={{ fill: '#F59E0B', r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="reps"
                                            name="Reps"
                                            stroke="#10B981"
                                            strokeWidth={2}
                                            dot={{ fill: '#10B981', r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                ) : chartType === 'bar' ? (
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 12 }}
                                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'white',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey="duration" name="Duration (min)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="calories" name="Calories" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="reps" name="Reps" fill="#10B981" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                ) : (
                                    <AreaChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 12 }}
                                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'white',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Legend />
                                        <Area
                                            type="monotone"
                                            dataKey="duration"
                                            name="Duration (min)"
                                            stroke="#3B82F6"
                                            fill="#3B82F620"
                                            strokeWidth={2}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="calories"
                                            name="Calories"
                                            stroke="#F59E0B"
                                            fill="#F59E0B20"
                                            strokeWidth={2}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="reps"
                                            name="Reps"
                                            stroke="#10B981"
                                            fill="#10B98120"
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Weekly Summary Chart */}
                {weeklyData.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                Weekly Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={weeklyData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'white',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey="duration" name="Duration (min)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="calories" name="Calories" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Exercise Distribution Pie Chart */}
                {exerciseDistribution.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Dumbbell className="w-5 h-5 text-purple-600" />
                                Exercise Type Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={exerciseDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={2}
                                            dataKey="value"
                                            label={({ name, value }) => `${name}: ${value}`}
                                        >
                                            {exerciseDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Exercise Progress Charts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-emerald-600" />
                            Exercise-Specific Progress
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {workoutTypes.map(type => {
                                const typeWorkouts = filteredWorkouts.filter(w => w.type === type.id);
                                if (typeWorkouts.length === 0) return null;

                                return (
                                    <div key={type.id} className="p-4 bg-slate-50 rounded-xl">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="font-medium text-slate-700">
                                                {type.icon} {type.label}
                                            </span>
                                            <span className="text-sm text-slate-500">
                                                {typeWorkouts.length} sessions • {typeWorkouts.reduce((a, w) => a + w.duration, 0)} min total
                                            </span>
                                        </div>
                                        <div className="h-24">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={typeWorkouts.slice(0, 7).reverse().map(w => ({ date: w.date, value: type.id === 'cardio' || type.id === 'hiit' ? w.calories : w.reps }))}>
                                                    <Area
                                                        type="monotone"
                                                        dataKey="value"
                                                        stroke={type.color}
                                                        fill={type.color + '30'}
                                                        strokeWidth={2}
                                                    />
                                                    <XAxis
                                                        dataKey="date"
                                                        tick={{ fontSize: 10 }}
                                                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    />
                                                    <YAxis tick={{ fontSize: 10 }} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Workouts</h1>
                    <p className="text-slate-600 mt-1">Track and manage your workout sessions</p>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('ai-tracker')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${viewMode === 'ai-tracker'
                            ? 'bg-emerald-500 text-white'
                            : 'text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        <Bot className="w-4 h-4" />
                        AI Tracker
                    </button>
                    <button
                        onClick={() => setViewMode('log')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${viewMode === 'log'
                            ? 'bg-emerald-500 text-white'
                            : 'text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        <List className="w-4 h-4" />
                        History
                    </button>
                </div>
            </div>

            {/* AI Tracker View */}
            {viewMode === 'ai-tracker' && (
                <div className={isWorkoutActive ? "space-y-4" : "space-y-6"}>
                    {!isWorkoutActive ? (
                        <>
                            {workoutHistory.length > 0 && (
                                <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Sparkles className="w-8 h-8" />
                                                <div>
                                                    <h3 className="font-bold text-lg">Recent Session</h3>
                                                    <p className="text-emerald-100">
                                                        {workoutHistory[workoutHistory.length - 1].repCount} reps • {' '}
                                                        {Math.floor(workoutHistory[workoutHistory.length - 1].duration / 60)} min • {' '}
                                                        {workoutHistory[workoutHistory.length - 1].calories} cal
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {showConfig && selectedExercise && (
                                <Card className="border-emerald-200 bg-emerald-50">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Target className="w-6 h-6 text-emerald-600" />
                                            <h3 className="text-lg font-bold text-slate-900">Configure Your Workout</h3>
                                        </div>

                                        <div className="flex items-center gap-4 mb-4">
                                            <span className="text-4xl">{EXERCISE_CONFIGS[selectedExercise]?.icon}</span>
                                            <div>
                                                <h4 className="font-semibold text-slate-900">{EXERCISE_CONFIGS[selectedExercise]?.name}</h4>
                                                <p className="text-sm text-slate-600">{EXERCISE_CONFIGS[selectedExercise]?.description}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    Target Reps (for beginners, we recommend 10)
                                                </label>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => setTargetReps(Math.max(0, targetReps - 5))}
                                                        className="w-10 h-10 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-lg"
                                                    >
                                                        -
                                                    </button>
                                                    <input
                                                        type="number"
                                                        value={targetReps}
                                                        onChange={(e) => setTargetReps(Math.max(0, parseInt(e.target.value) || 0))}
                                                        className="w-20 text-center px-3 py-2 border border-slate-200 rounded-lg text-lg font-semibold"
                                                        min="0"
                                                        max="100"
                                                    />
                                                    <button
                                                        onClick={() => setTargetReps(Math.min(100, targetReps + 5))}
                                                        className="w-10 h-10 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-lg"
                                                    >
                                                        +
                                                    </button>
                                                    <span className="text-sm text-slate-500">reps</span>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-2">
                                                    Set to 0 for unlimited reps (manual stop)
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => setTargetReps(0)}
                                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${targetReps === 0 ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                                >
                                                    Unlimited
                                                </button>
                                                <button
                                                    onClick={() => setTargetReps(5)}
                                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${targetReps === 5 ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                                >
                                                    5 reps
                                                </button>
                                                <button
                                                    onClick={() => setTargetReps(10)}
                                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${targetReps === 10 ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                                >
                                                    10 reps (Beginner)
                                                </button>
                                                <button
                                                    onClick={() => setTargetReps(15)}
                                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${targetReps === 15 ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                                >
                                                    15 reps
                                                </button>
                                                <button
                                                    onClick={() => setTargetReps(20)}
                                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${targetReps === 20 ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                                >
                                                    20 reps (Intermediate)
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 mt-6">
                                            <Button
                                                onClick={handleStartWorkout}
                                                className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                                            >
                                                Start Workout
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    setShowConfig(false);
                                                    setSelectedExercise(null);
                                                }}
                                                variant="outline"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    setShowPlanModal(true);
                                                }}
                                                variant="outline"
                                                className="border-purple-200 text-purple-600 hover:bg-purple-50"
                                            >
                                                <Bookmark className="w-4 h-4 mr-2" />
                                                Save as Plan
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            <ExerciseSelector
                                onSelectExercise={handleSelectExercise}
                                onConfigureExercise={handleConfigureExercise}
                                mode="single"
                            />

                            {/* Saved Workout Plans Section */}
                            {workoutPlans.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Bookmark className="w-5 h-5 text-purple-600" />
                                            Saved Workout Plans
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {workoutPlans.map((plan) => (
                                                <div
                                                    key={plan.id}
                                                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                                                >
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-slate-900">{plan.name}</h4>
                                                        <p className="text-sm text-slate-500">
                                                            {plan.exercises?.length || 0} exercise(s) • {plan.exercises?.[0]?.difficulty}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleLoadPlan(plan)}
                                                            className="bg-emerald-500 hover:bg-emerald-600"
                                                        >
                                                            <Play className="w-4 h-4 mr-1" />
                                                            Load
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => {
                                                                setEditingPlan(plan);
                                                                setNewPlanName(plan.name);
                                                            }}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-red-500 hover:text-red-600"
                                                            onClick={() => handleDeletePlan(plan.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Fitness Goal Recommendations */}
                            {fitnessGoal && getRecommendedExercises.length > 0 && (
                                <Card className="border-purple-200 bg-purple-50">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Target className="w-5 h-5 text-purple-600" />
                                            Recommended for Your Goal: {fitnessGoal.replace('_', ' ')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid gap-3">
                                            {getRecommendedExercises.map((rec, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-100"
                                                >
                                                    <div>
                                                        <p className="font-medium text-slate-900">{rec.type.replace('_', ' ')}</p>
                                                        <p className="text-sm text-slate-500">{rec.reason}</p>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedExercise(rec.type);
                                                            setShowConfig(true);
                                                        }}
                                                        className="bg-purple-500 hover:bg-purple-600"
                                                    >
                                                        Select
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    ) : (
                        <WorkoutSession
                            exerciseType={selectedExercise!}
                            onComplete={handleWorkoutComplete}
                            onExit={handleExitWorkout}
                            exerciseConfig={exerciseConfig}
                        />
                    )}
                </div>
            )}

            {/* Workout History View */}
            {viewMode === 'log' && (
                <>
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Total Workouts</p>
                                        <p className="text-2xl font-bold text-slate-900">{filteredWorkouts.length}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-emerald-100">
                                        <Dumbbell className="w-6 h-6 text-emerald-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Total Duration</p>
                                        <p className="text-2xl font-bold text-slate-900">{totalDuration} min</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-blue-100">
                                        <Clock className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Total Calories</p>
                                        <p className="text-2xl font-bold text-slate-900">{totalCalories.toLocaleString()}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-orange-100">
                                        <Flame className="w-6 h-6 text-orange-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Total Reps</p>
                                        <p className="text-2xl font-bold text-slate-900">{totalReps.toLocaleString()}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-purple-100">
                                        <Target className="w-6 h-6 text-purple-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Toggle Charts */}
                    <Button
                        onClick={() => setShowCharts(!showCharts)}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        {showCharts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        {showCharts ? 'Hide' : 'Show'} Analytics & Charts
                    </Button>

                    {/* Charts Section */}
                    {showCharts && renderCharts()}

                    {/* Filter Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="w-5 h-5" />
                                Filter Workouts
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Date Range Filter */}
                            <div className="flex flex-col md:flex-row gap-4 items-end">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={dateRange.start}
                                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={dateRange.end}
                                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <Button
                                    onClick={clearDateFilters}
                                    variant="outline"
                                >
                                    Clear
                                </Button>
                            </div>

                            {/* Workout Type Filter */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Workout Type
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setSelectedType(null)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all ${!selectedType
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        All
                                    </button>
                                    {workoutTypes.map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => setSelectedType(type.id)}
                                            className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedType === type.id
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            {type.icon} {type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Add Button */}
                    <Button onClick={() => setShowAddForm(!showAddForm)}>
                        <Plus className="w-5 h-5 mr-2" />
                        Log Workout
                    </Button>

                    {/* Workout List with clickable items */}
                    <div className="grid gap-4">
                        {filteredWorkouts.map((workout) => {
                            const typeInfo = workoutTypes.find(t => t.id === workout.type);
                            return (
                                <Card
                                    key={workout.id}
                                    className="hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => handleWorkoutClick(workout)}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className="p-3 rounded-xl"
                                                    style={{ backgroundColor: typeInfo?.color + '20' }}
                                                >
                                                    <Dumbbell
                                                        className="w-6 h-6"
                                                        style={{ color: typeInfo?.color }}
                                                    />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-slate-900">{workout.name}</h3>
                                                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            {workout.date}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4" />
                                                            {workout.duration} min
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Flame className="w-4 h-4" />
                                                            {workout.calories} kcal
                                                        </span>
                                                        {workout.reps > 0 && (
                                                            <span className="flex items-center gap-1 text-emerald-600">
                                                                <Target className="w-4 h-4" />
                                                                {workout.reps} reps
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                {editingWorkoutId === workout.id ? (
                                                    <>
                                                        <Button variant="ghost" size="sm" onClick={() => handleSaveExercises(workout.id)} className="text-emerald-500 hover:text-emerald-600">
                                                            <Save className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="text-slate-500 hover:text-slate-600">
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button variant="ghost" size="sm" onClick={() => handleEditExercises(workout.id, workout.exercises)}>
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        {workout.exercises && workout.exercises.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-slate-100">
                                                <p className="text-sm font-medium text-slate-700 mb-2">Exercises:</p>
                                                {editingWorkoutId === workout.id ? (
                                                    <div className="space-y-2">
                                                        <input
                                                            type="text"
                                                            value={editedExercises}
                                                            onChange={(e) => setEditedExercises(e.target.value)}
                                                            placeholder="Enter exercises separated by commas"
                                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                        />
                                                        <p className="text-xs text-slate-500">Separate exercises with commas</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-wrap gap-2">
                                                        {workout.exercises.map((exercise, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm"
                                                            >
                                                                {exercise}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {filteredWorkouts.length === 0 && (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <Dumbbell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-slate-900 mb-2">No workouts found</h3>
                                <p className="text-slate-500 mb-4">Start logging your workouts to see them here</p>
                                <Button onClick={() => setShowAddForm(true)}>
                                    <Plus className="w-5 h-5 mr-2" />
                                    Log Your First Workout
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            {/* Detailed Workout Modal */}
            {showDetailModal && renderDetailModal()}

            {/* Save as Plan Modal */}
            {showPlanModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Bookmark className="w-5 h-5 text-purple-600" />
                                Save Workout Plan
                            </h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setShowPlanModal(false);
                                    setNewPlanName('');
                                }}
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Plan Name
                                </label>
                                <input
                                    type="text"
                                    value={newPlanName}
                                    onChange={(e) => setNewPlanName(e.target.value)}
                                    placeholder="Enter a name for this workout plan"
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            {selectedExercise && exerciseConfig && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-sm font-medium text-slate-700 mb-2">Current Configuration:</p>
                                    <div className="space-y-1 text-sm text-slate-600">
                                        <p>• Exercise: {selectedExercise}</p>
                                        <p>• Difficulty: {exerciseConfig.difficulty}</p>
                                        <p>• Target: {exerciseConfig.targetType === 'reps' ? `${exerciseConfig.targetValue} reps` : `${exerciseConfig.targetValue} seconds`}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 mt-6">
                                <Button
                                    onClick={handleSaveAsPlan}
                                    disabled={!newPlanName.trim()}
                                    className="flex-1 bg-purple-500 hover:bg-purple-600"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Plan
                                </Button>
                                <Button
                                    onClick={() => {
                                        setShowPlanModal(false);
                                        setNewPlanName('');
                                    }}
                                    variant="outline"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
