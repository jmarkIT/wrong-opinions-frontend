import { api } from './client';
import type { MovieSearchResponse, MovieDetails, MovieCredits } from './types';

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
		api.get<MovieCredits>(`/movies/${tmdbId}/credits?limit=${limit}`)
};
