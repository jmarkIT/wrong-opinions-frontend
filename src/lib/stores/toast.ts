import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
	id: string;
	type: ToastType;
	message: string;
}

function createToastStore() {
	const { subscribe, update } = writable<Toast[]>([]);

	function add(type: ToastType, message: string, duration = 5000) {
		const id = crypto.randomUUID();

		update((toasts) => [...toasts, { id, type, message }]);

		if (duration > 0) {
			setTimeout(() => {
				remove(id);
			}, duration);
		}

		return id;
	}

	function remove(id: string) {
		update((toasts) => toasts.filter((t) => t.id !== id));
	}

	return {
		subscribe,
		success: (message: string, duration?: number) => add('success', message, duration),
		error: (message: string, duration?: number) => add('error', message, duration),
		info: (message: string, duration?: number) => add('info', message, duration),
		remove
	};
}

export const toasts = createToastStore();
