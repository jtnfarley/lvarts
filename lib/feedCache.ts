import type { FeedRow } from '@/lib/models/initFeedRow';

// Keeps the home feed alive while the user visits other pages. Lives in browser memory only,
// so a full page reload starts fresh.
type FeedCache = {
	userdetailsId: number
	feed: FeedRow[]
	queued: FeedRow[]
	lastChecked: Date
	endOfPosts: boolean
}

let cache: FeedCache | undefined;

export function readFeedCache(userdetailsId: number): FeedCache | undefined {
	return cache?.userdetailsId === userdetailsId ? cache : undefined;
}

export function writeFeedCache(next: FeedCache) {
	cache = next;
}

// Edits and deletes can happen on other pages while the Feed is unmounted, so the cache has to hear them too.
if (typeof window !== 'undefined') {
	window.addEventListener('postsUpdated', (event) => {
		if (!cache || !(event instanceof CustomEvent) || !event.detail) return;

		if (event.detail.action === 'delete') {
			const withoutDeleted = (posts: FeedRow[]) => posts.filter(post => post.id !== event.detail.postid);
			cache = { ...cache, feed: withoutDeleted(cache.feed), queued: withoutDeleted(cache.queued) };
		}

		if (event.detail.action === 'edit') {
			cache = undefined;
		}
	});
}
