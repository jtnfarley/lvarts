'use client'

import Image from "next/image"
import { redirect } from "next/navigation";
import imageUrl from '@/constants/imageUrl';
import { BiEdit, BiArrowBack } from "react-icons/bi";
import type SidebarProfile from '@/lib/models/sidebarProfile';
import User from "@/lib/models/user";

export default function Profile(props:{profile:SidebarProfile, user:User}) {
	const { profile, user } = props;

	const avatarSrc = (profile && profile.userDir && profile.avatar) ?
		`${imageUrl}/${profile.userDir}/${profile.avatar}` :
		'/images/melty-man.png'

	return (	
        <div className="flex min-h-0 flex-1 flex-col bg-white px-5 py-8">
            {profile && user && profile.userId === user.id && 
                <div className="w-full flex justify-center mb-8">
                    <button onClick={() => redirect(`/profile`)}><BiEdit className="inline"/> Edit Profile</button>
                </div>
            }
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
                <div className="flex justify-center text-xl font-bold uppercase">
                    {profile.displayName || (profile.handle ? `@${profile.handle}` : '')}
                </div>
                {profile.handle &&
                    <div className="mt-1 text-xs font-semibold tracking-[0.24em] text-gray-500">@{profile.handle}</div>
                }
            </div>
            <div className="flex-1 min-h-0 relative pe-2">
                <div className="h-full custom-scrollbar overflow-y-auto pb-20">
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
                <div className="absolute bottom-2 w-full">
                    <div className="w-full flex justify-center">
                        <div className="rounded-full bg-orange/70 p-3 shadow-md backdrop-blur-[1px]">
                            <BiArrowBack className="rotate-270 text-2xl text-white"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
	)
}
