# ApplicantHub — Career Management Platform

A full-stack applicant tracking system built with React + Vite (frontend) and Node.js + Express + Neon PostgreSQL (backend).

## Features

- **Admin-only login** — username stored in `.env`, only password entered in UI
- **Kanban board** — Accepted / Pending / Rejected columns, 10 applicants per column
- **Full CRUD** — Add, edit, delete applicants with photo upload
- **Job assignment** — Assign applicants to job positions
- **Pagination** — Per-column page navigation
- **Dark / Light mode**
- **Responsive** — Mobile, tablet, desktop

## Tech Stack

| Layer    | Tech |
|----------|------|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS v4, Framer Motion, Redux Toolkit, TanStack Query |
| Backend  | Node.js, Express.js, raw pg (Neon serverless) |
| Database | Neon PostgreSQL (serverless) |
| Storage  | Cloudinary (photo uploads) |
| Auth     | JWT (access + refresh tokens) |

## Project Structure

```
career-hub/
├── backend/          # Express REST API
│   ├── src/
│   │   ├── config/   # DB connection (Neon pg)
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── utils/
│   ├── prisma/seed.js  # DB setup + seed script
│   └── .env.example
└── frontend/         # React + Vite SPA
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── store/      # Redux Toolkit
    │   ├── services/   # Axios API layer
    │   └── types/
    └── .env.example
```

## Local Setup

### 1. Clone

```bash
git clone https://github.com/HailuBoc/career-hub.git
cd career-hub
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set DATABASE_URL, JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD
node prisma/seed.js   # Creates tables + seeds data
npm run dev           # Starts on http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev           # Starts on http://localhost:5173
```

## Deployment

### Backend (Railway / Render / Fly.io)

1. Set all environment variables from `.env.example`
2. Set `NODE_ENV=production`
3. Build command: `npm install`
4. Start command: `node src/server.js`
5. Run seed once: `node prisma/seed.js`

### Frontend (Vercel / Netlify)

1. Build command: `npm run build`
2. Output directory: `dist`
3. Set `VITE_API_URL` to your backend URL
4. Update `vite.config.ts` proxy or use `VITE_API_URL` env var

### Update `vite.config.ts` for production

```ts
server: {
  proxy: {
    '/api': {
      target: process.env.VITE_API_URL || 'http://localhost:5000',
      changeOrigin: true,
    },
  },
},
```

## Admin Login

- Open the app → click **Admin Login**
- Enter the password set in `ADMIN_PASSWORD` env var
- Username is never exposed to the client

## Demo Credentials (seed data)

```
Password: Admin@123456
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | — | Admin login (password only) |
| GET | `/api/auth/me` | ✅ | Get current admin |
| GET | `/api/applicants` | — | Get all applicants (grouped by status) |
| POST | `/api/applicants` | ✅ | Create applicant |
| PUT | `/api/applicants/:id` | ✅ | Update applicant |
| PATCH | `/api/applicants/:id/status` | ✅ | Update status only |
| DELETE | `/api/applicants/:id` | ✅ | Delete applicant |
| GET | `/api/jobs` | — | List all jobs |
| POST | `/api/jobs` | ✅ | Create job |
| PUT | `/api/jobs/:id` | ✅ | Update job |
| DELETE | `/api/jobs/:id` | ✅ | Delete job |
