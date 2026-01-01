# Wrong Opinions API Documentation

**Version:** 0.1.0

## Overview

The Wrong Opinions API is a RESTful API for tracking weekly movie and music selections. Users can search for movies and albums, create weekly selections, and associate up to 2 movies and 2 albums per ISO week.

### Base URL

```
http://localhost:8000
```

### API Prefix

All API endpoints (except `/health`) are prefixed with `/api`:

```
http://localhost:8000/api
```

### Content Type

All requests and responses use JSON:

```
Content-Type: application/json
```

---

## Authentication

Most endpoints require authentication using JWT (JSON Web Tokens).

### Authentication Flow

1. **Register** a new user account (`POST /api/auth/register`)
2. **Login** to receive a JWT token (`POST /api/auth/login`)
3. **Include the token** in the `Authorization` header for protected endpoints

### Authorization Header Format

```
Authorization: Bearer <your-jwt-token>
```

### Token Expiration

JWT tokens expire after a set period. When a token expires, the API returns a 401 Unauthorized error. The client should redirect to login.

---

## Error Responses

All errors follow a consistent format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

### HTTP Status Codes

| Status Code | Meaning |
|-------------|---------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created successfully |
| 204 | No Content - Request succeeded with no response body |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Missing or invalid authentication |
| 403 | Forbidden - Authenticated but not authorized |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists or constraint violated |
| 422 | Unprocessable Entity - Validation error |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

---

## Endpoints

### Health Check

#### `GET /health`

Check if the API is running.

**Authentication:** Not required

**Response:** `200 OK`

```json
{
  "status": "healthy",
  "version": "0.1.0"
}
```

---

## Authentication Endpoints

### Register User

#### `POST /api/auth/register`

Create a new user account.

**Authentication:** Not required

**Request Body:**

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Validation Rules:**
- `username`: 3-50 characters, alphanumeric with underscores/hyphens, converted to lowercase
- `email`: Valid email address
- `password`: 8-100 characters

**Response:** `201 Created`

```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "is_active": true,
  "created_at": "2025-12-28T10:30:00Z"
}
```

**Errors:**
- `409 Conflict` - Username or email already exists
- `422 Unprocessable Entity` - Validation failed

---

### Login

#### `POST /api/auth/login`

Authenticate and receive a JWT token.

**Authentication:** Not required

**Request Body:**

```json
{
  "username": "johndoe",
  "password": "securepassword123"
}
```

**Note:** The `username` field accepts either a username OR email address.

**Response:** `200 OK`

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Errors:**
- `401 Unauthorized` - Invalid credentials
- `403 Forbidden` - User account is inactive

---

### Get Current User

#### `GET /api/auth/me`

Get the authenticated user's information.

**Authentication:** Required

**Response:** `200 OK`

```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "is_active": true,
  "created_at": "2025-12-28T10:30:00Z"
}
```

**Errors:**
- `401 Unauthorized` - Missing or invalid token

---

## Movie Endpoints

### Search Movies

#### `GET /api/movies/search`

Search for movies using TMDB.

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Search query (min 1 character) |
| `page` | integer | No | Page number (default: 1, min: 1) |
| `year` | integer | No | Filter by release year (1800-2100) |

**Example Request:**

```
GET /api/movies/search?query=inception&page=1&year=2010
```

**Response:** `200 OK`

```json
{
  "page": 1,
  "total_pages": 1,
  "total_results": 3,
  "results": [
    {
      "tmdb_id": 27205,
      "title": "Inception",
      "original_title": "Inception",
      "release_date": "2010-07-16",
      "poster_url": "https://image.tmdb.org/t/p/w500/...",
      "overview": "Cobb, a skilled thief who commits corporate espionage...",
      "vote_average": 8.4
    }
  ]
}
```

**Field Details:**
- `poster_url`: Full URL to poster image (or `null` if not available)
- `release_date`: ISO date string (or `null`)
- All dates are in YYYY-MM-DD format

---

### Get Movie Details

#### `GET /api/movies/{tmdb_id}`

Get detailed information about a specific movie.

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `tmdb_id` | integer | TMDB movie ID |

**Example Request:**

```
GET /api/movies/27205
```

**Response:** `200 OK`

```json
{
  "tmdb_id": 27205,
  "title": "Inception",
  "original_title": "Inception",
  "release_date": "2010-07-16",
  "poster_url": "https://image.tmdb.org/t/p/w500/...",
  "backdrop_url": "https://image.tmdb.org/t/p/w1280/...",
  "overview": "Cobb, a skilled thief who commits corporate espionage...",
  "runtime": 148,
  "vote_average": 8.4,
  "vote_count": 35000,
  "tagline": "Your mind is the scene of the crime.",
  "status": "Released",
  "imdb_id": "tt1375666",
  "cached": false
}
```

**Field Details:**
- `cached`: `true` if served from local cache, `false` if freshly fetched from TMDB
- When `cached: true`, some fields may be `null` (backdrop_url, runtime, vote_count, tagline, status, imdb_id)
- All URL fields can be `null` if images are not available

**Errors:**
- `404 Not Found` - Movie doesn't exist in TMDB

---

### Get Movie Credits

#### `GET /api/movies/{tmdb_id}/credits`

Get cast and crew information for a movie.

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `tmdb_id` | integer | TMDB movie ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | integer | No | Max cast/crew to return (default: 10, min: 1, max: 50) |

**Example Request:**

```
GET /api/movies/27205/credits?limit=5
```

**Response:** `200 OK`

```json
{
  "cast": [
    {
      "tmdb_id": 6193,
      "name": "Leonardo DiCaprio",
      "character": "Dom Cobb",
      "order": 0,
      "profile_url": "https://image.tmdb.org/t/p/w185/..."
    },
    {
      "tmdb_id": 3894,
      "name": "Joseph Gordon-Levitt",
      "character": "Arthur",
      "order": 1,
      "profile_url": "https://image.tmdb.org/t/p/w185/..."
    }
  ],
  "crew": [
    {
      "tmdb_id": 525,
      "name": "Christopher Nolan",
      "department": "Directing",
      "job": "Director",
      "profile_url": "https://image.tmdb.org/t/p/w185/..."
    },
    {
      "tmdb_id": 525,
      "name": "Christopher Nolan",
      "department": "Writing",
      "job": "Screenplay",
      "profile_url": "https://image.tmdb.org/t/p/w185/..."
    }
  ]
}
```

**Notes:**
- Cast is ordered by billing order (top-billed actors first)
- Crew is filtered to key roles: Director, Writer, Screenplay, Composer, Producer, Cinematography
- Results are cached in local database after first fetch
- `profile_url` can be `null` if no profile image exists

**Errors:**
- `404 Not Found` - Movie doesn't exist in TMDB

---

### List All Selected Movies

#### `GET /api/movies/selections`

List all movies that have been selected in any week, with week context.

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number (default: 1, min: 1) |
| `page_size` | integer | No | Items per page (default: 20, min: 1, max: 100) |

**Example Request:**

```
GET /api/movies/selections?page=1&page_size=20
```

**Response:** `200 OK`

```json
{
  "total": 42,
  "page": 1,
  "page_size": 20,
  "results": [
    {
      "id": 5,
      "tmdb_id": 550,
      "title": "Fight Club",
      "original_title": "Fight Club",
      "release_date": "1999-10-15",
      "poster_path": "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      "overview": "A ticking-time-bomb insomniac and a slippery soap salesman...",
      "cached_at": "2025-01-15T10:00:00Z",
      "selections": [
        {
          "week_id": 12,
          "year": 2025,
          "week_number": 3,
          "position": 1,
          "added_at": "2025-01-15T10:30:00Z"
        }
      ]
    }
  ]
}
```

**Field Details:**
- Results are sorted alphabetically by title
- `selections` array contains all weeks where this movie was selected
- Each selection includes the week context (year, week_number, position)
- Movies without any selections are not included

---

## Album Endpoints

### Search Albums

#### `GET /api/albums/search`

Search for albums using MusicBrainz.

**Authentication:** Required

**Rate Limit:** MusicBrainz enforces 1 request per second

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Search query (min 1 character) |
| `limit` | integer | No | Max results (default: 25, min: 1, max: 100) |
| `offset` | integer | No | Result offset for pagination (default: 0, min: 0) |

**Example Request:**

```
GET /api/albums/search?query=dark+side+of+the+moon&limit=10
```

**Response:** `200 OK`

```json
{
  "count": 150,
  "offset": 0,
  "results": [
    {
      "musicbrainz_id": "3f49f47e-0e67-4f90-a3c0-df47c9b4b8c9",
      "title": "The Dark Side of the Moon",
      "artist": "Pink Floyd",
      "release_date": "1973-03-01",
      "country": "GB",
      "score": 100,
      "cover_art_url": "https://coverartarchive.org/release/..."
    }
  ]
}
```

**Field Details:**
- `musicbrainz_id`: UUID format string
- `artist`: For albums with multiple artists, names are concatenated with their join phrases (e.g., "Jay-Z & Kanye West", "Artist feat. Guest")
- `release_date`: Can be YYYY, YYYY-MM, or YYYY-MM-DD format (or `null`)
- `score`: Search relevance score (0-100)
- `cover_art_url`: May be `null` if no cover art is available

**Errors:**
- `429 Too Many Requests` - Rate limit exceeded (includes `Retry-After` header)

---

### Get Album Details

#### `GET /api/albums/{musicbrainz_id}`

Get detailed information about a specific album.

**Authentication:** Required

**Rate Limit:** 1 request per second (MusicBrainz)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `musicbrainz_id` | string | MusicBrainz release ID (UUID) |

**Example Request:**

```
GET /api/albums/3f49f47e-0e67-4f90-a3c0-df47c9b4b8c9
```

**Response:** `200 OK`

```json
{
  "musicbrainz_id": "3f49f47e-0e67-4f90-a3c0-df47c9b4b8c9",
  "title": "The Dark Side of the Moon",
  "artist": "Pink Floyd",
  "release_date": "1973-03-01",
  "country": "GB",
  "status": "Official",
  "cover_art_url": "https://coverartarchive.org/release/...",
  "cached": false
}
```

**Field Details:**
- `cached`: `true` if from local cache, `false` if freshly fetched
- `artist`: For albums with multiple artists, names are concatenated with their join phrases (e.g., "Jay-Z & Kanye West")
- When `cached: true`, `country` and `status` may be `null`
- `release_date`: Can be partial (YYYY or YYYY-MM) or full (YYYY-MM-DD)

**Errors:**
- `404 Not Found` - Album doesn't exist in MusicBrainz
- `429 Too Many Requests` - Rate limit exceeded

---

### Get Album Credits

#### `GET /api/albums/{musicbrainz_id}/credits`

Get artist credits for an album.

**Authentication:** Required

**Rate Limit:** 1 request per second (MusicBrainz)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `musicbrainz_id` | string | MusicBrainz release ID (UUID) |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | integer | No | Max artists to return (default: 10, min: 1, max: 50) |

**Example Request:**

```
GET /api/albums/3f49f47e-0e67-4f90-a3c0-df47c9b4b8c9/credits?limit=5
```

**Response:** `200 OK`

```json
{
  "artists": [
    {
      "musicbrainz_id": "83d91898-7763-47d7-b03b-b92132375c47",
      "name": "Pink Floyd",
      "sort_name": "Pink Floyd",
      "disambiguation": "British progressive rock band",
      "artist_type": "Group",
      "country": "GB",
      "join_phrase": null,
      "order": 0
    }
  ]
}
```

**Field Details:**
- `join_phrase`: Used for multi-artist credits (e.g., " & ", " feat. "), `null` for single artists
- `order`: Position in the artist credit list
- `artist_type`: Can be "Person", "Group", "Orchestra", "Choir", etc.
- `disambiguation`: Additional info to distinguish between artists with same name
- Results are cached in local database after first fetch

**Errors:**
- `404 Not Found` - Album doesn't exist in MusicBrainz
- `429 Too Many Requests` - Rate limit exceeded

---

### List All Selected Albums

#### `GET /api/albums/selections`

List all albums that have been selected in any week, with week context.

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number (default: 1, min: 1) |
| `page_size` | integer | No | Items per page (default: 20, min: 1, max: 100) |

**Example Request:**

```
GET /api/albums/selections?page=1&page_size=20
```

**Response:** `200 OK`

```json
{
  "total": 35,
  "page": 1,
  "page_size": 20,
  "results": [
    {
      "id": 15,
      "musicbrainz_id": "3f49f47e-0e67-4f90-a3c0-df47c9b4b8c9",
      "title": "The Dark Side of the Moon",
      "artist": "Pink Floyd",
      "release_date": "1973-03-01",
      "cover_art_url": "https://coverartarchive.org/release/3f49f47e.../front",
      "selections": [
        {
          "week_id": 12,
          "year": 2025,
          "week_number": 3,
          "position": 1,
          "added_at": "2025-01-15T10:45:00Z"
        }
      ]
    }
  ]
}
```

**Field Details:**
- Results are sorted alphabetically by title
- `selections` array contains all weeks where this album was selected
- Each selection includes the week context (year, week_number, position)
- Albums without any selections are not included

---

## Week Endpoints

All week endpoints require authentication. Weeks are globally unique per calendar week (year + week_number), meaning only one selection can exist per week across all users. Any authenticated user can view all weeks, but only the owner can modify their week's selections.

### List Weeks

#### `GET /api/weeks`

List all weeks across all users with pagination.

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number (default: 1, min: 1) |
| `page_size` | integer | No | Items per page (default: 20, min: 1, max: 100) |
| `year` | integer | No | Filter by year (1900-2100) |

**Example Request:**

```
GET /api/weeks?page=1&page_size=20&year=2025
```

**Response:** `200 OK`

```json
{
  "total": 45,
  "page": 1,
  "page_size": 20,
  "results": [
    {
      "id": 123,
      "user_id": 1,
      "year": 2025,
      "week_number": 52,
      "notes": "Great selections this week!",
      "created_at": "2025-12-22T10:00:00Z",
      "updated_at": "2025-12-28T15:30:00Z",
      "owner": {
        "id": 1,
        "username": "johndoe"
      }
    }
  ]
}
```

**Notes:**
- Returns ALL weeks from all users (not filtered to current user)
- Results are ordered by year and week_number in descending order (most recent first)
- Does not include movie/album selections (use Get Week endpoint for full details)
- `owner` field indicates who created the week

---

### Create Week

#### `POST /api/weeks`

Create a new week selection.

**Authentication:** Required

**Request Body:**

```json
{
  "year": 2025,
  "week_number": 52,
  "notes": "Looking forward to watching these!"
}
```

**Validation Rules:**
- `year`: 1900-2100
- `week_number`: 1-53 (ISO week number)
- `notes`: Optional
- Only ONE week can exist per year+week_number globally (across all users)

**Response:** `201 Created`

```json
{
  "id": 124,
  "user_id": 1,
  "year": 2025,
  "week_number": 52,
  "notes": "Looking forward to watching these!",
  "created_at": "2025-12-28T16:00:00Z",
  "updated_at": "2025-12-28T16:00:00Z",
  "owner": {
    "id": 1,
    "username": "johndoe"
  }
}
```

**Errors:**
- `409 Conflict` - Week already exists (another user already created this week)
- `422 Unprocessable Entity` - Validation failed

---

### Get Current Week

#### `GET /api/weeks/current`

Get the week for the current ISO week, or create it if it doesn't exist.

**Authentication:** Required

**Response:** `200 OK`

```json
{
  "id": 124,
  "user_id": 1,
  "year": 2025,
  "week_number": 52,
  "notes": null,
  "created_at": "2025-12-28T16:00:00Z",
  "updated_at": "2025-12-28T16:00:00Z",
  "owner": {
    "id": 1,
    "username": "johndoe"
  },
  "movies": [
    {
      "position": 1,
      "added_at": "2025-12-28T16:05:00Z",
      "movie": {
        "id": 42,
        "tmdb_id": 27205,
        "title": "Inception",
        "original_title": "Inception",
        "release_date": "2010-07-16",
        "poster_path": "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
        "overview": "Cobb, a skilled thief...",
        "cached_at": "2025-12-28T16:05:00Z"
      }
    }
  ],
  "albums": [
    {
      "position": 1,
      "added_at": "2025-12-28T16:10:00Z",
      "album": {
        "id": 15,
        "musicbrainz_id": "3f49f47e-0e67-4f90-a3c0-df47c9b4b8c9",
        "title": "The Dark Side of the Moon",
        "artist": "Pink Floyd",
        "release_date": "1973-03-01",
        "cover_art_url": "https://coverartarchive.org/release/...",
        "cached_at": "2025-12-28T16:10:00Z"
      }
    }
  ]
}
```

**Notes:**
- If a week for the current ISO week already exists (created by any user), returns that week
- Only creates a new week if no week exists for the current ISO week
- Returns the week with all associated movies and albums
- Useful for "This Week" views in the UI
- `movies` and `albums` arrays can be empty if nothing has been added yet
- If the returned week was created by another user, you cannot modify it (403 Forbidden)

---

### Get Week

#### `GET /api/weeks/{week_id}`

Get a specific week with its movie and album selections.

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `week_id` | integer | Week ID |

**Example Request:**

```
GET /api/weeks/124
```

**Response:** `200 OK`

```json
{
  "id": 124,
  "user_id": 1,
  "year": 2025,
  "week_number": 52,
  "notes": "Amazing week!",
  "created_at": "2025-12-28T16:00:00Z",
  "updated_at": "2025-12-28T16:15:00Z",
  "owner": {
    "id": 1,
    "username": "johndoe"
  },
  "movies": [
    {
      "position": 1,
      "added_at": "2025-12-28T16:05:00Z",
      "movie": {
        "id": 42,
        "tmdb_id": 27205,
        "title": "Inception",
        "original_title": "Inception",
        "release_date": "2010-07-16",
        "poster_path": "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
        "overview": "Cobb, a skilled thief...",
        "cached_at": "2025-12-28T16:05:00Z"
      }
    },
    {
      "position": 2,
      "added_at": "2025-12-28T16:06:00Z",
      "movie": {
        "id": 43,
        "tmdb_id": 550,
        "title": "Fight Club",
        "original_title": "Fight Club",
        "release_date": "1999-10-15",
        "poster_path": "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
        "overview": "A ticking-time-bomb insomniac...",
        "cached_at": "2025-12-28T16:06:00Z"
      }
    }
  ],
  "albums": []
}
```

**Notes:**
- Any authenticated user can view any week (not filtered by owner)
- `movies` array will have 0-2 items (position 1 and/or 2)
- `albums` array will have 0-2 items (position 1 and/or 2)
- `owner` field indicates who created the week

**Errors:**
- `404 Not Found` - Week doesn't exist

---

### Update Week

#### `PATCH /api/weeks/{week_id}`

Update a week's notes. Only the owner can update a week.

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `week_id` | integer | Week ID |

**Request Body:**

```json
{
  "notes": "Updated my thoughts on this week's selections."
}
```

**Notes:**
- Currently only supports updating the `notes` field
- Pass `null` to clear notes
- Only the owner of the week can perform this operation

**Response:** `200 OK`

```json
{
  "id": 124,
  "user_id": 1,
  "year": 2025,
  "week_number": 52,
  "notes": "Updated my thoughts on this week's selections.",
  "created_at": "2025-12-28T16:00:00Z",
  "updated_at": "2025-12-28T17:00:00Z",
  "owner": {
    "id": 1,
    "username": "johndoe"
  }
}
```

**Errors:**
- `403 Forbidden` - Not the owner of this week
- `404 Not Found` - Week doesn't exist

---

### Delete Week

#### `DELETE /api/weeks/{week_id}`

Delete a week and all its selections. Only the owner can delete a week.

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `week_id` | integer | Week ID |

**Response:** `204 No Content`

**Notes:**
- Deletes the week and all associated movie/album selections
- This action cannot be undone
- Only the owner of the week can perform this operation

**Errors:**
- `403 Forbidden` - Not the owner of this week
- `404 Not Found` - Week doesn't exist

---

### Add Movie to Week

#### `POST /api/weeks/{week_id}/movies`

Add a movie to a week selection. Only the owner can add movies to a week.

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `week_id` | integer | Week ID |

**Request Body:**

```json
{
  "tmdb_id": 27205,
  "position": 1
}
```

**Validation Rules:**
- `position`: Must be 1 or 2
- Position must not already be occupied
- Movie will be fetched from TMDB if not in local cache
- Only the owner of the week can perform this operation

**Response:** `201 Created`

```json
{
  "week_id": 124,
  "position": 1,
  "added_at": "2025-12-28T16:05:00Z",
  "movie": {
    "id": 42,
    "tmdb_id": 27205,
    "title": "Inception",
    "original_title": "Inception",
    "release_date": "2010-07-16",
    "poster_path": "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    "overview": "Cobb, a skilled thief...",
    "cached_at": "2025-12-28T16:05:00Z"
  }
}
```

**Errors:**
- `403 Forbidden` - Not the owner of this week
- `404 Not Found` - Week doesn't exist or movie not found in TMDB
- `409 Conflict` - Position is already occupied
- `422 Unprocessable Entity` - Invalid position (not 1 or 2)

---

### Remove Movie from Week

#### `DELETE /api/weeks/{week_id}/movies/{position}`

Remove a movie from a week selection. Only the owner can remove movies from a week.

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `week_id` | integer | Week ID |
| `position` | integer | Position (1 or 2) |

**Response:** `204 No Content`

**Errors:**
- `400 Bad Request` - Invalid position (not 1 or 2)
- `403 Forbidden` - Not the owner of this week
- `404 Not Found` - Week doesn't exist or no movie at that position

---

### Add Album to Week

#### `POST /api/weeks/{week_id}/albums`

Add an album to a week selection. Only the owner can add albums to a week.

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `week_id` | integer | Week ID |

**Request Body:**

```json
{
  "musicbrainz_id": "3f49f47e-0e67-4f90-a3c0-df47c9b4b8c9",
  "position": 1
}
```

**Validation Rules:**
- `position`: Must be 1 or 2
- Position must not already be occupied
- Album will be fetched from MusicBrainz if not in local cache
- Only the owner of the week can perform this operation

**Response:** `201 Created`

```json
{
  "week_id": 124,
  "position": 1,
  "added_at": "2025-12-28T16:10:00Z",
  "album": {
    "id": 15,
    "musicbrainz_id": "3f49f47e-0e67-4f90-a3c0-df47c9b4b8c9",
    "title": "The Dark Side of the Moon",
    "artist": "Pink Floyd",
    "release_date": "1973-03-01",
    "cover_art_url": "https://coverartarchive.org/release/...",
    "cached_at": "2025-12-28T16:10:00Z"
  }
}
```

**Errors:**
- `403 Forbidden` - Not the owner of this week
- `404 Not Found` - Week doesn't exist or album not found in MusicBrainz
- `409 Conflict` - Position is already occupied
- `422 Unprocessable Entity` - Invalid position (not 1 or 2)
- `429 Too Many Requests` - MusicBrainz rate limit exceeded

---

### Remove Album from Week

#### `DELETE /api/weeks/{week_id}/albums/{position}`

Remove an album from a week selection. Only the owner can remove albums from a week.

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `week_id` | integer | Week ID |
| `position` | integer | Position (1 or 2) |

**Response:** `204 No Content`

**Errors:**
- `400 Bad Request` - Invalid position (not 1 or 2)
- `403 Forbidden` - Not the owner of this week
- `404 Not Found` - Week doesn't exist or no album at that position

---

## Data Models

### User

```typescript
{
  id: number
  username: string
  email: string
  is_active: boolean
  created_at: string  // ISO 8601 datetime
}
```

### Movie (Search Result)

```typescript
{
  tmdb_id: number
  title: string
  original_title: string | null
  release_date: string | null  // YYYY-MM-DD
  poster_url: string | null
  overview: string | null
  vote_average: number  // 0.0-10.0
}
```

### Movie (Details)

```typescript
{
  tmdb_id: number
  title: string
  original_title: string | null
  release_date: string | null  // YYYY-MM-DD
  poster_url: string | null
  backdrop_url: string | null
  overview: string | null
  runtime: number | null  // minutes
  vote_average: number  // 0.0-10.0
  vote_count: number
  tagline: string | null
  status: string | null  // "Released", "Post Production", etc.
  imdb_id: string | null  // e.g., "tt1375666"
  cached: boolean
}
```

### Movie Credits

```typescript
{
  cast: [
    {
      tmdb_id: number
      name: string
      character: string | null
      order: number  // billing order, 0 is top-billed
      profile_url: string | null
    }
  ],
  crew: [
    {
      tmdb_id: number
      name: string
      department: string | null  // "Directing", "Writing", etc.
      job: string | null  // "Director", "Screenplay", etc.
      profile_url: string | null
    }
  ]
}
```

### Album (Search Result)

```typescript
{
  musicbrainz_id: string  // UUID
  title: string
  artist: string | null  // Multiple artists concatenated with join phrases
  release_date: string | null  // YYYY, YYYY-MM, or YYYY-MM-DD
  country: string | null  // ISO country code
  score: number  // search relevance, 0-100
  cover_art_url: string | null
}
```

### Album (Details)

```typescript
{
  musicbrainz_id: string  // UUID
  title: string
  artist: string | null  // Multiple artists concatenated with join phrases
  release_date: string | null  // YYYY, YYYY-MM, or YYYY-MM-DD
  country: string | null  // ISO country code
  status: string | null  // "Official", "Promotion", etc.
  cover_art_url: string | null
  cached: boolean
}
```

### Album Credits

```typescript
{
  artists: [
    {
      musicbrainz_id: string  // UUID
      name: string
      sort_name: string | null
      disambiguation: string | null
      artist_type: string | null  // "Person", "Group", etc.
      country: string | null  // ISO country code
      join_phrase: string | null  // " & ", " feat. ", etc.
      order: number
    }
  ]
}
```

### Movie Selection Week

```typescript
{
  week_id: number
  year: number
  week_number: number  // 1-53 (ISO week)
  position: number  // 1 or 2
  added_at: string  // ISO 8601 datetime
}
```

### Movie with Selections

```typescript
{
  id: number  // local database ID
  tmdb_id: number
  title: string
  original_title: string | null
  release_date: string | null  // YYYY-MM-DD
  poster_path: string | null
  overview: string | null
  cached_at: string  // ISO 8601 datetime
  selections: MovieSelectionWeek[]
}
```

### Movie Selections List Response

```typescript
{
  total: number
  page: number
  page_size: number
  results: MovieWithSelections[]
}
```

### Album Selection Week

```typescript
{
  week_id: number
  year: number
  week_number: number  // 1-53 (ISO week)
  position: number  // 1 or 2
  added_at: string  // ISO 8601 datetime
}
```

### Album with Selections

```typescript
{
  id: number  // local database ID
  musicbrainz_id: string  // UUID
  title: string
  artist: string  // Multiple artists concatenated with join phrases
  release_date: string | null  // YYYY-MM-DD
  cover_art_url: string | null
  selections: AlbumSelectionWeek[]
}
```

### Album Selections List Response

```typescript
{
  total: number
  page: number
  page_size: number
  results: AlbumWithSelections[]
}
```

### Week Owner

```typescript
{
  id: number
  username: string
}
```

### Week

```typescript
{
  id: number
  user_id: number
  year: number
  week_number: number  // 1-53 (ISO week)
  notes: string | null
  created_at: string  // ISO 8601 datetime
  updated_at: string  // ISO 8601 datetime
  owner: WeekOwner | null  // Who created this week
}
```

### Week with Selections

```typescript
{
  id: number
  user_id: number
  year: number
  week_number: number
  notes: string | null
  created_at: string
  updated_at: string
  owner: WeekOwner | null  // Who created this week
  movies: [
    {
      position: number  // 1 or 2
      added_at: string  // ISO 8601 datetime
      movie: {
        id: number  // local database ID
        tmdb_id: number
        title: string
        original_title: string | null
        release_date: string | null  // YYYY-MM-DD
        poster_path: string | null  // path only, not full URL
        overview: string | null
        cached_at: string  // ISO 8601 datetime
      }
    }
  ],
  albums: [
    {
      position: number  // 1 or 2
      added_at: string  // ISO 8601 datetime
      album: {
        id: number  // local database ID
        musicbrainz_id: string
        title: string
        artist: string
        release_date: string | null  // YYYY-MM-DD
        cover_art_url: string | null
        cached_at: string  // ISO 8601 datetime
      }
    }
  ]
}
```

---

## Important Notes

### ISO Week Numbers

This API uses ISO 8601 week numbers:
- Weeks start on Monday
- Week 1 is the first week with at least 4 days in the new year
- Year boundaries may differ from calendar years (e.g., Jan 1 might be in week 52/53 of previous year)

Most programming languages have built-in ISO week support:
- JavaScript: `new Date().toISOString()` + manual calculation or use libraries like `date-fns`
- Python: `datetime.date.today().isocalendar()`

### Image URLs

**TMDB Images:**
- Poster URLs are provided as full URLs in search/details responses
- In week selections, only `poster_path` is provided (without base URL)
- To construct full URL: `https://image.tmdb.org/t/p/w500/{poster_path}`
- Available sizes: w92, w154, w185, w342, w500, w780, original
- Backdrop sizes: w300, w780, w1280, original

**MusicBrainz Cover Art:**
- Cover art URLs are provided as full URLs
- Format: `https://coverartarchive.org/release/{musicbrainz_id}/front-500`
- May return 404 if no cover art is available

### Rate Limiting

**MusicBrainz:**
- Hard limit of 1 request per second
- The API implements automatic rate limiting
- If exceeded, returns `429 Too Many Requests` with `Retry-After` header
- Frontend should implement retry logic or queue requests

**TMDB:**
- Much more generous rate limits (40 requests per 10 seconds)
- Unlikely to hit limits in normal usage

### Caching

The API caches external API responses locally:
- Reduces load on external APIs
- Improves response times
- Allows offline operation for previously fetched data

When `cached: true`, some fields may be `null` because the cache stores a subset of data.

### Date Formats

**All timestamps** use ISO 8601 format with UTC timezone:
```
2025-12-28T16:05:00Z
```

**Date-only fields** (release dates) use ISO date format:
```
2025-12-28
```

MusicBrainz dates may be partial:
- `2025` (year only)
- `2025-12` (year and month)
- `2025-12-28` (full date)

### Week Constraints

Each week can have:
- **0-2 movies** (positions 1 and 2)
- **0-2 albums** (positions 1 and 2)
- Only ONE week can exist per year+week_number combination globally (across all users)
- The `user_id` indicates who owns the week and can modify it
- Any authenticated user can view all weeks
- Only the owner can add/remove movies/albums, update notes, or delete the week

### Auto-generated Documentation

The API also provides auto-generated OpenAPI documentation:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`
- **OpenAPI JSON:** `http://localhost:8000/openapi.json`

---

## Example Frontend Workflows

### User Registration & Login

```javascript
// 1. Register
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'johndoe',
    email: 'john@example.com',
    password: 'securepass123'
  })
})

// 2. Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'johndoe',
    password: 'securepass123'
  })
})

const { access_token } = await loginResponse.json()

// 3. Store token
localStorage.setItem('token', access_token)

// 4. Use token for authenticated requests
const weekResponse = await fetch('/api/weeks/current', {
  headers: {
    'Authorization': `Bearer ${access_token}`
  }
})
```

### Building a "My Week" Page

```javascript
// Get current week (auto-creates if doesn't exist)
const response = await fetch('/api/weeks/current', {
  headers: { 'Authorization': `Bearer ${token}` }
})

const week = await response.json()
// week contains: id, year, week_number, notes, movies[], albums[]

// Display movies (0-2)
week.movies.forEach(selection => {
  const movie = selection.movie
  const posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`
  // Render movie at position selection.position
})

// Display albums (0-2)
week.albums.forEach(selection => {
  const album = selection.album
  // album.cover_art_url is already a full URL
  // Render album at position selection.position
})
```

### Adding a Movie to Current Week

```javascript
// 1. Search for movie
const searchResponse = await fetch(
  '/api/movies/search?query=inception'
)
const { results } = await searchResponse.json()

// 2. Get current week
const weekResponse = await fetch('/api/weeks/current', {
  headers: { 'Authorization': `Bearer ${token}` }
})
const week = await weekResponse.json()

// 3. Determine available position
const usedPositions = week.movies.map(m => m.position)
const availablePosition = [1, 2].find(p => !usedPositions.includes(p))

// 4. Add movie to week
const addResponse = await fetch(`/api/weeks/${week.id}/movies`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    tmdb_id: results[0].tmdb_id,
    position: availablePosition
  })
})

if (addResponse.status === 409) {
  // Position already occupied, need to remove first or use other position
}
```

### Browsing Week History

```javascript
// List weeks with pagination and year filter
const response = await fetch(
  '/api/weeks?page=1&page_size=20&year=2025',
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
)

const { total, page, page_size, results } = await response.json()
const totalPages = Math.ceil(total / page_size)

// Get full details for a specific week
const weekDetailsResponse = await fetch(
  `/api/weeks/${results[0].id}`,
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
)

const weekWithSelections = await weekDetailsResponse.json()
// weekWithSelections includes movies[] and albums[]
```

---

## Questions or Issues?

For questions about this API or to report issues, please refer to:
- **OpenAPI Documentation:** `/docs` endpoint
- **Architecture Documentation:** `ARCHITECTURE.md`
- **Developer Guide:** `CLAUDE.md`
