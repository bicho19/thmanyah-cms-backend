import fs from 'node:fs/promises';
import path from 'node:path';
import { ulid } from 'ulid';
import AppError from '@/lib/exceptions/errors';
import type { AppLogger } from '@/types/common'; // Assuming you have this type
import { AbstractFileService } from '../abstract-file-service';
import type { FileToDelete, FileToRetrieve, FileToUpload, UploadResult } from '../types';

type LocalFsOptions = {
	upload_dir: string;
	base_url: string;
};

type InjectedDependencies = {
	logger: AppLogger;
};

export default class LocalFileService extends AbstractFileService {
	protected readonly logger_: AppLogger;
	protected readonly uploadDir_: string;
	protected readonly baseUrl_: string;

	constructor({ logger }: InjectedDependencies, options: LocalFsOptions) {
		super();
		this.logger_ = logger.child({ name: 'local-file-service' });
		this.uploadDir_ = options.upload_dir;
		this.baseUrl_ = options.base_url;
	}

	// Ensure the upload directory exists
	protected async ensureUploadDirExists(): Promise<void> {
		try {
			await fs.mkdir(this.uploadDir_, { recursive: true });
		} catch (error) {
			this.logger_.error(`Failed to create upload directory: ${this.uploadDir_}`, error);
			throw new Error('Could not initialize local file storage.');
		}
	}

	async upload(file: FileToUpload): Promise<UploadResult> {
		await this.ensureUploadDirExists();

		const fileExtension = path.extname(file.filename);
		const key = `${ulid()}${fileExtension}`;
		const filePath = path.join(this.uploadDir_, key);

		try {
			await fs.writeFile(filePath, file.content);
			const url = new URL(path.join(this.uploadDir_, key), this.baseUrl_).toString();

			this.logger_.info(`File uploaded locally: ${key}`);
			return { url, key };
		} catch (error) {
			this.logger_.error(`Error uploading file locally: ${key}`, error);
			throw error;
		}
	}

	async uploadProtected(file: FileToUpload): Promise<UploadResult> {
		// For local storage, "protected" might just mean a different directory
		// or no direct URL is returned. We'll treat it the same as `upload` for simplicity.
		this.logger_.info('uploadProtected called, but behaves like `upload` in local storage.');
		return this.upload(file);
	}

	async delete(fileData: FileToDelete): Promise<void> {
		const filePath = path.join(this.uploadDir_, fileData.key);
		try {
			await fs.unlink(filePath);
			this.logger_.info(`File deleted locally: ${fileData.key}`);
		} catch (error: any) {
			// Don't throw if the file doesn't exist (idempotent delete)
			if (error.code !== 'ENOENT') {
				this.logger_.error(`Error deleting file locally: ${fileData.key}`, error);
				throw error;
			}
		}
	}

	// --- Methods that are more complex for local storage ---

	async getPresignedDownloadUrl(fileData: FileToRetrieve): Promise<string> {
		this.logger_.warn('getPresignedDownloadUrl is not supported by LocalFileService. Returning a direct URL.');
		// In a real app, we might generate a short-lived token and a special route to serve the file.
		return new URL(path.join(this.uploadDir_, fileData.key), this.baseUrl_).toString();
	}

	// Stream methods can be implemented but are omitted here for brevity.
	// They would involve using fs.createWriteStream and fs.createReadStream.
	getUploadStreamDescriptor = async () => {
		throw new AppError(
			AppError.Types.UNEXPECTED_STATE,
			'Local file service does not support the upload stream descriptor.',
		);
	};
	getDownloadStream = async () => {
		throw new AppError(AppError.Types.UNEXPECTED_STATE, 'Local file service does not support the download stream.');
	};
}
