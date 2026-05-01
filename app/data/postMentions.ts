import { extractMentionedUserIdsFromLexical } from "@/lib/mentions";
import { prisma } from "@/prisma";

interface NotifyMentionedUsersParams {
  postId: string;
  authorUserId: string;
  authorUserDetailsId: string;
  lexical?: string | null;
  previousLexical?: string | null;
}

export const notifyMentionedUsers = async ({
  postId,
  authorUserId,
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
      mentionedUserId !== authorUserId &&
      !previousMentionedUserIds.has(mentionedUserId),
  );

  if (!nextMentionedUserIds.length) {
    return;
  }

  const existingNotifications = await prisma.notifications.findMany({
    where: {
      postId,
      type: "mention",
      notiUserId: authorUserId,
      userId: {
        in: nextMentionedUserIds,
      },
    },
    select: {
      userId: true,
    },
  });

  const existingUserIds = new Set(
    existingNotifications.map((notification) => notification.userId),
  );
  const notificationsToCreate = nextMentionedUserIds.filter(
    (mentionedUserId) => !existingUserIds.has(mentionedUserId),
  );

  if (!notificationsToCreate.length) {
    return;
  }

  await Promise.all(
    notificationsToCreate.map((mentionedUserId) =>
      prisma.notifications.create({
        data: {
          createdAt: new Date(),
          type: "mention",
          read: false,
          userId: mentionedUserId,
          notiUserId: authorUserId,
          notiUserDetailsId: authorUserDetailsId,
          postId,
        },
      }),
    ),
  );
};
