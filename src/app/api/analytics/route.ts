import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const branchId = searchParams.get('branchId')

const dateFilter: Record<string, unknown> = {}
    if (branchId) dateFilter.branchId = branchId

        const activeMemberships = await prisma.membership.count({
            where: { status: 'active', ...dateFilter },
        })

        const poolBookings = await prisma.poolBooking.count({
            where: { status: 'confirmed', date: { gte: new Date() } },
        })

        const poolOccupancy = await prisma.pool.count({
            where: { ...dateFilter },
        })

        const teaBookings = await prisma.teaBooking.count({
            where: { status: 'confirmed', date: { gte: new Date() } },
        })

        const totalRevenue = await prisma.membership.findMany({
            where: { ...dateFilter },
        })

        const events = await prisma.event.count({
            where: { ...dateFilter },
        })

        return NextResponse.json({
            activeMemberships,
            poolBookings,
            poolOccupancy,
            teaBookings,
            events,
            totalRevenue: totalRevenue.length,
        })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
    }
}