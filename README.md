# KaziLink - Kenyan Youth Services Platform

A web platform connecting Kenyan youths with service opportunities and clients seeking skilled workers. Built with a hybrid architecture using MongoDB as primary database and Supabase for email verification and real-time features.

## Features

### For Clients
- Post tasks with location, price, and description
- Browse and hire available youths
- Pay via M-Pesa integration (planned)
- Rate and review completed services

### For Youths (Taskers)
- Create profiles with skills and location
- Browse nearby tasks
- Accept or decline offers
- Get paid for completed work
- Build reputation through ratings

### Admin Panel
- Manage users and tasks
- Verify youth identities
- Monitor platform activity
- Handle disputes

## Tech Stack

- **Frontend**: React + Tailwind CSS + React Router
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (primary) + Supabase (email verification and real-time features)
- **Authentication**: JWT tokens with MongoDB user storage
- **Email Verification**: Supabase Auth
- **Real-time**: Supabase real-time subscriptions for notifications
- **Payments**: M-Pesa Daraja API (planned)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB instance
- Supabase account
- npm or yarn

## Environment Variables Setup

**Important**: Never commit `.env` files to version control. They contain sensitive information.

### Backend Environment Variables

Create `backend/.env` with:
```bash
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kazilink?retryWrites=true&w=majority

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_key

# Server Configuration
PORT=5000
NODE_ENV=development

# Email Configuration (optional, for Resend)
RESEND_API_KEY=your_resend_api_key

# Frontend URL for password reset redirects
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables

Create `frontend/.env` with:
```bash
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd kazi-connect
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Set up environment variables:

### Backend (.env)
```bash
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kazilink?retryWrites=true&w=majority

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_key

# Server Configuration
PORT=5000
NODE_ENV=development

# Email Configuration (optional, for Resend)
RESEND_API_KEY=your_resend_api_key

# Frontend URL for password reset redirects
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```bash
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Development

1. Start the backend server:
```bash
cd backend
npm start
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Database Setup

### MongoDB Atlas Setup

1. Create account on [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Set up database user and IP whitelist
4. Get connection string and add to backend `.env` as `MONGODB_URI`

### Supabase Setup

1. Create account on [Supabase](https://supabase.com)
2. Create a new project
3. Go to Settings > API to get your project URL and keys
4. Configure authentication settings in Authentication > Settings
5. Set up database tables using the SQL files in `supabase/` directory

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration (MongoDB + Supabase email)
- `POST /api/auth/login` - User login with JWT tokens
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify email status
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile
- `POST /api/auth/resend-verification` - Resend verification email
- `POST /api/auth/forgot-password` - Send password reset email
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/user/:id` - Get user by ID (for applicants modal)

### Tasks
- `GET /api/tasks` - Get all tasks (filtered by user role)
- `POST /api/tasks` - Create new task (clients only)
- `GET /api/tasks/:id` - Get task by ID
- `PATCH /api/tasks/:id` - Update task (clients only)
- `PATCH /api/tasks/:id/accept` - Apply for task (youths only)
- `PATCH /api/tasks/:id/accept-applicant` - Accept applicant (clients only)
- `PATCH /api/tasks/:id/assign/:userId` - Assign task to user (admin/clients)
- `PATCH /api/tasks/:id/complete` - Mark task complete (assigned youth)
- `PATCH /api/tasks/:id/complete-client` - Mark task complete (client)
- `DELETE /api/tasks/:id` - Delete task (clients only)

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/tasks` - Get all tasks (admin only)
- `PATCH /api/admin/users/:id/verify` - Verify user (admin only)
- `PATCH /api/admin/users/:id/deactivate` - Deactivate user (admin only)
- `DELETE /api/admin/tasks/:id` - Delete task (admin only)
- `GET /api/admin/stats` - Get platform statistics (admin only)

### Chat Synchronization
- `POST /api/chatsync/webhook` - Supabase webhook for chat messages

## Project Structure

```
kazi-connect/
├── backend/
│   ├── middleware/
│   │   └── verifySupabaseUser.js    # JWT authentication middleware
│   ├── routes/
│   │   ├── admin.js                 # Admin management routes
│   │   ├── auth.js                  # Authentication routes
│   │   ├── tasks.js                 # Task management routes
│   │   └── chatSync.js              # Chat webhook routes
│   ├── models/
│   │   ├── User.js                  # User MongoDB schema
│   │   ├── Task.js                  # Task MongoDB schema
│   │   └── ChatMessage.js           # Chat message MongoDB schema
│   ├── utils/
│   │   └── emailService.js          # Email utility functions
│   ├── supabaseClient.js            # Supabase client configuration
│   ├── server.js                    # Express server setup
│   ├── package.json
│   └── .env                         # Environment variables
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json
│   │   └── favicon_io/              # Favicon files
│   ├── src/
│   │   ├── components/
│   │   │   ├── App.js               # Main app component with routing
│   │   │   ├── AuthBackground.js    # Authentication background component
│   │   │   ├── LandingPage.jsx      # Landing page component
│   │   │   ├── UserNavbar.js        # Navigation for authenticated users
│   │   │   ├── PublicNavbar.js      # Navigation for public pages
│   │   │   ├── ProtectedRoute.js    # Route protection component
│   │   │   ├── ShareInvite.js       # Social sharing component
│   │   │   ├── EditTaskModal.jsx    # Task editing modal
│   │   │   ├── ApplicantsModal.jsx  # Task applicants modal
│   │   │   ├── chat/
│   │   │   │   ├── ChatModal.jsx    # Chat interface modal
│   │   │   │   └── ChatWindow.jsx   # Chat window component
│   │   ├── context/
│   │   │   ├── AuthContext.js       # Authentication state management
│   │   │   └── RealtimeContext.js   # Real-time notifications context
│   │   ├── pages/
│   │   │   ├── Home.js              # Home/landing page
│   │   │   ├── Register.js          # User registration page
│   │   │   ├── Login.js             # User login page
│   │   │   ├── VerifyEmail.js       # Email verification page
│   │   │   ├── AuthCallback.js      # Supabase auth callback page
│   │   │   ├── ResetPassword.js     # Password reset page
│   │   │   ├── Dashboard.js         # User dashboard
│   │   │   ├── MyTasks.js           # Client task management
│   │   │   ├── PostTask.js          # Task creation page
│   │   │   ├── BrowseTasks.js       # Youth task browsing
│   │   │   ├── Admin.js             # Admin panel
│   │   │   ├── Profile.js           # User profile page
│   │   │   └── Verify.js            # Account verification page
│   │   ├── utils/
│   │   │   ├── axios.js             # HTTP client configuration
│   │   │   ├── supabase.js          # Supabase client setup
│   │   │   └── realtime.js          # Real-time subscription utilities
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env                         # Frontend environment variables
├── supabase/
│   ├── create_chat_tables.sql       # Chat database schema
│   ├── chat_rls_policies.sql        # Row Level Security policies
│   ├── realtime_events.sql          # Real-time events table
│   ├── add_sender_fields_to_chat_messages.sql
│   └── README-realtime.md           # Real-time setup guide
├── .gitignore                       # Git ignore rules
├── package.json                     # Root package configuration
├── README.md                        # This file
└── TODO.md                          # Project task list
```

## Security Notes

- JWT tokens are stored in httpOnly cookies for security
- Passwords are hashed using bcrypt with salt rounds
- Supabase service role keys are used server-side only
- Environment variables contain sensitive configuration
- Row Level Security (RLS) policies protect Supabase data
- CORS is configured to allow specific origins only

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Testing

Run tests for both frontend and backend:

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd ../frontend
npm test
```

## Deployment

### Backend (Render)

1. Create a new account on [Render](https://render.com)
2. Connect your GitHub repository
3. Create a new Web Service:
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add environment variables in Render dashboard
5. Deploy

### Frontend (Vercel)

1. Create account on [Vercel](https://vercel.com)
2. Connect GitHub repository
3. Configure build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
4. Add environment variables
5. Deploy

## License

This project is licensed under the ISC License.

## Support

For support or questions, please open an issue in the GitHub repository.
