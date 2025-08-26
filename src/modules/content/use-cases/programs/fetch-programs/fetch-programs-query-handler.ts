import { ContainerServicesKeys } from '@/infra/constants';
import type { QueryHandler } from '@/lib/cqrs/query-handler';
import type ProgramService from '@/modules/content/services/program.service';
import type {
	FetchProgramsQuery,
	FetchProgramsResponse,
} from '@/modules/content/use-cases/programs/fetch-programs/fetch-programs.types';

type FetchProgramsQueryHandlerProps = {
	[ContainerServicesKeys.PROGRAM]: ProgramService;
};

class FetchProgramsQueryHandler implements QueryHandler<FetchProgramsQuery, FetchProgramsResponse> {
	private readonly programService: ProgramService;

	constructor({ programService }: FetchProgramsQueryHandlerProps) {
		this.programService = programService;
	}

	async handle(query: FetchProgramsQuery): Promise<FetchProgramsResponse> {
		const programs = await this.programService.list({
			title: query.title,
			type: query.type,
			status: query.status,
			slug: query.slug,
			categoryId: query.categoryId,
		});

		return {
			programs,
		};
	}
}
export default FetchProgramsQueryHandler;
