import type { FastifyInstance } from 'fastify';
import type { Routes } from '@/common/interfaces/routes.interface';
import { ScheduleImportContract } from '@/web/api/importer/api-contract/schedule-import.contract';
import ImporterController from '@/web/api/importer/importer.controller';

class ImporterRouter implements Routes {
	public path = '/importer';

	public importerController = new ImporterController();

	public async initializeRoutes(fastify: FastifyInstance) {
		fastify.route({
			method: 'post',
			url: `${this.path}/schedule`,
			preHandler: [fastify.authenticateUser],
			schema: ScheduleImportContract,
			handler: this.importerController.scheduleImport,
		});
	}
}

export default ImporterRouter;
