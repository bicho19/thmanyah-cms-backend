// turbo-id-hybrid.ts

// Using a larger alphabet for shorter IDs, similar to NanoID.
// 62 characters: 0-9, a-z, A-Z
const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ALPHABET_LEN = ALPHABET.length;

const TIMESTAMP_LEN = 8; // 8 chars for a 48-bit timestamp
const RANDOM_LEN = 14; // 14 chars for ~83 bits of randomness
const ID_TOTAL_LEN = TIMESTAMP_LEN + RANDOM_LEN; // 22 characters total

export class TurboIdGenerator {
	/**
	 * Generates a high-performance, time-sortable, 22-character ID.
	 * Format: [8-char Timestamp][14-char Randomness]
	 * Example: '0qYmQp3cSPGTxS3aRkNUa2'
	 * @returns {string} The generated ID.
	 */
	public generate(): string {
		let result = '';

		// 1. Generate the timestamp part (8 characters from 48 bits)
		let timestamp = Date.now();
		for (let i = 0; i < TIMESTAMP_LEN; i++) {
			result = ALPHABET[timestamp % ALPHABET_LEN] + result;
			timestamp = Math.floor(timestamp / ALPHABET_LEN);
		}

		// 2. Generate the random part (14 characters)
		const randomBytes = crypto.getRandomValues(new Uint8Array(RANDOM_LEN));
		for (let i = 0; i < RANDOM_LEN; i++) {
			// The `& 61` is a slight bias, but is extremely fast.
			// For purer distribution, a more complex method is needed, but this is fine for most cases.
			result += ALPHABET[randomBytes[i] % ALPHABET_LEN];
		}

		return result;
	}
}

// Singleton instance for easy access
export const turboId = new TurboIdGenerator();
