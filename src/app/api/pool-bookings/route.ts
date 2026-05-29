import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        const userId = user?.id || searchParams.get('userId')
        const date = searchParams.get('date')
        const upcoming = searchParams.get('upcoming')

        const now = new Date()
        const where: Record<string, unknown> = { userId }
        if (id) where.id = id
        if (date) where.date = new Date(date)
        if (upcoming === 'true') where.date = { gte: now }

        const bookings = await prisma.poolBooking.findMany({
            where,
            include: { user: true, pool: true, lane: true, membership: true },
            orderBy: { date: 'desc' },
        })

        if (id) {
            const booking = bookings[0]
            if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
            return NextResponse.json(booking)
        }
        return NextResponse.json(bookings)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch pool bookings' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { userId, membershipId, poolId, laneId, date, startTime, endTime } = body

        if (!userId || !poolId || !startTime || !endTime) {
            return NextResponse.json({ error: 'userId, poolId, startTime, and endTime are required' }, { status: 400 })
        }

        const booking = await prisma.poolBooking.create({
            data: {
                userId,
                membershipId,
                poolId,
                laneId,
                date: date ? new Date(date) : new Date(),
                startTime: new Date(startTime),
                endTime: new Date(endTime),
            },
        })
        return NextResponse.json(booking, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create pool booking' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, status } = body

        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

        const booking = await prisma.poolBooking.update({
            where: { id },
            data: { status },
        })
        return NextResponse.json(booking)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update pool booking' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

        await prisma.poolBooking.delete({ where: { id } })
        return NextResponse.json({ message: 'Pool booking deleted successfully' })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete pool booking' }, { status: 500 })
    }
}