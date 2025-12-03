# CTF War

A modern Capture The Flag (CTF) platform built with React, TypeScript, Express, and Supabase.

## Features

- 🎯 Challenge management with multiple categories and difficulties
- 👥 Team-based and individual competitions
- 🏆 Real-time leaderboards
- 🔐 Secure authentication and authorization
- 📁 File upload support for challenge files
- 💡 Hint system with point penalties
- 🚀 Built with modern tech stack

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development
- TailwindCSS for styling
- Zustand for state management
- React Router for navigation

### Backend
- Node.js with Express
- TypeScript
- Supabase for database (PostgreSQL)
- JWT authentication
- Redis for caching and sessions

## Prerequisites

- Node.js 18+ and npm
- Redis server
- Supabase account and project

## Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and configure:

```env
# Supabase Configuration
SUPABASE_URL="your-supabase-url"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SUPABASE_ANON_KEY="your-anon-key"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=3001
NODE_ENV=development

# File Upload Configuration
UPLOAD_DIR="uploads"
MAX_FILE_SIZE=10485760

# Redis Configuration
REDIS_URL="redis://localhost:6379"

# CORS Configuration
CORS_ORIGIN="http://localhost:5173"
```

## Database Setup

The platform uses Supabase as the database backend. The database schema includes:

- Users (authentication and profiles)
- Teams (team management)
- Challenges (CTF challenges)
- Submissions (user submissions)
- Solves (successful challenge completions)
- Competitions (CTF competitions)
- Hints (challenge hints)
- Challenge Files (downloadable files)

### Setting up Supabase

1. Create a new Supabase project at https://supabase.com
2. Get your project URL and service role key from Settings > API
3. Create the database tables using the Supabase SQL editor
4. Update your `.env` file with the credentials

## Installation

```bash
# Install dependencies
npm install

# Start Redis (if using Docker)
docker-compose up -d

# Run development server (both frontend and backend)
npm run dev

# Or run them separately
npm run client:dev  # Frontend only
npm run server:dev  # Backend only
```

## Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Project Structure

```
├── api/                    # Backend API
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── lib/          # Utilities and Supabase client
│   │   ├── routes/       # API routes
│   │   └── scripts/      # Utility scripts
│   ├── app.ts            # Express app setup
│   ├── index.ts          # API entry point
│   └── server.ts         # Server configuration
├── src/                   # Frontend source
│   ├── components/       # React components
│   ├── pages/           # Page components
│   ├── stores/          # Zustand stores
│   ├── hooks/           # Custom hooks
│   └── lib/             # Utilities
├── public/              # Static assets
└── uploads/            # Challenge file uploads
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Challenges
- `GET /api/challenges` - List all challenges
- `GET /api/challenges/:id` - Get challenge details
- `POST /api/challenges/:id/submit` - Submit flag
- `POST /api/challenges` - Create challenge (admin)
- `PUT /api/challenges/:id` - Update challenge (admin)
- `DELETE /api/challenges/:id` - Delete challenge (admin)

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard (individual/team)
- `GET /api/leaderboard/statistics` - Get platform statistics

### Teams
- `POST /api/teams` - Create team
- `POST /api/teams/join` - Join team with invite code
- `POST /api/teams/leave` - Leave current team
- `GET /api/teams/me` - Get current team

## Admin Setup

To create an admin user:

```bash
# Set environment variables
$env:ADMIN_EMAIL="admin@example.com"
$env:ADMIN_USERNAME="admin"
$env:ADMIN_PASSWORD="YourSecurePassword"

# Run the script
npx tsx api/src/scripts/createAdmin.ts
```

## Development

### Type Checking
```bash
npm run check
```

### Linting
```bash
npm run lint
```

## License

MIT

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.