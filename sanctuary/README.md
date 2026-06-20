# The Sanctuary — Hotel Booking Website

A full-stack luxury hotel booking website with room browsing, dining menu, user accounts with email/OTP verification, secure admin panel, and booking management.

**Live site:** https://sanctuary-hotel.vercel.app

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Tailwind CSS, Framer Motion |
| UI Components | Radix UI (shadcn-style) |
| Backend | FastAPI (Python) |
| Database | MongoDB Atlas |
| Auth | JWT tokens + email OTP verification |
| Transactional Email | Brevo API |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |
| Images | Unsplash (CDN) |

---

## Project Structure

```
sanctuary/
├── backend/
│   ├── server.py          ← FastAPI app (auth, rooms, bookings, menu, email)
│   ├── requirements.txt   ← Python dependencies
│   ├── Procfile            ← Render start command
│   ├── runtime.txt         ← Python version
│   ├── .npmrc               ← (frontend) legacy-peer-deps config
│   └── .env.example        ← Environment variables template
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.js
    │   ├── index.js
    │   ├── styles/
    │   │   └── index.css
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Footer.jsx
    │   │   ├── AdminLayout.jsx
    │   │   └── ui/
    │   │       ├── button.jsx
    │   │       ├── input.jsx
    │   │       ├── textarea.jsx
    │   │       ├── badge.jsx
    │   │       ├── select.jsx
    │   │       ├── dialog.jsx
    │   │       ├── tabs.jsx
    │   │       ├── popover.jsx
    │   │       ├── calendar.jsx
    │   │       ├── dropdown-menu.jsx
    │   │       └── sonner.jsx
    │   ├── lib/
    │   │   └── utils.js
    │   └── pages/
    │       ├── HomePage.jsx
    │       ├── RoomsPage.jsx
    │       ├── RoomDetailPage.jsx
    │       ├── MenuPage.jsx
    │       ├── AuthPage.jsx        ← Sign in / Sign up / OTP verification
    │       ├── DashboardPage.jsx   ← Bookings + Security (change password)
    │       └── admin/
    │           ├── AdminDashboard.jsx
    │           ├── AdminRooms.jsx
    │           ├── AdminMenu.jsx
    │           └── AdminBookings.jsx
    ├── package.json
    ├── tailwind.config.js
    └── postcss.config.js
```

---

## Features

- **Public browsing** — anyone can view rooms, availability, and the dining menu without an account
- **Booking requires login** — guests are prompted to sign in before confirming a booking
- **Email + OTP signup verification** — new accounts must verify a 6-digit code sent to their email before the account is active; only valid, real email addresses can register
- **Welcome email** — sent automatically after successful OTP verification, with a link to start booking
- **Change password** — logged-in users can change their password from Dashboard → Security
- **Failed login lockout** — 5 incorrect password attempts locks the account for 15 minutes
- **Inline error handling** — invalid email/password/OTP errors are shown directly on the form; the user is never redirected away on error
- **Single hard-coded admin account** — only one email/password combination can ever log in as admin (see below); no other account can self-promote to admin, and there is no demo/shared admin login

---

## Admin Access

```
Email:    shishirgyawali222@gmail.com
Password: Shishir$1234
```

This is the **only** account that can access `/admin`. It is enforced directly in the backend (`server.py`), not stored as a regular toggle — no other user, regardless of role field manipulation, can log in as admin.

Admin can:
- View all bookings, and confirm / cancel / complete them
- Add, edit, delete rooms
- Add, edit, delete menu items

---

## STEP 1 — Install Prerequisites

```bash
# Check Node.js (need v18+)
node --version

# Check Python (need 3.11+)
python --version

# Check npm
npm --version
```

- Node.js: https://nodejs.org
- Python: https://python.org
- Git: https://git-scm.com

---

## STEP 2 — Set Up MongoDB Atlas (Free Database)

1. Go to https://www.mongodb.com/cloud/atlas → **Try Free**
2. Choose the **Free** tier (M0 Sandbox)
3. Pick any cloud provider/region, name your cluster
4. Click **Create Cluster** (~2 minutes)

**Get your connection string:**
5. Click **Connect** → **Drivers** → Python, version 3.12+
6. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. Replace `<username>` / `<password>` with your credentials

**Allow all IPs (required for cloud deployment):**
8. Go to **Network Access** → **Add IP Address** → **Allow Access from Anywhere** → Confirm

---

## STEP 3 — Set Up Brevo (Transactional Email)

OTP and welcome emails are sent via the **Brevo API** (not SMTP — most free hosting tiers, including Render's free plan, block outbound SMTP ports).

1. Sign up free at https://brevo.com
2. Go to **Settings → SMTP & API → API Keys & MCP**
3. Click **Generate API key** → name it → no expiration → **Generate**
4. Copy the key immediately (starts with `xkeysib-...`) — it's shown only once
5. Go to **Settings → Senders, domains, IPs → Senders** → **Add a sender**
   - Email: the address you want emails to appear "from" (e.g. `shishirgyawali222@gmail.com`)
   - Click **Add this sender anyway** if prompted about free email providers
   - Verify it via the confirmation email Brevo sends

> Free tier: 300 emails/day, sends to any recipient once your sender is verified (no domain purchase required).

---

## STEP 4 — Run Backend Locally

```bash
cd sanctuary/backend

# Create and activate a virtual environment
python -m venv venv
# Mac/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create your .env file
cp .env.example .env
```

Edit `backend/.env`:
```
MONGO_URL="mongodb+srv://youruser:yourpass@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority"
DB_NAME="sanctuary_hotel"
JWT_SECRET="pick-any-long-random-string-here-keep-it-secret"
CORS_ORIGINS="http://localhost:3000"

ADMIN_EMAIL="shishirgyawali222@gmail.com"
ADMIN_PASSWORD="Shishir$1234"

BREVO_API_KEY="your-brevo-api-key"
SMTP_FROM_NAME="The Sanctuary Hotel"
```

```bash
uvicorn server:app --reload --port 8000
```

✅ Visit http://localhost:8000/api — should return `{"message":"The Sanctuary Hotel API"}`

---

## STEP 5 — Run Frontend Locally

Open a **new terminal**:

```bash
cd sanctuary/frontend
npm install
echo "REACT_APP_BACKEND_URL=http://localhost:8000" > .env
npm start
```

✅ Visit http://localhost:3000

The app auto-seeds rooms and menu items on first load (no demo admin account is created — admin access is governed entirely by `ADMIN_EMAIL` / `ADMIN_PASSWORD`).

---

## STEP 6 — Push to GitHub

```bash
cd sanctuary
git init
git add .
git commit -m "Initial commit: The Sanctuary hotel website"
```

Create a repo on GitHub (`sanctuary-hotel`, Public), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/sanctuary-hotel.git
git branch -M main
git push -u origin main
```

For future changes:
```bash
git add .
git commit -m "describe what you changed"
git push
```
Both Render and Vercel auto-redeploy on every push to `main`.

---

## STEP 7 — Deploy Backend on Render

1. Go to https://render.com → sign up with GitHub
2. **New** → **Web Service** → select `sanctuary-hotel` repo
3. **Root Directory:** `backend`
4. **Runtime:** Python 3
5. **Build Command:** `pip install -r requirements.txt`
6. **Start Command:** `uvicorn server:app --host 0.0.0.0 --port $PORT`

**Add environment variables** (Environment tab):

```
MONGO_URL        = mongodb+srv://youruser:yourpass@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
DB_NAME          = sanctuary_hotel
JWT_SECRET       = your-super-secret-key-change-this
CORS_ORIGINS     = https://your-frontend.vercel.app,http://localhost:3000

ADMIN_EMAIL      = shishirgyawali222@gmail.com
ADMIN_PASSWORD   = Shishir$1234

BREVO_API_KEY    = your-brevo-api-key
SMTP_FROM_NAME   = The Sanctuary Hotel
```

(Update `CORS_ORIGINS` with your real Vercel URL after Step 8.)

7. **Save Changes / Deploy** → wait for the green "Live" status
8. Render gives you a URL like: `https://sanctuary-hotel.onrender.com`

✅ Test: visit `https://your-render-url.onrender.com/api` — should return the API message

> **Note:** Render's free tier spins down after inactivity, which can delay the first request by ~50 seconds.

---

## STEP 8 — Deploy Frontend on Vercel

1. Go to https://vercel.com → sign up with GitHub
2. **New Project** → import `sanctuary-hotel`
3. **Root Directory:** `frontend`
4. Framework Preset: **Create React App** (auto-detected)

**Add environment variables:**
```
REACT_APP_BACKEND_URL = https://your-render-url.onrender.com
CI                     = false
```

> `CI=false` is required — without it, Vercel treats build warnings (common with React/npm deprecation notices) as hard failures.

5. **Deploy** → wait ~2-3 minutes
6. Vercel gives you a URL like: `https://sanctuary-hotel.vercel.app`

---

## STEP 9 — Update CORS on Render

1. Go back to Render → your service → **Environment**
2. Update `CORS_ORIGINS` to your actual Vercel URL:
   ```
   CORS_ORIGINS = https://sanctuary-hotel.vercel.app,http://localhost:3000
   ```
3. Save — Render auto-redeploys

---

## STEP 10 — Final Test

| Feature | How to test |
|---|---|
| Homepage | Loads with hero image and booking widget; logo appears beside "The Sanctuary" |
| Rooms | `/rooms` — visible without logging in |
| Menu | `/menu` — all dishes load with images, including Eggs Benedict |
| Sign up | Create an account with a real email → receive OTP → verify → receive welcome email |
| Invalid email | Try signing up/logging in with a malformed email → inline error, no redirect |
| Wrong password 5x | Account locks for 15 minutes with a clear message |
| Booking while logged out | Rooms are visible but booking redirects/requires login |
| Admin login | `shishirgyawali222@gmail.com` / `Shishir$1234` → `/admin` |
| Old demo admin | `admin@sanctuary.com` / `admin123` → should fail |
| Change password | Dashboard → Security tab |
| Admin panel | `/admin` — dashboard, manage rooms/menu/bookings |

---

## Troubleshooting

**"Cannot connect to backend"**
→ Check `REACT_APP_BACKEND_URL` in Vercel has no trailing slash
→ Check Render service shows "Live" (green)

**"CORS error" in browser console**
→ Update `CORS_ORIGINS` in Render to include your exact Vercel URL

**MongoDB connection failed**
→ Check `MONGO_URL` in Render variables
→ Ensure Atlas Network Access allows `0.0.0.0/0`

**OTP / welcome emails not arriving**
→ Confirm `BREVO_API_KEY` is set in Render
→ Confirm the sender email is **Verified** in Brevo → Senders
→ Check Render → Logs for `Failed to send email to...` errors
→ Do **not** use SMTP on Render's free tier — it blocks outbound SMTP ports (`Network is unreachable`); the Brevo HTTPS API is used instead for this reason

**Vercel build fails with "npm run build exited with 1"**
→ Ensure `CI=false` is set in Vercel environment variables
→ Check `package.json` has valid JSON (no stray braces around `"engines"`)

**Vercel build fails with "invalid or discontinued Node.js version"**
→ Update `"engines": { "node": "24.x" }` in `frontend/package.json`

**Frontend shows blank page after an action**
→ Usually means a frontend error is being thrown trying to render a non-string error response (e.g. FastAPI 422 validation errors return an array, not a string) — check the browser console and ensure error handling extracts a string message before rendering it

**Seed data not loading**
→ Visit `https://your-render-url.onrender.com/api/seed` directly (POST request), or:
  ```bash
  curl -X POST https://your-render-url.onrender.com/api/seed
  ```

---

## Security Notes

- Admin access is restricted to a single hard-coded email/password pair, validated server-side on every login — it cannot be bypassed by editing a user's role in the database
- Passwords are hashed with bcrypt before storage
- JWT tokens expire after 24 hours
- Failed login attempts are rate-limited (5 attempts → 15-minute lockout)
- New accounts must verify a one-time email code before they can sign in
- Regenerate `JWT_SECRET`, `ADMIN_PASSWORD`, and `BREVO_API_KEY` before going to production with real users — none of the values in this README should be used as-is

---

## Optional Enhancements

- **Custom domain** — buy on Namecheap/Hostinger, connect to Vercel for free; also enables Brevo domain authentication for better email deliverability
- **Payments** — integrate Stripe for real transactions
- **Image uploads** — add Cloudinary instead of static Unsplash URLs for room/menu photos
