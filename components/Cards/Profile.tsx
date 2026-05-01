'use client'

import Image from "next/image"
import imageUrl from '@/constants/imageUrl';
import type SidebarProfile from '@/lib/models/sidebarProfile';

export default function Profile(props:{profile:SidebarProfile}) {
	const { profile } = props;

	const avatarSrc = (profile && profile.userDir && profile.avatar) ?
		`${imageUrl}/${profile.userDir}/${profile.avatar}` :
		'/images/melty-man.png'

	return (	
        <div className="flex min-h-0 flex-1 flex-col bg-white px-5 py-8">
            <div className='h-45 flex justify-center'>
                <Image
                    src={avatarSrc}
                    alt={profile?.displayName || 'Lehigh Valley Art & Music'}
                    width={300}
                    height={300}
                    className='avatar-profile'
                />
            </div>
            <div className="mb-6 flex flex-col items-center">
                <div className="flex justify-center text-xl font-bold uppercase">{profile.displayName || (profile.handle ? `@${profile.handle}` : '')}</div>
                {profile.handle &&
                    <div className="mt-1 text-xs font-semibold tracking-[0.24em] text-gray-500">@{profile.handle}</div>
                }
            </div>
            <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto pe-2">	
                <div className="w-full flex flex-col items-center justify-center mb-5">
                    <div className="text-2xl"><strong>{profile.postCount || 0}</strong></div>
                    <div className="uppercase text-sm">posts</div>
                </div>
                <div className="flex mb-10">
                    <div className="w-1/2 flex flex-col items-center justify-center border-e-2">
                        <div className="text-2xl"><strong>{profile.followers.length || 0}</strong></div>
                        <div className="uppercase text-sm">followers</div>
                    </div>
                    <div className="w-1/2 flex flex-col items-center justify-center">
                        <div className="text-2xl"><strong>{profile.following.length || 0}</strong></div>
                        <div className="uppercase text-sm">following</div>
                    </div>
                </div>
                <div className="mb-10">{profile.bio}</div>
                {profile.urls && profile.urls.length > 0 &&
                    <div className="mb-4">
                        <div className="text-lg font-bold flex justify-center">Links</div>
                        {profile.urls.map((url, index) => {
                            return (
                                <div key={index} className='mb-2'>
                                    <a href={(url.match(/^https?:\/\//)) ? url : `https://${url}`} target='blank' className='text-blue-500'>{url}</a>
                                </div>
                            )
                        })}
                    </div>
                }
            </div>
        </div>
	)
}
