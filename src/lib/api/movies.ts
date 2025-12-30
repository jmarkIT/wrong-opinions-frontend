import { api } from './client';
import type { MovieSearchResponse, MovieDetails, MovieCredits, MovieSelectionsResponse } from './types';

export const moviesApi = {
	search: (query: string, page = 1, year?: number) => {
		const params = new URLSearchParams({
			query,
			page: String(page)
		});
		if (year) {
			params.set('year', String(year));
		}
		return api.get<MovieSearchResponse>(`/movies/search?${params}`);
	},

	details: (tmdbId: number) => api.get<MovieDetails>(`/movies/${tmdbId}`),

	credits: (tmdbId: number, limit = 10) =>
		api.get<MovieCredits>(`/movies/${tmdbId}/credits?limit=${limit}`),

	selections: (page = 1, pageSize = 20) => {
		const params = new URLSearchParams({
			page: String(page),
			page_size: String(pageSize)
		});
		return api.get<MovieSelectionsResponse>(`/movies/selections?${params}`);
	}
};
