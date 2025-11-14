# KaziLink - Kenyan Youth Services Platform

A web platform connecting Kenyan youths with service opportunities and clients seeking skilled workers. Built with a hybrid architecture using MongoDB as primary database and Supabase for email verification.

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
- **Database**: MongoDB (primary) + Supabase (email verification)
- **Authentication**: JWT tokens with MongoDB user storage
- **Email Verification**: Supabase Auth
- **Payments**: M-Pesa Daraja API (planned)

## Prerequisites

- Node.js (v14 or higher)
- Supabase account
- npm or yarn

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
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Server Configuration
PORT=5000

# Email Configuration (optional, for Resend)
RESEND_API_KEY=your_resend_api_key
```

### Frontend (.env)
```bash
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Supabase Configuration (if needed)
REACT_APP_SUPABASE_URL=your_supabase_project_url
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

## Deployment

### Backend (Render)

1. Create a new account on [Render](https://render.com)

2. Connect your GitHub repository

3. Create a new Web Service:
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. Add environment variables in Render dashboard:
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string
   - `PORT`: 10000 (or Render's default)

5. Deploy and note the service URL (e.g., `https://your-backend.onrender.com`)

### Frontend (Vercel)

1. Create a new account on [Vercel](https://vercel.com)

2. Connect your GitHub repository

3. Configure the project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`

4. Add environment variables in Vercel dashboard:
   - `REACT_APP_API_URL`: Your Render backend URL + `/api` (e.g., `https://your-backend.onrender.com/api`)

5. Deploy

### MongoDB Atlas Setup

1. Create account on [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Set up database user and IP whitelist
4. Get connection string and add to backend `.env`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration (MongoDB + Supabase email)
- `POST /api/auth/login` - User login with JWT tokens
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify email status
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile
- `POST /api/auth/resend-verification` - Resend verification email

### Tasks (Planned)
- `GET /api/tasks` - Get all tasks (filtered by user role)
- `POST /api/tasks` - Create new task (clients only)
- `PATCH /api/tasks/:id/accept` - Accept task (youths only)
- `PATCH /api/tasks/:id/complete` - Mark task complete

### Admin (Planned)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/tasks` - Get all tasks
- `PATCH /api/admin/users/:id/verify` - Verify user

## Project Structure

```
kazi-connect/
├── backend/
│   ├── middleware/
│   │   └── verifySupabaseUser.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── (tasks.js, admin.js - planned)
│   ├── utils/
│   │   └── emailService.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthBackground.js
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Navbar.js
│   │   │   ├── ProtectedRoute.js
│   │   │   └── ShareInvite.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Admin.js
│   │   │   ├── AuthCallback.js
│   │   │   ├── BrowseTasks.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── PostTask.js
│   │   │   ├── Register.js
│   │   │   ├── ResetPassword.js
│   │   │   └── Verify.js
│   │   ├── utils/
│   │   │   ├── axios.js
│   │   │   └── supabase.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env
├── TODO.md
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support or questions, please open an issue in the GitHub repository.
