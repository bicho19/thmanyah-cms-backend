import type { FindOptions, PopulateHint } from '@mikro-orm/core';
import type { FindConfig } from '@/common/find-config';
import type { AppBaseEntity } from '@/types/base.entity';

export class BaseService<T extends AppBaseEntity> {
	protected toFindOptions(cfg: FindConfig<T> = {}): FindOptions<T, any> {
		const opts: FindOptions<T, any> = {};

		/* ---------- projection / fields ------------------------- */
		if (cfg.fields?.length) {
			// Cast once – satisfies the compiler, safe at runtime.
			opts.fields = cfg.fields as any;
		}

		/* ---------- paging -------------------------------------- */
		if (cfg.skip !== undefined) opts.offset = cfg.skip;
		if (cfg.take !== undefined) opts.limit = cfg.take;

		/* ---------- ordering ------------------------------------ */
		if (cfg.order) opts.orderBy = cfg.order as any;

		/* ---------- population ---------------------------------- */
		if (cfg.populate?.length) {
			opts.populate = cfg.populate as PopulateHint[];
		}

		/* ---------- extra FindOptions --------------------------- */
		if (cfg.options) Object.assign(opts, cfg.options);

		return opts;
	}
}
