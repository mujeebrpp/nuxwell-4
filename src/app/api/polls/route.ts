import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        const branchId = searchParams.get('branchId')
        const status = searchParams.get('status')

        const where: Record<string, unknown> = {}
        if (id) where.id = id
        if (branchId) where.branchId = branchId
        if (status) where.status = status

        const polls = await prisma.poll.findMany({
            where,
            include: { branch: true, bookings: true },
        })

        if (id) {
            const poll = polls[0]
            if (!poll) return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
            return NextResponse.json(poll)
        }
        return NextResponse.json(polls)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch polls' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { branchId, name, capacity, location } = body

        if (!branchId || !name) {
            return NextResponse.json({ error: 'branchId and name are required' }, { status: 400 })
        }

        const poll = await prisma.poll.create({
            data: { branchId, name, capacity, location },
        })
        return NextResponse.json(poll, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create poll' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, name, capacity, location, status } = body

        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

        const updateData: Record<string, unknown> = {}
        if (name !== undefined) updateData.name = name
        if (capacity !== undefined) updateData.capacity = capacity
        if (location !== undefined) updateData.location = location
        if (status !== undefined) updateData.status = status

        const poll = await prisma.poll.update({
            where: { id },
            data: updateData,
        })
        return NextResponse.json(poll)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update poll' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

        await prisma.poll.delete({ where: { id } })
        return NextResponse.json({ message: 'Poll deleted successfully' })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete poll' }, { status: 500 })
    }
}