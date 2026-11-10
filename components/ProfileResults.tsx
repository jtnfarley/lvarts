'use client'

import Link from 'next/link';
import Avatar from '@/components/shared/Avatar';
import Follow from '@/components/PostUi/Follow';
import imageUrl from '@/constants/imageUrl';
import User from '@/lib/models/user';
import type { ProfileResult } from '@/lib/searchProfiles';

export const profileAvatarUrl = (profile: Pick<ProfileResult, 'userdir' | 'avatar'>) =>
    profile.userdir && profile.avatar ? `${imageUrl}/${profile.userdir}/${profile.avatar}` : undefined;

const plainBio = (biohtml: string | null) => (biohtml ?? '').replace(/<[^>]*>/g, '').trim();

export default function ProfileResults(props: { profiles: ProfileResult[], user: User }) {
    const { profiles, user } = props;

    return (
        <ul className="lvartsmusic-card divide-y divide-black/5 dark:divide-white/10">
            {profiles.map((profile) => {
                const bio = plainBio(profile.biohtml);

                return (
                    <li key={profile.id} className="flex items-center gap-3 px-4 py-3">
                        <Link href={`/user/${profile.handle}`} className="flex min-w-0 flex-1 items-center gap-3">
                            <Avatar imageUrl={profileAvatarUrl(profile)} displayName={profile.displayname} handle={profile.handle} size="md" />
                            <div className="min-w-0">
                                <div className="truncate font-bold text-lvartsmusic-foreground">{profile.displayname || `@${profile.handle}`}</div>
                                {profile.displayname && <div className="truncate text-sm text-lvartsmusic-muted">@{profile.handle}</div>}
                                {bio && <div className="line-clamp-2 text-sm text-lvartsmusic-muted">{bio}</div>}
                            </div>
                        </Link>
                        {user.userdetails?.id !== profile.id && <Follow followinguserdetailsid={profile.id} user={user} />}
                    </li>
                );
            })}
        </ul>
    );
}
