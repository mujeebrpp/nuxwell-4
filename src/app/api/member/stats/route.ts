import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

// GET /api/member/stats - Get member dashboard stats
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 })
        }

        const now = new Date()
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

        // Get workouts this week
        const workoutsThisWeek = await prisma.workout.count({
            where: {
                userId,
                createdAt: { gte: weekAgo }
            }
        })

        // Get meals logged
        const mealsLogged = await prisma.meal.count({
            where: {
                userId
            }
        })

        // Get total calories burned
        const workouts = await prisma.workout.findMany({
            where: {
                userId
            },
            select: { caloriesBurned: true, durationMinutes: true }
        })
        const caloriesBurned = workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0)

        // Get active minutes
        const activeMinutes = workouts.reduce((sum, w) => sum + w.durationMinutes, 0)

        // Calculate streak (simplified)
        const currentStreak = 0 // Would need more complex logic

        // Goal progress (simplified - based on workouts per week)
        const goalProgress = Math.min((workoutsThisWeek / 5) * 100, 100) // Assuming 5 workouts per week goal

        return NextResponse.json({
            workoutsThisWeek,
            mealsLogged,
            caloriesBurned,
            activeMinutes,
            currentStreak,
            goalProgress
        })
    } catch (error) {
        console.error('Error fetching member stats:', error)
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }
}
