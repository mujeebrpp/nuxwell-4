import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        const userId = searchParams.get('userId')

        const where: Record<string, unknown> = {}
        if (id) where.id = id
        if (userId) where.members = { some: { userId } }

        const families = await prisma.family.findMany({
            where,
            include: {
                primaryGuardian: true,
                secondaryGuardian: true,
                members: { include: { user: true } },
            },
        })

        if (id) {
            const family = families[0]
            if (!family) return NextResponse.json({ error: 'Family not found' }, { status: 404 })
            return NextResponse.json(family)
        }
        return NextResponse.json(families)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch families' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, primaryGuardianId, secondaryGuardianId } = body

        if (!name || !primaryGuardianId) {
            return NextResponse.json({ error: 'name and primaryGuardianId are required' }, { status: 400 })
        }

        const family = await prisma.family.create({
            data: { name, primaryGuardianId, secondaryGuardianId },
        })
        return NextResponse.json(family, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create family' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, name } = body

        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

        const family = await prisma.family.update({
            where: { id },
            data: { name },
        })
        return NextResponse.json(family)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update family' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

        await prisma.family.delete({ where: { id } })
        return NextResponse.json({ message: 'Family deleted successfully' })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete family' }, { status: 500 })
    }
}