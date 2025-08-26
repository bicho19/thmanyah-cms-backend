import { google, type youtube_v3 } from 'googleapis';
import type { IImporter, MappedEpisodeData } from '@/modules/importer/interfaces/mporter.interface';

export class YouTubeImporter implements IImporter {
	readonly providerName = 'youtube';
	private readonly youtubeApi: youtube_v3.Youtube;

	constructor(config: { apiKey: string }) {
		this.youtubeApi = google.youtube({ version: 'v3', auth: config.apiKey });
	}

	canHandle(url: string): boolean {
		// Supports youtube.com, youtu.be, playlist, channel, user, etc.
		return /(youtube\.com\/(watch\?v=.*|playlist|channel|c|user)|youtu\.be\/)/.test(url);
	}

	async fetchAndMapEpisodes(playlistId: string): Promise<MappedEpisodeData[]> {
		//  Fetch all playlist items with pagination
		const playlistItems = await this.fetchPlaylistItems(playlistId);

		// Collect all video IDs
		const videoIds = playlistItems
			.map((item) => item.contentDetails?.videoId)
			.filter((id): id is string => Boolean(id));

		// Fetch durations in batches of 50 (API limit)
		const durationMap = await this.fetchVideoDurations(videoIds);

		// Map to standardized format
		const mappedEpisodes: MappedEpisodeData[] = playlistItems.map((item) => {
			const videoId = item.contentDetails?.videoId ?? '';
			const snippet = item.snippet ?? {};
			const thumbnails = snippet.thumbnails ?? {};

			const thumbnailUrl = thumbnails.high?.url ?? thumbnails.medium?.url ?? thumbnails.default?.url ?? '';

			return {
				sourceId: videoId,
				title: snippet.title ?? '',
				description: snippet.description ?? '',
				publishDate: snippet.publishedAt ? new Date(snippet.publishedAt) : undefined,
				thumbnailUrl,
				durationSeconds: durationMap.get(videoId) ?? 0,
				media: [
					{
						type: 'video',
						source: 'youtube',
						url: `https://www.youtube.com/watch?v=${videoId}`,
						qualityLabel: 'HD',
					},
				],
			};
		});

		return mappedEpisodes;
	}

	private async fetchPlaylistItems(playlistId: string): Promise<youtube_v3.Schema$PlaylistItem[]> {
		let items: youtube_v3.Schema$PlaylistItem[] = [];
		let nextPageToken: string | undefined;

		do {
			const res = await this.youtubeApi.playlistItems.list({
				playlistId,
				part: ['snippet', 'contentDetails'],
				maxResults: 50,
				pageToken: nextPageToken,
			});

			items.push(...(res.data.items ?? []));
			nextPageToken = res.data.nextPageToken ?? undefined;
		} while (nextPageToken);

		return items;
	}

	private async fetchVideoDurations(videoIds: string[]): Promise<Map<string, number>> {
		const durationMap = new Map<string, number>();

		for (let i = 0; i < videoIds.length; i += 50) {
			const chunk = videoIds.slice(i, i + 50);
			const res = await this.youtubeApi.videos.list({
				id: chunk,
				part: ['contentDetails'],
				maxResults: 50,
			});

			for (const video of res.data.items ?? []) {
				if (video.id && video.contentDetails?.duration) {
					durationMap.set(video.id, this.convertYoutubeDurationToSeconds(video.contentDetails.duration));
				}
			}
		}

		return durationMap;
	}

	private convertYoutubeDurationToSeconds(duration: string): number {
		// Example: "PT1H2M30S"
		const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
		if (!match) return 0;

		const [, hours, minutes, seconds] = match.map((v) => (v ? parseInt(v, 10) : 0));
		return (hours ?? 0) * 3600 + (minutes ?? 0) * 60 + (seconds ?? 0);
	}
}
