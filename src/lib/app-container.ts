import {
	type AwilixContainer,
	type asFunction,
	asValue,
	type ClassOrFunctionReturning,
	createContainer,
	type Resolver,
} from 'awilix';

export type AppContainer = AwilixContainer & {
	registerAdd: <T>(name: string, registration: T) => AppContainer;
	createScope: () => AppContainer;
};

function asArray(resolvers: (ClassOrFunctionReturning<unknown> | Resolver<unknown>)[]): {
	resolve: (container: AwilixContainer) => unknown[];
} {
	return {
		resolve: (container: AwilixContainer) => resolvers.map((resolver) => container.build(resolver)),
	};
}

function registerAdd(this: AppContainer, name: string, registration: typeof asFunction | typeof asValue) {
	const storeKey = `${name}_STORE`;

	if (this.registrations[storeKey] === undefined) {
		this.register(storeKey, asValue([] as Resolver<unknown>[]));
	}
	const store = this.resolve(storeKey) as (ClassOrFunctionReturning<unknown> | Resolver<unknown>)[];

	if (this.registrations[name] === undefined) {
		this.register(name, asArray(store));
	}
	store.unshift(registration);

	return this;
}

// @ts-ignore
export function createAppContainer(...args): AppContainer {
	// @ts-ignore
	const container = createContainer.apply(null, args) as AppContainer;

	// @ts-ignore
	container.registerAdd = registerAdd.bind(container);

	const originalScope = container.createScope;
	container.createScope = () => {
		const scoped = originalScope() as AppContainer;
		// @ts-ignore
		scoped.registerAdd = registerAdd.bind(scoped);

		return scoped;
	};

	return container;
}
