import { z } from 'zod';
import { prisma } from '@/prisma';
import { hasBlocked } from '@/lib/blocks';
import { getNotificationSettings } from '@/lib/notificationSettings';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const PUSH_TIMEOUT_MS = 10000;

export const expoPushTokenSchema = z.string().regex(/^Expo(nent)?PushToken\[[^\]]+\]$/);

// One ticket per message, in the order the messages were sent.
const pushResponseSchema = z.object({
    data: z.array(
        z.object({
            status: z.enum(['ok', 'error']),
            details: z.object({ error: z.string().optional() }).optional(),
        })
    ),
});

type PostActivity = 'liked your post' | 'commented on your post' | 'mentioned you';

const SETTING_BY_ACTIVITY = {
    'liked your post': 'pushlikes',
    'commented on your post': 'pushcomments',
    'mentioned you': 'pushmentions',
    'followed you': 'pushfollows',
} as const;

type Activity = keyof typeof SETTING_BY_ACTIVITY;

// Never throws: a failed push must not break the like or comment that triggered it.
export const pushPostActivity = (
    receiverUserdetailsId: number,
    senderUserdetailsId: number,
    postid: number,
    activity: PostActivity
): Promise<void> =>
    sendPush(receiverUserdetailsId, senderUserdetailsId, activity, () => `/post/${postid}`);

export const pushFollow = (receiverUserdetailsId: number, senderUserdetailsId: number): Promise<void> =>
    sendPush(receiverUserdetailsId, senderUserdetailsId, 'followed you', (sender) =>
        sender?.handle ? `/user/${sender.handle}` : '/notifications'
    );

const sendPush = async (
    receiverUserdetailsId: number,
    senderUserdetailsId: number,
    activity: Activity,
    pathFor: (sender: { handle: string | null } | null) => string
): Promise<void> => {
    if (receiverUserdetailsId === senderUserdetailsId) return;

    try {
        if (await hasBlocked(receiverUserdetailsId, senderUserdetailsId)) return;

        const settings = await getNotificationSettings(receiverUserdetailsId);
        if (settings.pushpaused || !settings[SETTING_BY_ACTIVITY[activity]]) return;

        const devices = await prisma.pushtokens.findMany({
            where: { userdetailsid: receiverUserdetailsId },
            select: { token: true },
        });
        if (!devices.length) return;

        const sender = await prisma.userdetails.findUnique({
            where: { id: senderUserdetailsId },
            select: { displayname: true, handle: true },
        });
        const senderName = sender?.displayname ?? sender?.handle ?? 'Someone';
        const path = pathFor(sender);

        const response = await fetch(EXPO_PUSH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(
                devices.map(({ token }) => ({
                    to: token,
                    title: 'LV Art & Music',
                    body: `${senderName} ${activity}`,
                    data: { path },
                    channelId: 'default',
                }))
            ),
            signal: AbortSignal.timeout(PUSH_TIMEOUT_MS),
        });
        if (!response.ok) {
            console.error('Expo push request failed with status', response.status);
            return;
        }

        const { data: tickets } = pushResponseSchema.parse(await response.json());
        const staleTokens = devices
            .filter((_, index) => tickets[index]?.details?.error === 'DeviceNotRegistered')
            .map(({ token }) => token);
        if (staleTokens.length) {
            await prisma.pushtokens.deleteMany({ where: { token: { in: staleTokens } } });
        }
    } catch (error) {
        console.error('Sending push notification failed', error);
    }
};
