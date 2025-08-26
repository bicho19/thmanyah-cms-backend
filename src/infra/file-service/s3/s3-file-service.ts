import path from 'node:path';
import { PassThrough } from 'node:stream';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ulid } from 'ulid';
import type { AppLogger } from '@/types/common';
import { AbstractFileService } from '../abstract-file-service';
import type { FileToDelete, FileToRetrieve, FileToUpload, UploadResult } from '../types';

type S3Options = {
	region: string;
	bucket: string;
	access_key_id: string;
	secret_access_key: string;
	endpoint?: string;
	download_url_duration?: number;
};

type InjectedDependencies = {
	logger: AppLogger;
};

export default class S3FileService extends AbstractFileService {
	protected readonly logger_: AppLogger;
	protected readonly client_: S3Client;
	protected readonly bucket_: string;
	protected readonly downloadUrlDuration_: number;

	constructor({ logger }: InjectedDependencies, options: S3Options) {
		super();
		this.logger_ = logger.child({ name: 's3-file-service' });
		this.bucket_ = options.bucket;
		this.downloadUrlDuration_ = options.download_url_duration || 3600; // 1 hour

		this.client_ = new S3Client({
			region: options.region,
			endpoint: options.endpoint,
			credentials: {
				accessKeyId: options.access_key_id,
				secretAccessKey: options.secret_access_key,
			},
		});
	}

	protected buildKey(filename: string): string {
		const fileExt = path.extname(filename);
		// e.g., 'doc-2023-10-27-01HDE...');
		return `${path.basename(filename, fileExt)}-${ulid()}${fileExt}`;
	}

	async upload(file: FileToUpload): Promise<UploadResult> {
		return this.uploadFile(file, 'public-read');
	}

	async uploadProtected(file: FileToUpload): Promise<UploadResult> {
		return this.uploadFile(file, 'private');
	}

	protected async uploadFile(file: FileToUpload, acl: 'public-read' | 'private'): Promise<UploadResult> {
		const key = this.buildKey(file.filename);

		const command = new PutObjectCommand({
			Bucket: this.bucket_,
			Key: key,
			Body: file.content,
			ContentType: file.mimetype,
			ACL: acl,
		});

		await this.client_.send(command);

		const url = `https://${this.bucket_}.s3.${this.client_.config.region}.amazonaws.com/${key}`;

		this.logger_.info(`File uploaded to S3: ${key}`);
		return { url, key };
	}

	async delete(fileData: FileToDelete): Promise<void> {
		const command = new DeleteObjectCommand({
			Bucket: this.bucket_,
			Key: fileData.key,
		});
		await this.client_.send(command);
		this.logger_.info(`File deleted from S3: ${fileData.key}`);
	}

	async getPresignedDownloadUrl(fileData: FileToRetrieve): Promise<string> {
		const command = new GetObjectCommand({
			Bucket: this.bucket_,
			Key: fileData.key,
		});

		const url = await getSignedUrl(this.client_, command, {
			expiresIn: this.downloadUrlDuration_,
		});

		return url;
	}

	// Stream implementations using the newer SDK
	getUploadStreamDescriptor = async (descriptor) => {
		const key = this.buildKey(`${descriptor.name}.${descriptor.ext}`);
		const pass = new PassThrough();

		const upload = new Upload({
			client: this.client_,
			params: {
				Bucket: this.bucket_,
				Key: key,
				Body: pass,
				ACL: descriptor.acl ?? 'private',
			},
		});

		const promise = upload.done().then((response) => {
			return {
				url: (response as any).Location,
				key: (response as any).Key,
			};
		});

		const url = `https://${this.bucket_}.s3.${this.client_.config.region}.amazonaws.com/${key}`;
		return { writeStream: pass, promise, url, key };
	};

	getDownloadStream = async (fileData) => {
		const command = new GetObjectCommand({
			Bucket: this.bucket_,
			Key: fileData.key,
		});
		const response = await this.client_.send(command);
		return response.Body as any;
	};
}
