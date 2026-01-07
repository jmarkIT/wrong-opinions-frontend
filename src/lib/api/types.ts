// Authentication
export interface User {
	id: number;
	username: string;
	email: string;
	is_active: boolean;
	created_at: string;
}

export interface RegisterRequest {
	username: string;
	email: string;
	password: string;
}

export interface LoginRequest {
	username: string;
	password: string;
}

export interface TokenResponse {
	access_token: string;
	token_type: string;
}

// Movies
export interface MovieSearchResult {
	tmdb_id: number;
	title: string;
	original_title: string | null;
	release_date: string | null;
	poster_url: string | null;
	overview: string | null;
	vote_average: number;
}

export interface MovieSearchResponse {
	page: number;
	total_pages: number;
	total_results: number;
	results: MovieSearchResult[];
}

export interface MovieDetails {
	tmdb_id: number;
	title: string;
	original_title: string | null;
	release_date: string | null;
	poster_url: string | null;
	backdrop_url: string | null;
	overview: string | null;
	runtime: number | null;
	vote_average: number;
	vote_count: number;
	tagline: string | null;
	status: string | null;
	imdb_id: string | null;
	cached: boolean;
}

export interface CastMember {
	tmdb_id: number;
	name: string;
	character: string | null;
	order: number;
	profile_url: string | null;
}

export interface CrewMember {
	tmdb_id: number;
	name: string;
	department: string | null;
	job: string | null;
	profile_url: string | null;
}

export interface MovieCredits {
	cast: CastMember[];
	crew: CrewMember[];
}

// Albums
export interface AlbumSearchResult {
	musicbrainz_id: string;
	title: string;
	artist: string | null;
	release_date: string | null;
	country: string | null;
	score: number;
	cover_art_url: string | null;
}

export interface AlbumSearchResponse {
	count: number;
	offset: number;
	results: AlbumSearchResult[];
}

export interface AlbumDetails {
	musicbrainz_id: string;
	title: string;
	artist: string | null;
	release_date: string | null;
	country: string | null;
	status: string | null;
	cover_art_url: string | null;
	cached: boolean;
}

export interface Artist {
	musicbrainz_id: string;
	name: string;
	sort_name: string | null;
	disambiguation: string | null;
	artist_type: string | null;
	country: string | null;
	join_phrase: string | null;
	order: number;
}

export interface AlbumCredits {
	artists: Artist[];
}

// Weeks
export interface WeekOwner {
	id: number;
	username: string;
}

export interface Week {
	id: number;
	user_id: number | null; // null if week is unclaimed
	year: number;
	week_number: number;
	notes: string | null;
	created_at: string;
	updated_at: string;
	owner: WeekOwner | null; // null if week is unclaimed
}

export interface WeekMovie {
	id: number;
	tmdb_id: number;
	title: string;
	original_title: string | null;
	release_date: string | null;
	poster_path: string | null;
	overview: string | null;
	cached_at: string;
}

export interface WeekAlbum {
	id: number;
	musicbrainz_id: string;
	title: string;
	artist: string;
	release_date: string | null;
	cover_art_url: string | null;
	cached_at: string;
}

export interface WeekMovieSelection {
	position: number;
	added_at: string;
	movie: WeekMovie;
}

export interface WeekAlbumSelection {
	position: number;
	added_at: string;
	album: WeekAlbum;
}

export interface WeekWithSelections extends Week {
	movies: WeekMovieSelection[];
	albums: WeekAlbumSelection[];
}

export interface WeekListResponse {
	total: number;
	page: number;
	page_size: number;
	results: Week[];
}

export interface CreateWeekRequest {
	year: number;
	week_number: number;
	notes?: string;
}

export interface AddMovieRequest {
	tmdb_id: number;
	position: 1 | 2;
}

export interface AddAlbumRequest {
	musicbrainz_id: string;
	position: 1 | 2;
}

export interface AddMovieResponse {
	week_id: number;
	position: number;
	added_at: string;
	movie: WeekMovie;
}

export interface AddAlbumResponse {
	week_id: number;
	position: number;
	added_at: string;
	album: WeekAlbum;
}

// Movie Selections
export interface MovieSelectionWeek {
	week_id: number;
	year: number;
	week_number: number;
	position: number;
	added_at: string;
}

export interface MovieWithSelections {
	id: number;
	tmdb_id: number;
	title: string;
	original_title: string | null;
	release_date: string | null;
	poster_path: string | null;
	overview: string | null;
	cached_at: string;
	selections: MovieSelectionWeek[];
}

export interface MovieSelectionsResponse {
	total: number;
	page: number;
	page_size: number;
	results: MovieWithSelections[];
}

// Album Selections
export interface AlbumSelectionWeek {
	week_id: number;
	year: number;
	week_number: number;
	position: number;
	added_at: string;
}

export interface AlbumWithSelections {
	id: number;
	musicbrainz_id: string;
	title: string;
	artist: string;
	release_date: string | null;
	cover_art_url: string | null;
	selections: AlbumSelectionWeek[];
}

export interface AlbumSelectionsResponse {
	total: number;
	page: number;
	page_size: number;
	results: AlbumWithSelections[];
}

// API Error
export interface ApiError {
	detail: string;
	status: number;
}

export interface ApiResponse<T> {
	data?: T;
	error?: ApiError;
}
