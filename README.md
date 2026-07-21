# GadgetZone — Frontend

The customer-facing storefront and admin dashboard for **GadgetZone**, built with **Next.js 16** and **TypeScript**.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| Next.js 16 (App Router) | Framework |
| React 19 | UI library |
| TypeScript | Type safety |
| Tailwind CSS v4 | Styling |
| shadcn/ui | Component library |
| Zustand | State management |
| Recharts | Admin charts |
| Sonner | Toast notifications |

---

## Project Structure

```
src/
├── app/
│   ├── (store)/          # Customer-facing pages
│   │   ├── page.tsx      # Homepage
│   │   ├── shop/         # Product listing
│   │   ├── cart/         # Shopping cart
│   │   ├── checkout/     # Checkout flow
│   │   ├── account/      # User account
│   │   ├── wishlist/     # Saved items
│   │   ├── categories/   # Browse by category
│   │   ├── collections/  # Curated collections
│   │   ├── sale/         # Sale items
│   │   ├── contact/      # Contact page
│   │   ├── about/        # About page
│   │   └── (auth)/       # Login / Register
│   └── admin/            # Admin dashboard
├── components/           # Reusable UI components
└── lib/                  # Utilities and helpers
```

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** (comes with Node.js)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local and fill in the required values

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Create a `.env.local` file in this directory with the following:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Pages Overview

| Route | Description |
|---|---|
| `/` | Homepage |
| `/shop` | All products |
| `/cart` | Shopping cart |
| `/checkout` | Checkout |
| `/account` | User account & orders |
| `/wishlist` | Saved products |
| `/admin` | Admin dashboard |
| `/admin/products` | Manage products |
