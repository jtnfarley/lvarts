'use client'

import Link from 'next/link';
import {APIProvider} from '@vis.gl/react-google-maps';
import User from '@/lib/models/user';
import PostUi from '@/components/PostUi/PostUi';
import ProfileResults from '@/components/ProfileResults';
import { cn } from '@/lib/utils';
import type { FeedRow } from '@/lib/models/initFeedRow';
import type { ProfileResult } from '@/lib/searchProfiles';

// The feed query returns at most one page, so a full page means "there may be more".
const POSTS_PAGE_SIZE = 20;

export type SearchTab = 'posts' | 'profiles';

export default function Search(props:{query:string, tab:SearchTab, user:User, posts:FeedRow[], profiles:ProfileResult[], googleMapsApiKey:string}) {
    const {query, tab, user, posts, profiles, googleMapsApiKey} = props;
    const searchPath = `/search/${encodeURIComponent(query)}`;

    const tabs = [
        { key: 'posts', label: 'Posts', count: `${posts.length}${posts.length >= POSTS_PAGE_SIZE ? '+' : ''}`, href: `${searchPath}?tab=posts` },
        { key: 'profiles', label: 'Profiles', count: `${profiles.length}`, href: `${searchPath}?tab=profiles` },
    ] as const;

    return (
        <APIProvider apiKey={googleMapsApiKey}>
            <div className="flex flex-col gap-5 py-3">
                <div className='lvartsmusic-card px-3 pt-3'>
                    <div className='text-2xl font-bold flex justify-center pb-3 break-all'>
                        {query}
                    </div>
                    <nav className="flex" aria-label="Search results">
                        {tabs.map(({key, label, count, href}) => (
                            <Link
                                key={key}
                                href={href}
                                replace
                                aria-current={tab === key ? 'page' : undefined}
                                className={cn(
                                    'flex-1 border-b-2 py-2 text-center font-semibold transition-colors',
                                    tab === key
                                        ? 'border-lvartsmusic-accent text-lvartsmusic-foreground'
                                        : 'border-transparent text-lvartsmusic-muted hover:text-lvartsmusic-foreground'
                                )}
                            >
                                {label} <span className="text-sm font-normal">{count}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                {tab === 'posts' && (
                    posts.length > 0
                        ? posts.map((post:FeedRow, index:number) => (
                            <PostUi key={`${post.id}-${index}`} postData={post} user={user} googleMapsApiKey={googleMapsApiKey} />
                        ))
                        : <p className="lvartsmusic-card px-4 py-6 text-center text-lvartsmusic-muted">No posts match &ldquo;{query}&rdquo;.</p>
                )}

                {tab === 'profiles' && (
                    profiles.length > 0
                        ? <ProfileResults profiles={profiles} user={user} />
                        : <p className="lvartsmusic-card px-4 py-6 text-center text-lvartsmusic-muted">No profiles match &ldquo;{query}&rdquo;.</p>
                )}
            </div>
        </APIProvider>
    );
}
