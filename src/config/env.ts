import dotenv from 'dotenv';
import { z } from 'zod/v4';

dotenv.config();

const envSchema = z.object({
	PORT: z.string().transform(Number).default(3000),
	APP_ENV: z.string().default('development'),
	API_VERSION: z.string().default('v1'),
	SERVER_URL: z.url(),
	CORS_ORIGIN: z.string().optional().default('*'),
	SECRET_KEY: z.string(),
	DATABASE_URI: z.string(),
	EVENT_BUS_PROVIDER: z.enum(['in-memory', 'redis']).default('in-memory'),
	REDIS_URI: z.string(),
});

// We need to infer the type from the schema ourselves
type EnvType = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
	console.error('❌ Invalid environment variables', z.prettifyError(parsed.error));
	process.exit(1);
}

console.log('-------- Current environment variables ----------');
console.log(parsed.data);

export const env = parsed.data as EnvType;
