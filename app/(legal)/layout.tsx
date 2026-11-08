import Link from 'next/link';

export default function LegalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<div className="min-h-screen lvartsmusic-bg-gradient text-lvartsmusic-foreground">
			<main className="mx-auto flex max-w-2xl flex-col gap-4 p-6">
				{children}
				<Link href="/" className="mt-4 text-lvartsmusic-accent">
					&larr; Back to Lehigh Valley Art &amp; Music
				</Link>
			</main>
		</div>
	);
}
