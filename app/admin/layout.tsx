import { notFound } from 'next/navigation';
import { isAdmin } from '@/lib/auth/isAdmin';
import { AdminNav } from './AdminNav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
	if (!(await isAdmin())) notFound();

	return (
		<>
			<AdminNav />
			{children}
		</>
	);
}
