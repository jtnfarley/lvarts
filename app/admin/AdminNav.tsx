'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { adminTools } from './adminTools';

const links = [{ href: '/admin', label: 'Dashboard' }, ...adminTools];

export function AdminNav() {
	const pathname = usePathname();

	return (
		<nav className="flex flex-wrap items-center gap-2 border-b p-3">
			{links.map(({ href, label }) => {
				const active = href === '/admin' ? pathname === href : pathname.startsWith(href);
				return (
					<Link key={href} href={href} className={`rounded border px-3 py-1 text-sm ${active ? 'font-bold' : ''}`}>
						{label}
					</Link>
				);
			})}
			<Link href="/home" className="link ml-auto text-sm">
				Back to site
			</Link>
		</nav>
	);
}
