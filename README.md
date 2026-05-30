# Nuxwell Family Wellness Club

A comprehensive full-stack wellness platform combining aquatic centers, tea social hub, functional fitness, and AI-powered workout tracking into one seamless experience.

## Features

- **Pool Booking System** - Reserve lanes in Olympic lap pools, therapy pools, or kids pools
- **Tea Hub Booking** - Book tea tables for family gatherings and events
- **AI Workout Tracking** - Real-time form feedback and rep counting using MediaPipe BlazePose
- **Wellness Rewards** - Earn points for visits, workouts, and redemptions
- **Family Accounts** - Manage shared memberships and wellness scores
- **QR Self-Service** - Check-in, locker access, and equipment rental
- **Multi-Pool System** - Configurable pools (2 large lap, 2 therapy, 3 kids)
- **Progress Tracking** - Body metrics, workout history, and analytics

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Backend** | Supabase (PostgreSQL) |
| **ORM** | Prisma 7 |
| **Authentication** | Supabase Auth + NextAuth |
| **AI/ML** | MediaPipe BlazePose |
| **Charts** | Recharts |
| **Icons** | Lucide React |

## Project Structure

```
nuxwell-4/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API route handlers
│   │   ├── (auth)/            # Auth pages (login, register)
│   │   ├── dashboard/         # Protected dashboard pages
│   │   └── layout.tsx
│   ├── components/
│   │   ├── layout/            # Navbar, Sidebar
│   │   ├── ui/                # Reusable UI components
│   │   └── workout/           # AI workout components
│   ├── lib/
│   │   ├── supabase/          # Supabase clients
│   │   ├── prisma/            # Prisma client
│   │   └── hooks/             # Custom React hooks
│   └── types/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Database seeding
├── plans/                     # Project planning docs
└── package.json
```

## Database Schema

The platform uses a comprehensive PostgreSQL schema with the following key models:

### Core Models
- **Profile** - Extended user profiles with roles (ADMIN, TRAINER, LIFEGUARD, MANAGER, SUPERADMIN, MEMBER, USER)
- **Family** - Family account management with guardians and members
- **Membership** - Subscription plans and status tracking
- **Branch** - Multi-location facility management

### Booking Systems
- **Pool / PoolLane / PoolBooking** - Olympic pool lane reservations
- **TeaTable / TeaBooking** - Tea hub table reservations
- **Poll / PollBooking** - Jacuzzi/spa pool bookings
- **TrainingBooking** - Personal trainer sessions

### Fitness & Wellness
- **Workout / WorkoutPlan** - Workout session tracking
- **ExerciseRecord** - AI workout records with form metrics
- **Meal / Progress** - Nutrition and progress tracking
- **WellnessScore** - Daily/weekly/monthly wellness scoring

### Business Features
- **RewardPoint / RewardTransaction** - Loyalty rewards system
- **Event / Ticket** - Workshop and party bookings
- **Staff** - Employee management
- **Locker / EquipmentRental** - QR self-service system

## API Endpoints

### Authentication
- `POST /api/auth` - Sign up with email/password

### Profile & Users
- `GET /api/profile?userId=xxx` - Get user profile
- `POST /api/profile` - Create profile
- `GET /api/profile/upgrade-request` - Membership upgrade requests

### Bookings
- `GET/POST/PUT /api/pool-bookings` - Pool lane reservations
- `GET/POST/PUT /api/poll-bookings` - Spa pool reservations
- `GET/POST/PUT /api/tea-bookings` - Tea table reservations

### Dashboard Data
- `GET /api/analytics` - Analytics data
- `GET /api/user/stats` - User statistics
- `GET /api/admin/stats` - Admin dashboard stats
- `GET /api/trainer/stats` - Trainer dashboard stats

### Family Management
- `GET /api/families` - Family data
- `GET /api/family-members` - Family member list

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (Supabase recommended)
- MediaPipe-compatible browser

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd nuxwell-4

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

```env
# Database
DATABASE_URL=your_postgresql_url
DIRECT_URL=your_postgresql_direct_url

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Auth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Optional: MediaPipe settings
NEXT_PUBLIC_MEDIAPIPE_CAMERA=environment
```

### Running the Application

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm run start

# Lint
npm run lint

# Seed database
npm run prisma:seed
```

## AI Workout Tracker

The AI workout tracker uses MediaPipe BlazePose for real-time exercise detection:

### Exercises Supported
1. Squat
2. Push-up
3. Jumping Jack
4. Plank
5. Lunge
6. Sit-up
7. Mountain Climber
8. High Knees
9. Glute Bridge
10. Burpee

### Components
- `usePoseDetector` - MediaPipe BlazePose integration hook
- `useExerciseDetector` - Exercise-specific detection logic
- `useAudioFeedback` - Text-to-speech rep counting
- `CameraView` - Video feed with skeleton overlay
- `ExerciseSelector` - Grid of exercise cards

### Detection Logic
- Uses 33-body pose landmarks from BlazePose
- Calculates angles between joints for form validation
- Tracks rep phases (down/up/complete)
- Provides real-time audio feedback

## Authentication & Authorization

The platform supports role-based access control:

| Role | Permissions |
|------|-------------|
| ADMIN / SUPERADMIN | Full system access, user management |
| MANAGER | Branch management, bookings |
| TRAINER | Train clients, view progress |
| LIFEGUARD | Pool management |
| MEMBER / USER | Personal access, bookings, workouts |
| PENDING_MEMBER | Limited access until approved |

## Pricing Plans

| Plan | Price | Features |
|------|-------|----------|
| Family Wellness | ₹4,999/month | Up to 4 family members, pool access, tea hub, AI tracking, rewards |
| Individual | ₹1,999/month | Personal access, pool, tea hub, AI tracking, rewards |
| Senior/Child | ₹999/month | Swim lessons, therapy pool, family booking link |

## Browser Support

- Chrome (recommended for MediaPipe)
- Edge
- Firefox
- Safari

## Development

### Key Files
- `src/app/page.tsx` - Landing page
- `src/app/dashboard/layout.tsx` - Dashboard layout with role-based routing
- `src/components/layout/sidebar.tsx` - Navigation sidebar
- `src/lib/hooks/use-auth.tsx` - Authentication context
- `prisma/schema.prisma` - Database schema

### Scripts
```json
{
  "dev": "next dev",
  "build": "npx prisma generate && next build",
  "start": "next start",
  "lint": "eslint",
  "prisma:seed": "ts-node --compiler-options '{\"module\":\"CommonJS\"}' prisma/seed.ts"
}
```

## License

[MIT](LICENSE)

## Contact

For issues and feature requests, please visit the [GitHub Issues](https://github.com/Kilo-Org/kilocode/issues) page.