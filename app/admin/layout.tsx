import { notFound } from 'next/navigation';
import { isAdmin } from '@/lib/auth/isAdmin';
import { AdminNav } from './AdminNav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
	if (!(await isAdmin())) notFound();

	return (
		// Fixed light colors so the admin pages read the same in the site's light and dark themes.
		<div className="min-h-screen bg-neutral-100 text-neutral-900 [&_*]:border-neutral-300">
			<AdminNav />
			{children}
		</div>
	);
}
