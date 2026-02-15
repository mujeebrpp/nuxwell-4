import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

// GET /api/workouts - Get all workouts or filter by userId
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')
        const id = searchParams.get('id')

        // Get single workout by ID
        if (id) {
            const workout = await prisma.workout.findUnique({
                where: { id },
                include: {
                    profile: true,
                },
            })

            if (!workout) {
                return NextResponse.json({ error: 'Workout not found' }, { status: 404 })
            }

            return NextResponse.json(workout)
        }

        // Get workouts by userId
        if (userId) {
            const workouts = await prisma.workout.findMany({
                where: { userId },
                include: {
                    profile: true,
                },
                orderBy: {
                    completedAt: 'desc',
                },
            })

            return NextResponse.json(workouts)
        }

        // Get all workouts
        const workouts = await prisma.workout.findMany({
            include: {
                profile: true,
            },
            orderBy: {
                completedAt: 'desc',
            },
        })

        return NextResponse.json(workouts)
    } catch (error) {
        console.error('Error fetching workouts:', error)
        return NextResponse.json({ error: 'Failed to fetch workouts' }, { status: 500 })
    }
}

// POST /api/workouts - Create a new workout
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { userId, name, type, durationMinutes, caloriesBurned, exercises } = body

        if (!userId || !name || !type || !durationMinutes) {
            return NextResponse.json(
                { error: 'userId, name, type, and durationMinutes are required' },
                { status: 400 }
            )
        }

        // Verify profile exists
        const profile = await prisma.profile.findUnique({
            where: { userId },
        })

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        const workout = await prisma.workout.create({
            data: {
                userId,
                name,
                type,
                durationMinutes,
                caloriesBurned,
                exercises,
            },
        })

        return NextResponse.json(workout, { status: 201 })
    } catch (error) {
        console.error('Error creating workout:', error)
        return NextResponse.json({ error: 'Failed to create workout' }, { status: 500 })
    }
}

// PUT /api/workouts - Update a workout
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, name, type, durationMinutes, caloriesBurned, exercises } = body

        if (!id) {
            return NextResponse.json({ error: 'id is required' }, { status: 400 })
        }

        const workout = await prisma.workout.update({
            where: { id },
            data: {
                name,
                type,
                durationMinutes,
                caloriesBurned,
                exercises,
            },
        })

        return NextResponse.json(workout)
    } catch (error) {
        console.error('Error updating workout:', error)
        return NextResponse.json({ error: 'Failed to update workout' }, { status: 500 })
    }
}

// DELETE /api/workouts - Delete a workout
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'id is required' }, { status: 400 })
        }

        await prisma.workout.delete({
            where: { id },
        })

        return NextResponse.json({ message: 'Workout deleted successfully' })
    } catch (error) {
        console.error('Error deleting workout:', error)
        return NextResponse.json({ error: 'Failed to delete workout' }, { status: 500 })
    }
}
