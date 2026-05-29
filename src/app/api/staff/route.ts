import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        const branchId = searchParams.get('branchId')
        const role = searchParams.get('role')

        const where: any = {}
        if (id) where.id = id
        if (branchId) where.branchId = branchId
        if (role) where.role = role

        const staff = await prisma.staff.findMany({
            where,
            include: { branch: true },
        })

        if (id) {
            const member = staff[0]
            if (!member) return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
            return NextResponse.json(member)
        }
        return NextResponse.json(staff)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { branchId, name, email, phone, role } = body

        if (!name || !email || !role) {
            return NextResponse.json({ error: 'name, email, and role are required' }, { status: 400 })
        }

        const staff = await prisma.staff.create({
            data: { branchId, name, email, phone, role },
        })
        return NextResponse.json(staff, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create staff member' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, status } = body

        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

        const staff = await prisma.staff.update({
            where: { id },
            data: { status },
        })
        return NextResponse.json(staff)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update staff member' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

        await prisma.staff.delete({ where: { id } })
        return NextResponse.json({ message: 'Staff member deleted successfully' })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete staff member' }, { status: 500 })
    }
}