import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

// GET /api/progress - Get all progress entries or filter by userId
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')
        const id = searchParams.get('id')

        // Get single progress entry by ID
        if (id) {
            const progress = await prisma.progress.findUnique({
                where: { id },
                include: {
                    profile: true,
                },
            })

            if (!progress) {
                return NextResponse.json({ error: 'Progress entry not found' }, { status: 404 })
            }

            return NextResponse.json(progress)
        }

        // Get progress by userId
        if (userId) {
            const progress = await prisma.progress.findMany({
                where: { userId },
                include: {
                    profile: true,
                },
                orderBy: {
                    recordedAt: 'desc',
                },
            })

            return NextResponse.json(progress)
        }

        // Get all progress entries
        const progress = await prisma.progress.findMany({
            include: {
                profile: true,
            },
            orderBy: {
                recordedAt: 'desc',
            },
        })

        return NextResponse.json(progress)
    } catch (error) {
        console.error('Error fetching progress:', error)
        return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
    }
}

// POST /api/progress - Create a new progress entry
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { userId, weight, bodyFatPercentage, measurements, notes } = body

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 })
        }

        // Verify profile exists
        const profile = await prisma.profile.findUnique({
            where: { userId },
        })

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        const progress = await prisma.progress.create({
            data: {
                userId,
                weight,
                bodyFatPercentage,
                measurements,
                notes,
            },
        })

        return NextResponse.json(progress, { status: 201 })
    } catch (error) {
        console.error('Error creating progress:', error)
        return NextResponse.json({ error: 'Failed to create progress entry' }, { status: 500 })
    }
}

// PUT /api/progress - Update a progress entry
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, weight, bodyFatPercentage, measurements, notes } = body

        if (!id) {
            return NextResponse.json({ error: 'id is required' }, { status: 400 })
        }

        const progress = await prisma.progress.update({
            where: { id },
            data: {
                weight,
                bodyFatPercentage,
                measurements,
                notes,
            },
        })

        return NextResponse.json(progress)
    } catch (error) {
        console.error('Error updating progress:', error)
        return NextResponse.json({ error: 'Failed to update progress entry' }, { status: 500 })
    }
}

// DELETE /api/progress - Delete a progress entry
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'id is required' }, { status: 400 })
        }

        await prisma.progress.delete({
            where: { id },
        })

        return NextResponse.json({ message: 'Progress entry deleted successfully' })
    } catch (error) {
        console.error('Error deleting progress:', error)
        return NextResponse.json({ error: 'Failed to delete progress entry' }, { status: 500 })
    }
}
