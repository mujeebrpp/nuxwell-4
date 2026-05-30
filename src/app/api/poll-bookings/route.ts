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
        const familyId = searchParams.get('familyId')
        const pollId = searchParams.get('pollId')
        const date = searchParams.get('date')
        const upcoming = searchParams.get('upcoming')

        const now = new Date()
        const where: any = {}
        if (userId) where.userId = userId
        if (familyId) where.familyId = familyId
        if (pollId) where.pollId = pollId
        if (id) where.id = id
        if (date) where.date = new Date(date)
        if (upcoming === 'true') where.date = { gte: now }

        const bookings = await prisma.pollBooking.findMany({
            where,
            include: { user: true, poll: true, membership: true, family: true },
            orderBy: { date: 'desc' },
        })

        if (id) {
            const booking = bookings[0]
            if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
            return NextResponse.json(booking)
        }
        return NextResponse.json(bookings)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch poll bookings' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { userId, familyId, membershipId, pollId, date, startTime, endTime, groupSize, specialRequest } = body

        if (!userId && !familyId) {
            return NextResponse.json({ error: 'userId or familyId is required' }, { status: 400 })
        }
        if (!pollId || !startTime || !endTime) {
            return NextResponse.json({ error: 'pollId, startTime, and endTime are required' }, { status: 400 })
        }

        const booking = await prisma.pollBooking.create({
            data: {
                userId,
                familyId,
                membershipId,
                pollId,
                date: date ? new Date(date) : new Date(),
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                groupSize: groupSize || 2,
                specialRequest,
            },
        })
        return NextResponse.json(booking, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create poll booking' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, status, groupSize, specialRequest } = body

        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

        const updateData: any = {}
        if (status !== undefined) updateData.status = status
        if (groupSize !== undefined) updateData.groupSize = groupSize
        if (specialRequest !== undefined) updateData.specialRequest = specialRequest

        const booking = await prisma.pollBooking.update({
            where: { id },
            data: updateData,
        })
        return NextResponse.json(booking)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update poll booking' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

        await prisma.pollBooking.delete({ where: { id } })
        return NextResponse.json({ message: 'Poll booking deleted successfully' })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete poll booking' }, { status: 500 })
    }
}