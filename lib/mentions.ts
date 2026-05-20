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
  mentionedUserIds: Set<number>,
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

    if (isRecord(data) && typeof data.userdetailsid === "number") {
      mentionedUserIds.add(data.userdetailsid);
    }
  }

  Object.values(value).forEach((entry) =>
    collectMentionedUserIds(entry, mentionedUserIds),
  );
};

export const extractMentionedUserIdsFromLexical = (
  lexical?: string | null,
): number[] => {
  if (!lexical) {
    return [];
  }

  try {
    const parsed = JSON.parse(lexical) as unknown;
    const mentionedUserIds = new Set<number>();

    collectMentionedUserIds(parsed, mentionedUserIds);

    return [...mentionedUserIds];
  } catch {
    return [];
  }
};
