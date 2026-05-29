import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')
        const exerciseType = searchParams.get('exerciseType')
        const date = searchParams.get('date')

        const where: Record<string, string> = {}
        if (userId) where.userId = userId
        if (exerciseType) where.exerciseType = exerciseType
        if (date) where.recordedAt = date

        const records = await prisma.exerciseRecord.findMany({
            where,
            orderBy: { recordedAt: 'desc' },
        })

        return NextResponse.json(records)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch exercise records' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { userId, exerciseType, repCount, duration, calories, formScore, formMetrics } = body

        if (!userId || !exerciseType) {
            return NextResponse.json({ error: 'userId and exerciseType are required' }, { status: 400 })
        }

        const record = await prisma.exerciseRecord.create({
            data: { userId, exerciseType, repCount, duration, calories, formScore, formMetrics },
        })
        return NextResponse.json(record, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create exercise record' }, { status: 500 })
    }
}