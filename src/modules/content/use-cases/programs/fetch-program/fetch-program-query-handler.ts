import { ContainerServicesKeys } from '@/infra/constants';
import type { QueryHandler } from '@/lib/cqrs/query-handler';
import AppError from '@/lib/exceptions/errors';
import type ProgramService from '@/modules/content/services/program.service';
import type {
	FetchProgramQuery,
	FetchProgramResponse,
} from '@/modules/content/use-cases/programs/fetch-program/fetch-program.types';

type FetchProgramQueryHandlerProps = {
	[ContainerServicesKeys.PROGRAM]: ProgramService;
};

class FetchProgramQueryHandler implements QueryHandler<FetchProgramQuery, FetchProgramResponse> {
	private readonly programService: ProgramService;

	constructor({ programService }: FetchProgramQueryHandlerProps) {
		this.programService = programService;
	}

	async handle(query: FetchProgramQuery): Promise<FetchProgramResponse> {
		const program = await this.programService.retrieve(query.id, { populate: ['category'] });

		if (!program) {
			throw new AppError(AppError.Types.NOT_FOUND, `Program with id ${query.id} not found`);
		}

		return {
			program,
		};
	}
}

export default FetchProgramQueryHandler;
