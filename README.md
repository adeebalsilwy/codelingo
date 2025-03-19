<h1>Build a Duolingo Clone With Nextjs, React, Drizzle, Stripe (2024)</h1>
<h3>This is a repository for a "Build a Duolingo Clone With Nextjs, React, Drizzle, Stripe (2024)</h3>
Key Features:
- 🌐 Next.js 14 & server actions
- 🗣 AI Voices using Elevenlabs AI
- 🎨 Beautiful component system using Shadcn UI
- 🎭 Amazing characters thanks to KenneyNL
- 🔐 Auth using Clerk
- 🔊 Sound effects
- ❤️ Hearts system
- 🌟 Points / XP system
- 💔 No hearts left popup
- 🚪 Exit confirmation popup
- 🔄 Practice old lessons to regain hearts
- 🏆 Leaderboard
- 🗺 Quests milestones
- 🛍 Shop system to exchange points with hearts
- 💳 Pro tier for unlimited hearts using Stripe
- 🏠 Landing page
- 📊 Admin dashboard React Admin
- 🌧 ORM using DrizzleORM
- 💾 PostgresDB using NeonDB
- 🚀 Deployment on Vercel
- 📱 Mobile responsiveness

### Prerequisites

**Node version 14.x**

### Cloning the repository

```shell
git clone https://github.com/bouzayenilyes/lingo.git
```

### Install packages

```shell
npm i
```

### Setup .env file


```js
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""
DATABASE_URL="postgresql://..."
STRIPE_API_KEY=""
NEXT_PUBLIC_APP_URL="http://localhost:3000"
STRIPE_WEBHOOK_SECRET=""
```

### Setup Drizzle ORM

```shell
npm run db:pu
```

### Seed the app

```shell
npm run db:seed

```

or

```shell
npm run db:prod

```

### Start the app

```shell
npm run dev
```

## Known Issues & Updates

- Fixed Google account registration issue where a new account did not log in properly.
- Added missing courses and lessons for various programming languages (now including proper tagging via language).
- Updated the code editor to support C++ alongside Java.
- Chat integration now works without error notifications.
- Clarified behavior for mobile/web app installation prompts.
- Reminder notifications are now enabled as a feature.
- Fixed UI language consistency when switching to English (levels and courses now display in English).