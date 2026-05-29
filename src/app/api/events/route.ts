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

        const events = await prisma.event.findMany({
            where,
            include: { tickets: true },
        })

        if (id) {
            const event = events[0]
            if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
            return NextResponse.json(event)
        }
        return NextResponse.json(events)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { branchId, title, description, type, date, startTime, endTime, capacity, price } = body

        if (!title || !type || !date || !startTime || !endTime || !capacity) {
            return NextResponse.json({ error: 'title, type, date, startTime, endTime, and capacity are required' }, { status: 400 })
        }

        const event = await prisma.event.create({
            data: {
                branchId,
                title,
                description,
                type,
                date: new Date(date),
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                capacity,
                price,
            },
        })
        return NextResponse.json(event, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, status, registered } = body

        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

        const event = await prisma.event.update({
            where: { id },
            data: { status, registered },
        })
        return NextResponse.json(event)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

        await prisma.event.delete({ where: { id } })
        return NextResponse.json({ message: 'Event deleted successfully' })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
    }
}