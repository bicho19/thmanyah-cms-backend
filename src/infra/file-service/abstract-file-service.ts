import type * as Stream from 'node:stream';
import type {
	FileToDelete,
	FileToRetrieve,
	FileToUpload,
	UploadResult,
	UploadStreamDescriptor,
	UploadStreamResult,
} from './types';

/**
 * The core interface for a file service.
 * All file service plugins (S3, Local, R2, etc.) must implement this contract.
 */
export interface IFileService {
	/**
	 * Uploads a file.
	 * @param file - The file data.
	 * @returns The URL and key of the uploaded file.
	 */
	upload(file: FileToUpload): Promise<UploadResult>;

	/**
	 * Uploads a file with restricted (private) access.
	 * @param file - The file data.
	 * @returns The URL and key of the uploaded file.
	 */
	uploadProtected(file: FileToUpload): Promise<UploadResult>;

	/**
	 * Deletes a file from the storage provider.
	 * @param fileData - The identifying data for the file to delete.
	 */
	delete(fileData: FileToDelete): Promise<void>;

	/**
	 * Gets a presigned URL for downloading a file.
	 * Useful for granting temporary access to private files.
	 * @param fileData - The identifying data for the file.
	 * @returns A temporary, signed URL.
	 */
	getPresignedDownloadUrl(fileData: FileToRetrieve): Promise<string>;

	// --- Stream-based methods (optional but good for large files) ---

	/**
	 * Gets a writable stream to upload a large file directly.
	 * @param descriptor - Metadata about the file to be uploaded.
	 * @returns An object containing the write stream and a promise that resolves on completion.
	 */
	getUploadStreamDescriptor(descriptor: UploadStreamDescriptor): Promise<UploadStreamResult>;

	/**
	 * Gets a readable stream to download a file.
	 * @param fileData - The identifying data for the file.
	 * @returns A readable stream of the file's content.
	 */
	getDownloadStream(fileData: FileToRetrieve): Promise<Stream.Readable>;
}

/**
 * Abstract class to be extended by all file service implementations.
 */
export abstract class AbstractFileService implements IFileService {
	// We can add shared logic here in the future if needed.

	abstract upload(file: FileToUpload): Promise<UploadResult>;
	abstract uploadProtected(file: FileToUpload): Promise<UploadResult>;
	abstract delete(fileData: FileToDelete): Promise<void>;
	abstract getPresignedDownloadUrl(fileData: FileToRetrieve): Promise<string>;
	abstract getUploadStreamDescriptor(descriptor: UploadStreamDescriptor): Promise<UploadStreamResult>;
	abstract getDownloadStream(fileData: FileToRetrieve): Promise<Stream.Readable>;
}
