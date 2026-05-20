'use server'

import { generateUniqueHandle } from "@/app/data/handles";

export const getHandleSuggestion = async ({
  currentHandle,
  currentUserId,
}: {
  currentHandle?: string;
  currentUserId?: number;
} = {}) => {
  return generateUniqueHandle(
    currentUserId,
    currentHandle ? [currentHandle] : [],
  );
};
