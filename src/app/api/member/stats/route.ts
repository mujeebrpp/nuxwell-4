import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = user.id

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
            where: { userId }
        })

        // Get total calories burned
        const workouts = await prisma.workout.findMany({
            where: { userId },
            select: { caloriesBurned: true, durationMinutes: true }
        })
        const caloriesBurned = workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0)
        const activeMinutes = workouts.reduce((sum, w) => sum + w.durationMinutes, 0)

        // Get pool visits this week
        const poolVisits = await prisma.poolBooking.count({
            where: {
                userId,
                date: { gte: weekAgo }
            }
        })

        // Get tea visits
        const teaVisits = await prisma.teaBooking.count({
            where: {
                userId,
                date: { gte: weekAgo }
            }
        })

        // Get reward points
        const rewardPoints = await prisma.rewardPoint.findMany({
            where: { userId }
        })
        const totalRewardPoints = rewardPoints.reduce((sum, r) => sum + r.points, 0)

        // Fetch upcoming bookings
        const upcomingBookings = await prisma.poolBooking.count({
            where: {
                userId: userId,
                date: { gte: now }
            }
        })

        const upcomingTeaBookings = await prisma.teaBooking.count({
            where: {
                userId: userId,
                date: { gte: now }
            }
        })

        return NextResponse.json({
            workoutsThisWeek,
            mealsLogged,
            caloriesBurned,
            activeMinutes,
            poolVisits,
            teaVisits,
            rewardPoints: totalRewardPoints,
            wellnessScore: 78,
            upcomingBookings: upcomingBookings + upcomingTeaBookings
        })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }
}