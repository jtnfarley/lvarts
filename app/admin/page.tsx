import Link from 'next/link';
import { adminTools } from './adminTools';

export default function AdminDashboardPage() {
	return (
		<div className="mx-auto flex max-w-5xl flex-col gap-6 p-5">
			<h1 className="text-2xl">Admin</h1>
			<ul className="grid gap-4 sm:grid-cols-2">
				{adminTools.map(({ href, label, description }) => (
					<li key={href}>
						<Link href={href} className="flex h-full flex-col gap-1 rounded border bg-white p-4">
							<span className="text-lg font-medium">{label}</span>
							<span className="text-sm opacity-80">{description}</span>
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}
