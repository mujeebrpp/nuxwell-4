import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        const branchId = searchParams.get('branchId')

        if (id) {
const pool = await prisma.pool.findUnique({
                where: { id },
                include: { lanes: true },
            })
            if (!pool) return NextResponse.json({ error: 'Pool not found' }, { status: 404 })
            return NextResponse.json(pool)
        }

        const where = branchId ? { branchId } : {}
        const pools = await prisma.pool.findMany({
            where,
            include: { lanes: true },
        })
        return NextResponse.json(pools)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch pools' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { branchId, name, type, length, width, depth, capacity } = body

        if (!branchId || !name || !type) {
            return NextResponse.json({ error: 'branchId, name, and type are required' }, { status: 400 })
        }

        const pool = await prisma.pool.create({
            data: { branchId, name, type, length, width, depth, capacity },
        })
        return NextResponse.json(pool, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create pool' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, name, type, length, width, depth, capacity } = body

        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

        const pool = await prisma.pool.update({
            where: { id },
            data: { name, type, length, width, depth, capacity },
        })
        return NextResponse.json(pool)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update pool' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

        await prisma.pool.delete({ where: { id } })
        return NextResponse.json({ message: 'Pool deleted successfully' })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete pool' }, { status: 500 })
    }
}