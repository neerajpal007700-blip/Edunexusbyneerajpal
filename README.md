# EduNexus by Neeraj Pal — Complete Full-Stack Project

This package combines the supplied EduNexus frontend with the Node/Express/MongoDB backend.

## Stack
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: JWT + bcryptjs

## Run
1. Install Node.js 18+ and MongoDB.
2. Open a terminal in `backend/`.
3. Run `npm install`.
4. Copy `.env.example` to `.env` and set `MONGO_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.
5. Run `npm start` (or `npm run dev` after installing nodemon).
6. Open `http://localhost:5000/`.

The Express server serves the frontend and API from one origin, so no frontend API URL configuration is required.

## API
- GET `/api/health`
- POST `/api/auth/signup`
- POST `/api/auth/login`
- GET `/api/auth/me`
- GET/POST/PUT/DELETE `/api/notes`
- GET/POST/PUT/DELETE `/api/mindmaps`
- GET/POST/PUT/DELETE `/api/live-classes`
- GET/POST/PUT/DELETE `/api/videos`
- GET/POST/PUT/DELETE `/api/quizzes`
- POST `/api/results`
- GET `/api/results/mine`
- GET `/api/admin/stats` (admin token)

Public content endpoints return published content. Create/update/delete operations require an admin JWT.

## Frontend integration
`frontend/api.js` provides the shared API client, token handling, login/signup integration, logout handling, and authenticated requests. Login and signup forms are connected to the backend.

## Admin
The first admin is created automatically from `ADMIN_EMAIL` and `ADMIN_PASSWORD` when the server starts and the account does not already exist.

Never commit `.env` or real credentials.
