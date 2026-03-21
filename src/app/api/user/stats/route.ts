import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

// GET /api/user/stats - Get user dashboard stats
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

        // Calculate days active (simplified)
        const daysActive = 0 // Would need more complex logic based on activity

        return NextResponse.json({
            workoutsThisWeek,
            mealsLogged,
            daysActive
        })
    } catch (error) {
        console.error('Error fetching user stats:', error)
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }
}
