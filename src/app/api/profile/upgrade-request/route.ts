import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { userId } = body

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 })
        }

        const profile = await prisma.profile.findUnique({
            where: { userId },
        })

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        if (profile.role === 'MEMBER') {
            return NextResponse.json({ error: 'User is already a member' }, { status: 400 })
        }

        if (profile.role === 'PENDING_MEMBER') {
            return NextResponse.json({ error: 'Upgrade request already submitted' }, { status: 400 })
        }

        await prisma.profile.update({
            where: { userId },
            data: {
                role: 'PENDING_MEMBER',
            },
        })

        return NextResponse.json({ message: 'Upgrade request submitted successfully. A member will review your request.' }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to submit upgrade request' }, { status: 500 })
    }
}