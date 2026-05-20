import { extractMentionedUserIdsFromLexical } from "@/lib/mentions";
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
		console.log(authorUserDetailsId, mentionedUserId)
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
