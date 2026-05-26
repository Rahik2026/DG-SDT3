# 🎓 CampusHub — Your College, Connected

<div align="center">

A **production-ready, premium** college community web application built with Next.js, Firebase, and Google Drive API. Think Discord meets Notion for college students.

**[Live Demo](#) · [Documentation](#setup) · [Report Bug](#) · [Request Feature](#)**

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🏠 **Smart Dashboard** | Real-time stats, exam countdown, homework tracking, activity charts |
| 💬 **WhatsApp-Style Chat** | Private & group messaging, typing indicators, online status |
| 📰 **Community Feed** | Posts, likes, comments, tags, bookmarks, infinite scroll |
| 📁 **File Manager** | Google Drive integration, grid/list view, category filters |
| 📝 **Question Bank** | Subject-wise past papers, searchable, downloadable PDFs |
| 🛡️ **Admin Panel** | User management, content moderation, analytics dashboard |
| 🔐 **Auth System** | Firebase Authentication with protected routes |
| 📊 **Analytics** | Recharts-powered interactive charts and stats |
| 🌙 **Dark Mode** | Beautiful dark-first design with ambient gradients |
| 📱 **Mobile-First** | Fully responsive across all devices |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **State** | Zustand |
| **Auth & DB** | Firebase (Firestore + Auth) |
| **File Storage** | Google Drive API v3 |
| **Date Utils** | date-fns |

---

## 📁 Project Structure

```
college-community/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── auth/
│   │   │   ├── login/page.tsx  # Login page with social auth
│   │   │   └── signup/page.tsx # Registration page
│   │   ├── dashboard/page.tsx  # Main dashboard with widgets
│   │   ├── feed/page.tsx       # Community feed with posts
│   │   ├── chat/page.tsx       # WhatsApp-style messaging
│   │   ├── files/page.tsx      # File manager (Google Drive)
│   │   ├── questions/page.tsx  # Question bank
│   │   ├── admin/page.tsx      # Admin panel with analytics
│   │   ├── api/
│   │   │   └── drive/route.ts  # Google Drive API endpoint
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Root redirect
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   │   ├── Avatar.tsx      # Avatar with initials & online status
│   │   │   ├── Badge.tsx       # Status badges with variants
│   │   │   ├── Button.tsx      # Button with loading, icons, variants
│   │   │   ├── Card.tsx        # Glass-morphism card with glow effects
│   │   │   ├── EmptyState.tsx  # Empty state placeholder
│   │   │   ├── Input.tsx       # Input with icons and validation
│   │   │   ├── Modal.tsx       # Animated modal dialog
│   │   │   └── Skeleton.tsx    # Loading skeleton components
│   │   └── layout/
│   │       ├── AppLayout.tsx   # Main app layout wrapper
│   │       ├── Sidebar.tsx     # Collapsible sidebar navigation
│   │       └── TopBar.tsx      # Top bar with search & notifications
│   ├── lib/
│   │   ├── firebase.ts         # Firebase initialization
│   │   └── demo-data.ts        # Demo data for offline mode
│   ├── stores/
│   │   └── useStore.ts         # Zustand global state management
│   └── types/
│       └── index.ts            # TypeScript type definitions
├── .env.local.example          # Environment variables template
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
├── next.config.ts              # Next.js configuration
└── package.json
```

---

## 📐 Data Architecture

### 🔥 Firebase (Text & Metadata ONLY)

Firebase Firestore stores **only text data and metadata**:

```
firestore/
├── users/           # User profiles, roles, online status
├── posts/           # Post text, likes, tags
├── comments/        # Comment text
├── chatRooms/       # Chat room info, members
├── messages/        # Message text (NO file content)
├── files/           # File METADATA only (name, driveUrl, category)
├── homework/        # Homework info, due dates
├── exams/           # Exam schedules
├── announcements/   # Announcement text
├── questionBank/    # Question paper metadata
└── notifications/   # Notification data
```

### 📁 Google Drive (ALL Files)

**Every file** (PDFs, images, documents) goes to Google Drive:

```javascript
// Firebase stores only the reference:
{
  "title": "Physics Chapter 3 Notes",
  "fileId": "1AbCDef...",            // Google Drive file ID
  "driveUrl": "https://drive.google.com/uc?id=FILE_ID",
  "thumbnailUrl": "...",
  "uploadedBy": "userId",
  "fileType": "pdf",
  "fileSize": 2450000,
  "category": "notes",
  "subject": "Physics",
  "semester": 5,
  "downloads": 45
}
```

❌ **Never stored in Firebase**: PDFs, images, videos, documents, any binary files

---

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** 18+ and npm/yarn/pnpm
- **Firebase** project (free tier works)
- **Google Cloud** project with Drive API enabled
- **Git** for version control

### Step 1: Clone & Install

```bash
git clone <your-repo-url> college-community
cd college-community
npm install
```

### Step 2: Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Google Drive API
GOOGLE_DRIVE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_DRIVE_CLIENT_SECRET=GOCSPX-...
GOOGLE_DRIVE_REDIRECT_URI=http://localhost:3000/api/auth/callback
GOOGLE_DRIVE_REFRESH_TOKEN=your-refresh-token
GOOGLE_DRIVE_FOLDER_ID=your-shared-folder-id

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

> 💡 The app works in **demo mode** without any Firebase/Drive config. Just click "Sign In" with empty fields to explore all features.

---

## 🔥 How to Connect Firebase

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" → Name it → Continue
3. Disable Google Analytics (optional) → Create

### 2. Enable Authentication

1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password**
3. (Optional) Enable **Google** sign-in

### 3. Set Up Firestore

1. Go to **Firestore Database** → **Create database**
2. Choose **Start in test mode** (update rules for production)
3. Select a region close to your users

### 4. Get Config

1. Go to **Project settings** (gear icon)
2. Scroll to **Your apps** → **Web app** → Register
3. Copy the config values into `.env.local`

### 5. Firestore Security Rules (Production)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read all profiles, edit only their own
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Posts are readable by all authenticated users
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.authorId;
    }
    
    // Chat rooms - members only
    match /chatRooms/{roomId} {
      allow read: if request.auth.uid in resource.data.members;
      allow create: if request.auth != null;
    }
    
    // Messages - chat room members only
    match /messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
    
    // Files metadata - all authenticated users
    match /files/{fileId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
    
    // Admin-only collections
    match /announcements/{annId} {
      allow read: if request.auth != null;
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## 📁 How to Connect Google Drive API

### 1. Enable Google Drive API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or use existing
3. Go to **APIs & Services** → **Library**
4. Search **Google Drive API** → **Enable**

### 2. Create OAuth2 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Add redirect URI: `http://localhost:3000/api/auth/callback`
5. Save the **Client ID** and **Client Secret**

### 3. Get Refresh Token

Use the [OAuth 2.0 Playground](https://developers.google.com/oauthplayground):

1. Click the gear icon → Check "Use your own OAuth credentials"
2. Enter your Client ID and Secret
3. In Step 1, select **Drive API v3** → `https://www.googleapis.com/auth/drive.file`
4. Click **Authorize APIs** → Sign in with Google
5. Click **Exchange authorization code for tokens**
6. Copy the **Refresh Token**

### 4. Create a Shared Folder

1. Go to [Google Drive](https://drive.google.com)
2. Create a new folder (e.g., "CampusHub Files")
3. Copy the folder ID from the URL: `https://drive.google.com/drive/folders/FOLDER_ID`
4. Add this as `GOOGLE_DRIVE_FOLDER_ID` in `.env.local`

### 5. File Upload Flow

```
User uploads file → API route (/api/drive) → Google Drive API → Returns file ID
                                                                        ↓
                                            Firebase Firestore ← Store metadata + Drive URL
```

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Select your repository
4. Add all environment variables from `.env.local`
5. Click **Deploy**

```bash
# Or use Vercel CLI
npm i -g vercel
vercel
```

### Deploy Firebase Hosting (Alternative)

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

### Production Checklist

- [ ] Set proper Firestore security rules
- [ ] Enable Firebase App Check
- [ ] Set up Google Drive API quotas
- [ ] Configure CORS for your domain
- [ ] Set up error monitoring (Sentry)
- [ ] Enable Firebase Analytics
- [ ] Set up CDN caching rules
- [ ] Configure rate limiting on API routes
- [ ] Add proper HTTPS headers

---

## ❓ Common Issues & Fixes

### 1. "Firebase app not initialized"
**Fix**: Ensure all `NEXT_PUBLIC_FIREBASE_*` env vars are set. Restart the dev server after adding/changing env vars.

### 2. "Google Drive API quota exceeded"
**Fix**: The free tier allows 12,000 requests/day. For higher usage, enable billing or implement request caching.

### 3. "CORS error on file upload"
**Fix**: Ensure your domain is added to the OAuth2 authorized origins in Google Cloud Console.

### 4. Build errors with Recharts
**Fix**: Recharts requires client-side rendering. Ensure chart components are in `'use client'` files.

### 5. Hydration mismatch errors
**Fix**: Components using `window`, `Date.now()`, or `Math.random()` must check `mounted` state:
```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return null;
```

### 6. Sidebar overlapping content on mobile
**Fix**: The sidebar uses fixed positioning on mobile. The main content area already handles margin transitions.

### 7. Dark mode flash on load
**Fix**: The `<html>` tag has `className="dark"` set in the root layout to prevent FOUC.

### 8. File upload not working
**Fix**: 
- Check Google Drive API is enabled
- Verify OAuth2 credentials are correct
- Ensure refresh token hasn't expired
- Check folder permissions

---

## 🎨 Design System

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| Background | `#07070e` | App background |
| Surface | `rgba(255,255,255,0.03)` | Cards, panels |
| Border | `rgba(255,255,255,0.06)` | Borders, dividers |
| Primary | `#6366f1` (Indigo) | CTAs, active states |
| Accent | `#a855f7` (Purple) | Secondary actions |
| Success | `#10b981` (Emerald) | Positive states |
| Warning | `#f59e0b` (Amber) | Caution states |
| Danger | `#ef4444` (Red) | Error states |

### Typography
- **Font**: Inter (Variable)
- **Headings**: 600-700 weight
- **Body**: 400 weight, 14px
- **Captions**: 500 weight, 11-12px

### Spacing
- Cards: `p-4` to `p-6`
- Gaps: `gap-3` to `gap-6`
- Rounded: `rounded-xl` to `rounded-2xl`

---

## 📄 License

MIT License — feel free to use this for your college or any educational purpose.

---

<div align="center">

Built with ❤️ for the college community

**CampusHub** — _Your College, Connected_

</div>
