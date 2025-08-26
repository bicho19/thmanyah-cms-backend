/**
 * The standardized data structure that the ImportService expects
 * after an importer has fetched and mapped the data.
 */
export interface MappedProgramData {
	sourceProvider: string;
	sourceId: string;
	title: string;
	description: string;
	thumbnailUrl?: string;
	episodes: MappedEpisodeData[];
}

/**
 * Defines the contract that every source importer must follow.
 */
export interface IImporter {
	/**
	 * The unique name of this provider (e.g., 'youtube').
	 */
	readonly providerName: string;

	/**
	 * Checks if this importer can handle the given URL.
	 * @param url The URL to check (e.g., a YouTube channel URL).
	 */
	canHandle(url: string): boolean;

	/**
	 * Fetches and maps ONLY the episodes from a specific source (e.g., a playlist).
	 */
	fetchAndMapEpisodes(url: string): Promise<MappedEpisodeData[]>;
}

// It's good practice to define the mapped data structures in a separate file.
// src/modules/importer/interfaces/mapped-data.interface.ts
export interface MappedEpisodeData {
	sourceId: string;
	title: string;
	description: string;
	publishDate: Date;
	durationSeconds: number;
	thumbnailUrl?: string;
	media: MappedMediaData[];
}

export interface MappedMediaData {
	type: 'video' | 'audio';
	url: string;
	source: 'youtube' | 'external' | 'upload'; // Mapped from MediaSource enum
	qualityLabel?: string;
}
