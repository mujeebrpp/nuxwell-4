import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { Role } from '@prisma/client'

export async function GET(request: NextRequest) {
    try {
        const profiles = await prisma.profile.findMany({
            select: {
                userId: true,
                email: true,
                fullName: true,
                role: true,
                phone: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        })
        return NextResponse.json(profiles)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json()
        const { userId, role, isActive } = body

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 })
        }

        const updateData: { role?: Role; isActive?: boolean } = {}
        if (role) updateData.role = role as Role
        if (isActive !== undefined) updateData.isActive = isActive

        const profile = await prisma.profile.update({
            where: { userId },
            data: updateData,
        })

        return NextResponse.json(profile)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }
}