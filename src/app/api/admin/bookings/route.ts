import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { createClient } from '@/lib/supabase/server'

type BookingType = 'pool' | 'tea' | 'poll'

async function checkAdminAuth(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
        return null
    }

    const profile = await prisma.profile.findUnique({
        where: { userId: user.id },
        select: { role: true },
    })

    if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'SUPERADMIN')) {
        return null
    }
    
    return user
}

export async function GET(request: NextRequest) {
    try {
        const user = await checkAdminAuth(request)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type') as BookingType | null
        const status = searchParams.get('status')
        const date = searchParams.get('date')
        const search = searchParams.get('search')

        const bookings: any[] = []

        if (!type || type === 'pool') {
            const poolWhere: Record<string, unknown> = {}
            if (status) poolWhere.status = status
            if (date) {
                const parsedDate = new Date(date)
                if (isNaN(parsedDate.getTime())) {
                    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
                }
                poolWhere.date = parsedDate
            }
            if (search) {
                poolWhere.OR = [
                    { user: { fullName: { contains: search, mode: 'insensitive' } } },
                    { user: { email: { contains: search, mode: 'insensitive' } } },
                ]
            }
            const poolBookings = await prisma.poolBooking.findMany({
                where: poolWhere,
                include: { user: true, pool: true, lane: true, membership: true },
                orderBy: { date: 'desc' },
            })
            bookings.push(...poolBookings.map(b => ({ ...b, bookingType: 'pool' })))
        }

        if (!type || type === 'tea') {
            const teaWhere: Record<string, unknown> = {}
            if (status) teaWhere.status = status
            if (date) {
                const parsedDate = new Date(date)
                if (isNaN(parsedDate.getTime())) {
                    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
                }
                teaWhere.date = parsedDate
            }
            if (search) {
                teaWhere.OR = [
                    { user: { fullName: { contains: search, mode: 'insensitive' } } },
                    { user: { email: { contains: search, mode: 'insensitive' } } },
                ]
            }
            const teaBookings = await prisma.teaBooking.findMany({
                where: teaWhere,
                include: { user: true, table: true, membership: true, family: true },
                orderBy: { date: 'desc' },
            })
            bookings.push(...teaBookings.map(b => ({ ...b, bookingType: 'tea' })))
        }

        if (!type || type === 'poll') {
            const pollWhere: Record<string, unknown> = {}
            if (status) pollWhere.status = status
            if (date) {
                const parsedDate = new Date(date)
                if (isNaN(parsedDate.getTime())) {
                    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
                }
                pollWhere.date = parsedDate
            }
            if (search) {
                pollWhere.OR = [
                    { user: { fullName: { contains: search, mode: 'insensitive' } } },
                    { user: { email: { contains: search, mode: 'insensitive' } } },
                ]
            }
            const pollBookings = await prisma.pollBooking.findMany({
                where: pollWhere,
                include: { user: true, poll: true, membership: true, family: true },
                orderBy: { date: 'desc' },
            })
            bookings.push(...pollBookings.map(b => ({ ...b, bookingType: 'poll' })))
        }

        const sortedBookings = bookings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        return NextResponse.json(sortedBookings)
    } catch (error) {
        console.error('Error fetching bookings:', error)
        return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const user = await checkAdminAuth(request)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const body = await request.json()
        const { id, type, status: newStatus } = body

        if (!id || !type || !newStatus) {
            return NextResponse.json({ error: 'id, type, and status are required' }, { status: 400 })
        }

        if (!['pool', 'tea', 'poll'].includes(type)) {
            return NextResponse.json({ error: 'Invalid booking type' }, { status: 400 })
        }

        if (!['confirmed', 'cancelled', 'completed', 'no_show'].includes(newStatus)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
        }

        switch (type) {
            case 'pool':
                await prisma.poolBooking.update({
                    where: { id },
                    data: { status: newStatus },
                })
                break
            case 'tea':
                await prisma.teaBooking.update({
                    where: { id },
                    data: { status: newStatus },
                })
                break
            case 'poll':
                await prisma.pollBooking.update({
                    where: { id },
                    data: { status: newStatus },
                })
                break
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error updating booking:', error)
        return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
    }
}