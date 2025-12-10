# Environment Variables

This document describes all environment variables used in the portfolio website.

## Required Variables

None. The application works out of the box with default values.

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

## Development vs Production

- **Development**: Uses relaxed security headers, verbose error messages
- **Production**: Strict security headers, optimized builds, error tracking ready

## Security Notes

- Never commit `.env.local` to version control
- All `NEXT_PUBLIC_*` variables are exposed to the browser
- Use server-side environment variables for sensitive data

