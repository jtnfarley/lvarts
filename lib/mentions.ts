const MENTION_NODE_TYPES = new Set([
  "beautifulMention",
  "custom-beautifulMention",
  "user-beautifulMention",
]);

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const collectMentionedUserIds = (
  value: unknown,
  mentionedUserIds: Set<string>,
): void => {
  if (Array.isArray(value)) {
    value.forEach((entry) => collectMentionedUserIds(entry, mentionedUserIds));
    return;
  }

  if (!isRecord(value)) {
    return;
  }

  if (typeof value.type === "string" && MENTION_NODE_TYPES.has(value.type)) {
    const data = value.data;

    if (isRecord(data) && typeof data.userId === "string" && data.userId) {
      mentionedUserIds.add(data.userId);
    }
  }

  Object.values(value).forEach((entry) =>
    collectMentionedUserIds(entry, mentionedUserIds),
  );
};

export const extractMentionedUserIdsFromLexical = (
  lexical?: string | null,
): string[] => {
  if (!lexical) {
    return [];
  }

  try {
    const parsed = JSON.parse(lexical) as unknown;
    const mentionedUserIds = new Set<string>();

    collectMentionedUserIds(parsed, mentionedUserIds);

    return [...mentionedUserIds];
  } catch {
    return [];
  }
};
