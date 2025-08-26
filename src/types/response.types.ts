export type PaginationQuery = {
	offset?: number;
	limit?: number;
};
export interface PaginatedResponse<T> {
	items: T[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}
