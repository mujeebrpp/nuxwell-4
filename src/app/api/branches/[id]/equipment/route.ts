import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params

        const equipment = await prisma.equipment.findMany({
            where: { branchId: id },
            orderBy: { name: 'asc' },
        })

        return NextResponse.json(equipment)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch equipment' }, { status: 500 })
    }
}