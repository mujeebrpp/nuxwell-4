import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

// GET /api/meals - Get all meals or filter by userId
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')
        const id = searchParams.get('id')
        const type = searchParams.get('type')

        // Get single meal by ID
        if (id) {
            const meal = await prisma.meal.findUnique({
                where: { id },
                include: {
                    profile: true,
                },
            })

            if (!meal) {
                return NextResponse.json({ error: 'Meal not found' }, { status: 404 })
            }

            return NextResponse.json(meal)
        }

        // Build where clause
        const where: { userId?: string; type?: string } = {}
        if (userId) where.userId = userId
        if (type) where.type = type

        // Get meals by userId (with optional type filter)
        if (userId || type) {
            const meals = await prisma.meal.findMany({
                where,
                include: {
                    profile: true,
                },
                orderBy: {
                    loggedAt: 'desc',
                },
            })

            return NextResponse.json(meals)
        }

        // Get all meals
        const meals = await prisma.meal.findMany({
            include: {
                profile: true,
            },
            orderBy: {
                loggedAt: 'desc',
            },
        })

        return NextResponse.json(meals)
    } catch (error) {
        console.error('Error fetching meals:', error)
        return NextResponse.json({ error: 'Failed to fetch meals' }, { status: 500 })
    }
}

// POST /api/meals - Create a new meal
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { userId, name, type, calories, protein, carbs, fats, ingredients } = body

        if (!userId || !name || !type || !calories) {
            return NextResponse.json(
                { error: 'userId, name, type, and calories are required' },
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

        const meal = await prisma.meal.create({
            data: {
                userId,
                name,
                type,
                calories,
                protein,
                carbs,
                fats,
                ingredients,
            },
        })

        return NextResponse.json(meal, { status: 201 })
    } catch (error) {
        console.error('Error creating meal:', error)
        return NextResponse.json({ error: 'Failed to create meal' }, { status: 500 })
    }
}

// PUT /api/meals - Update a meal
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, name, type, calories, protein, carbs, fats, ingredients } = body

        if (!id) {
            return NextResponse.json({ error: 'id is required' }, { status: 400 })
        }

        const meal = await prisma.meal.update({
            where: { id },
            data: {
                name,
                type,
                calories,
                protein,
                carbs,
                fats,
                ingredients,
            },
        })

        return NextResponse.json(meal)
    } catch (error) {
        console.error('Error updating meal:', error)
        return NextResponse.json({ error: 'Failed to update meal' }, { status: 500 })
    }
}

// DELETE /api/meals - Delete a meal
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'id is required' }, { status: 400 })
        }

        await prisma.meal.delete({
            where: { id },
        })

        return NextResponse.json({ message: 'Meal deleted successfully' })
    } catch (error) {
        console.error('Error deleting meal:', error)
        return NextResponse.json({ error: 'Failed to delete meal' }, { status: 500 })
    }
}
