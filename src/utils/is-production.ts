const isProduction = (): boolean => {
	return ['production', 'prod'].includes(process.env.APP_ENV || '');
};

export { isProduction };
