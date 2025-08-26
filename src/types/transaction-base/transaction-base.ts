import type { EntityManager } from '@mikro-orm/core';

export interface ITransactionBaseService {
  withTransaction(transactionManager?: EntityManager): this
}
