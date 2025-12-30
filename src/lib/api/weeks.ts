import { api } from './client';
import type {
	Week,
	WeekWithSelections,
	WeekListResponse,
	CreateWeekRequest,
	AddMovieRequest,
	AddAlbumRequest,
	AddMovieResponse,
	AddAlbumResponse
} from './types';

export const weeksApi = {
	list: (page = 1, pageSize = 20, year?: number) => {
		const params = new URLSearchParams({
			page: String(page),
			page_size: String(pageSize)
		});
		if (year) {
			params.set('year', String(year));
		}
		return api.get<WeekListResponse>(`/weeks?${params}`);
	},

	current: () => api.get<WeekWithSelections>('/weeks/current'),

	get: (id: number) => api.get<WeekWithSelections>(`/weeks/${id}`),

	create: (data: CreateWeekRequest) => api.post<Week>('/weeks', data),

	update: (id: number, notes: string | null) => api.patch<Week>(`/weeks/${id}`, { notes }),

	delete: (id: number) => api.delete(`/weeks/${id}`),

	addMovie: (weekId: number, data: AddMovieRequest) =>
		api.post<AddMovieResponse>(`/weeks/${weekId}/movies`, data),

	removeMovie: (weekId: number, position: 1 | 2) =>
		api.delete(`/weeks/${weekId}/movies/${position}`),

	addAlbum: (weekId: number, data: AddAlbumRequest) =>
		api.post<AddAlbumResponse>(`/weeks/${weekId}/albums`, data),

	removeAlbum: (weekId: number, position: 1 | 2) =>
		api.delete(`/weeks/${weekId}/albums/${position}`)
};
