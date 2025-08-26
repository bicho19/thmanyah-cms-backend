import { AbstractFileService } from '@/infra/file-service/abstract-file-service';
import AppError from '@/lib/exceptions/errors';

export default class DefaultFileService extends AbstractFileService {
	_throwNotImplemented = () => {
		throw new AppError(
			AppError.Types.UNEXPECTED_STATE,
			'Please configure a file service in order to manipulate files.',
		);
	};
	upload = this._throwNotImplemented;
	uploadProtected = this._throwNotImplemented;
	delete = this._throwNotImplemented;
	getPresignedDownloadUrl = this._throwNotImplemented;
	getUploadStreamDescriptor = this._throwNotImplemented;
	getDownloadStream = this._throwNotImplemented;
}
