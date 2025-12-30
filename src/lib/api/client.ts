import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import type { ApiResponse } from './types';

// Use relative URL to leverage Vite proxy in development
const API_BASE = '/api';

function getToken(): string | null {
	if (!browser) return null;
	return localStorage.getItem('auth_token');
}

export function setToken(token: string): void {
	if (browser) {
		localStorage.setItem('auth_token', token);
	}
}

export function clearToken(): void {
	if (browser) {
		localStorage.removeItem('auth_token');
	}
}

async function request<T>(
	endpoint: string,
	options: RequestInit = {}
): Promise<ApiResponse<T>> {
	const token = getToken();
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...((options.headers as Record<string, string>) || {})
	};

	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	try {
		const response = await fetch(`${API_BASE}${endpoint}`, {
			...options,
			headers
		});

		// Handle 204 No Content
		if (response.status === 204) {
			return { data: undefined as T };
		}

		// Handle 401 Unauthorized
		if (response.status === 401) {
			clearToken();
			if (browser) {
				goto('/login');
			}
			return {
				error: {
					detail: 'Session expired. Please log in again.',
					status: 401
				}
			};
		}

		const data = await response.json();

		if (!response.ok) {
			return {
				error: {
					detail: data.detail || 'An error occurred',
					status: response.status
				}
			};
		}

		return { data };
	} catch (err) {
		return {
			error: {
				detail: err instanceof Error ? err.message : 'Network error',
				status: 0
			}
		};
	}
}

export const api = {
	get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),

	post: <T>(endpoint: string, body?: unknown) =>
		request<T>(endpoint, {
			method: 'POST',
			body: body ? JSON.stringify(body) : undefined
		}),

	patch: <T>(endpoint: string, body: unknown) =>
		request<T>(endpoint, {
			method: 'PATCH',
			body: JSON.stringify(body)
		}),

	delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' })
};
