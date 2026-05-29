import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    return NextResponse.json({
        message: 'Auth API - Use Supabase Auth or Auth.js for authentication',
        endpoints: {
            signIn: 'POST /api/auth/sign-in',
            signUp: 'POST /api/auth/sign-up',
            signOut: 'POST /api/auth/sign-out',
        },
    })
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { action } = body

        switch (action) {
            case 'signIn':
                return NextResponse.json({ error: 'Use Supabase auth client for sign-in' }, { status: 400 })
            case 'signUp':
                return NextResponse.json({ error: 'Use Supabase auth client for sign-up' }, { status: 400 })
            case 'signOut':
                return NextResponse.json({ error: 'Use Supabase auth client for sign-out' }, { status: 400 })
            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }
    } catch (error) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
}