'use server'

import { isLoggedIn } from "@/app/data/currentUser";
import { getTextResponse } from "@/lib/ai";
import { buildAiIfyPrompt } from "@/lib/aiIfyPrompt";
import { boringAdjectives } from "@/lib/utils";

// Longer posts are cut off here; the rewrite is capped at 400 characters anyway.
const MAX_AIIFY_CHARACTERS = 2000;

// The prompt is built here, not in the browser, so this can only be used to rewrite a
// post in one of the known tones, not as a general-purpose chat with the model.
export const aiIfyPost = async (text: string, tone: string): Promise<string> => {
    const user = await isLoggedIn();
    if (!user) throw new Error('Not signed in');

    if (typeof text !== 'string' || !text.trim()) throw new Error('Nothing to rewrite');
    if (!boringAdjectives.includes(tone)) throw new Error('Unknown tone');

    const post = text.trim().slice(0, MAX_AIIFY_CHARACTERS);
    return getTextResponse(buildAiIfyPrompt(tone, post));
}
