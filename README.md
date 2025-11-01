now# Kenyan Youth Services Platform

A web platform connecting Kenyan youths with service opportunities and clients seeking skilled workers. Built with MERN stack (MongoDB, Express.js, React, Node.js).

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

- **Frontend**: React + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **Payments**: M-Pesa Daraja API (planned)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd kenyan-youth-services
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
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### Frontend (.env)
```bash
cp .env.example .env
# Edit .env with your API URL (for production deployment)
```

## Development

1. Start MongoDB locally or use MongoDB Atlas

2. Start the backend server:
```bash
cd backend
npm run dev  # or npm start
```

3. Start the frontend development server:
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: https://kazi-connect-five.vercel.app
- Backend: https://kazi-connect.onrender.com

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
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Tasks
- `GET /api/tasks` - Get all tasks (filtered by user role)
- `POST /api/tasks` - Create new task (clients only)
- `PATCH /api/tasks/:id/accept` - Accept task (youths only)
- `PATCH /api/tasks/:id/complete` - Mark task complete

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/tasks` - Get all tasks
- `PATCH /api/admin/users/:id/verify` - Verify user

## Project Structure

```
kenyan-youth-services/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── tasks.js
│   │   └── admin.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   └── App.js
│   ├── package.json
│   └── .env.example
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
