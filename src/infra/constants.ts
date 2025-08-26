export const ContainerInfraKeys = {
	CONFIG_MODULE: 'configModule',
	LOGGER: 'logger',
	DATABASE_CONNECTION: '_database_connection',
	DATABASE_ORM: '_database_orm',
	DATABASE_EM: '_database_em',
	DATABASE_EM_FACTORY: '_database_em_factory',
	ENTITY_REGISTRY: '_entity_registry',
	//ENTITY_MANAGER: '__entity_manager__',
	REDIS_CONNECTION: '__redis_connection__',
	EVENT_BUS: '_event_bus',
	FILE_SERVICE: '__file_service__',
	LOCKING_PROVIDER: '__locking_provider__',
	LOCKING_MODULE: '__locking_module__',
	NOTIFICATION_MODULE: '__notification_module__',
	QUEUE_MODULE: '_queue_module',
	QUEUE_PROVIDER: '__queue_provider__',
	WORKFLOW_MODULE: '__workflow_module__',
	CACHE_MODULE: '_cache_module',
	CACHE_PROVIDER: '_cache_provider',
} as const;

export const ContainerRepositoriesKeys = {
	USERS: 'userRepository',
	CATEGORY: 'categoryRepository',
	PROGRAM: 'programRepository',
	EPISODE: 'episodeRepository',
	MEDIA: 'mediaRepository',
} as const;

export const ContainerServicesKeys = {
	USERS: 'userService',
	CATEGORY: 'categoryService',
	PROGRAM: 'programService',
	EPISODE: 'episodeService',
	DISCOVERY: 'discoveryService',
	IMPORT_SERVICE: 'importService',
} as const;
