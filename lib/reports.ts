import { z } from 'zod';

export const REPORT_REASONS = {
    spam: 'Spam or scam',
    harassment: 'Harassment or bullying',
    hate: 'Hate speech',
    sexual: 'Sexual or explicit content',
    violence: 'Violence or threats',
    other: 'Something else',
} as const;

export type ReportReason = keyof typeof REPORT_REASONS;

export const REPORT_STATUSES = ['open', 'resolved', 'dismissed'] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

const reasonKeys = Object.keys(REPORT_REASONS) as [ReportReason, ...ReportReason[]];

// A report is about exactly one thing: a post (comments are posts too) or a profile.
export const reportInputSchema = z
    .object({
        postid: z.number().int().positive().optional(),
        userdetailsid: z.number().int().positive().optional(),
        reason: z.enum(reasonKeys),
        details: z.string().trim().max(500).optional(),
    })
    .refine((input) => (input.postid === undefined) !== (input.userdetailsid === undefined), {
        message: 'Report either a post or a user',
    });

export type ReportInput = z.infer<typeof reportInputSchema>;
