import { isLoggedIn } from '@/app/data/currentUser';
import { prisma } from '@/prisma';
import { canUseUserdir } from '@/lib/auth/canUseUserdir';
import { isAdmin } from '@/lib/auth/isAdmin';

// Applies canUseUserdir to the logged-in user. Not a 'use server' file on purpose: it
// answers a security question for server code and must not be callable from a browser.
export const canUploadToUserdir = async (userdir: string): Promise<boolean> => {
	const user = await isLoggedIn();
	if (!user) return false;

	const owner = await prisma.userdetails.findFirst({ where: { userdir }, select: { userid: true } });
	return canUseUserdir({
		userdir,
		ownUserdir: user.userdetails?.userdir,
		isAdmin: await isAdmin(),
		ownedByAnotherUser: owner !== null && owner.userid !== Number(user.id),
	});
};
