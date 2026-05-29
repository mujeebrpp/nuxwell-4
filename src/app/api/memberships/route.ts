import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        const userId = searchParams.get('userId')

        const where: Record<string, unknown> = {}
        if (id) where.id = id
        if (userId) where.userId = userId

        const memberships = await prisma.membership.findMany({
            where,
            include: { user: true, branch: true, family: true },
            orderBy: { startDate: 'desc' },
        })

        if (id) {
            const membership = memberships[0]
            if (!membership) return NextResponse.json({ error: 'Membership not found' }, { status: 404 })
            return NextResponse.json(membership)
        }
        return NextResponse.json(memberships)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch memberships' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { userId, branchId, familyId, type, endDate } = body

        if (!userId || !type || !endDate) {
            return NextResponse.json({ error: 'userId, type, and endDate are required' }, { status: 400 })
        }

        const membership = await prisma.membership.create({
            data: { userId, branchId, familyId, type, endDate: new Date(endDate) },
        })
        return NextResponse.json(membership, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create membership' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, status, renewalDate } = body

        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

        const membership = await prisma.membership.update({
            where: { id },
            data: { status, renewalDate: renewalDate ? new Date(renewalDate) : undefined },
        })
        return NextResponse.json(membership)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update membership' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

        await prisma.membership.delete({ where: { id } })
        return NextResponse.json({ message: 'Membership deleted successfully' })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete membership' }, { status: 500 })
    }
}