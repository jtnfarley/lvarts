'use server'

import { Prisma } from "@prisma/client";
import { normalizeHandle } from "@/lib/handles";
import { prisma } from "@/prisma";

export interface MentionSuggestion {
  [key: string]: string | number | boolean | null;
  value: string;
  userdetailsid: number;
  displayname: string | null;
  avatar: string | null;
  userdir: string | null;
}

interface SearchMentionUsersParams {
  query?: string;
  currentUserDetailsId?: number;
}

export const searchMentionUsers = async ({
  query = "",
  currentUserDetailsId,
}: SearchMentionUsersParams): Promise<MentionSuggestion[]> => {
  const trimmedQuery = query.trim();
  const normalizedQuery = normalizeHandle(query);

  const users = await prisma.userdetails.findMany({
    where: {
      AND: [
        {
          handle: {
            not: "",
          },
        },
        ...(currentUserDetailsId
          ? [
              {
                id: {
                  not: currentUserDetailsId,
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
                          displayname: {
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
      id: true,
      handle: true,
      displayname: true,
      avatar: true,
      userdir: true,
      biohtml: true,
      updatedat: true,
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
              displayname: "asc" as const,
            },
          ]
        : [
            {
              updatedat: "desc" as const,
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
      userdetailsid: user.id,
      displayname: user.displayname?.trim() || null,
      avatar: user.avatar ?? null,
      userdir: user.userdir ?? null
    }));
};
