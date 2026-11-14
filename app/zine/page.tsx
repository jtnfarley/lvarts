import Link from 'next/link';
import { isLoggedIn } from '../data/currentUser';
import { getZine } from '../data/posts';
import LikePost from '@/components/PostUi/LikePost';
import CommentButton from '@/components/PostUi/CommentButton';
import PostMedia from '@/components/PostUi/PostMedia';
import ZineBody from '@/components/Zine/ZineBody';
import { splitTitle } from '@/lib/zine/title';

export const dynamic = 'force-dynamic';

const formatEntryDate = (date: Date): string =>
	new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', month: 'long', day: 'numeric', year: 'numeric' }).format(date);

export default async function Zine() {
	const entries = await getZine();
	const user = await isLoggedIn();

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-12 px-5 py-10">
			<header className="flex flex-col gap-2 border-b border-lvartsmusic-border pb-8 text-center">
				<div className="text-sm uppercase tracking-widest">Lehigh Valley Art &amp; Music</div>
				<h1 className="font-serif text-4xl font-bold lg:text-6xl">LVAM Literary Zine</h1>
			</header>

			{entries.length === 0 && <p className="text-center">Nothing here yet. Check back soon.</p>}

			{entries.map((entry) => {
				const { title, bodyHtml } = splitTitle(entry.content ?? '');

				return (
					<article key={entry.id} className="flex flex-col gap-4 border-t border-lvartsmusic-border pt-12 first-of-type:border-t-0 first-of-type:pt-0">
						<h2 className="font-serif text-3xl font-bold">
							<Link href={`/post/${entry.id}`}>{title}</Link>
						</h2>
						<div className="text-sm">
							by <Link href={`/user/${entry.userdetails.handle}`} className="underline">{entry.userdetails.displayname ?? entry.userdetails.handle}</Link> · {formatEntryDate(entry.createdat)}
						</div>
						{entry.postfile && <PostMedia post={entry} />}
						<ZineBody html={bodyHtml} />
						{user?.userdetails?.id && (
							<div className="flex items-center gap-6">
								<LikePost postData={entry} user={user} currentUserPost={entry.userdetails.id === user.userdetails.id} />
								<CommentButton postData={entry} />
							</div>
						)}
					</article>
				);
			})}
		</div>
	);
}
