import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params

        const lockers = await prisma.locker.findMany({
            where: { branchId: id },
            orderBy: { lockerNumber: 'asc' },
        })

        return NextResponse.json(lockers)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch lockers' }, { status: 500 })
    }
}