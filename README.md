# Walid Khaled – Exterior Design & Facades

Premium website for Walid Khaled, a leading exterior facade design and execution company based in Duhok, Iraq. Serving all Iraqi governorates since 2009.

**Live Demo:** [walid-khaled.vercel.app](https://walid-khaled.vercel.app)

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 3.4 (dark theme, gold accents)
- **i18n:** next-intl — Arabic (default), Kurdish, English
- **Animations:** Framer Motion
- **Auth:** JWT + bcryptjs (session-based with CSRF protection)
- **Media:** Swiper, Yet Another React Lightbox
- **Charts:** Recharts (admin analytics)
- **Storage:** In-memory (designed for easy swap to PostgreSQL/Supabase)

## Features

### Public Website
- **Multi-language** — Arabic, Kurdish (Sorani), English
- **Homepage** — Hero with video, services overview, project previews, stats, reviews, trust section
- **Projects** — Filterable gallery with categories, before/after comparisons, image galleries, video galleries
- **Services** — 8 service types with detailed pages
- **Reviews** — Verified customer reviews with ratings
- **FAQ** — Expandable FAQ section
- **Consultation Request** — Multi-step form with image/video upload
- **Contact** — Phone, WhatsApp, social media links
- **Iraq Coverage Map** — Visual governorate map
- **Smart Assistant** — AI-powered chat assistant
- **Floating Action Buttons** — WhatsApp and phone quick-access

### Admin Panel (`/admin`)
- **Dashboard** — Analytics, recent requests, quick stats
- **Projects** — CRUD with image/video galleries, before/after
- **Services** — CRUD with features and icons
- **Reviews** — Approve/reject submitted reviews
- **Requests** — View and manage consultation requests
- **FAQs** — CRUD for FAQ items
- **Media Library** — Upload and manage images/videos
- **Settings** — Company info, social links, SEO, hero content
- **Analytics** — Visitors, requests, device types, traffic sources
- **Backup/Restore** — Export/import all website data
- **Auth** — JWT session auth with rate limiting, CAPTCHA, CSRF, inactivity timeout, device trust

## Getting Started

### Prerequisites
- **Node.js** ≥ 18.x
- **npm** ≥ 9.x

### Installation

```bash
# Clone the repository
git clone <your-repo-url> walid-khaled
cd walid-khaled

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and set JWT_SECRET (generate with: openssl rand -base64 64)

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### First-Run Admin Setup

1. Visit `/admin/setup`
2. Choose a username and password
3. The admin account is created and you can log in at `/admin/login`

Alternatively, set `ADMIN_USERNAME` and `ADMIN_PASSWORD_HASH` in your environment variables to skip the setup page.

---

## Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

Manual steps:

1. Push the project to a GitHub/GitLab/Bitbucket repository
2. Import the project in [Vercel](https://vercel.com/new)
3. Set environment variables in Vercel dashboard:
   - `JWT_SECRET` — Generate with `openssl rand -base64 64`
   - `NODE_ENV` — Set to `production`
   - (Optional) `ADMIN_USERNAME` and `ADMIN_PASSWORD_HASH`
4. Deploy

### Other Platforms (Netlify, Railway, DigitalOcean, etc.)

This is a standard Next.js application. Any platform that supports Next.js will work.

**Build command:** `npm run build`
**Output directory:** `.next`
**Start command:** `npm start`
**Node version:** 18.x or higher

### Self-Hosted (VPS / Dedicated Server)

```bash
# Build
NODE_ENV=production npm run build

# Start (port 3000 by default)
npm start

# Or with PM2 for process management
npm install -g pm2
pm2 start npm --name "walid-khaled" -- start
pm2 save
pm2 startup
```

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | ✅ Yes (production) | Secret key for signing JWT tokens |
| `NODE_ENV` | Yes | Set to `production` for production |
| `ADMIN_USERNAME` | No | Skip first-run setup by providing admin username |
| `ADMIN_PASSWORD_HASH` | No | Skip first-run setup by providing bcrypt hash |

---

## Project Structure

```
walid-khaled/
├── prisma/                  # Database schema (future use)
├── public/
│   ├── favicon.svg
│   ├── fonts/
│   ├── images/              # Static images
│   ├── uploads/             # User-uploaded media (git-ignored)
│   └── videos/              # Static videos (hero, etc.)
├── src/
│   ├── app/
│   │   ├── [locale]/        # i18n public pages (ar, kurd, en)
│   │   │   ├── consultation/
│   │   │   ├── contact/
│   │   │   ├── faq/
│   │   │   ├── privacy/
│   │   │   ├── projects/
│   │   │   ├── reviews/
│   │   │   ├── services/
│   │   │   └── terms/
│   │   ├── admin/           # Admin panel
│   │   ├── api/             # API routes (Node.js runtime)
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Root page (redirects to /ar)
│   │   ├── sitemap.ts       # Dynamic sitemap
│   │   └── globals.css      # Global styles + Tailwind
│   ├── components/
│   │   ├── home/            # Homepage sections
│   │   ├── layout/          # Navigation, Footer, FloatingButtons
│   │   ├── projects/        # Project cards, galleries
│   │   ├── sections/        # IraqMap, ReviewsPage, SmartAssistant
│   │   └── ui/              # ThemeProvider, shared UI
│   ├── i18n/
│   │   ├── messages/        # Translation files (ar, en, kurd)
│   │   └── request.ts       # next-intl config
│   ├── lib/
│   │   ├── auth.ts          # Authentication, JWT, rate limiting
│   │   ├── admin-store.ts   # Admin credential persistence
│   │   ├── backup-store.ts  # Backup/restore file operations
│   │   ├── data.ts          # Data layer (in-memory CRUD)
│   │   └── utils.ts         # Utility functions
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   └── middleware.ts         # i18n + admin auth middleware
├── .env.example             # Environment variables template
├── .gitignore
├── next.config.js           # Next.js configuration
├── package.json
├── postcss.config.js
├── tailwind.config.ts       # Tailwind theme (dark, gold, animations)
├── tsconfig.json
└── vercel.json              # Vercel deployment config
```

## Notes

### Data Storage

Currently, all data is stored in-memory and resets on server restart. The code is structured with async functions ready for a database swap (Supabase, PostgreSQL, or similar). To add persistent storage:

1. Set up a database (Supabase, PlanetScale, Neon, etc.)
2. Replace the in-memory arrays in `src/lib/data.ts` with database queries
3. Add the appropriate database client package

In the meantime, the **Backup & Restore** feature in the admin panel lets you export all data as JSON and restore it after a restart.

### Production Considerations

- **File Uploads:** Uploads go to `/public/uploads/` — on serverless platforms like Vercel, use an external storage service (Cloudinary, S3, Supabase Storage) for permanent file storage.
- **Rate Limiting:** In-memory rate limiting works for single-server deployments. Use Redis for distributed deployments.
- **Admin Credentials:** On Vercel, use environment variables (not the setup page) since the filesystem is ephemeral.
- **JWT Secret:** Always set a strong `JWT_SECRET` in production. Sessions are invalidated if the secret changes.

## License

All rights reserved. This project is proprietary software.
