import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isAdmin } from '@/lib/auth/isAdmin';
import { stripHtml } from '@/lib/cards/text';
import { listPendingZine } from '@/lib/zine/review';
import { splitTitle } from '@/lib/zine/title';
import { approveZine, rejectZine } from './actions';

export const dynamic = 'force-dynamic';

// Paragraphs as plain text, so submitted content is never rendered as HTML on this page.
const paragraphs = (html: string): string[] =>
	html
		.split('</p>')
		.map((paragraph) => stripHtml(paragraph))
		.filter(Boolean);

export default async function ZineReviewPage() {
	if (!(await isAdmin())) notFound();

	const pending = await listPendingZine();

	return (
		<div className="mx-auto flex max-w-3xl flex-col gap-6 p-5">
			<h1 className="text-2xl">Zine review</h1>
			<h2 className="text-xl">Waiting for review ({pending.length})</h2>
			{pending.length === 0 && <p className="text-sm">Nothing is waiting for review.</p>}

			<ul className="flex flex-col gap-4">
				{pending.map((post) => {
					const { title, bodyHtml } = splitTitle(post.content ?? '');
					const author = post.usertoposts[0]?.userdetails;

					return (
						<li key={post.id} className="flex flex-col gap-2 rounded border bg-white p-4">
							<h3 className="text-lg font-medium">{title}</h3>
							<div className="text-sm opacity-70">
								by {author?.displayname ?? author?.handle ?? 'unknown'} · {post.createdat.toLocaleDateString('en-US')}
								{post.postfile && ' · has an attachment'}
							</div>
							<div className="flex flex-col gap-1 text-sm">
								{paragraphs(bodyHtml).map((line, index) => (
									<p key={index}>{line}</p>
								))}
							</div>
							<div className="mt-2 flex flex-wrap gap-2">
								<form action={approveZine.bind(null, post.id)}>
									<button type="submit" className="rounded border px-3 py-1.5 text-sm">
										Approve
									</button>
								</form>
								<form action={rejectZine.bind(null, post.id)}>
									<button type="submit" className="rounded border px-3 py-1.5 text-sm">
										Reject
									</button>
								</form>
								<Link href={`/edit-post/${post.id}`} className="rounded border px-3 py-1.5 text-sm">
									Edit
								</Link>
							</div>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
