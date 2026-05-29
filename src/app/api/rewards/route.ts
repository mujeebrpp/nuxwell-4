import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')
        const familyId = searchParams.get('familyId')

        const where: any = {}
        if (userId) where.userId = userId
        if (familyId) where.familyId = familyId

        const points = await prisma.rewardPoint.findMany({
            where,
            include: { user: true, family: true },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json(points)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch reward points' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { userId, familyId, points, type, sourceId } = body

        if (!points || !type) {
            return NextResponse.json({ error: 'points and type are required' }, { status: 400 })
        }

        const point = await prisma.rewardPoint.create({
            data: { userId, familyId, points, type, sourceId },
        })
        return NextResponse.json(point, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create reward point' }, { status: 500 })
    }
}