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
import CommunityPlaceholder from '@/components/shared/CommunityPlaceholder';

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

	if (theme === 'lvartsmusic') {
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

				{isOwnProfile &&
					<button onClick={() => redirect(`/profile`)} className="lvartsmusic-pill-outline mt-4 w-full">
						<BiEdit className="inline" /> My Profile
					</button>
				}

				<div className="mt-6">
					<h2 className="text-xs font-bold uppercase tracking-wide text-lvartsmusic-muted">Skills</h2>
					<div className="mt-2 flex flex-wrap gap-2 opacity-50">
						<span className="rounded-full border border-dashed border-lvartsmusic-muted px-3 py-1 text-xs font-medium text-lvartsmusic-muted">
							Coming soon
						</span>
					</div>
				</div>

				<div className="mt-6">
					<h2 className="text-xs font-bold uppercase tracking-wide text-lvartsmusic-muted">Communities</h2>
					<CommunityPlaceholder />
				</div>

				{profile.urls && profile.urls.length > 0 &&
					<div className="mt-6">
						<h2 className="text-xs font-bold uppercase tracking-wide text-lvartsmusic-muted">Links</h2>
						<div className="mt-2 space-y-1 text-center">
							{profile.urls.map((url, index) => (
								<div key={index}>
									<a href={(url.url.match(/^https?:\/\//)) ? url.url : `https://${url.url}`} target='blank' className='text-lvartsmusic-accent'>
										{url.urlname || url.url}
									</a>
								</div>
							))}
						</div>
					</div>
				}
			</div>
		)
	}

	return (
        <div className="flex min-h-0 flex-1 flex-col px-5 py-8 bg-gray-900/40 rounded-tr-md w-full">
            {profile && user && user.userdetails && profile.id === user.userdetails.id && 
                <div className="w-full flex justify-center mb-8 text-gray-400">
                    <button onClick={() => redirect(`/profile`)} className="cursor-pointer"><BiEdit className="inline"/> Edit Profile</button>
                </div>
            }
            <div className='h-45 flex justify-center'>
                <Avatar
                    imageUrl={avatarSrc}
                    displayName={profile?.displayname}
                    handle={profile?.handle}
                    size="lg"
                    className='avatar-profile'
                />
            </div>
            <div className="mb-6 flex flex-col items-center text-[#c9c9c9]">
                <div className="flex justify-center text-xl font-bold uppercase text-center">
                    {profile.displayname || (profile.handle ? `@${profile.handle}` : '')}
                </div>
                {profile.handle &&
                    <div className="mt-1 text-md font-semibold tracking-[0.24em] text-gray-400">@{profile.handle}</div>
                }
            </div>
            <div className="flex-1 min-h-0 relative pe-2 text-gray-400">
                <div className="h-full custom-scrollbar overflow-y-auto xl:pb-20">
                    <div className="w-full flex flex-col items-center justify-center mb-5">
                        <div className="text-2xl"><strong>{profile.postcount || 0}</strong></div>
                        <div className="uppercase text-sm">posts</div>
                    </div>
                    <div className="flex mb-10">
                        <div className="w-1/2 flex flex-col items-center justify-center border-e-1 border-e-gray-400">
                            <div className="text-2xl"><strong>{followers || 0}</strong></div>
                            <div className="uppercase text-sm">followers</div>
                        </div>
                        <div className="w-1/2 flex flex-col items-center justify-center">
                            <div className="text-2xl"><strong>{following || 0}</strong></div>
                            <div className="uppercase text-sm">following</div>
                        </div>
                    </div>
                    {biohtml &&
                        <div className="mb-10" dangerouslySetInnerHTML={{ __html: biohtml }} />
                    }
                    {profile.urls && profile.urls.length > 0 && // > 0 is necessary
                        <div className="mb-4">
                            <div className="text-lg font-bold flex justify-center">Links</div>
                            {profile.urls.map((url, index) => {
                                return (
                                    <div key={index} className='mb-2'>
                                        <a href={(url.url.match(/^https?:\/\//)) ? url.url : `https://${url.url}`} target='blank' className='text-blue-500'>{url.urlname || url.url}</a>
                                    </div>
                                )
                            })}
                        </div>
                    }
                </div>
                <div className="hidden md:block absolute bottom-2 w-full">
                    <div className="w-full flex justify-center">
                        <div className="rounded-full bg-gray-900/70 p-3 shadow-md backdrop-blur-[1px]">
                            <BiArrowBack className="rotate-270 text-2xl text-white"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
	)
}
