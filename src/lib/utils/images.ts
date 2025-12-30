const TMDB_BASE = 'https://image.tmdb.org/t/p';

export type PosterSize = 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original';
export type BackdropSize = 'w300' | 'w780' | 'w1280' | 'original';
export type ProfileSize = 'w45' | 'w185' | 'h632' | 'original';

/**
 * Get full TMDB poster URL from a poster path
 */
export function getPosterUrl(path: string | null, size: PosterSize = 'w500'): string | null {
	if (!path) return null;
	return `${TMDB_BASE}/${size}${path}`;
}

/**
 * Get full TMDB backdrop URL from a backdrop path
 */
export function getBackdropUrl(path: string | null, size: BackdropSize = 'w1280'): string | null {
	if (!path) return null;
	return `${TMDB_BASE}/${size}${path}`;
}

/**
 * Get full TMDB profile URL from a profile path
 */
export function getProfileUrl(path: string | null, size: ProfileSize = 'w185'): string | null {
	if (!path) return null;
	return `${TMDB_BASE}/${size}${path}`;
}

/**
 * Movie poster placeholder SVG data URL
 */
export const MOVIE_PLACEHOLDER = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450" fill="#374151">
  <rect width="300" height="450" fill="#1f2937"/>
  <text x="150" y="225" text-anchor="middle" fill="#6b7280" font-size="48">🎬</text>
</svg>
`)}`;

/**
 * Album cover placeholder SVG data URL
 */
export const ALBUM_PLACEHOLDER = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" fill="#374151">
  <rect width="300" height="300" fill="#1f2937"/>
  <text x="150" y="150" text-anchor="middle" fill="#6b7280" font-size="48">💿</text>
</svg>
`)}`;
