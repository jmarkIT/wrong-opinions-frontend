# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev          # Start dev server at http://localhost:5173
npm run build        # Build for production
npm run preview      # Preview production build
npm run check        # Run svelte-check for type errors
```

## Tech Stack

- **SvelteKit** with TypeScript and Svelte 5 runes
- **Tailwind CSS v4** via @tailwindcss/vite plugin
- **Vite** for bundling

## Project Structure

```
src/
├── lib/
│   ├── api/           # API client and endpoints
│   │   ├── client.ts  # Base fetch wrapper with auth
│   │   ├── types.ts   # TypeScript interfaces
│   │   ├── auth.ts, movies.ts, albums.ts, weeks.ts
│   ├── stores/        # Svelte stores
│   │   ├── auth.ts    # Auth state (user, token)
│   │   └── toast.ts   # Toast notifications
│   ├── components/    # Reusable components
│   │   ├── ui/        # Button, Input, Toast
│   │   ├── layout/    # Header (dropdown nav: Weeks, Media, Search)
│   │   ├── movies/    # MovieCard, MovieSlot
│   │   ├── albums/    # AlbumCard, AlbumSlot
│   │   └── weeks/     # WeekCard, WeekHeader, WeekPicker
│   └── utils/         # Utilities
│       ├── dates.ts   # ISO week formatting
│       └── images.ts  # TMDB image URL helpers
└── routes/
    ├── +layout.svelte # Root layout with auth guard
    ├── login/, register/
    ├── weeks/, weeks/current/, weeks/[id]/
    ├── movies/          # Add Movie (search)
    ├── movies/all/      # All Movies (selections list)
    ├── movies/[tmdbId]/ # Movie details
    ├── albums/          # Add Album (search)
    ├── albums/all/      # All Albums (selections list)
    └── albums/[musicbrainzId]/ # Album details
```

## Key Architecture Patterns

- **Auth Guard**: Root layout checks auth state, redirects to `/login` if unauthenticated
- **Token Storage**: JWT stored in localStorage, auto-injected by API client
- **401 Handling**: API client clears token and redirects to login on 401
- **API Client**: All requests go through `src/lib/api/client.ts` which handles auth headers
- **API Proxy**: Vite dev server proxies `/api` requests to backend at `localhost:8000` (configured in `vite.config.ts`)

## Project Overview

This is the frontend application for "Wrong Opinions" - a web application for tracking weekly movie and music selections. Users can search for movies (via TMDB) and albums (via MusicBrainz), then create weekly selections with up to 2 movies and 2 albums per ISO calendar week.

**Backend API:** The backend runs at `http://localhost:8000` with API endpoints prefixed at `/api`. See API.md for complete endpoint documentation.

**Key Domain Concepts:**
- **ISO Week System**: Weeks are identified by year + week_number (1-53). Week 1 is the first week with at least 4 days in the new year. Weeks start on Monday.
- **Week Ownership**: Only one week can exist per year+week_number globally (across all users). Weeks can be **unclaimed** (`user_id: null`) or **owned** by a user. When a user adds a selection to an unclaimed week, they automatically claim ownership. Owners can delete their weeks to allow another user to claim them. All authenticated users can view all weeks.
- **Selections**: Each week can have 0-2 movies (position 1 and 2) and 0-2 albums (position 1 and 2).
- **Authentication**: JWT-based authentication required for most endpoints. Token is obtained via `/api/auth/login` and sent as `Authorization: Bearer <token>` header.

## API Architecture

### Authentication Flow
1. User registers via `POST /api/auth/register`
2. User logs in via `POST /api/auth/login` to receive JWT token
3. Token must be included in `Authorization: Bearer <token>` header for protected endpoints
4. Token expiration returns 401 - client should redirect to login

### Image URLs
**TMDB Images:**
- Search/details endpoints return full poster URLs
- Week selections return only `poster_path` (path without base URL)
- Construct full URL: `https://image.tmdb.org/t/p/w500/{poster_path}`
- Available sizes: w92, w154, w185, w342, w500, w780, original
- Backdrop sizes: w300, w780, w1280, original

**MusicBrainz Cover Art:**
- Full URLs provided in responses
- May return 404 if unavailable
- Frontend displays `ALBUM_PLACEHOLDER` SVG (from `src/lib/utils/images.ts`) when cover art is null or fails to load

### Rate Limiting
**MusicBrainz**: Hard limit of 1 request per second. API returns 429 with `Retry-After` header if exceeded. Frontend should implement retry logic or queue requests.

**TMDB**: 40 requests per 10 seconds (generous, unlikely to hit in normal usage).

### Data Caching
The backend caches external API responses. When `cached: true`, some fields may be `null` because only a subset is stored in cache.

**Album Artist Names:** The `album.artist` field in cached data contains the English/romanized name. The `/albums/{id}/credits` endpoint returns detailed artist information including native script names. The album details page prefers `album.artist` for consistent English display, falling back to credits data. The Artists section uses `sort_name` (romanized) as primary with native `name` shown below when different. Artists are deduplicated by `musicbrainz_id` since the API may return duplicates for different roles.

## Common Frontend Workflows

### Display Current Week
```javascript
// GET /api/weeks/current returns the current ISO week
// Auto-creates as unclaimed if doesn't exist
// Returns week with movies[] and albums[] arrays
// If unclaimed (user_id: null), any user can add selections to claim it
```

### Add Movie to Week
```javascript
// 1. WeekPicker loads editable weeks (owned by user or unclaimed)
// 2. User selects target week or creates new week inline
// 3. Search: GET /api/movies/search?query=inception
//    OR lookup by ID: GET /api/movies/{tmdb_id}
// 4. Determine available position (1 or 2) for selected week
// 5. Add: POST /api/weeks/{week_id}/movies
//    Body: { tmdb_id: 27205, position: 1 }
// 6. Handle 409 if position occupied
```

**Manual Movie Lookup:** The movie search page also accepts direct TMDB IDs or URLs (e.g., `83533` or `https://www.themoviedb.org/movie/83533-avatar-fire-and-ash`). This uses the `/api/movies/{id}` details endpoint directly.

### Add Album to Week
```javascript
// 1. WeekPicker loads editable weeks (owned by user or unclaimed)
// 2. User selects target week or creates new week inline
// 3. Search: GET /api/albums/search?query=dark+side+of+the+moon
//    OR lookup by ID: GET /api/albums/{musicbrainz_id}
// 4. Determine available position (1 or 2) for selected week
// 5. Add: POST /api/weeks/{week_id}/albums
//    Body: { musicbrainz_id: "uuid", position: 1 }
// 6. Handle 429 rate limit (retry after delay)
```

**Manual Album Lookup:** The album search page also accepts direct MusicBrainz release IDs or URLs (e.g., `e38b19cd-6599-4d41-bc4d-eb50b9b3749d` or `https://musicbrainz.org/release/e38b19cd-6599-4d41-bc4d-eb50b9b3749d`). This uses the `/api/albums/{id}` details endpoint directly.

**WeekPicker Component:** Used on movie/album search and detail pages. Allows users to select any editable week (past or future up to 1 week ahead) or create new weeks inline. Shows slot availability for the selected week.

### Browse Week History
```javascript
// GET /api/weeks?page=1&page_size=20&year=2025
// Returns all weeks from all users
// Use GET /api/weeks/{week_id} for full details with selections
```

### Browse All Selected Movies/Albums
```javascript
// GET /api/movies/selections?page=1&page_size=20
// Returns all movies ever selected, with week context
// Each movie includes selections[] array with week_id, year, week_number, position

// GET /api/albums/selections?page=1&page_size=20
// Returns all albums ever selected, with week context
```

## Design System

### Typography
- **Headings**: Source Serif 4 (Google Fonts) - warm, readable serif
- **Body**: Source Sans 3 (Google Fonts) - clean sans-serif
- Fonts loaded via `app.html`, applied via CSS custom properties in `app.css`

### Color Palette (defined in `app.css` @theme)
| Purpose | Light Mode | Dark Mode |
|---------|-----------|-----------|
| Background | `cream-50`, `cream-100` | `stone-900`, `stone-800` |
| Text Primary | `stone-800` | `cream-100` |
| Text Secondary | `stone-500`, `stone-600` | `stone-400` |
| Accent/Primary | `amber-600`, `amber-700` | `amber-500` |
| Success | `sage-600` | `sage-500` |
| Error/Danger | `rose-500`, `rose-600` | `rose-500` |
| Borders | `cream-200`, `cream-300` | `stone-700` |

### Component Patterns
- **Cards**: White background with `border border-cream-200` (not shadows), `rounded-md`
- **Buttons**: `rounded-md`, amber primary, cream secondary, rose danger
- **Inputs**: `rounded-md`, cream borders, amber focus ring
- **Hover states**: Border color change to `amber-400` for cards, background darkening for buttons
- **Loading spinners**: `border-amber-600`
- **Error alerts**: `bg-rose-50 border-rose-200 text-rose-700`
- **Slot cards (MovieSlot/AlbumSlot)**: Fixed `h-36` content height for visual consistency. Movie posters fill the full height; album covers (square) are vertically centered within the container. Remove button shows confirmation prompt before deletion.

### Dark Mode
Uses `prefers-color-scheme: dark` media query. Stone grays replace cream tones, text uses `cream-100`.

## Important Constraints

- **Week Uniqueness**: Only one week per year+week_number globally. Attempting to create a duplicate returns 409.
- **Ownership**: Only the week owner (`user_id`) can add/remove movies/albums, update notes, or delete the week. Exception: **unclaimed weeks** (`user_id: null`) can have selections added by any authenticated user, which claims the week for them.
- **Positions**: Movies and albums each support positions 1 and 2. Cannot add to occupied position (409 error).
- **Date Formats**: All timestamps are ISO 8601 with UTC (e.g., `2025-12-28T16:05:00Z`). Release dates are ISO date format (`2025-12-28`). MusicBrainz dates may be partial (YYYY, YYYY-MM, or YYYY-MM-DD).
- **Error Handling**: All errors return `{ "detail": "error message" }` format. Key status codes: 401 (auth), 403 (forbidden), 404 (not found), 409 (conflict), 422 (validation), 429 (rate limit).
- **Connection Errors**: The API client handles backend unavailability gracefully, showing "Unable to connect to server" for network errors, 5xx responses, and JSON parse failures (e.g., when Vite proxy returns HTML error pages).
