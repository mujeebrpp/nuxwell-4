import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        const familyId = searchParams.get('familyId')
        const userId = user?.id || searchParams.get('userId')
        const date = searchParams.get('date')
        const upcoming = searchParams.get('upcoming')

        const now = new Date()
        const where: any = {}
        if (id) where.id = id
        if (familyId) where.familyId = familyId
        if (userId) where.userId = userId
        if (date) where.date = new Date(date)
        if (upcoming === 'true') where.date = { gte: now }

const bookings = await prisma.familyBooking.findMany({
             where,
             include: { family: true, pool: true, poolLane: true, teaTable: true, workoutPlace: true, trainer: true },
             orderBy: { date: 'desc' },
         })

        if (id) {
            const booking = bookings[0]
            if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
            return NextResponse.json(booking)
        }
        return NextResponse.json(bookings)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch family bookings' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const { familyId, date, startTime, endTime, groupSize, poolId, poolLaneId, teaTableId, workoutPlaceId, trainerId, specialRequest } = body

        if (!familyId) {
            return NextResponse.json({ error: 'familyId is required' }, { status: 400 })
        }

        if (!startTime || !endTime) {
            return NextResponse.json({ error: 'startTime and endTime are required' }, { status: 400 })
        }

        if (groupSize < 4 || groupSize > 8) {
            return NextResponse.json({ error: 'Group size must be between 4 and 8 people' }, { status: 400 })
        }

const booking = await prisma.familyBooking.create({
             data: {
                 familyId,
                 userId: user.id,
                 date: date ? new Date(date) : new Date(),
                 startTime: new Date(startTime),
                 endTime: new Date(endTime),
                 groupSize,
                 poolId,
                 poolLaneId,
                 teaTableId,
                 workoutPlaceId,
                 trainerId,
                 specialRequest,
             },
             include: { family: true, pool: true, poolLane: true, teaTable: true, workoutPlace: true, trainer: true },
         })
        return NextResponse.json(booking, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create family booking' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
     try {
         const body = await request.json()
         const { id, status, trainerId, workoutPlaceId, specialRequest } = body

        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

const updateData: any = {}
         if (status !== undefined) updateData.status = status
         if (trainerId !== undefined) updateData.trainerId = trainerId
         if (workoutPlaceId !== undefined) updateData.workoutPlaceId = workoutPlaceId
         if (specialRequest !== undefined) updateData.specialRequest = specialRequest

        const booking = await prisma.familyBooking.update({
            where: { id },
            data: updateData,
        })
        return NextResponse.json(booking)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update family booking' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

        await prisma.familyBooking.delete({ where: { id } })
        return NextResponse.json({ message: 'Family booking deleted successfully' })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete family booking' }, { status: 500 })
    }
}