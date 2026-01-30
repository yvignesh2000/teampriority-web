# TeamPriority Web

A production-ready, offline-capable team productivity web application built with Next.js 14. Helps small teams (3-5 people) build consistent prioritization habits using proven frameworks.

![TeamPriority](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## Features

### Core Priorities
- **Eisenhower Matrix** - Organize tasks by urgency and importance in a 2x2 grid
- **Weekly Impact Goal** - Set a single direction-giving focus for each week
- **Today's Top 3** - Commit to 3 high-impact tasks daily

### Proof System
- **Daily Proof Log** - Track what you shipped, solved, or improved
- **Proof Scoring** - Lightweight points system (High = ⭐ 2x multiplier)
- **Weekly Summary** - Auto-generated markdown summaries
- **Export** - Copy to clipboard or download for sharing

### Team Features
- **Shared Task Visibility** - Team can see all tasks
- **Private Data** - Goals, proof logs, and summaries are user-private
- **Role-based Access** - Admins manage topics and team roles

### Reliability
- **Offline-First** - Works without internet, syncs when back online
- **IndexedDB Storage** - Data persists locally using Dexie.js
- **Background Sync** - Outbox queue with automatic retry

## Quick Start

### 1. Clone and Install
```bash
cd teampriority-web
npm install
```

### 2. Configure Firebase
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Use your existing project OR create a new one
3. Enable **Authentication** (Email/Password)
4. Enable **Cloud Firestore**
5. Copy your web app config

### 3. Set Environment Variables
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase credentials:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 4. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

Or manually copy `firestore.rules` to Firebase Console > Firestore > Rules.

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Create First Admin
After signing up, promote yourself to admin:
```bash
# Download service account key from Firebase Console
# Save as scripts/service-account-key.json
npx ts-node scripts/seed-admin.ts your@email.com
```

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

```bash
vercel
```

Remember to add environment variables in Vercel project settings.

## Project Structure

```
teampriority-web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages (login, signup)
│   │   ├── (app)/             # Protected app pages
│   │   │   ├── matrix/        # Eisenhower Matrix
│   │   │   ├── goals/         # Weekly Impact Goals
│   │   │   ├── top3/          # Today's Top 3
│   │   │   ├── proof/         # Proof Log
│   │   │   ├── summary/       # Weekly Summary
│   │   │   ├── export/        # Export Center
│   │   │   ├── prompts/       # Prompt Center
│   │   │   ├── topics/        # Topics (admin)
│   │   │   ├── team/          # Team (admin)
│   │   │   └── settings/      # Settings
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home (redirects)
│   ├── components/
│   │   ├── ui/                # Base UI components
│   │   └── layout/            # Layout components
│   ├── lib/
│   │   ├── context/           # React contexts
│   │   ├── db/                # IndexedDB + Sync
│   │   ├── firebase/          # Firebase client
│   │   ├── hooks/             # Data hooks
│   │   ├── types/             # TypeScript types
│   │   └── utils/             # Utilities
├── public/                    # Static assets
├── scripts/                   # Admin scripts
├── firestore.rules           # Security rules
└── .env.example              # Environment template
```

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules with CSS Variables
- **Auth**: Firebase Authentication
- **Database**: Firebase Firestore
- **Offline**: Dexie.js (IndexedDB)
- **Deployment**: Vercel

## Offline Architecture

```
User Action → Local Write (IndexedDB)
                  ↓
            Sync Queue
                  ↓
         [Online?] → Firestore
                  ↓
         Real-time Listener
                  ↓
         Local Update (version check)
```

- **Write-first**: All changes go to IndexedDB immediately
- **Outbox queue**: Pending changes stored in `syncQueue` table
- **Conflict resolution**: Higher version wins (last-write-wins)
- **Real-time sync**: Firestore listener updates local DB

## Automated Prompts

| Time | Prompt | Condition |
|------|--------|-----------|
| 9:30 AM | Set Top 3 | Weekdays |
| 6:30 PM | Log Proof | Weekdays |
| 5:00 PM Friday | Weekly Summary | Fridays |

Prompts appear as banners and can be dismissed or completed.

## Security

- **Row-level security**: Firestore rules enforce user ownership
- **Team visibility**: Tasks visible to team, private data stays private
- **Admin roles**: Only admins can manage topics and roles
- **Local encryption**: Uses browser's IndexedDB security

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT © 2024

---

Built with focus for teams who ship.
