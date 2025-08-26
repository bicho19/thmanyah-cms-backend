export const AppErrorTypes = {
	/** Errors stemming from the database */
	DB_ERROR: 'database_error',
	SERVER_ERROR: 'server_error',
	DUPLICATE_ERROR: 'duplicate_error',
	INVALID_ARGUMENT: 'invalid_argument',
	INVALID_DATA: 'invalid_data',
	VALIDATION_ERROR: 'validation_error',
	UNAUTHORIZED: 'unauthorized',
	NOT_FOUND: 'not_found',
	NOT_ALLOWED: 'not_allowed',
	UNEXPECTED_STATE: 'unexpected_state',
	CONFLICT: 'conflict',
	BAD_REQUEST: 'bad_request',
};

export const AppErrorCodes = {
	INSUFFICIENT_INVENTORY: 'insufficient_inventory',
	CART_INCOMPATIBLE_STATE: 'cart_incompatible_state',
};

export const AppErrorStatusCodes: Record<string, number> = {
	[AppErrorTypes.DB_ERROR]: 500,
	[AppErrorTypes.SERVER_ERROR]: 500,
	[AppErrorTypes.DUPLICATE_ERROR]: 409,
	[AppErrorTypes.INVALID_ARGUMENT]: 400,
	[AppErrorTypes.INVALID_DATA]: 400,
	[AppErrorTypes.VALIDATION_ERROR]: 400,
	[AppErrorTypes.UNAUTHORIZED]: 401,
	[AppErrorTypes.NOT_FOUND]: 404,
	[AppErrorTypes.NOT_ALLOWED]: 403,
	[AppErrorTypes.UNEXPECTED_STATE]: 500,
	[AppErrorTypes.CONFLICT]: 409,
	[AppErrorTypes.BAD_REQUEST]: 400,
};

/**
 * Standardized error to be used across Medusa project.
 * @extends Error
 */
class AppError extends Error {
	public type: string;
	public message: string;
	public code?: string;
	public date: Date;
	public statusCode: number;
	public details?: any;

	public static Types = AppErrorTypes;
	public static Codes = AppErrorCodes;

	/**
	 * Creates a standardized error to be used across the project.
	 * @param type - error type (semantic domain)
	 * @param message - human-readable message
	 * @param code - optional code for fine-grained application errors
	 * @param details - optional extra metadata (fields etc)
	 */
	constructor(type: string, message: string, code?: string, details?: any) {
		super(message);

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, AppError);
		}

		this.type = type;
		this.code = code;
		this.message = message;
		this.date = new Date();
		this.details = details;

		// centralized status code
		this.statusCode = AppErrorStatusCodes[type] || 500;
	}
}

export default AppError;
