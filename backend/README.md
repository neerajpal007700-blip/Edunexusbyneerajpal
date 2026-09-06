# EduNexus by Neeraj Pal — Backend

Node.js + Express + MongoDB REST API for the EduNexus frontend.

## Setup
1. Install Node.js 18+ and MongoDB.
2. Copy `.env.example` to `.env` and set `MONGO_URI` and a strong `JWT_SECRET`.
3. Run `npm install`.
4. Run `npm start` (or `npm run dev`).

API base: `http://localhost:5000/api`

### Auth
POST `/auth/signup` — `{name,email,password,classLevel}`
POST `/auth/login` — `{email,password}`
GET `/auth/me` — Bearer token

### Content
GET/POST/PUT/DELETE:
- `/notes`
- `/mindmaps`
- `/live-classes`
- `/videos`
- `/quizzes`

POST `/results` — submit quiz answers
GET `/results/mine` — current user's results

Admin-only content writes require `Authorization: Bearer <token>`.

## Frontend connection
Set frontend API base URL to `http://localhost:5000/api` during local development. For production, use your deployed HTTPS API URL.
