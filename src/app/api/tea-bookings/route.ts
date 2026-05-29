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
        const date = searchParams.get('date')
        const upcoming = searchParams.get('upcoming')

        const now = new Date()
        const where: any = {}
        if (userId) where.userId = userId
        if (familyId) where.familyId = familyId
        if (id) where.id = id
        if (date) where.date = new Date(date)
        if (upcoming === 'true') where.date = { gte: now }

        const bookings = await prisma.teaBooking.findMany({
            where,
            include: { user: true, table: true, membership: true, family: true, orderItems: { include: { menu: true } } },
            orderBy: { date: 'desc' },
        })

        if (id) {
            const booking = bookings[0]
            if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
            return NextResponse.json(booking)
        }
        return NextResponse.json(bookings)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch tea bookings' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { userId, familyId, membershipId, tableId, date, startTime, endTime, groupSize, specialRequest, depositAmount, depositPaid, foodOrder } = body

        if (!userId && !familyId) {
            return NextResponse.json({ error: 'userId or familyId is required' }, { status: 400 })
        }
        if (!tableId || !startTime || !endTime) {
            return NextResponse.json({ error: 'tableId, startTime, and endTime are required' }, { status: 400 })
        }

        const booking = await prisma.teaBooking.create({
            data: {
                userId,
                familyId,
                membershipId,
                tableId,
                date: date ? new Date(date) : new Date(),
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                groupSize: groupSize || 2,
                specialRequest,
                depositAmount: depositAmount || 0,
                depositPaid: depositPaid || false,
                foodOrder: foodOrder || {},
            },
        })
        return NextResponse.json(booking, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create tea booking' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, status, depositPaid, foodOrder, specialRequest } = body

        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

        const updateData: any = {}
        if (status !== undefined) updateData.status = status
        if (depositPaid !== undefined) updateData.depositPaid = depositPaid
        if (foodOrder !== undefined) updateData.foodOrder = foodOrder
        if (specialRequest !== undefined) updateData.specialRequest = specialRequest

        const booking = await prisma.teaBooking.update({
            where: { id },
            data: updateData,
        })
        return NextResponse.json(booking)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update tea booking' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

        await prisma.teaBooking.delete({ where: { id } })
        return NextResponse.json({ message: 'Tea booking deleted successfully' })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete tea booking' }, { status: 500 })
    }
}