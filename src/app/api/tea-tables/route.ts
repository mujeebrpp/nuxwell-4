import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        const branchId = searchParams.get('branchId')

        const where: Record<string, unknown> = {}
        if (id) where.id = id
        if (branchId) where.branchId = branchId

        const tables = await prisma.teaTable.findMany({
            where,
            include: { bookings: true },
        })

        if (id) {
            const table = tables[0]
            if (!table) return NextResponse.json({ error: 'Tea table not found' }, { status: 404 })
            return NextResponse.json(table)
        }
        return NextResponse.json(tables)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch tea tables' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { branchId, tableNumber, capacity, location } = body

        if (!branchId || !tableNumber || !capacity) {
            return NextResponse.json({ error: 'branchId, tableNumber, and capacity are required' }, { status: 400 })
        }

        const table = await prisma.teaTable.create({
            data: { branchId, tableNumber, capacity, location },
        })
        return NextResponse.json(table, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create tea table' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, status } = body

        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

        const table = await prisma.teaTable.update({
            where: { id },
            data: { status },
        })
        return NextResponse.json(table)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update tea table' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

        await prisma.teaTable.delete({ where: { id } })
        return NextResponse.json({ message: 'Tea table deleted successfully' })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete tea table' }, { status: 500 })
    }
}