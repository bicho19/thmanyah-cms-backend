import { AsyncLocalStorage } from 'node:async_hooks';
import type { AppContainer } from './app-container';

// This interface defines what we'll store for each request.
// Storing the whole container is the most flexible approach.
export interface RequestContextStore {
	container: AppContainer;
}

// Export a singleton instance of AsyncLocalStorage.
export const asyncContext = new AsyncLocalStorage<RequestContextStore>();
