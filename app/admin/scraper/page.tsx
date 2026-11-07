import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isAdmin } from '@/lib/auth/isAdmin';
import { formatDateLine } from '@/lib/cards/text';
import { SOURCES, type Source } from '@/lib/scraper/sources';
import { readDiff, readIndex, readSnapshot } from '@/lib/scraper/snapshots';
import type { RunDiff, RunIndexEntry, ScrapedEvent, Snapshot } from '@/lib/scraper/types';
import { runScraperNow } from './actions';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ run?: string }>;

const formatWhen = (iso: string): string =>
	new Date(iso).toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'short' });

const durationSeconds = (run: RunIndexEntry): number =>
	Math.round((new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime()) / 1000);

const isBadRun = (run: RunIndexEntry): boolean => run.failed || run.eventCount === 0;

function RunHistory({ source, runs, selectedPath }: { source: Source; runs: RunIndexEntry[]; selectedPath?: string }) {
	if (runs.length === 0) return <p className="text-sm">No runs yet for {source.displayName}.</p>;

	return (
		<div className="overflow-x-auto">
			<table className="w-full text-left text-sm">
				<thead>
					<tr className="border-b">
						<th className="p-2">Started</th>
						<th className="p-2">Duration</th>
						<th className="p-2">Events</th>
						<th className="p-2">New</th>
						<th className="p-2">Changed</th>
						<th className="p-2">Missing</th>
						<th className="p-2">Warnings</th>
						<th className="p-2">Errors</th>
						<th className="p-2" />
					</tr>
				</thead>
				<tbody>
					{runs.map((run) => (
						<tr
							key={run.snapshotPath}
							className={`border-b ${isBadRun(run) ? 'bg-red-500/15 text-red-600' : ''} ${run.snapshotPath === selectedPath ? 'font-semibold' : ''}`}
						>
							<td className="p-2">{formatWhen(run.startedAt)}</td>
							<td className="p-2">{durationSeconds(run)}s</td>
							<td className="p-2">{run.eventCount}</td>
							<td className="p-2">{run.newCount}</td>
							<td className="p-2">{run.changedCount}</td>
							<td className="p-2">{run.missingCount}</td>
							<td className="p-2">{run.warningCount}</td>
							<td className="p-2">{run.errorCount}</td>
							<td className="flex gap-3 p-2">
								<Link href={`/admin/scraper?run=${encodeURIComponent(run.snapshotPath)}`} className="link">
									View
								</Link>
								<a href={`/admin/scraper/download?path=${encodeURIComponent(run.snapshotPath)}`} className="link">
									JSON
								</a>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function Badge({ children, tone }: { children: string; tone: 'amber' | 'red' }) {
	const colors = tone === 'red' ? 'bg-red-500/20 text-red-600' : 'bg-amber-500/20 text-amber-600';
	return <span className={`rounded px-1.5 py-0.5 text-xs ${colors}`}>{children}</span>;
}

function EventsTable({ events }: { events: ScrapedEvent[] }) {
	return (
		<div className="overflow-x-auto">
			<table className="w-full text-left text-sm">
				<thead>
					<tr className="border-b">
						<th className="p-2">When</th>
						<th className="p-2">Image</th>
						<th className="p-2">Event</th>
						<th className="p-2">Warnings</th>
						<th className="p-2" />
					</tr>
				</thead>
				<tbody>
					{events.map((event) => (
						<tr key={event.matchKey} className="border-b align-top">
							<td className="whitespace-nowrap p-2">{formatDateLine(new Date(event.startsAt))}</td>
							<td className="p-2">
								{event.imageUrl && (
									// eslint-disable-next-line @next/next/no-img-element -- admin preview of a remote venue image
									<img src={event.imageUrl} alt="" width={56} height={56} className="rounded" />
								)}
							</td>
							<td className="p-2">
								<div className="flex flex-wrap items-center gap-2">
									<span className="font-medium">{event.headline}</span>
									{event.soldOut && <Badge tone="amber">Sold out</Badge>}
									{event.canceled && <Badge tone="red">Canceled</Badge>}
								</div>
								{event.tagline && <div className="opacity-70">{event.tagline}</div>}
								<details className="mt-1 opacity-70">
									<summary className="cursor-pointer text-xs">Raw title</summary>
									<p className="text-xs">{event.rawTitle}</p>
									{event.notices.length > 0 && <p className="text-xs">Notices: {event.notices.join(' | ')}</p>}
									{event.description && <p className="text-xs">{event.description}</p>}
								</details>
							</td>
							<td className="p-2">{event.warnings.join(', ')}</td>
							<td className="p-2">
								<a href={event.sourceUrl} target="_blank" rel="noreferrer" className="link">
									Source
								</a>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function EventList({ title, events }: { title: string; events: ScrapedEvent[] }) {
	if (events.length === 0) return null;
	return (
		<div>
			<h4 className="font-medium">
				{title} ({events.length})
			</h4>
			<ul className="list-disc pl-5 text-sm">
				{events.map((event) => (
					<li key={event.matchKey}>
						{formatDateLine(new Date(event.startsAt))} — {event.headline}
					</li>
				))}
			</ul>
		</div>
	);
}

const showValue = (value: unknown): string => (typeof value === 'string' ? value : JSON.stringify(value));

function Changes({ diff }: { diff: RunDiff }) {
	const isEmpty =
		diff.newEvents.length + diff.changed.length + diff.missingPast.length + diff.missingFuture.length === 0;
	if (isEmpty) return <p className="text-sm">No changes from the previous run.</p>;

	return (
		<div className="flex flex-col gap-4">
			<EventList title="New" events={diff.newEvents} />
			{diff.changed.length > 0 && (
				<div>
					<h4 className="font-medium">Changed ({diff.changed.length})</h4>
					<ul className="list-disc pl-5 text-sm">
						{diff.changed.map((item) => (
							<li key={item.matchKey}>
								{item.headline}
								<ul className="list-disc pl-5">
									{item.changes.map((change) => (
										<li key={change.field}>
											{change.field}: <span className="line-through opacity-60">{showValue(change.before)}</span> →{' '}
											{showValue(change.after)}
										</li>
									))}
								</ul>
							</li>
						))}
					</ul>
				</div>
			)}
			<EventList title="Missing (future, worth checking)" events={diff.missingFuture} />
			<EventList title="Missing (past, normal)" events={diff.missingPast} />
		</div>
	);
}

async function SourceSection({ source, runs, selectedPath }: { source: Source; runs: RunIndexEntry[]; selectedPath?: string }) {
	const sourceRuns = runs.filter((run) => run.sourceKey === source.key);
	const selected =
		sourceRuns.find((run) => run.snapshotPath === selectedPath) ?? sourceRuns.find((run) => !run.failed);

	let snapshot: Snapshot | null = null;
	let diff: RunDiff | null = null;
	if (selected) {
		[snapshot, diff] = await Promise.all([readSnapshot(selected.snapshotPath), readDiff(selected.diffPath)]);
	}

	return (
		<section className="flex flex-col gap-4">
			<h2 className="text-xl">{source.displayName}</h2>
			<RunHistory source={source} runs={sourceRuns} selectedPath={selected?.snapshotPath} />

			{selected && snapshot && (
				<>
					<h3 className="text-lg">
						Events from {formatWhen(selected.startedAt)}
						{selected.snapshotPath !== sourceRuns.find((run) => !run.failed)?.snapshotPath && ' (older run)'}
					</h3>
					{snapshot.errors.length > 0 && (
						<ul className="list-disc pl-5 text-sm text-red-600">
							{snapshot.errors.map((error) => (
								<li key={error}>{error}</li>
							))}
						</ul>
					)}
					<EventsTable events={snapshot.events} />
					<h3 className="text-lg">Changes</h3>
					{diff && <Changes diff={diff} />}
				</>
			)}
		</section>
	);
}

export default async function ScraperPage({ searchParams }: { searchParams: SearchParams }) {
	if (!(await isAdmin())) notFound();

	const { run } = await searchParams;
	const runs = await readIndex();

	return (
		<div className="mx-auto flex max-w-6xl flex-col gap-8 p-5">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl">Event scraper</h1>
				<form action={runScraperNow}>
					<button type="submit" className="rounded border px-3 py-1.5 text-sm">
						Run now
					</button>
				</form>
			</div>
			{SOURCES.map((source) => (
				<SourceSection key={source.key} source={source} runs={runs} selectedPath={run} />
			))}
		</div>
	);
}
