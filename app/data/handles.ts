import { prisma } from "@/prisma";
import {
  getRandomHandleBase,
  HANDLE_MAX_LENGTH,
  isValidHandle,
  normalizeHandle,
} from "@/lib/handles";

const RESERVED_HANDLES = new Set([
  "about",
  "admin",
  "api",
  "calendar",
  "code_of_conduct",
  "explore",
  "feed",
  "help",
  "home",
  "login",
  "logout",
  "me",
  "messages",
  "new",
  "notifications",
  "null",
  "post",
  "profile",
  "root",
  "scene",
  "search",
  "settings",
  "support",
  "undefined",
  "user",
]);

const isHandleReserved = (handle: string) => {
  return RESERVED_HANDLES.has(handle);
};

const isHandleTaken = async (handle: string, excludeUserId?: string) => {
  const existingUser = await prisma.userDetails.findFirst({
    where: {
      handle,
    },
    select: {
      userId: true,
    },
  });

  if (!existingUser) {
    return false;
  }

  return existingUser.userId !== excludeUserId;
};

const buildSuffixedHandle = (base: string, suffix: number) => {
  const suffixText = `_${suffix}`;
  const slicedBase = base.slice(0, HANDLE_MAX_LENGTH - suffixText.length);

  return `${slicedBase}${suffixText}`;
};

export const generateUniqueHandle = async (
  excludeUserId?: string,
  avoid: string[] = [],
): Promise<string> => {
  const blockedHandles = new Set(avoid.map((handle) => normalizeHandle(handle)));

  for (let attempt = 0; attempt < 40; attempt += 1) {
    const base = getRandomHandleBase();

    if (!base || blockedHandles.has(base) || isHandleReserved(base)) {
      continue;
    }

    if (!(await isHandleTaken(base, excludeUserId))) {
      return base;
    }

    for (let suffix = 2; suffix < 50; suffix += 1) {
      const candidate = buildSuffixedHandle(base, suffix);

      if (blockedHandles.has(candidate) || isHandleReserved(candidate)) {
        continue;
      }

      if (!(await isHandleTaken(candidate, excludeUserId))) {
        return candidate;
      }
    }
  }

  const fallback = `artist_${Math.floor(1000 + Math.random() * 9000)}`;

  if (!isHandleReserved(fallback) && !(await isHandleTaken(fallback, excludeUserId))) {
    return fallback;
  }

  return generateUniqueHandle(excludeUserId, [...blockedHandles, fallback]);
};

export const resolveHandle = async ({
  requestedHandle,
  excludeUserId,
}: {
  requestedHandle?: string;
  excludeUserId?: string;
}): Promise<string> => {
  if (!requestedHandle) {
    return generateUniqueHandle(excludeUserId);
  }

  const normalizedHandle = normalizeHandle(requestedHandle);

  if (!normalizedHandle || !isValidHandle(normalizedHandle) || isHandleReserved(normalizedHandle)) {
    throw new Error(
      "Handle must be 3-30 characters using lowercase letters, numbers, or underscores.",
    );
  }

  if (await isHandleTaken(normalizedHandle, excludeUserId)) {
    throw new Error("That handle is already taken.");
  }

  return normalizedHandle;
};
