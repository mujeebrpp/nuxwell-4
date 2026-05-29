import { prisma } from '../src/lib/prisma/client'

async function main() {
    console.log('🌱 Starting seed for Nuxwell Family Tea Hub & Aquatic Wellness Club...')

    // Create main branch
    const branch = await prisma.branch.create({
        data: {
            name: 'Nuxwell Main Center',
            address: '123 Wellness Avenue, Malappuram, Kerala',
            phone: '+91-456-123-4567',
            email: 'info@nuxwell.com',
        },
    })

    console.log('✅ Created main branch')

    // Create Large Lap Pools (2 pools)
    await prisma.pool.create({
        data: {
            branchId: branch.id,
            name: 'Olympic Lap Pool 1',
            type: 'large_lap',
            length: 25,
            width: 3,
            depth: 1.5,
            capacity: 8,
            lanes: {
                create: Array.from({ length: 8 }, (_, i) => ({
                    laneNumber: i + 1,
                })),
            },
        },
    })

    await prisma.pool.create({
        data: {
            branchId: branch.id,
            name: 'Olympic Lap Pool 2',
            type: 'large_lap',
            length: 25,
            width: 3,
            depth: 1.5,
            capacity: 8,
            lanes: {
                create: Array.from({ length: 8 }, (_, i) => ({
                    laneNumber: i + 1,
                })),
            },
        },
    })

    // Create Small Lap Pools (2 pools)
    await prisma.pool.create({
        data: {
            branchId: branch.id,
            name: 'Therapy Pool 1',
            type: 'small_lap',
            length: 15,
            width: 3,
            depth: 1,
            capacity: 6,
            lanes: {
                create: Array.from({ length: 6 }, (_, i) => ({
                    laneNumber: i + 1,
                })),
            },
        },
    })

    await prisma.pool.create({
        data: {
            branchId: branch.id,
            name: 'Therapy Pool 2',
            type: 'small_lap',
            length: 15,
            width: 3,
            depth: 1,
            capacity: 6,
            lanes: {
                create: Array.from({ length: 6 }, (_, i) => ({
                    laneNumber: i + 1,
                })),
            },
        },
    })

    // Create Kids Pools (3 pools)
    await prisma.pool.create({
        data: {
            branchId: branch.id,
            name: 'Kids Pool A',
            type: 'kids',
            length: 6,
            width: 1,
            depth: 0.5,
            capacity: 4,
        },
    })

    await prisma.pool.create({
        data: {
            branchId: branch.id,
            name: 'Kids Pool B',
            type: 'kids',
            length: 6,
            width: 1,
            depth: 0.5,
            capacity: 4,
        },
    })

    await prisma.pool.create({
        data: {
            branchId: branch.id,
            name: 'Kids Pool C',
            type: 'kids',
            length: 6,
            width: 1,
            depth: 0.5,
            capacity: 4,
        },
    })

    console.log('✅ Created 7 pools (2 large, 2 small, 3 kids)')

    // Create Tea Tables
    await Promise.all(
        Array.from({ length: 20 }, (_, i) =>
            prisma.teaTable.create({
                data: {
                    branchId: branch.id,
                    tableNumber: i + 1,
                    capacity: i < 12 ? 4 : 6,
                    location: i < 12 ? 'indoor' : 'outdoor',
                },
            })
        )
    )

    console.log('✅ Created 20 tea tables')

    // Create Users
    await prisma.profile.create({
        data: {
            userId: 'main-admin-001',
            email: 'admin@nuxwell.com',
            fullName: 'Super Admin',
            role: 'SUPERADMIN',
        },
    })

    await prisma.profile.create({
        data: {
            userId: 'manager-001',
            email: 'manager@nuxwell.com',
            fullName: 'Club Manager',
            role: 'MANAGER',
        },
    })

    await prisma.profile.create({
        data: {
            userId: 'trainer-001',
            email: 'trainer@nuxwell.com',
            fullName: 'Head Trainer',
            role: 'TRAINER',
        },
    })

    await prisma.profile.create({
        data: {
            userId: 'lifeguard-001',
            email: 'lifeguard@nuxwell.com',
            fullName: 'Head Lifeguard',
            role: 'LIFEGUARD',
        },
    })

    await prisma.profile.create({
        data: {
            userId: 'member-001',
            email: 'rahul.malappuram@example.com',
            fullName: 'Rahul Menon',
            weight: 72.5,
            height: 175,
            fitnessGoal: 'weight_loss',
        },
    })

    await prisma.profile.create({
        data: {
            userId: 'member-002',
            email: 'sneha.kottayam@example.com',
            fullName: 'Sneha Kuriakose',
            weight: 58.0,
            height: 162,
            fitnessGoal: 'muscle_gain',
        },
    })

    await prisma.profile.create({
        data: {
            userId: 'member-003',
            email: 'fazil.perinthalmanna@example.com',
            fullName: 'Fazil Abdulla',
            weight: 85.0,
            height: 180,
            fitnessGoal: 'maintenance',
        },
    })

    console.log('✅ Created 7 user profiles')

    // Create Family Account
    await prisma.family.create({
        data: {
            name: 'Menon Family',
            primaryGuardianId: 'member-001',
            members: {
                create: [
                    { userId: 'member-003', memberType: 'senior' },
                ],
            },
        },
    })

    console.log('✅ Created family account')

    // Create Memberships
    await prisma.membership.create({
        data: {
            userId: 'member-001',
            type: 'family',
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        },
    })

    await prisma.membership.create({
        data: {
            userId: 'member-002',
            type: 'individual',
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
    })

    console.log('✅ Created memberships')

    // Create Staff
    await prisma.staff.create({
        data: {
            branchId: branch.id,
            name: 'Aqua Fitness Trainer',
            email: 'aqua.trainer@nuxwell.com',
            phone: '+91-456-123-4568',
            role: 'trainer',
        },
    })

    await prisma.staff.create({
        data: {
            branchId: branch.id,
            name: 'Pool Safety Officer',
            email: 'safety@nuxwell.com',
            phone: '+91-456-123-4569',
            role: 'lifeguard',
        },
    })

    console.log('✅ Created staff members')

    // Create Rewards Points for members
    await prisma.rewardPoint.createMany({
        data: [
            { userId: 'member-001', points: 150, type: 'visit' },
            { userId: 'member-001', points: 200, type: 'swim' },
            { userId: 'member-001', points: 100, type: 'workout' },
            { userId: 'member-001', points: 75, type: 'tea_purchase' },
            { userId: 'member-002', points: 85, type: 'visit' },
            { userId: 'member-002', points: 120, type: 'workout' },
        ],
    })

    console.log('✅ Created reward points')

    // Create Events
    await prisma.event.create({
        data: {
            branchId: branch.id,
            title: 'Monthly Family Swim Day',
            description: 'Fun swimming competition for families',
            type: 'family_event',
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000),
            endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000),
            capacity: 100,
            price: 0,
        },
    })

    await prisma.event.create({
        data: {
            branchId: branch.id,
            title: 'Wellness Workshop: Nutrition Basics',
            description: 'Learn about healthy eating for families',
            type: 'wellness_workshop',
            date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            startTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000),
            endTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000),
            capacity: 50,
            price: 200,
        },
    })

    console.log('✅ Created events')

    // Create Equipment
    await prisma.equipment.createMany({
        data: [
            { branchId: branch.id, name: 'Swimming Goggles', category: 'goggles', totalQty: 50, availableQty: 45 },
            { branchId: branch.id, name: 'Kickboards', category: 'kickboard', totalQty: 20, availableQty: 18 },
            { branchId: branch.id, name: 'Floatation Belts', category: 'floatation', totalQty: 30, availableQty: 28 },
            { branchId: branch.id, name: 'Kettlebells (12kg)', category: 'training', totalQty: 15, availableQty: 15 },
            { branchId: branch.id, name: 'Battle Ropes', category: 'training', totalQty: 5, availableQty: 5 },
        ],
    })

    console.log('✅ Created equipment')

    // Create Lockers
    await Promise.all(
        Array.from({ length: 30 }, (_, i) =>
            prisma.locker.create({
                data: {
                    branchId: branch.id,
                    lockerNumber: i + 1,
                },
            })
        )
    )

    console.log('✅ Created smart lockers')

    console.log('🎉 Seed completed successfully!')
    console.log('📍 Nuxwell Family Tea Hub & Aquatic Wellness Club is ready!')
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })