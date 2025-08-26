import type { FastifyReply, FastifyRequest } from 'fastify';
import type ScheduleImportCommandHandler from '@/modules/importer/use-cases/schedule-import/schedule-import-command-handler';
import type { ScheduleImportBody } from '@/web/api/importer/api-contract/schedule-import.contract';

class ImporterController {
	public scheduleImport = async (request: FastifyRequest<{ Body: ScheduleImportBody }>, reply: FastifyReply) => {
		const handler = request.container.resolve<ScheduleImportCommandHandler>('importer.scheduleImportCommandHandler');

		await handler.execute({
			url: request.body.url,
			programId: request.body.programId,
		});

		return reply.send({
			message: 'Import job has been accepted and is being processed in the background.',
		});
	};
}

export default ImporterController;
