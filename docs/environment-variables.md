# Environment Variables

This document describes all environment variables used in the portfolio website.

## Required Variables

None for the public site if you keep the hard-coded project fallback enabled (default).

If you enable the **Sanity-backed projects + custom admin**, you must set the variables below.

## Optional Variables

### `NEXT_PUBLIC_GA_ID`

- **Type**: String
- **Default**: `G-VJ8DW3XTD7`
- **Description**: Google Analytics tracking ID
- **Usage**: Used in `app/layout.tsx` for Google Tag Manager
- **Example**: `NEXT_PUBLIC_GA_ID=G-VJ8DW3XTD7`

### `NEXT_PUBLIC_SITE_URL`

- **Type**: String
- **Default**: `https://kohn.me.uk`
- **Description**: Base URL of the website
- **Usage**: Used for SEO metadata and structured data
- **Example**: `NEXT_PUBLIC_SITE_URL=https://kohn.me.uk`

### `NODE_ENV`

- **Type**: String
- **Values**: `development` | `production` | `test`
- **Description**: Node.js environment
- **Usage**: Automatically set by Next.js, controls build optimizations
- **Note**: Do not manually set this in `.env.local`

## Sanity (projects database)

### `NEXT_PUBLIC_SANITY_PROJECT_ID`

- **Type**: String
- **Required**: Yes (when using Sanity)
- **Description**: Sanity project id
- **Example**: `NEXT_PUBLIC_SANITY_PROJECT_ID=abc123xy`

### `NEXT_PUBLIC_SANITY_DATASET`

- **Type**: String
- **Required**: Yes (when using Sanity)
- **Description**: Sanity dataset name (e.g. `production`)
- **Example**: `NEXT_PUBLIC_SANITY_DATASET=production`

### `SANITY_API_VERSION`

- **Type**: String
- **Required**: No
- **Default**: `2024-01-01`
- **Description**: Sanity API version date string

### `SANITY_API_READ_TOKEN`

- **Type**: String
- **Required**: Only if dataset is private
- **Description**: Token used for server-side reads to Sanity
- **Security**: Server-only (do not prefix with `NEXT_PUBLIC_`)

### `SANITY_API_WRITE_TOKEN`

- **Type**: String
- **Required**: Yes (for admin CRUD + imports)
- **Description**: Token used for server-side writes to Sanity
- **Security**: **Server-only**. Must never be exposed to the browser.

### `SANITY_DISABLE_FALLBACK`

- **Type**: Boolean-ish string
- **Required**: No
- **Description**: Set to `true` to disable fallback to hard-coded project data once migration is confirmed.
- **Example**: `SANITY_DISABLE_FALLBACK=true`

## Admin authentication (NextAuth Credentials)

### `ADMIN_EMAIL`

- **Type**: String (email)
- **Required**: Yes (for admin)
- **Description**: Single allowlisted admin email

### `ADMIN_PASSWORD`

- **Type**: String
- **Required**: Yes (for admin)
- **Description**: Admin password used by Credentials provider

### `NEXTAUTH_URL`

- **Type**: String (URL)
- **Required**: Yes (production)
- **Description**: Canonical site URL (used by NextAuth)

### `NEXTAUTH_SECRET`

- **Type**: String
- **Required**: Yes (production)
- **Description**: Secret used to sign/encrypt NextAuth tokens

## Optional revalidation

### `REVALIDATE_SECRET`

- **Type**: String
- **Required**: No
- **Description**: Secret required by `POST /api/revalidate` (header `x-revalidate-secret`)

## Development vs Production

- **Development**: Uses relaxed security headers, verbose error messages
- **Production**: Strict security headers, optimized builds, error tracking ready

## Security Notes

- Never commit `.env.local` to version control
- All `NEXT_PUBLIC_*` variables are exposed to the browser
- Use server-side environment variables for sensitive data
