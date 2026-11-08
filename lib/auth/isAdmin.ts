import { auth } from '@/auth';

// The schema has no admin role, so admins are listed in ADMIN_EMAILS (comma-separated).
export const isAdminEmail = (email: string | null | undefined): boolean => {
	const normalized = email?.trim().toLowerCase();
	if (!normalized) return false;

	const adminEmails = (process.env.ADMIN_EMAILS ?? '')
		.split(',')
		.map((entry) => entry.trim().toLowerCase())
		.filter(Boolean);
	return adminEmails.includes(normalized);
};

export const isAdmin = async (): Promise<boolean> => isAdminEmail((await auth())?.user?.email);
