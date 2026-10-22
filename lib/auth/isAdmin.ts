import { auth } from '@/auth';

// The schema has no admin role, so admins are listed in ADMIN_EMAILS (comma-separated).
export const isAdmin = async (): Promise<boolean> => {
	const email = (await auth())?.user?.email?.trim().toLowerCase();
	if (!email) return false;

	const adminEmails = (process.env.ADMIN_EMAILS ?? '')
		.split(',')
		.map((entry) => entry.trim().toLowerCase())
		.filter(Boolean);
	return adminEmails.includes(email);
};
