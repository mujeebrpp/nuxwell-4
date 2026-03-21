import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

// GET /api/admin/stats - Get admin dashboard stats
export async function GET(request: NextRequest) {
    try {
        const now = new Date()
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

        // Get total users count
        const totalUsers = await prisma.profile.count()

        // Get active users (users with workouts or meals in last 7 days)
        const activeUserIds = new Set<string>()
        const recentWorkouts = await prisma.workout.findMany({
            where: {
                createdAt: { gte: weekAgo }
            },
            select: { userId: true }
        })
        recentWorkouts.forEach(w => activeUserIds.add(w.userId))

        const activeUsers = activeUserIds.size

        // Get total workouts
        const totalWorkouts = await prisma.workout.count()

        // Get workouts this week
        const workoutsThisWeek = await prisma.workout.count({
            where: {
                createdAt: { gte: weekAgo }
            }
        })

        // Get total meals
        const totalMeals = await prisma.meal.count()

        // Get meals this week
        const mealsThisWeek = await prisma.meal.count({
            where: {
                createdAt: { gte: weekAgo }
            }
        })

        return NextResponse.json({
            totalUsers,
            activeUsers,
            totalWorkouts,
            workoutsThisWeek,
            totalMeals,
            mealsThisWeek
        })
    } catch (error) {
        console.error('Error fetching admin stats:', error)
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }
}
