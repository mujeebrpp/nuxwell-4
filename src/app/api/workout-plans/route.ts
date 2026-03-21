import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

// GET /api/workout-plans - Get all workout plans or filter by userId
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')
        const id = searchParams.get('id')

        // Get single workout plan by ID
        if (id) {
            const workoutPlan = await prisma.workoutPlan.findUnique({
                where: { id },
                include: {
                    profile: true,
                },
            })

            if (!workoutPlan) {
                return NextResponse.json({ error: 'Workout plan not found' }, { status: 404 })
            }

            return NextResponse.json(workoutPlan)
        }

        // Get workout plans by userId
        if (userId) {
            const workoutPlans = await prisma.workoutPlan.findMany({
                where: { userId },
                include: {
                    profile: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            })

            return NextResponse.json(workoutPlans)
        }

        // Get all workout plans
        const workoutPlans = await prisma.workoutPlan.findMany({
            include: {
                profile: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        return NextResponse.json(workoutPlans)
    } catch (error) {
        console.error('Error fetching workout plans:', error)
        return NextResponse.json({ error: 'Failed to fetch workout plans' }, { status: 500 })
    }
}

// POST /api/workout-plans - Create a new workout plan
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { userId, name, exercises } = body

        if (!userId || !name || !exercises) {
            return NextResponse.json(
                { error: 'userId, name, and exercises are required' },
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

        const workoutPlan = await prisma.workoutPlan.create({
            data: {
                userId,
                name,
                exercises,
            },
        })

        return NextResponse.json(workoutPlan, { status: 201 })
    } catch (error) {
        console.error('Error creating workout plan:', error)
        return NextResponse.json({ error: 'Failed to create workout plan' }, { status: 500 })
    }
}

// PUT /api/workout-plans - Update a workout plan
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, name, exercises } = body

        if (!id) {
            return NextResponse.json({ error: 'id is required' }, { status: 400 })
        }

        const workoutPlan = await prisma.workoutPlan.update({
            where: { id },
            data: {
                name,
                exercises,
            },
        })

        return NextResponse.json(workoutPlan)
    } catch (error) {
        console.error('Error updating workout plan:', error)
        return NextResponse.json({ error: 'Failed to update workout plan' }, { status: 500 })
    }
}

// DELETE /api/workout-plans - Delete a workout plan
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'id is required' }, { status: 400 })
        }

        await prisma.workoutPlan.delete({
            where: { id },
        })

        return NextResponse.json({ message: 'Workout plan deleted successfully' })
    } catch (error) {
        console.error('Error deleting workout plan:', error)
        return NextResponse.json({ error: 'Failed to delete workout plan' }, { status: 500 })
    }
}
