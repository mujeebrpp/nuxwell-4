import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

// GET /api/profile - Get all profiles or a single profile by userId
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (userId) {
            const profile = await prisma.profile.findUnique({
                where: { userId },
                include: {
                    workouts: true,
                    meals: true,
                    progress: true,
                },
            })

            if (!profile) {
                return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
            }

            // Return simplified profile for auth hook
            return NextResponse.json({
                profile: {
                    id: profile.userId,
                    userId: profile.userId,
                    email: profile.email,
                    fullName: profile.fullName,
                    role: profile.role,
                    fitnessGoal: profile.fitnessGoal,
                }
            })
        }

        const profiles = await prisma.profile.findMany({
            include: {
                workouts: true,
                meals: true,
                progress: true,
            },
        })

        return NextResponse.json(profiles)
    } catch (error) {
        console.error('Error fetching profiles:', error)
        return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 })
    }
}

// POST /api/profile - Create a new profile
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { userId, email, fullName, avatarUrl, weight, weightUnit, height, fitnessGoal, role } = body

        if (!userId || !email) {
            return NextResponse.json({ error: 'userId and email are required' }, { status: 400 })
        }

        // Check if profile already exists
        const existingProfile = await prisma.profile.findUnique({
            where: { userId },
        })

        if (existingProfile) {
            return NextResponse.json({ error: 'Profile already exists' }, { status: 409 })
        }

        const profile = await prisma.profile.create({
            data: {
                userId,
                email,
                fullName,
                avatarUrl,
                weight,
                weightUnit: weightUnit || 'kg',
                height,
                fitnessGoal,
                role: role || 'USER',
            },
        })

        return NextResponse.json(profile, { status: 201 })
    } catch (error) {
        console.error('Error creating profile:', error)
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
    }
}

// PUT /api/profile - Update a profile
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { userId, fullName, avatarUrl, weight, weightUnit, height, fitnessGoal, role } = body

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 })
        }

        const profile = await prisma.profile.update({
            where: { userId },
            data: {
                fullName,
                avatarUrl,
                weight,
                weightUnit: weightUnit || 'kg',
                height,
                fitnessGoal,
                role,
            },
        })

        return NextResponse.json(profile)
    } catch (error) {
        console.error('Error updating profile:', error)
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }
}

// DELETE /api/profile - Delete a profile
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 })
        }

        await prisma.profile.delete({
            where: { userId },
        })

        return NextResponse.json({ message: 'Profile deleted successfully' })
    } catch (error) {
        console.error('Error deleting profile:', error)
        return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 })
    }
}
