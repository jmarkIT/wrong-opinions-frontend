import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import { api, setToken, clearToken } from '$lib/api/client';
import type { User, LoginRequest, RegisterRequest, TokenResponse } from '$lib/api/types';

interface AuthState {
	user: User | null;
	isLoading: boolean;
	isInitialized: boolean;
}

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>({
		user: null,
		isLoading: false,
		isInitialized: false
	});

	return {
		subscribe,

		async initialize() {
			if (!browser) return;

			const token = localStorage.getItem('auth_token');
			if (!token) {
				update((state) => ({ ...state, isInitialized: true }));
				return;
			}

			update((state) => ({ ...state, isLoading: true }));

			const response = await api.get<User>('/auth/me');

			if (response.data) {
				update((state) => ({
					...state,
					user: response.data!,
					isLoading: false,
					isInitialized: true
				}));
			} else {
				clearToken();
				update((state) => ({
					...state,
					user: null,
					isLoading: false,
					isInitialized: true
				}));
			}
		},

		async login(credentials: LoginRequest): Promise<{ success: boolean; error?: string }> {
			update((state) => ({ ...state, isLoading: true }));

			const response = await api.post<TokenResponse>('/auth/login', credentials);

			if (response.error) {
				update((state) => ({ ...state, isLoading: false }));
				return { success: false, error: response.error.detail };
			}

			setToken(response.data!.access_token);

			// Fetch user info
			const userResponse = await api.get<User>('/auth/me');

			if (userResponse.error) {
				clearToken();
				update((state) => ({ ...state, isLoading: false }));
				return { success: false, error: userResponse.error.detail };
			}

			update((state) => ({
				...state,
				user: userResponse.data!,
				isLoading: false
			}));

			return { success: true };
		},

		async register(
			data: RegisterRequest
		): Promise<{ success: boolean; error?: string }> {
			update((state) => ({ ...state, isLoading: true }));

			const response = await api.post<User>('/auth/register', data);

			update((state) => ({ ...state, isLoading: false }));

			if (response.error) {
				return { success: false, error: response.error.detail };
			}

			return { success: true };
		},

		logout() {
			clearToken();
			set({ user: null, isLoading: false, isInitialized: true });
		},

		isOwner(userId: number): boolean {
			const state = get({ subscribe });
			return state.user?.id === userId;
		}
	};
}

export const auth = createAuthStore();

export const isAuthenticated = derived(auth, ($auth) => $auth.user !== null);
export const currentUser = derived(auth, ($auth) => $auth.user);
