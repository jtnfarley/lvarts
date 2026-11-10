import {currentUser} from "@/app/data/currentUser";
import Search from '@/components/Search';
import { searchPosts } from '@/app/data/posts';
import { searchProfiles } from '@/lib/searchProfiles';

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ query: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
    const user = await currentUser();

    const { query: encodedQuery } = await params;
    const { tab } = await searchParams;
    // A hand-typed URL like /search/100% is not valid percent-encoding; fall back to the raw text.
    let query = encodedQuery;
    try {
        query = decodeURIComponent(encodedQuery);
    } catch {
        // keep the raw text
    }

    const googleMapsApiKey = process.env.GOOGLE_MAPS;

    if (!googleMapsApiKey) {
        return null;
    }

    const [posts, profiles] = await Promise.all([searchPosts(query), searchProfiles(query)]);

    // An explicit tab wins; otherwise land on profiles only when there are no posts to show.
    const activeTab = tab === 'profiles' || (tab !== 'posts' && !posts.length && profiles.length) ? 'profiles' : 'posts';

	return (
		<Search query={query} tab={activeTab} user={user} posts={posts} profiles={profiles} googleMapsApiKey={googleMapsApiKey} />
	);
}
