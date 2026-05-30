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

         const places = await prisma.workoutPlace.findMany({ where })

         if (id) {
             const place = places[0]
             if (!place) return NextResponse.json({ error: 'Workout place not found' }, { status: 404 })
             return NextResponse.json(place)
         }
         return NextResponse.json(places)
     } catch (error) {
         return NextResponse.json({ error: 'Failed to fetch workout places' }, { status: 500 })
     }
}

export async function POST(request: NextRequest) {
     try {
         const body = await request.json()
         const { branchId, name, capacity, location } = body

         if (!branchId || !name || !capacity) {
             return NextResponse.json({ error: 'branchId, name, and capacity are required' }, { status: 400 })
         }

         const place = await prisma.workoutPlace.create({
             data: { branchId, name, capacity, location },
         })
         return NextResponse.json(place, { status: 201 })
     } catch (error) {
         return NextResponse.json({ error: 'Failed to create workout place' }, { status: 500 })
     }
}

export async function PUT(request: NextRequest) {
     try {
         const body = await request.json()
         const { id, status } = body

         if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

         const place = await prisma.workoutPlace.update({
             where: { id },
             data: { status },
         })
         return NextResponse.json(place)
     } catch (error) {
         return NextResponse.json({ error: 'Failed to update workout place' }, { status: 500 })
     }
}

export async function DELETE(request: NextRequest) {
     try {
         const { searchParams } = new URL(request.url)
         const id = searchParams.get('id')

         if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

         await prisma.workoutPlace.delete({ where: { id } })
         return NextResponse.json({ message: 'Workout place deleted successfully' })
     } catch (error) {
         return NextResponse.json({ error: 'Failed to delete workout place' }, { status: 500 })
     }
}