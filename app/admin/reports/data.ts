import { prisma } from '@/prisma';

const personSelect = { id: true, handle: true, displayname: true } as const;

// A plain module (not 'use server') used only by the admin page, which the admin
// layout already gates.
export const getReports = async (which: 'open' | 'closed') => {
	const open = which === 'open';
	return prisma.reports.findMany({
		where: open ? { status: 'open' } : { status: { not: 'open' } },
		orderBy: open ? { createdat: 'asc' } : { resolvedat: 'desc' },
		take: open ? 100 : 20,
		include: {
			reporter: { select: personSelect },
			reporteduser: { select: personSelect },
			posts: {
				select: {
					id: true,
					content: true,
					posttypes: { select: { posttype: true } },
					usertoposts: {
						orderBy: { id: 'asc' },
						take: 1,
						select: { userdetails: { select: personSelect } },
					},
				},
			},
		},
	});
};

export type AdminReport = Awaited<ReturnType<typeof getReports>>[number];
