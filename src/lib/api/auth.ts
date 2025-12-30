import { api } from './client';
import type { User, RegisterRequest, LoginRequest, TokenResponse } from './types';

export const authApi = {
	register: (data: RegisterRequest) => api.post<User>('/auth/register', data),

	login: (data: LoginRequest) => api.post<TokenResponse>('/auth/login', data),

	me: () => api.get<User>('/auth/me')
};
