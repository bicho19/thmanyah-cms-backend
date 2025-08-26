export interface ScheduleImportCommand {
	url: string;
}

export interface ScheduleImportResponse {
	/**
	 * The unique identifier of the job in the queue.
	 * This can be used to track the job's status.
	 */
	jobId: string;
}
