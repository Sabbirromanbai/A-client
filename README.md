# GoodTogether — Together We Make Change 🌱

**GoodTogether** is a community-driven social development platform where people can create, discover, join, and manage social service events. It helps communities work together to make a positive impact.

🔗 **Live Website:** https://a-client-beta.vercel.app

## ✨ Key Features

- **Authentication System:** Secure email/password authentication with Google sign-in using Better Auth.
- **Upcoming Events:** Discover upcoming social service events with search and category filtering.
- **Create Events:** Authenticated users can create events with descriptions, images, locations, categories, and future dates.
- **Join Events:** Users can join or leave events and participate in community activities.
- **Joined Events:** View and manage all joined events in one place.
- **Manage Events:** Event creators can update or delete their own events.
- **Protected Routes:** Private pages and APIs are protected with authentication and JWT verification.
- **Responsive Design:** User-friendly interface for mobile, tablet, and desktop devices.
- **Dark & Light Theme:** Switch between light and dark modes.

## 🛠️ Technologies Used

**Frontend**
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide React
- Better Auth

**Backend**
- Node.js
- Express.js
- MongoDB Native Driver
- JWT Authentication (JOSE)

## 🚀 Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/Sabbirromanbai/A-client.git
cd A-client
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file and add the required environment variables. Use the
frontend origin for both Better Auth URL variables and the API origin (without
an `/api` suffix) for `NEXT_PUBLIC_API_URL`:

```env
NEXT_PUBLIC_API_URL=https://a-server-eo2d.onrender.com
NEXT_PUBLIC_BETTER_AUTH_URL=https://a-client-beta.vercel.app
BETTER_AUTH_URL=https://a-client-beta.vercel.app
MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING
DB_NAME=YOUR_DATABASE_NAME
BETTER_AUTH_SECRET=YOUR_BETTER_AUTH_SECRET
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
```

Use the same `MONGODB_URI` and `DB_NAME` for the frontend and backend. Configure
the Render backend with `MONGODB_URI`, `DB_NAME`,
`BETTER_AUTH_URL=https://a-client-beta.vercel.app`, and
`CLIENT_URL=https://a-client-beta.vercel.app`. Register
`https://a-client-beta.vercel.app/api/auth/callback/google` as the authorized
Google OAuth redirect URI.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Project Goal

GoodTogether aims to make social development activities easier to organize by connecting people who want to contribute to their communities.

**Together We Make Change. 💚**

---

Developed as part of **Programming Hero — Batch 14, Assignment 08**.
