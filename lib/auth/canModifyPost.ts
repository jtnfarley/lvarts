// A post's author is the first usertoposts row. Admins can delete or edit any post (moderation).
// Undefined ids (not logged in, or a post with no author row) must never count as a
// match, which is why both are checked before comparing.
export const canModifyPost = (params: {
	authorUserdetailsId: number | undefined;
	userdetailsid: number | undefined;
	isAdmin: boolean;
}): boolean => {
	const { authorUserdetailsId, userdetailsid, isAdmin } = params;
	if (isAdmin) return true;
	return authorUserdetailsId !== undefined && userdetailsid !== undefined && authorUserdetailsId === userdetailsid;
};
