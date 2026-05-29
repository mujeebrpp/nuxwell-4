import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (id) {
            const branch = await prisma.branch.findUnique({
                where: { id },
                include: {
                    pools: true,
                    teaTables: true,
                    staff: true,
                },
            })
            if (!branch) return NextResponse.json({ error: 'Branch not found' }, { status: 404 })
            return NextResponse.json(branch)
        }

        const branches = await prisma.branch.findMany({
            include: {
                pools: true,
                teaTables: true,
            },
        })
        return NextResponse.json(branches)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch branches' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, address, phone, email, capacity } = body

        if (!name || !address) {
            return NextResponse.json({ error: 'name and address are required' }, { status: 400 })
        }

        const branch = await prisma.branch.create({
            data: { name, address, phone, email, capacity },
        })
        return NextResponse.json(branch, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create branch' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, name, address, phone, email, capacity } = body

        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

        const branch = await prisma.branch.update({
            where: { id },
            data: { name, address, phone, email, capacity },
        })
        return NextResponse.json(branch)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update branch' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

        await prisma.branch.delete({ where: { id } })
        return NextResponse.json({ message: 'Branch deleted successfully' })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete branch' }, { status: 500 })
    }
}