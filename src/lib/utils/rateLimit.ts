/**
 * Rate limit queue for MusicBrainz API (1 request per second)
 */
class RateLimitQueue {
	private queue: Array<() => Promise<void>> = [];
	private isProcessing = false;
	private lastRequest = 0;
	private minInterval: number;

	constructor(minIntervalMs = 1000) {
		this.minInterval = minIntervalMs;
	}

	async add<T>(fn: () => Promise<T>): Promise<T> {
		return new Promise((resolve, reject) => {
			this.queue.push(async () => {
				try {
					const result = await fn();
					resolve(result);
				} catch (error) {
					reject(error);
				}
			});
			this.process();
		});
	}

	private async process() {
		if (this.isProcessing || this.queue.length === 0) return;
		this.isProcessing = true;

		const now = Date.now();
		const elapsed = now - this.lastRequest;

		if (elapsed < this.minInterval) {
			await new Promise((r) => setTimeout(r, this.minInterval - elapsed));
		}

		const fn = this.queue.shift();
		if (fn) {
			this.lastRequest = Date.now();
			await fn();
		}

		this.isProcessing = false;

		// Process next item if queue is not empty
		if (this.queue.length > 0) {
			this.process();
		}
	}
}

export const musicBrainzQueue = new RateLimitQueue(1100); // 1.1 seconds to be safe
