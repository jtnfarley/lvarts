'use server'

import { Prisma } from "@prisma/client";
import { normalizeHandle } from "@/lib/handles";
import { prisma } from "@/prisma";

export interface MentionSuggestion {
  [key: string]: string | number | boolean | null;
  value: string;
  userId: string;
  displayName: string | null;
  avatar: string | null;
  userDir: string | null;
  bio: string | null;
}

interface SearchMentionUsersParams {
  query?: string;
  currentUserId?: string;
}

export const searchMentionUsers = async ({
  query = "",
  currentUserId,
}: SearchMentionUsersParams): Promise<MentionSuggestion[]> => {
  const trimmedQuery = query.trim();
  const normalizedQuery = normalizeHandle(query);

  const users = await prisma.userDetails.findMany({
    where: {
      AND: [
        {
          handle: {
            not: "",
          },
        },
        ...(currentUserId
          ? [
              {
                userId: {
                  not: currentUserId,
                },
              },
            ]
          : []),
        ...((normalizedQuery || trimmedQuery)
          ? [
              {
                OR: [
                  ...(normalizedQuery
                    ? [
                        {
                          handle: {
                            contains: normalizedQuery,
                            mode: Prisma.QueryMode.insensitive,
                          },
                        },
                      ]
                    : []),
                  ...(trimmedQuery
                    ? [
                        {
                          displayName: {
                            contains: trimmedQuery,
                            mode: Prisma.QueryMode.insensitive,
                          },
                        },
                      ]
                    : []),
                ],
              },
            ]
          : []),
      ],
    },
    select: {
      userId: true,
      handle: true,
      displayName: true,
      avatar: true,
      userDir: true,
      bio: true,
      updatedAt: true,
    },
    orderBy: [
      ...(normalizedQuery
        ? [
            {
              handle: "asc" as const,
            },
          ]
        : []),
      ...(trimmedQuery
        ? [
            {
              displayName: "asc" as const,
            },
          ]
        : [
            {
              updatedAt: "desc" as const,
            },
          ]),
    ],
    take: 6,
  });

  return users
    .filter(
      (user): user is typeof user & { handle: string } =>
        typeof user.handle === "string" && user.handle.trim().length > 0,
    )
    .map((user) => ({
      value: user.handle.trim(),
      userId: user.userId,
      displayName: user.displayName?.trim() || null,
      avatar: user.avatar ?? null,
      userDir: user.userDir ?? null,
      bio: user.bio ?? null,
    }));
};
