# Freddie Kohn Portfolio Website

A modern, high-performance portfolio website showcasing software engineering and game development projects. Built with Next.js 14, React, TypeScript, and Tailwind CSS.

## Features

- **Performance Optimized**: Lighthouse score ≥ 95 across all categories
- **Fully Accessible**: WCAG 2.1 AA compliant with comprehensive keyboard navigation
- **SEO Optimized**: Dynamic metadata, structured data, and Open Graph support
- **Responsive Design**: Mobile-first approach with optimized touch targets
- **Type Safe**: Strict TypeScript with comprehensive type definitions
- **Error Handling**: Comprehensive error boundaries and fallback UI
- **Modern Stack**: Next.js 14 App Router, React Server Components, Framer Motion

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd portfolio
```

1. Install dependencies:

```bash
npm install
```

1. Run the development server:

```bash
npm run dev
```

1. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run analyze` - Analyze bundle size

## Garage Estimate / Invoice PDF Generator

Route: `/apps/garage-estimates`

This tool is fully client-side and lets you build garage estimates/invoices with:

- client and vehicle details
- line items with quantity/rate/discount/VAT
- automatic subtotal, VAT total, shipping, and grand total
- draft autosave in localStorage
- draft export/import as JSON
- A4 PDF generation and immediate download/preview in browser

### Draft actions

- **Autosave**: debounced every 500ms to `garageEstimatesDraft:v1`
- **Clear draft**: removes local draft and resets the form
- **Export draft JSON**: downloads current draft
- **Import draft JSON**: restores from a previously exported draft file

### Logo support

In the Company Profile section, upload a PNG/JPG logo file. The file is converted to a data URL in-browser and embedded into the PDF header. No logo file is sent to any server.

## Project Structure

```text
portfolio/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── projects/          # Projects pages
│   ├── skills/            # Skills page
│   ├── error.tsx          # Error boundary
│   └── not-found.tsx      # 404 page
├── components/             # React components
│   ├── ui/                # Reusable UI components
│   └── ...                # Feature components
├── lib/                   # Utility functions
│   ├── animations.ts      # Animation variants
│   ├── parsing.ts         # Text parsing utilities
│   ├── projects.ts        # Project data
│   ├── seo.ts             # SEO utilities
│   └── utils.ts           # General utilities
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
├── public/                # Static assets
└── __tests__/             # Test files
```

## Architecture

### Component Organization

- **UI Components** (`components/ui/`): Reusable, unstyled components built on Radix UI
- **Feature Components** (`components/`): Domain-specific components
- **Pages** (`app/`): Next.js App Router pages with server/client components

### Data Flow

1. **Static Data**: Project data stored in `lib/projects.ts`
2. **Server Components**: Pages are server components by default for optimal performance
3. **Client Components**: Interactive components marked with `"use client"` directive
4. **State Management**: React hooks for local state, no global state library needed

## Project data backups (important)

Before migrating the hard-coded project data to a database, we generate a **versioned JSON backup**.

- **Backup location**: `backups/projects-backup-YYYY-MM-DD.json`
- **How to generate**:

```bash
npm run backup:projects
```

This backup includes:

- internal projects (those with detail pages under `/projects/[slug]`)
- external/list-only projects (those shown on `/projects` without detail pages)

### Performance Optimizations

- **Image Optimization**: Next.js Image component with AVIF/WebP support
- **Code Splitting**: Dynamic imports for heavy components
- **Bundle Optimization**: Webpack chunk splitting for vendor libraries
- **Font Optimization**: Variable fonts with subsetting
- **Lazy Loading**: Images and components loaded on demand

### Accessibility Features

- **ARIA Labels**: Comprehensive ARIA attributes throughout
- **Keyboard Navigation**: Full keyboard support with shortcuts
- **Focus Management**: Proper focus trapping in modals
- **Screen Reader Support**: Semantic HTML and ARIA live regions
- **Color Contrast**: WCAG AA compliant color schemes

## Deployment

### Build for Production

```bash
npm run build
npm run start
```

## Sanity-backed projects + custom admin (no Sanity Studio)

This repo supports migrating the hard-coded project data to **Sanity**, while keeping the **public site UI unchanged** and adding a **custom admin UI under `/admin`**.

### Admin routes

- `/admin/login`
- `/admin/projects`
- `/admin/projects/new`
- `/admin/projects/[id]/edit`

### Required env vars (for Sanity + admin)

See `.env.example` and `docs/environment-variables.md`. At minimum:

```bash
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=...        # if dataset is private
SANITY_API_WRITE_TOKEN=...       # server-only

# Admin auth
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=...
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=...              # generate a strong random secret
```

### Manual Sanity setup (one-time)

1. Create a Sanity project + dataset.
1. Create two API tokens in Sanity:
   - **Read token** (optional if dataset public)
   - **Write token** with permissions to create/update/delete documents + upload assets

### Backup + import (migration)

1. Generate a versioned backup JSON:

```bash
npm run backup:projects
```

1. Import the latest backup into Sanity (safe: uses `createIfNotExists`):

```bash
npm run sanity:import-projects
```

Optionally specify a backup file:

```bash
npm run sanity:import-projects -- backups/projects-backup-YYYY-MM-DD.json
```

### Disabling fallback after migration

Public pages read from Sanity **first**, and fall back to the existing hard-coded data if Sanity is empty/unavailable.

Once you’ve confirmed Sanity has the full dataset, set:

```bash
SANITY_DISABLE_FALLBACK=true
```

### Optional: on-demand revalidation

`POST /api/revalidate` with header `x-revalidate-secret: $REVALIDATE_SECRET` and optional JSON body:

```json
{ "slugs": ["route-optimisation"] }
```

### Environment Variables

Create a `.env.local` file (see `.env.example` for reference):

```env
# Optional: Analytics ID
NEXT_PUBLIC_GA_ID=G-VJ8DW3XTD7
```

### Deployment Platforms

The site is optimized for deployment on:

- **Vercel** (recommended for Next.js)
- **Netlify**
- **Any Node.js hosting platform**

## Testing

### Unit Tests

```bash
npm run test
```

### Accessibility Testing

Accessibility tests are included in the test suite using jest-axe:

```bash
npm run test
```

### E2E Testing

E2E tests can be added using Playwright or Cypress (not included in base setup).

## Contributing

1. Follow the existing code style
2. Use Conventional Commits for commit messages
3. Ensure all tests pass: `npm run test`
4. Run linter: `npm run lint`
5. Build successfully: `npm run build`

## License

© 2024 Freddie Kohn. All rights reserved.

## Contact

- **Email**: [freddiej.kohn@gmail.com](mailto:freddiej.kohn@gmail.com)
- **LinkedIn**: [freddie-j-kohn](https://www.linkedin.com/in/freddie-j-kohn/)
- **GitHub**: [Chickohn](https://github.com/Chickohn)
