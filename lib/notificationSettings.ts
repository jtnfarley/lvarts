import { prisma } from '@/prisma';

export type NotificationSettings = {
    pushpaused: boolean;
    pushlikes: boolean;
    pushcomments: boolean;
    pushmentions: boolean;
    pushfollows: boolean;
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
    pushpaused: false,
    pushlikes: true,
    pushcomments: true,
    pushmentions: true,
    pushfollows: true,
};

// A user who never opened the settings has no row, which means every push is on.
export const getNotificationSettings = async (userdetailsid: number): Promise<NotificationSettings> => {
    const row = await prisma.notificationsettings.findUnique({
        where: { userdetailsid },
        select: {
            pushpaused: true,
            pushlikes: true,
            pushcomments: true,
            pushmentions: true,
            pushfollows: true,
        },
    });
    return row ?? DEFAULT_NOTIFICATION_SETTINGS;
};
