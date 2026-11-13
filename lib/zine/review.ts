import { prisma } from '@/prisma';

export const ZINE_POST_TYPE = 'zine';
export const REJECTED_ZINE_POST_TYPE = 'zine_rejected';

// Trusted: these change what the public sees with NO authorization. Only the admin actions
// (and a future AI reviewer) may call them, so they must never be exported from a 'use server' file.
// A pending zine post is a private post of type "zine"; approving makes it public.

export const listPendingZine = () =>
	prisma.posts.findMany({
		where: { privatepost: true, posttypes: { posttype: ZINE_POST_TYPE } },
		orderBy: { createdat: 'asc' },
		select: {
			id: true,
			content: true,
			createdat: true,
			postfile: true,
			usertoposts: {
				orderBy: { id: 'asc' },
				take: 1,
				select: { userdetails: { select: { displayname: true, handle: true, userdir: true } } },
			},
		},
	});

export const approveZinePost = async (postId: number): Promise<void> => {
	await prisma.posts.updateMany({
		where: { id: postId, posttypes: { posttype: ZINE_POST_TYPE } },
		data: { privatepost: false },
	});
};

export const rejectZinePost = async (postId: number): Promise<void> => {
	const rejectedType = await prisma.posttypes.findFirst({ where: { posttype: REJECTED_ZINE_POST_TYPE } });
	if (!rejectedType) throw new Error(`Post type "${REJECTED_ZINE_POST_TYPE}" not found. Run npm run seed:zine first.`);

	await prisma.posts.updateMany({
		where: { id: postId, posttypes: { posttype: ZINE_POST_TYPE } },
		data: { posttypeid: rejectedType.id, privatepost: true },
	});
};
