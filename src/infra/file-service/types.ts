import type * as Stream from 'node:stream';

/**
 * A framework-agnostic representation of a file to be uploaded.
 * This replaces the dependency on Express.Multer.File.
 */
export type FileToUpload = {
	/** The content of the file. */
	content: Buffer;
	/** The original name of the file (e.g., 'document.pdf'). */
	filename: string;
	/** The MIME type of the file (e.g., 'application/pdf'). */
	mimetype: string;
};

/**
 * The result of a successful file upload.
 */
export type UploadResult = {
	/** The publicly accessible or internal URL of the uploaded file. */
	url: string;
	/** A unique key or identifier for the file within the storage provider. */
	key: string;
};

/**
 * Data required to delete a file.
 */
export type FileToDelete = {
	key: string;
};

/**
 * Data required to get a presigned URL or download stream.
 */
export type FileToRetrieve = {
	key: string;
};

/**
 * Data needed to get a direct upload stream.
 */
export type UploadStreamDescriptor = {
	/** A name for the file, which may be used to construct the key. */
	name: string;
	/** The file extension (e.g., 'pdf'). */
	ext: string;
	/** Access control level (e.g., 'public-read' or 'private'). */
	acl?: 'public-read' | 'private';
};

/**
 * The result of getting an upload stream.
 */
export type UploadStreamResult = {
	/** The stream to which the file content should be written. */
	writeStream: Stream.PassThrough;
	/** A promise that resolves when the upload is complete. */
	promise: Promise<UploadResult>;
	/** The final URL of the file. */
	url: string;
	/** The final key of the file. */
	key: string;
};
