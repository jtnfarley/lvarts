'use server'

import { z } from "zod";
import { getTextResponse } from "@/lib/ai";
import { sendAdminAlert } from "@/lib/mail";
import { currentUser } from "@/app/data/currentUser";
import { SUPPORT_KNOWLEDGE } from "@/lib/supportKnowledge";

export interface SupportChatMessage {
    role: 'user' | 'assistant';
    text: string;
}

// The conversation is held in the browser, so none of it can be trusted to be small or
// well-formed. Caps keep one request from becoming an expensive prompt.
const MAX_MESSAGE_CHARACTERS = 1000;
const MAX_HISTORY_MESSAGE_CHARACTERS = 2500; // assistant replies can be longer than user messages

const supportInputSchema = z.object({
    history: z.array(z.object({ role: z.enum(['user', 'assistant']), text: z.string() })),
    message: z.string().trim().min(1),
});

export const sendSupportMessage = async (historyInput: SupportChatMessage[], messageInput: string) => {
    const user = await currentUser();

    const parsed = supportInputSchema.parse({ history: historyInput, message: messageInput });
    const message = parsed.message.slice(0, MAX_MESSAGE_CHARACTERS);
    const history = parsed.history.map((m) => ({ ...m, text: m.text.slice(0, MAX_HISTORY_MESSAGE_CHARACTERS) }));

    const transcript = history
        .slice(-10)
        .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
        .join('\n');

    const prompt = `You are the support assistant for Lehigh Valley Art & Music, a social platform for the local arts community.

Here is accurate information about how the site works. Use only this information when describing steps, buttons, toggles, or file-format requirements — do not invent UI elements or capabilities that aren't listed here. If the user's question isn't covered below, say you're not sure rather than guessing.

${SUPPORT_KNOWLEDGE}

Conversation so far:
${transcript}

User: ${message}

Respond in exactly this format:
STATUS: resolved|unknown|issue

<your reply>

- Use "issue" if the user is reporting something broken or not working.
- Use "unknown" if their question isn't covered by the information above and you can't confidently answer it.
- Use "resolved" only if you gave a complete answer grounded in the information above.`;

    const response = await getTextResponse(prompt, undefined, 0);
    const [firstLine, ...rest] = response.split('\n');
    const statusMatch = /^STATUS:\s*(resolved|unknown|issue)/i.exec(firstLine);
    const status = statusMatch ? statusMatch[1].toLowerCase() : 'resolved';
    const reply = rest.join('\n').trim() || response;

    if (status === 'issue' || status === 'unknown') {
        const reporter = user.userdetails?.displayname ?? user.userdetails?.handle ?? user.email ?? `user ${user.id}`;
        const subject = status === 'issue'
            ? 'LVArts support: technical issue reported'
            : 'LVArts support: unanswered question';

        await sendAdminAlert(
            subject,
            `Reported by: ${reporter} (${user.email ?? 'no email on file'})\n\n${message}`
        );
    }

    return { reply };
};
