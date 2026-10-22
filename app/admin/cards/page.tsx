import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isAdmin } from '@/lib/auth/isAdmin';
import { getRoundup } from '@/lib/cards/getRoundup';
import { addDays, easternToday, formatDay, InvalidRoundupInput, RoundupOptions } from '@/lib/cards/roundupWindow';
import { formatDateLine } from '@/lib/cards/text';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ view?: string; start?: string; end?: string }>;

const VIEWS = [
	{ key: 'today', label: 'Today' },
	{ key: 'tomorrow', label: 'Tomorrow' },
	{ key: 'weekend', label: 'This Weekend' },
] as const;

const optionsFor = ({ view, start, end }: Awaited<SearchParams>): RoundupOptions => {
	if (view === 'custom') return { start, end };
	if (view === 'tomorrow') return { preset: 'today', date: formatDay(addDays(easternToday(), 1)) };
	if (view === 'weekend') return { preset: 'weekend' };
	return { preset: 'today' };
};

const coverQuery = (options: RoundupOptions): string => {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(options)) {
		if (value) params.set(key, value);
	}
	return params.toString();
};

function CardPreview({ src, label, filename }: { src: string; label: string; filename: string }) {
	return (
		<div className="flex w-[360px] flex-col gap-2">
			{/* eslint-disable-next-line @next/next/no-img-element -- generated JPEG, not optimizable */}
			<img src={src} alt={label} width={360} height={450} className="rounded border" />
			<div className="flex items-center justify-between text-sm">
				<span>{label}</span>
				<a href={src} download={filename} className="link">Download JPEG</a>
			</div>
		</div>
	);
}

export default async function CardsPreviewPage({ searchParams }: { searchParams: SearchParams }) {
	if (!(await isAdmin())) notFound();

	const query = await searchParams;
	const view = query.view ?? 'today';
	const options = optionsFor(query);

	let roundup;
	let inputError: string | undefined;
	try {
		roundup = await getRoundup(options);
	} catch (error) {
		if (!(error instanceof InvalidRoundupInput)) throw error;
		inputError = error.message;
	}

	return (
		<div className="mx-auto flex max-w-5xl flex-col gap-6 p-5">
			<h1 className="text-2xl">Instagram cards</h1>

			<div className="flex flex-wrap items-end gap-3">
				{VIEWS.map(({ key, label }) => (
					<Link key={key} href={`/admin/cards?view=${key}`} className={`rounded border px-3 py-1 ${view === key ? 'font-bold' : ''}`}>
						{label}
					</Link>
				))}
				<form className="flex flex-wrap items-end gap-2" action="/admin/cards">
					<input type="hidden" name="view" value="custom" />
					<label className="flex flex-col text-sm">
						Start
						<input type="date" name="start" defaultValue={query.start} required className="rounded border px-2 py-1" />
					</label>
					<label className="flex flex-col text-sm">
						End
						<input type="date" name="end" defaultValue={query.end} required className="rounded border px-2 py-1" />
					</label>
					<button type="submit" className={`rounded border px-3 py-1 ${view === 'custom' ? 'font-bold' : ''}`}>
						Custom range
					</button>
				</form>
			</div>

			{inputError && <p role="alert">{inputError}</p>}

			{roundup && (
				<>
					<p>
						{roundup.headline} · {roundup.dateLabel}
					</p>

					{roundup.events.length === 0 ? (
						<p>No events in this window.</p>
					) : (
						<div className="flex flex-wrap gap-6">
							<CardPreview
								src={`/api/cards/roundup?${coverQuery(options)}`}
								label="Cover"
								filename={`cover-${roundup.dateLabel.replace(/\W+/g, '-')}.jpg`}
							/>
							{roundup.events.map((event) => (
								<CardPreview
									key={event.id}
									src={`/api/cards/event/${event.id}`}
									label={`Event ${event.id} · ${formatDateLine(event.date)}`}
									filename={`event-${event.id}.jpg`}
								/>
							))}
						</div>
					)}

					{roundup.skipped.length > 0 && (
						<div>
							<h2 className="text-lg">Skipped</h2>
							<ul className="list-disc pl-6">
								{roundup.skipped.map((event) => (
									<li key={event.id}>
										Event {event.id}
										{event.title ? ` (${event.title})` : ''}: {event.reason}
									</li>
								))}
							</ul>
						</div>
					)}
				</>
			)}
		</div>
	);
}
