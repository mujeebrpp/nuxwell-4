import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const familyId = searchParams.get('familyId')

        const profile = await prisma.profile.findUnique({
            where: { userId: user.id },
        })

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        const where: Record<string, unknown> = {}
        if (familyId) {
            if (profile.role === 'MEMBER') {
                const isMember = await prisma.familyMember.findFirst({
                    where: { familyId, userId: user.id },
                })
                if (!isMember) {
                    return NextResponse.json({ error: 'Not authorized to view this family' }, { status: 403 })
                }
            }
            where.familyId = familyId
        } else {
            if (profile.role !== 'MEMBER') {
                where.primaryGuardianId = user.id
            } else {
                return NextResponse.json({ error: 'Provide familyId for MEMBER role' }, { status: 400 })
            }
        }

        const familyMembers = await prisma.familyMember.findMany({
            where,
            include: { user: true, family: true },
        })

        return NextResponse.json(familyMembers)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch family members' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { familyId, email, memberType } = body

        if (!familyId || !email) {
            return NextResponse.json({ error: 'familyId and email are required' }, { status: 400 })
        }

        const profile = await prisma.profile.findUnique({
            where: { userId: user.id },
        })

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        const family = await prisma.family.findUnique({
            where: { id: familyId },
        })

        if (!family) {
            return NextResponse.json({ error: 'Family not found' }, { status: 404 })
        }

        if (profile.role === 'MEMBER') {
            const isMember = await prisma.familyMember.findFirst({
                where: { familyId, userId: user.id },
            })
            if (!isMember) {
                return NextResponse.json({ error: 'Not authorized to add members to this family' }, { status: 403 })
            }
        } else {
            if (family.primaryGuardianId !== user.id && family.secondaryGuardianId !== user.id) {
                return NextResponse.json({ error: 'Not authorized to add members to this family' }, { status: 403 })
            }
        }

        const targetProfile = await prisma.profile.findUnique({
            where: { email },
        })

        if (!targetProfile) {
            return NextResponse.json({ error: 'User not found with this email' }, { status: 404 })
        }

        const existingMember = await prisma.familyMember.findUnique({
            where: { familyId_userId: { familyId, userId: targetProfile.userId } },
        })

        if (existingMember) {
            return NextResponse.json({ error: 'User is already a family member' }, { status: 409 })
        }

        const newMember = await prisma.familyMember.create({
            data: {
                familyId,
                userId: targetProfile.userId,
                memberType: memberType || 'child',
            },
            include: { user: true, family: true },
        })

        return NextResponse.json({ member: newMember }, { status: 201 })
    } catch (error) {
        console.error('Error adding family member:', error)
        return NextResponse.json({ error: 'Failed to add family member' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        const familyId = searchParams.get('familyId')
        const userId = searchParams.get('userId')

        if (!id && (!familyId || !userId)) {
            return NextResponse.json({ error: 'Provide either id or both familyId and userId' }, { status: 400 })
        }

        const profile = await prisma.profile.findUnique({
            where: { userId: user.id },
        })

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        if (id) {
            const member = await prisma.familyMember.findUnique({
                where: { id },
            })
            if (!member) {
                return NextResponse.json({ error: 'Member not found' }, { status: 404 })
            }
            
            if (profile.role === 'MEMBER') {
                const isMember = await prisma.familyMember.findFirst({
                    where: { familyId: member.familyId, userId: user.id },
                })
                if (!isMember) {
                    return NextResponse.json({ error: 'Not authorized to remove members from this family' }, { status: 403 })
                }
            } else {
                const family = await prisma.family.findUnique({
                    where: { id: member.familyId },
                })
                if (family && family.primaryGuardianId !== user.id && family.secondaryGuardianId !== user.id) {
                    return NextResponse.json({ error: 'Not authorized to remove members from this family' }, { status: 403 })
                }
            }

            await prisma.familyMember.delete({ where: { id } })
        } else if (familyId && userId) {
            const family = await prisma.family.findUnique({
                where: { id: familyId },
            })

            if (!family) {
                return NextResponse.json({ error: 'Family not found' }, { status: 404 })
            }

            if (profile.role === 'MEMBER') {
                const isMember = await prisma.familyMember.findFirst({
                    where: { familyId, userId: user.id },
                })
                if (!isMember) {
                    return NextResponse.json({ error: 'Not authorized to remove members from this family' }, { status: 403 })
                }
            } else {
                if (family.primaryGuardianId !== user.id && family.secondaryGuardianId !== user.id) {
                    return NextResponse.json({ error: 'Not authorized to remove members from this family' }, { status: 403 })
                }
            }

            await prisma.familyMember.delete({
                where: { familyId_userId: { familyId, userId } },
            })
        }

        return NextResponse.json({ message: 'Family member removed successfully' })
    } catch (error) {
        console.error('Error removing family member:', error)
        return NextResponse.json({ error: 'Failed to remove family member' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { id, memberType } = body

        if (!id || !memberType) {
            return NextResponse.json({ error: 'id and memberType are required' }, { status: 400 })
        }

        const profile = await prisma.profile.findUnique({
            where: { userId: user.id },
        })

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        const member = await prisma.familyMember.findUnique({
            where: { id },
        })

        if (!member) {
            return NextResponse.json({ error: 'Member not found' }, { status: 404 })
        }

        if (profile.role === 'MEMBER') {
            const isMember = await prisma.familyMember.findFirst({
                where: { familyId: member.familyId, userId: user.id },
            })
            if (!isMember) {
                return NextResponse.json({ error: 'Not authorized to update this family member' }, { status: 403 })
            }
        } else {
            const family = await prisma.family.findUnique({
                where: { id: member.familyId },
            })
            if (family && family.primaryGuardianId !== user.id && family.secondaryGuardianId !== user.id) {
                return NextResponse.json({ error: 'Not authorized to update this family member' }, { status: 403 })
            }
        }

        const updatedMember = await prisma.familyMember.update({
            where: { id },
            data: { memberType },
            include: { user: true, family: true },
        })

        return NextResponse.json({ member: updatedMember })
    } catch (error) {
        console.error('Error updating family member:', error)
        return NextResponse.json({ error: 'Failed to update family member' }, { status: 500 })
    }
}