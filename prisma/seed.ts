import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import 'dotenv/config'

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL

const pool = new Pool({
    connectionString
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('🌱 Starting seed for Malappuram, Kerala...')

    // Create profiles for users in Malappuram
    const profile1 = await prisma.profile.create({
        data: {
            userId: 'user-malappuram-001',
            email: 'rahul.malappuram@example.com',
            fullName: 'Rahul Menon',
            weight: 72.5,
            height: 175,
            fitnessGoal: 'weight_loss',
        },
    })

    const profile2 = await prisma.profile.create({
        data: {
            userId: 'user-malappuram-002',
            email: 'sneha.kottayam@example.com',
            fullName: 'Sneha Kuriakose',
            weight: 58.0,
            height: 162,
            fitnessGoal: 'muscle_gain',
        },
    })

    const profile3 = await prisma.profile.create({
        data: {
            userId: 'user-malappuram-003',
            email: 'fazil.perinthalmanna@example.com',
            fullName: 'Fazil Abdulla',
            weight: 85.0,
            height: 180,
            fitnessGoal: 'maintenance',
        },
    })

    console.log('✅ Created 3 profiles')

    // Create workouts for Rahul (weight loss focus)
    const workouts = [
        {
            userId: profile1.id,
            name: 'Morning Yoga at Beach',
            type: 'yoga',
            durationMinutes: 45,
            caloriesBurned: 180,
            exercises: JSON.stringify([
                { name: 'Surya Namaskar', sets: 3, reps: 12 },
                { name: 'Tadasana', duration: '2 min' },
                { name: 'Vrikshasana', duration: '1 min each side' },
                { name: 'Bhujangasana', sets: 3, reps: 10 },
                { name: 'Savasana', duration: '5 min' }
            ]),
        },
        {
            userId: profile1.id,
            name: 'Evening HIIT Session',
            type: 'hiit',
            durationMinutes: 30,
            caloriesBurned: 320,
            exercises: JSON.stringify([
                { name: 'Jumping Jacks', duration: '45 sec' },
                { name: 'Burpees', sets: 4, reps: 10 },
                { name: 'Mountain Climbers', duration: '45 sec' },
                { name: 'High Knees', duration: '45 sec' },
                { name: 'Squat Jumps', sets: 4, reps: 12 }
            ]),
        },
        {
            userId: profile1.id,
            name: 'Cardio at AKG Memorial Stadium',
            type: 'cardio',
            durationMinutes: 60,
            caloriesBurned: 450,
            exercises: JSON.stringify([
                { name: 'Warmup Walk', duration: '10 min' },
                { name: 'Jogging', duration: '25 min' },
                { name: 'Sprint Intervals', sets: 6, duration: '1 min' },
                { name: 'Cool Down Walk', duration: '10 min' }
            ]),
        },
    ]

    // Create workouts for Sneha (muscle gain focus)
    const workouts2 = [
        {
            userId: profile2.id,
            name: 'Strength Training - Upper Body',
            type: 'strength',
            durationMinutes: 50,
            caloriesBurned: 280,
            exercises: JSON.stringify([
                { name: 'Pushups', sets: 4, reps: 12 },
                { name: 'Dumbbell Rows', sets: 3, reps: 15 },
                { name: 'Shoulder Press', sets: 3, reps: 12 },
                { name: 'Bicep Curls', sets: 3, reps: 15 },
                { name: 'Tricep Dips', sets: 3, reps: 12 }
            ]),
        },
        {
            userId: profile2.id,
            name: 'Strength Training - Lower Body',
            type: 'strength',
            durationMinutes: 55,
            caloriesBurned: 310,
            exercises: JSON.stringify([
                { name: 'Squats', sets: 4, reps: 15 },
                { name: 'Lunges', sets: 3, reps: '12 each' },
                { name: 'Deadlifts', sets: 3, reps: 10 },
                { name: 'Calf Raises', sets: 4, reps: 20 },
                { name: 'Glute Bridges', sets: 3, reps: 15 }
            ]),
        },
    ]

    // Create workouts for Fazil (maintenance)
    const workouts3 = [
        {
            userId: profile3.id,
            name: 'Morning Walk at Kottakunnu',
            type: 'cardio',
            durationMinutes: 40,
            caloriesBurned: 200,
            exercises: JSON.stringify([
                { name: 'Warmup Stretch', duration: '5 min' },
                { name: 'Brisk Walking', duration: '25 min' },
                { name: 'Cool Down Stretch', duration: '10 min' }
            ]),
        },
        {
            userId: profile3.id,
            name: 'Evening Flexibility',
            type: 'flexibility',
            durationMinutes: 35,
            caloriesBurned: 120,
            exercises: JSON.stringify([
                { name: 'Stretching Routine', duration: '20 min' },
                { name: 'Foam Rolling', duration: '10 min' },
                { name: 'Deep Breathing', duration: '5 min' }
            ]),
        },
    ]

    // Insert all workouts
    for (const workout of [...workouts, ...workouts2, ...workouts3]) {
        await prisma.workout.create({ data: workout })
    }

    console.log('✅ Created 7 workouts')

    // Create meals for Rahul
    const meals1 = [
        {
            userId: profile1.id,
            name: 'Kerala Porotta with Chicken Curry',
            type: 'lunch',
            calories: 650,
            protein: 35.5,
            carbs: 72.0,
            fats: 28.0,
            ingredients: JSON.stringify([
                { name: 'Porotta', quantity: '2 pieces' },
                { name: 'Chicken', quantity: '150g' },
                { name: 'Onion', quantity: '1 medium' },
                { name: 'Tomato', quantity: '1 small' },
                { name: 'Coconut Oil', quantity: '2 tbsp' }
            ]),
        },
        {
            userId: profile1.id,
            name: 'Morning Tea with Oats',
            type: 'breakfast',
            calories: 180,
            protein: 6.0,
            carbs: 28.0,
            fats: 5.0,
            ingredients: JSON.stringify([
                { name: 'Oats', quantity: '40g' },
                { name: 'Tea', quantity: '1 cup' },
                { name: 'Sugar', quantity: '1 tsp' }
            ]),
        },
        {
            userId: profile1.id,
            name: 'Fish Thali with Rice',
            type: 'dinner',
            calories: 580,
            protein: 42.0,
            carbs: 65.0,
            fats: 18.0,
            ingredients: JSON.stringify([
                { name: 'Rice', quantity: '200g' },
                { name: 'Meen Curry', quantity: '150ml' },
                { name: 'Sambar', quantity: '100ml' },
                { name: 'Pickle', quantity: '20g' },
                { name: 'Banana', quantity: '1 medium' }
            ]),
        },
        {
            userId: profile1.id,
            name: 'Evening Snack - Roasted Chana',
            type: 'snack',
            calories: 120,
            protein: 5.0,
            carbs: 18.0,
            fats: 3.5,
            ingredients: JSON.stringify([
                { name: 'Chickpeas', quantity: '30g' },
                { name: 'Oil', quantity: '1 tsp' },
                { name: 'Spices', quantity: 'as needed' }
            ]),
        },
    ]

    // Create meals for Sneha
    const meals2 = [
        {
            userId: profile2.id,
            name: 'Protein Rich Breakfast',
            type: 'breakfast',
            calories: 350,
            protein: 28.0,
            carbs: 32.0,
            fats: 12.0,
            ingredients: JSON.stringify([
                { name: 'Eggs', quantity: '3 whole' },
                { name: 'Bread', quantity: '2 slices' },
                { name: 'Milk', quantity: '200ml' },
                { name: 'Banana', quantity: '1 medium' }
            ]),
        },
        {
            userId: profile2.id,
            name: 'Chicken Salad Lunch',
            type: 'lunch',
            calories: 420,
            protein: 45.0,
            carbs: 25.0,
            fats: 18.0,
            ingredients: JSON.stringify([
                { name: 'Grilled Chicken', quantity: '150g' },
                { name: 'Mixed Greens', quantity: '100g' },
                { name: 'Cucumber', quantity: '1 medium' },
                { name: 'Olive Oil', quantity: '2 tbsp' },
                { name: 'Lemon', quantity: '1 small' }
            ]),
        },
        {
            userId: profile2.id,
            name: 'Protein Shake Dinner',
            type: 'dinner',
            calories: 280,
            protein: 35.0,
            carbs: 20.0,
            fats: 6.0,
            ingredients: JSON.stringify([
                { name: 'Whey Protein', quantity: '30g' },
                { name: 'Milk', quantity: '250ml' },
                { name: 'Peanut Butter', quantity: '1 tbsp' }
            ]),
        },
    ]

    // Create meals for Fazil
    const meals3 = [
        {
            userId: profile3.id,
            name: 'Traditional Kerala Breakfast',
            type: 'breakfast',
            calories: 480,
            protein: 15.0,
            carbs: 68.0,
            fats: 18.0,
            ingredients: JSON.stringify([
                { name: 'Idiyappam', quantity: '200g' },
                { name: 'Egg Curry', quantity: '100ml' },
                { name: 'Banana', quantity: '1 large' }
            ]),
        },
        {
            userId: profile3.id,
            name: 'Fish Biryani Lunch',
            type: 'lunch',
            calories: 720,
            protein: 38.0,
            carbs: 85.0,
            fats: 25.0,
            ingredients: JSON.stringify([
                { name: 'Biryani Rice', quantity: '250g' },
                { name: 'Fish', quantity: '150g' },
                { name: 'Onion', quantity: '2 medium' },
                { name: 'Ghee', quantity: '3 tbsp' },
                { name: 'Spices', quantity: 'as needed' }
            ]),
        },
        {
            userId: profile3.id,
            name: 'Light Dinner - Kappa and Fish',
            type: 'dinner',
            calories: 520,
            protein: 32.0,
            carbs: 55.0,
            fats: 18.0,
            ingredients: JSON.stringify([
                { name: 'Kappa', quantity: '200g' },
                { name: 'Fish Curry', quantity: '150ml' },
                { name: 'Vegetable Thoran', quantity: '50g' }
            ]),
        },
    ]

    // Insert all meals
    for (const meal of [...meals1, ...meals2, ...meals3]) {
        await prisma.meal.create({ data: meal })
    }

    console.log('✅ Created 10 meals')

    // Create progress records for all users
    const progress1 = [
        {
            userId: profile1.id,
            weight: 75.0,
            bodyFatPercentage: 24.5,
            measurements: JSON.stringify({ chest: 98, waist: 88, hips: 102, arms: 35, thighs: 58 }),
            notes: 'Initial assessment at Kottakunnu gym',
        },
        {
            userId: profile1.id,
            weight: 73.8,
            bodyFatPercentage: 23.2,
            measurements: JSON.stringify({ chest: 97, waist: 86, hips: 100, arms: 34.5, thighs: 57 }),
            notes: 'After 2 weeks of yoga and HIIT',
        },
        {
            userId: profile1.id,
            weight: 72.5,
            bodyFatPercentage: 22.0,
            measurements: JSON.stringify({ chest: 96, waist: 84, hips: 98, arms: 34, thighs: 56 }),
            notes: 'Great progress! Continuing the program',
        },
    ]

    const progress2 = [
        {
            userId: profile2.id,
            weight: 56.0,
            bodyFatPercentage: 26.0,
            measurements: JSON.stringify({ chest: 86, waist: 66, hips: 92, arms: 28, thighs: 52 }),
            notes: 'Starting strength training',
        },
        {
            userId: profile2.id,
            weight: 57.2,
            bodyFatPercentage: 25.2,
            measurements: JSON.stringify({ chest: 87, waist: 65, hips: 91, arms: 29, thighs: 53 }),
            notes: 'Gained muscle mass, losing fat',
        },
        {
            userId: profile2.id,
            weight: 58.0,
            bodyFatPercentage: 24.5,
            measurements: JSON.stringify({ chest: 88, waist: 64, hips: 90, arms: 30, thighs: 54 }),
            notes: 'Strong progress on muscle building',
        },
    ]

    const progress3 = [
        {
            userId: profile3.id,
            weight: 86.5,
            bodyFatPercentage: 28.0,
            measurements: JSON.stringify({ chest: 108, waist: 102, hips: 108, arms: 40, thighs: 65 }),
            notes: 'Maintenance check - Morning walk routine',
        },
        {
            userId: profile3.id,
            weight: 85.8,
            bodyFatPercentage: 27.5,
            measurements: JSON.stringify({ chest: 107, waist: 100, hips: 107, arms: 39.5, thighs: 64 }),
            notes: 'Slight improvement in measurements',
        },
        {
            userId: profile3.id,
            weight: 85.0,
            bodyFatPercentage: 27.0,
            measurements: JSON.stringify({ chest: 106, waist: 98, hips: 106, arms: 39, thighs: 63 }),
            notes: 'Consistent with maintenance goals',
        },
    ]

    // Insert all progress records
    for (const p of [...progress1, ...progress2, ...progress3]) {
        await prisma.progress.create({ data: p })
    }

    console.log('✅ Created 9 progress records')

    console.log('🎉 Seed completed successfully!')
    console.log('📍 Location: Malappuram, Kerala, India')
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
