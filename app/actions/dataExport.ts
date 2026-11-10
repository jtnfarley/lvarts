'use server'

import { isLoggedIn } from '@/app/data/currentUser';
import { createExportToken, getExportSecret } from '@/lib/exportToken';
import { sendEmail } from '@/lib/mail';
import { prisma } from '@/prisma';

type EmailExportResult = { ok: true; email: string } | { ok: false; error: string };

const siteUrl = () => process.env.NEXTAUTH_URL ?? 'https://www.lvartandmusic.com';

// The link goes only to the address on the signed-in account, never one the browser supplies.
export const emailMyDataExport = async (): Promise<EmailExportResult> => {
    const userdetailsid = (await isLoggedIn())?.userdetails?.id;
    if (!userdetailsid) return { ok: false, error: 'Please sign in first.' };

    const details = await prisma.userdetails.findUnique({
        where: { id: userdetailsid },
        select: { User: { select: { email: true } } },
    });
    const email = details?.User.email;
    if (!email) return { ok: false, error: 'We could not find an email address for your account.' };

    const link = `${siteUrl()}/api/account/export?token=${createExportToken(userdetailsid, getExportSecret())}`;
    try {
        await sendEmail(
            email,
            'Your Lehigh Valley Art & Music data',
            [
                'You asked for a copy of your data. Open this link in a browser to download it as a JSON file:',
                '',
                link,
                '',
                'The link works for one hour and anyone who has it can download your data, so please do not share it.',
                "If you didn't ask for this, you can ignore this email.",
            ].join('\n')
        );
    } catch (error) {
        console.error('Data export email failed', error);
        return { ok: false, error: 'We could not send the email. Please try again later.' };
    }

    return { ok: true, email };
};
