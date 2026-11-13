import { prisma } from '@/prisma';
import { REJECTED_ZINE_POST_TYPE, ZINE_POST_TYPE } from '@/lib/zine/review';

// Adds the zine post types. Safe to run more than once: it only adds what is missing.
// Usage: npm run seed:zine

const main = async (): Promise<void> => {
	for (const posttype of [ZINE_POST_TYPE, REJECTED_ZINE_POST_TYPE]) {
		const existing = await prisma.posttypes.findFirst({ where: { posttype } });
		if (existing) {
			console.log(`post type "${posttype}" exists`);
			continue;
		}
		await prisma.posttypes.create({ data: { posttype } });
		console.log(`created post type "${posttype}"`);
	}
};

main()
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(() => prisma.$disconnect());
