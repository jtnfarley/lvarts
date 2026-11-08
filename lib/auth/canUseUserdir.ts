import { isSafeUserdir } from '@/lib/userdir';

// Which upload folder a user may write to: their own, or (admins only) any. A user with no
// folder yet may start one, because profile setup uploads the avatar before the profile
// is first saved, but only if nobody else already owns that name.
export const canUseUserdir = (params: {
	userdir: string;
	ownUserdir: string | null | undefined;
	isAdmin: boolean;
	ownedByAnotherUser: boolean;
}): boolean => {
	const { userdir, ownUserdir, isAdmin, ownedByAnotherUser } = params;
	if (!isSafeUserdir(userdir)) return false;
	if (isAdmin) return true;
	if (ownUserdir) return userdir === ownUserdir;
	return !ownedByAnotherUser;
};
