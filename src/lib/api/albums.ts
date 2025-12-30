import { api } from './client';
import type { AlbumSearchResponse, AlbumDetails, AlbumCredits } from './types';

export const albumsApi = {
	search: (query: string, limit = 25, offset = 0) => {
		const params = new URLSearchParams({
			query,
			limit: String(limit),
			offset: String(offset)
		});
		return api.get<AlbumSearchResponse>(`/albums/search?${params}`);
	},

	details: (musicbrainzId: string) => api.get<AlbumDetails>(`/albums/${musicbrainzId}`),

	credits: (musicbrainzId: string, limit = 10) =>
		api.get<AlbumCredits>(`/albums/${musicbrainzId}/credits?limit=${limit}`)
};
