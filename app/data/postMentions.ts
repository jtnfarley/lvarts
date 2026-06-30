import { after } from "next/server";
import { extractMentionedUserIdsFromLexical } from "@/lib/mentions";
import { hdBot } from "@/lib/bots/hd";
import { imageBot } from "@/lib/bots/imageBot";
import { prisma } from "@/prisma";

interface NotifyMentionedUsersParams {
  postid: number;
  authorUserDetailsId: number;
  lexical?: string | null;
  previousLexical?: string | null;
}

export const notifyMentionedUsers = async ({
	postid,
	authorUserDetailsId,
	lexical,
	previousLexical,
}: NotifyMentionedUsersParams) => {
	const previousMentionedUserIds = new Set(
		extractMentionedUserIdsFromLexical(previousLexical),
	);
	const nextMentionedUserIds = [
		...new Set(extractMentionedUserIdsFromLexical(lexical)),
	].filter(
		(mentionedUserId) =>
		mentionedUserId !== authorUserDetailsId &&
		!previousMentionedUserIds.has(mentionedUserId),
	);

	if (!nextMentionedUserIds.length) {
		return;
	}

	for (const mentionedUserId of nextMentionedUserIds) {
		switch (mentionedUserId) {
			case 12:
				after(() => hdBot(postid));
				return;
			case 13:
				const prompt = `You are the painter Walter Emerson Baum who founded the Baum School of Art and the Allentown Art Museum. Create a painting about`;
				after(() => imageBot({postid, prompt, userdetailsid: 13, userdir: 'baum'}));
				return;
			case 14:
				const prompt2 = `You are the painter Ella Sophonisba Hergesheimer. Create a painting about`;
				after(() => imageBot({postid, prompt: prompt2, userdetailsid: 14, userdir: 'hergesheimer'}));
				return;
		}

		const notification = await prisma.notifications.create({
			data: {
				notificationtypeid: 4, //mention
				createdat: new Date(),
				postid
			}
		})

		if (notification && notification.id) {
			await prisma.userstonotifications.create({
				data: {
					notificationid: notification.id,
					senderuserdetailsid: authorUserDetailsId,
					receiveruserdetailsid: mentionedUserId
				}
			})
		}
	}
};
