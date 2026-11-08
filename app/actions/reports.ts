'use server'

import { after } from 'next/server';
import { Prisma } from '@prisma/client';
import { isLoggedIn } from '@/app/data/currentUser';
import { prisma } from '@/prisma';
import { sendAdminAlert } from '@/lib/mail';
import { REPORT_REASONS, reportInputSchema, type ReportReason } from '@/lib/reports';

type ReportResult = { ok: true } | { ok: false; error: string };

const siteUrl = () => process.env.NEXTAUTH_URL ?? 'https://www.lvartandmusic.com';

// Runs after the response; a failed email must not fail the report, which is already saved.
const alertAdmin = async (lines: string[], reason: ReportReason) => {
    try {
        await sendAdminAlert(`New report: ${REPORT_REASONS[reason]}`, lines.join('\n'));
    } catch (error) {
        console.error('Report alert email failed', error);
    }
};

export const reportContent = async (input: unknown): Promise<ReportResult> => {
    const parsed = reportInputSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: 'Please choose a reason.' };
    const { postid, userdetailsid, reason, details } = parsed.data;

    const user = await isLoggedIn();
    const reporterId = user?.userdetails?.id;
    if (!reporterId) return { ok: false, error: 'Please sign in to report content.' };

    // The first usertoposts row is the author.
    const reportedUserId =
        postid !== undefined
            ? (await prisma.usertoposts.findFirst({
                  where: { postid },
                  orderBy: { id: 'asc' },
                  select: { userdetailsid: true },
              }))?.userdetailsid
            : (await prisma.userdetails.findUnique({ where: { id: userdetailsid }, select: { id: true } }))?.id;
    if (reportedUserId === undefined) return { ok: false, error: 'That content no longer exists.' };
    if (reportedUserId === reporterId) return { ok: false, error: "You can't report your own content." };

    try {
        await prisma.reports.create({
            data: {
                reporteruserdetailsid: reporterId,
                postid,
                reporteduserdetailsid: userdetailsid,
                reason,
                details: details || null,
            },
        });
    } catch (error) {
        // The unique indexes mean this person already reported it; nothing more to record.
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return { ok: true };
        }
        throw error;
    }

    after(() =>
        alertAdmin(
            [
                `Reason: ${REPORT_REASONS[reason]}`,
                postid !== undefined ? `Post: ${siteUrl()}/post/${postid}` : `Profile id: ${userdetailsid}`,
                `Reported by: @${user?.userdetails?.handle ?? reporterId}`,
                details ? `Details: ${details}` : 'Details: (none)',
                '',
                `Review: ${siteUrl()}/admin/reports`,
            ],
            reason
        )
    );

    return { ok: true };
};
