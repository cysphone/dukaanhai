# 🛒 DukaanHai — WhatsApp-First AI Store Builder

> Create a professional online store by chatting on WhatsApp. AI generates your website, content, and product catalog automatically.

![DukaanHai](https://img.shields.io/badge/DukaanHai-WhatsApp%20AI%20Store%20Builder-orange?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square)
![Prisma](https://img.shields.io/badge/Prisma-5-indigo?style=flat-square)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 WhatsApp Bot | Create entire store by chatting — AI extracts business details step-by-step |
| 🧠 Gemini AI | Auto-generates headline, tagline, about section, and product descriptions |
| 🎨 3 Templates | Minimal Artisan · Bold Visual Brand · Mobile Catalog |
| 📦 Product Management | Add, edit, delete products with image URLs |
| 🔐 Auth | Email/password auth with NextAuth.js |
| 🌐 Subdomain Routing | `yourslug.dukaanhai.com` routing via Next.js middleware |
| 📱 Mobile-First | All templates are fully responsive |
| 🚀 Vercel Ready | Serverless-compatible with Prisma + Neon |

---

## 🏗️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **Backend**: Next.js API Routes (serverless)
- **ORM**: Prisma 5 with PostgreSQL (Neon)
- **Auth**: NextAuth.js with JWT sessions
- **AI**: Google Gemini 1.5 Flash API
- **Messaging**: WhatsApp Cloud API
- **Deployment**: Vercel

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourname/dukaanhai.git
cd dukaanhai
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Fill in all required values (see [Environment Variables](#environment-variables) below).

### 3. Set Up Database

Create a free PostgreSQL database at [neon.tech](https://neon.tech), then:

```bash
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## 🔑 Environment Variables

| Variable | Description | Where to Get |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | [neon.tech](https://neon.tech) |
| `DIRECT_URL` | Direct DB URL (for migrations) | Same as DATABASE_URL for Neon |
| `NEXTAUTH_SECRET` | Random secret (min 32 chars) | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your app URL | `http://localhost:3000` for dev |
| `GEMINI_API_KEY` | Google Gemini API key | [aistudio.google.com](https://aistudio.google.com) |
| `WHATSAPP_VERIFY_TOKEN` | Custom string you define | Any string you choose |
| `WHATSAPP_TOKEN` | WhatsApp Cloud API token | [developers.facebook.com](https://developers.facebook.com) |
| `WHATSAPP_PHONE_ID` | WhatsApp Phone Number ID | Meta Business Suite |

---

## 📱 WhatsApp Bot Setup

1. Go to [Meta for Developers](https://developers.facebook.com)
2. Create a new App → Add WhatsApp product
3. Get your `Phone Number ID` and generate a permanent `Access Token`
4. Set webhook URL to: `https://yourdomain.com/api/whatsapp/webhook`
5. Set verify token to match your `WHATSAPP_VERIFY_TOKEN`
6. Subscribe to `messages` webhook field

### WhatsApp Bot Flow

```
User: "Hi"
Bot: "Namaste! Apni dukaan ka naam batao..."
User: "Sharma Kirana Store"
Bot: "Aap kya bechte ho? (Category)..."
User: "Grocery"
Bot: "Kahan se operate karte ho?..."
User: "Karol Bagh, Delhi"
Bot: "Description do apni dukaan ki..."
User: "We sell fresh daily groceries..."
Bot: "WhatsApp number kya hai?..."
User: "+91 9876543210"
Bot: "Template choose karo: 1, 2, or 3"
User: "1"
Bot: "🤖 Store bana raha hun..." [creates store]
Bot: "🎉 Store ready! https://sharma-kirana-store.dukaanhai.com"
```

---

## 🌐 Subdomain Routing Setup (Production)

### On Vercel:
1. Add your domain `dukaanhai.com` to Vercel project
2. Add wildcard DNS record: `*.dukaanhai.com → CNAME → cname.vercel-dns.com`
3. In Vercel dashboard: Add `*.dukaanhai.com` as a domain

### The middleware (`src/middleware.ts`) handles:
- `yourstore.dukaanhai.com` → rewrite to `/store/yourstore`
- Custom domains → rewrite to `/domain/customdomain`

---

## 📁 Project Structure

```
dukaanhai/
├── prisma/
│   └── schema.prisma              # DB models
├── src/
│   ├── app/
│   │   ├── page.tsx               # Landing page
│   │   ├── login/page.tsx         # Auth pages
│   │   ├── register/page.tsx
│   │   ├── dashboard/             # Protected dashboard
│   │   │   ├── layout.tsx         # Sidebar layout
│   │   │   ├── page.tsx           # Dashboard home
│   │   │   ├── business/          # Business management
│   │   │   ├── products/          # Product catalog
│   │   │   ├── templates/         # Template picker
│   │   │   └── settings/          # Account settings
│   │   ├── store/[slug]/          # Public store pages
│   │   └── api/
│   │       ├── auth/              # NextAuth + register
│   │       ├── business/          # Business CRUD + AI
│   │       ├── products/          # Products CRUD
│   │       └── whatsapp/webhook/  # WhatsApp bot
│   ├── components/
│   │   └── templates/             # 3 store templates
│   │       ├── MinimalTemplate.tsx
│   │       ├── BoldTemplate.tsx
│   │       └── CatalogTemplate.tsx
│   ├── lib/
│   │   ├── prisma.ts              # DB client
│   │   ├── auth.ts                # NextAuth config
│   │   ├── gemini.ts              # AI integration
│   │   └── utils.ts               # Helpers
│   └── middleware.ts              # Subdomain routing
└── vercel.json
```

---

## 🎨 Templates

### 1. Minimal Artisan
- Font: Cormorant Garamond + Jost
- Colors: Stone / Warm whites
- Style: Editorial, elegant, serif typography
- Best for: Boutiques, artisans, premium products

### 2. Bold Visual Brand
- Font: Bebas Neue + DM Sans
- Colors: Dark / Orange accent
- Style: High-contrast, bold, modern
- Best for: Fashion, food, lifestyle brands

### 3. Mobile Catalog
- Font: Nunito
- Colors: Emerald / Clean white
- Style: WhatsApp-optimized, card-based list
- Best for: Kiranas, grocery, neighborhood shops

---

## 🚀 Deployment on Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add GEMINI_API_KEY
# ... etc

# Deploy to production
vercel --prod
```

---

## 🔮 Roadmap

- [ ] Image upload with Cloudinary integration
- [ ] AI background removal for product images  
- [ ] Custom domain management UI
- [ ] WhatsApp order management system
- [ ] Analytics dashboard
- [ ] UPI payment integration
- [ ] Instagram shop sync
- [ ] Multi-language support (Hindi, Tamil, etc.)

---

## 📄 License

MIT © DukaanHai 2024

---

Made with ❤️ for Indian sellers 🇮🇳
