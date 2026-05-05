'use client'

import { useRouter } from "next/navigation"
import User from "@/lib/models/user"
import { useEffect, useState } from "react"
import Follow from '../PostUi/Follow';

interface Props {
    currentUser: User
    recUserId: string
    displayName?: string | null
    handle?: string | null
    avatar?: string,
    bioHtml?: string | null
}

const UserCard = ({currentUser, recUserId, displayName, handle, avatar, bioHtml}: Props) => {

    const router = useRouter()
    const [following, setFollowing] = useState(false)

    const viewProfile = () => {
        router.push(`/user/${recUserId}`)
    }

    const bio = bioHtml ? bioHtml.replace(/<[^>]*>/g, '') : '';

    const truncateText = (text:string, length:number) => {
        return (text.length > length) ? `${text.substring(0, length)}...` : text;
    } 
    
    useEffect(() => {
        if (currentUser.userDetails?.following?.includes(recUserId)) {
            setFollowing(true)
        }
    }, [])

    return (
        <article className="xl:w-full xl:border-b xl:border-b-gray-400 py-4">
            <div className="flex items-center text-gray-700 text-sm gap-3 justify-between">
                <button className="xl:flex w-full gap-3 items-center cursor-pointer" onClick={viewProfile} title={displayName || (handle ? `@${handle}` : 'Profile')}>
                    <div className="w-[45px]">
                        <img src={avatar} className='rounded-sm border-1 border-gray-400 w-[45px] h-[45px]'/>
                    </div>

                    <div className='hidden xl:block text-start'>
                        <div className='xl:text-gray-400 xl:text-[16px] font-bold'>{truncateText(displayName || '', 17) || (handle ? `@${truncateText(handle, 10)}` : 'Artist')}</div>
                        {handle && <div className='hidden xl:block text-sm lowercase text-gray-400'>@{truncateText(handle, 17)}</div>}
                    </div>
                </button>
                <div className='hidden xl:block'>
                    <Follow followUserId={recUserId} user={currentUser}/>
                </div>
            </div>
            {bio && bio !== '' &&
                <div className="mt-3">
                    <div className='hidden xl:block text-sm rounded-sm text-gray-400'>{truncateText(bio, 100)}</div>
                </div>
            }
        </article>
    )
}

export default UserCard
