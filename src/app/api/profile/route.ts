import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 })
        }

        const profile = await prisma.profile.findUnique({
            where: { userId },
            include: {
                memberships: true,
                familyMemberLinks: { include: { family: true } },
            },
        })

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        return NextResponse.json(profile)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { userId, email, fullName, phone, dateOfBirth, weight, height, fitnessGoal } = body

        if (!userId || !email) {
            return NextResponse.json({ error: 'userId and email are required' }, { status: 400 })
        }

        const profile = await prisma.profile.create({
            data: {
                userId,
                email,
                fullName,
                phone,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
                weight,
                height,
                fitnessGoal,
            },
        })

        return NextResponse.json(profile, { status: 201 })
    } catch (error: unknown) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
            return NextResponse.json({ error: 'Profile already exists' }, { status: 409 })
        }
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { userId, fullName, phone, dateOfBirth, weight, height, fitnessGoal, avatarUrl } = body

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 })
        }

        const profile = await prisma.profile.update({
            where: { userId },
            data: {
                fullName,
                phone,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
                weight,
                height,
                fitnessGoal,
                avatarUrl,
            },
        })

        return NextResponse.json(profile)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 })
        }

        await prisma.profile.delete({ where: { userId } })
        return NextResponse.json({ message: 'Profile deleted successfully' })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 })
    }
}