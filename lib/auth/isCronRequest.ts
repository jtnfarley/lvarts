import { createHash, timingSafeEqual } from 'node:crypto';

// Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`. Both sides are hashed first so
// the comparison is constant-time and works for headers of any length.
export const isCronRequest = (request: Request): boolean => {
	const secret = process.env.CRON_SECRET;
	if (!secret) return false;

	const digest = (value: string) => createHash('sha256').update(value).digest();
	return timingSafeEqual(digest(request.headers.get('authorization') ?? ''), digest(`Bearer ${secret}`));
};
