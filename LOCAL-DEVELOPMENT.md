# 🔧 Local Development Setup

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Your `.env` file has been created with:

```bash
# Neon Database Configuration
DATABASE_URL=postgresql://neondb_owner:npg_im61ZIwxsjWn@ep-rapid-night-agzgtgcn-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# JWT Authentication Secret (securely generated)
JWT_SECRET=497fd19783b88aaf863207c2a8bf01f874a755e8f9ea82bc74513f3f1c6145b149a6b3a293a908791faf2de9be5f0bc2bd755637794ac0aa12fdf53ccbf2bdb8

# Environment
NODE_ENV=development

# API Configuration for local development
VITE_API_URL=http://localhost:8888/.netlify/functions
```

### 3. Start Development Server

**Option A: Netlify Dev (Recommended)**
```bash
npm run dev:netlify
```
This starts both frontend and functions on `http://localhost:8888`

**Option B: Separate processes**
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Functions (if needed)
netlify functions:serve
```

### 4. Test Authentication
Use these demo accounts:

**Customer Account:**
- Email: `customer@demo.com`
- Password: `123456`

**Provider Account:**
- Email: `provider@demo.com`
- Password: `123456`

## 🔐 JWT Secret Generation

If you need a new JWT secret:
```bash
npm run generate-jwt
```

## 📊 Database Management

### Setup Database (first time)
```bash
npm run setup-db
npm run migrate-data
npm run setup-auth
```

### Reset Demo Users
```bash
npm run setup-auth
```

## 🏗️ Build & Deploy

### Local Build Test
```bash
npm run build
npm run preview
```

### Deploy to Production
```bash
# Build
npm run build:prod

# Deploy via Git
git add .
git commit -m "Deploy"
git push origin main
```

## 🚨 Troubleshooting

### Auth Issues
- Check `.env` file exists and has correct JWT_SECRET
- Verify database connection with `npm run setup-auth`
- Clear browser localStorage: `localStorage.clear()`

### Function Issues
- Make sure Netlify CLI is installed: `npm install -g netlify-cli`
- Check functions are running on port 8888
- Verify environment variables are loaded

### Database Issues
- Test connection: `psql 'postgresql://neondb_owner:npg_im61ZIwxsjWn@ep-rapid-night-agzgtgcn-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'`
- Reset schema: `npm run setup-db`
- Reset data: `npm run migrate-data`

## 📁 Project Structure

```
├── netlify/functions/     # API endpoints
│   ├── auth.js           # Authentication
│   ├── institutes.js     # Institutes CRUD
│   ├── therapists.js     # Therapists CRUD
│   └── ...              # Other endpoints
├── src/
│   ├── contexts/AuthContext.tsx  # Auth state management
│   ├── lib/api-client.ts        # API wrapper
│   └── ...
├── scripts/              # Database setup scripts
├── migrations/           # SQL schema and data
└── .env                 # Local environment variables
```

## 🔗 API Endpoints

All endpoints available at `http://localhost:8888/.netlify/functions/`

- `POST /auth/login` - User login
- `POST /auth/register` - User registration  
- `POST /auth/verify-token` - Token verification
- `GET /institutes` - List institutes
- `GET /therapists` - List therapists
- `GET /appointments` - List appointments
- And more...

## ✅ Ready for Development!

Your local environment is fully configured with:
- ✅ Real database connection
- ✅ Secure JWT authentication
- ✅ Demo user accounts
- ✅ All API endpoints working
- ✅ Hot reload development server
