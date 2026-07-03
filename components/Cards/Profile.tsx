'use client'

import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import imageUrl from '@/constants/imageUrl';
import { BiEdit, BiArrowBack } from "react-icons/bi";
import type SidebarProfile from '@/lib/models/sidebarProfile';
import User from "@/lib/models/user";
import createDOMPurify from "dompurify";
import { useFollowsStore } from '@/stores/follows-store';
import Avatar from '@/components/shared/Avatar';

export default function Profile(props:{profile:SidebarProfile, user:User, getUpdatedProfile?:Function, theme?:'lvartsmusic'}) {
	const { profile, user, theme } = props;
	const [biohtml, setBioHtml] = useState('');
	const avatarSrc = (profile && profile.userdir && profile.avatar) ?
		`${imageUrl}/${profile.userdir}/${profile.avatar}` :
		undefined

    const userfollowing = useFollowsStore((state) => state.following);
    const userfollowers = useFollowsStore((state) => state.followers);
    let followers = 0, following = 0;
    if (Object.hasOwn(profile, 'followerscount') && Object.hasOwn(profile, 'followingcount')) {
        followers = profile.followerscount;
        following = profile.followingcount;
    } else {
        following = userfollowing.length;
        followers = userfollowers.length;
    }

	useEffect(() => {
		if (!profile.biohtml) {
			setBioHtml('');
			return;
		}

		setBioHtml(createDOMPurify(window).sanitize(profile.biohtml));
	}, [profile.biohtml]);

	const isOwnProfile = Boolean(profile && user && user.userdetails && profile.id === user.userdetails.id);

    return (
        <div className="lvartsmusic-card w-full p-5">
            <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                    <p className="text-lg font-extrabold text-lvartsmusic-foreground">{following || 0}</p>
                    <p className="text-xs text-lvartsmusic-muted">Following</p>
                </div>

                <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
                    <div className="absolute inset-0 rounded-full border border-lvartsmusic-accent/15" />
                    <div className="absolute inset-2 rounded-full border border-lvartsmusic-accent/30" />
                    <div className="absolute inset-4 rounded-full border-2 border-lvartsmusic-accent-highlight/50" />
                    <Avatar imageUrl={avatarSrc} displayName={profile?.displayname} handle={profile?.handle} size="lg" />
                </div>

                <div className="text-center">
                    <p className="text-lg font-extrabold text-lvartsmusic-foreground">{followers || 0}</p>
                    <p className="text-xs text-lvartsmusic-muted">Followers</p>
                </div>
            </div>

            <div className="mt-4 text-center">
                <p className="truncate text-base font-bold text-lvartsmusic-foreground">
                    {profile.displayname || (profile.handle ? `@${profile.handle}` : '')}
                </p>
                {profile.handle &&
                    <p className="text-sm text-lvartsmusic-muted">@{profile.handle}</p>
                }
            </div>

            {biohtml &&
                <div className="mt-3 text-center text-sm text-lvartsmusic-muted" dangerouslySetInnerHTML={{ __html: biohtml }} />
            }

            <div className="mt-4 text-center text-sm text-lvartsmusic-muted">
                <strong className="text-lvartsmusic-foreground">{profile.postcount || 0}</strong> posts
            </div>

            {profile.urls && profile.urls.length > 0 &&
                <div className="mt-6">
                    <h2 className="text-xs font-bold uppercase tracking-wide text-lvartsmusic-muted">Links</h2>
                    <div className="mt-2 space-y-1 text-center text-sm">
                        {profile.urls.map((url, index) => (
                            <div key={index}>
                                <a href={(url.url.match(/^https?:\/\//)) ? url.url : `https://${url.url}`} target='_blank' rel='noopener noreferrer' className='link'>
                                    {url.urlname || url.url}
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            }

            {isOwnProfile &&
                <button onClick={() => redirect(`/profile`)} className="lvartsmusic-pill-outline mt-4 w-full">
                    <BiEdit className="inline" /> My Profile
                </button>
            }
        </div>
    )
}
