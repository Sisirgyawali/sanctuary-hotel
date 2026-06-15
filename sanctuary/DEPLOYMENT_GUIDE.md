# The Sanctuary — Full Deployment Guide
## React + FastAPI + MongoDB Atlas → Vercel + Railway

---

## PROJECT STRUCTURE

```
sanctuary/
├── backend/
│   ├── server.py          ← FastAPI app
│   ├── requirements.txt   ← Python dependencies
│   ├── Procfile           ← Railway start command
│   ├── runtime.txt        ← Python version
│   └── .env.example       ← Environment variables template
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
    │       ├── AuthPage.jsx
    │       ├── DashboardPage.jsx
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

## STEP 1 — INSTALL PREREQUISITES

Make sure you have these installed on your machine:

```bash
# Check Node.js (need v18+)
node --version

# Check Python (need 3.11+)
python --version

# Check npm
npm --version

# If Node.js is missing, download from: https://nodejs.org
# If Python is missing, download from: https://python.org
```

Install Git if not already:
- Download from: https://git-scm.com

---

## STEP 2 — SET UP MONGODB ATLAS (Free Database)

1. Go to https://www.mongodb.com/cloud/atlas
2. Click **"Try Free"** → Create an account
3. Choose **"Free"** tier (M0 Sandbox)
4. Select a cloud provider and region (any is fine)
5. Name your cluster (e.g., `sanctuary-cluster`)
6. Click **"Create Cluster"** (takes ~2 minutes)

**Get your connection string:**
7. In Atlas, click **"Connect"** on your cluster
8. Choose **"Drivers"**
9. Select **Python** and version **3.12 or later**
10. Copy the connection string — it looks like:
    ```
    mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
    ```
11. Replace `<username>` and `<password>` with your credentials

**Allow all IPs (for deployment):**
12. Go to **Network Access** in Atlas sidebar
13. Click **"Add IP Address"**
14. Choose **"Allow Access from Anywhere"** → Confirm

---

## STEP 3 — RUN BACKEND LOCALLY

```bash
# Navigate to backend folder
cd sanctuary/backend

# Create a virtual environment
python -m venv venv

# Activate it:
# On Mac/Linux:
source venv/bin/activate
# On Windows:
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
```

```bash
# Start the backend
uvicorn server:app --reload --port 8000
```

✅ Visit http://localhost:8000/api — you should see: `{"message":"The Sanctuary Hotel API"}`

---

## STEP 4 — RUN FRONTEND LOCALLY

Open a **new terminal**:

```bash
# Navigate to frontend folder
cd sanctuary/frontend

# Install all packages (this takes 2-3 minutes)
npm install

# Create your .env file
echo "REACT_APP_BACKEND_URL=http://localhost:8000" > .env

# Start the React app
npm start
```

✅ Visit http://localhost:3000 — your hotel website is running!

**Seed initial data:**
- The app auto-seeds on first load
- Admin login: `admin@sanctuary.com` / `admin123`

---

## STEP 5 — PUSH TO GITHUB

```bash
# Initialize git in the sanctuary folder
cd sanctuary
git init
git add .
git commit -m "Initial commit: The Sanctuary hotel website"
```

Create a new repository on GitHub:
1. Go to https://github.com → click **"New"**
2. Name it `sanctuary-hotel`
3. Keep it **Public** (free deployment works better)
4. Click **"Create repository"**

```bash
# Link and push
git remote add origin https://github.com/YOUR_USERNAME/sanctuary-hotel.git
git branch -M main
git push -u origin main
```

---

## STEP 6 — DEPLOY BACKEND ON RAILWAY

Railway is the easiest place to deploy FastAPI for free.

1. Go to https://railway.app
2. Sign up with your GitHub account
3. Click **"New Project"**
4. Choose **"Deploy from GitHub repo"**
5. Select `sanctuary-hotel`
6. Railway will detect the `backend/` folder

**Set start command:**
- In Railway project settings → click your service
- Go to **Settings** → **Deploy** → **Start Command**
- Enter: `uvicorn server:app --host 0.0.0.0 --port $PORT`
- Set **Root Directory** to: `backend`

**Add environment variables in Railway:**
- Click your service → **Variables** tab → **Add Variable**

```
MONGO_URL     = mongodb+srv://youruser:yourpass@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
DB_NAME       = sanctuary_hotel
JWT_SECRET    = your-super-secret-key-change-this
CORS_ORIGINS  = https://your-frontend.vercel.app,http://localhost:3000
```
(You'll update CORS_ORIGINS after deploying frontend)

7. Click **Deploy** → wait for green checkmark
8. Railway gives you a URL like: `https://sanctuary-hotel-production.up.railway.app`

✅ Test it: visit `https://your-railway-url.railway.app/api` — should return API message

---

## STEP 7 — DEPLOY FRONTEND ON VERCEL

1. Go to https://vercel.com
2. Sign up with your GitHub account
3. Click **"New Project"**
4. Import `sanctuary-hotel` from GitHub
5. Set **Root Directory** to: `frontend`
6. Framework Preset: **Create React App** (auto-detected)

**Add environment variable:**
- Click **"Environment Variables"**
- Add:
  ```
  REACT_APP_BACKEND_URL = https://your-railway-url.up.railway.app
  ```
  (Use your actual Railway URL from Step 6)

7. Click **"Deploy"** → wait ~2 minutes
8. Vercel gives you a URL like: `https://sanctuary-hotel.vercel.app`

---

## STEP 8 — UPDATE CORS ON RAILWAY

Now that you have your Vercel URL, update the backend:

1. Go back to Railway → your service → **Variables**
2. Update `CORS_ORIGINS`:
   ```
   CORS_ORIGINS = https://sanctuary-hotel.vercel.app,http://localhost:3000
   ```
3. Railway auto-redeploys

---

## STEP 9 — FINAL TEST

Visit your Vercel URL and test:

| Feature | How to test |
|---------|-------------|
| Homepage | Should load with hero image and booking widget |
| Rooms | Click "Rooms" — see 5 hotel rooms |
| Menu | Click "Dining" — see food categories |
| Sign up | Create an account |
| Admin login | admin@sanctuary.com / admin123 |
| Make booking | Go to a room, pick dates, book it |
| Admin panel | /admin — see dashboard, manage rooms/menu/bookings |

---

## ADMIN CREDENTIALS

```
Email:    admin@sanctuary.com
Password: admin123
```

Admin can:
- View all bookings
- Confirm / Cancel / Complete bookings
- Add, edit, delete rooms
- Add, edit, delete menu items

---

## TROUBLESHOOTING

**"Cannot connect to backend"**
→ Check REACT_APP_BACKEND_URL in Vercel — must NOT have trailing slash
→ Check Railway service is running (green dot)

**"CORS error" in browser console**
→ Update CORS_ORIGINS in Railway to include your exact Vercel URL

**"MongoDB connection failed"**
→ Check MONGO_URL is correct in Railway variables
→ Ensure Atlas Network Access allows 0.0.0.0/0

**"Seed data not loading"**
→ Visit your backend URL + `/api/seed` directly (POST request)
→ Or use curl: `curl -X POST https://your-railway-url.railway.app/api/seed`

**Frontend shows blank page**
→ Check Vercel build logs for errors
→ Make sure Root Directory is set to `frontend` in Vercel

---

## TECH STACK SUMMARY

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, Framer Motion |
| UI Components | Radix UI (shadcn-style) |
| Backend | FastAPI (Python) |
| Database | MongoDB Atlas |
| Auth | JWT tokens |
| Frontend Deploy | Vercel (free) |
| Backend Deploy | Railway (free tier) |
| Images | Unsplash (CDN) |

---

## OPTIONAL ENHANCEMENTS

- **Custom domain**: Buy a domain on Namecheap, connect to Vercel for free
- **Email notifications**: Add SendGrid for booking confirmation emails
- **Payment**: Add Stripe for real payments
- **Image uploads**: Add Cloudinary for room image uploads instead of URLs
