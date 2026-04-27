'use client'

import { useRouter } from "next/navigation"
import User from "@/lib/models/user"
import { useEffect, useState } from "react"
import Follow from '../PostUi/Follow';

interface Props {
    currentUser: User
    recUserId: string
    displayName: string
    avatar?: string,
    bio?: string
}

const UserCard = ({currentUser, recUserId, displayName, avatar, bio}: Props) => {

    const router = useRouter()
    const [following, setFollowing] = useState(false)

    const viewProfile = () => {
        router.push(`/user/${recUserId}`)
    }

    const truncateBio = (bio:string) => {
        return (bio.length > 100) ? bio.substring(0, 100) : bio;
    } 
    useEffect(() => {
        if (currentUser.userDetails?.following?.includes(recUserId)) {
            setFollowing(true)
        }
    }, [])

    return (
        <article className="xl:w-full xl:bg-white xl:border-b-1 xl:py-4">
            <div className="flex items-center text-gray-700 text-sm gap-3 justify-between">
                <button className="flex gap-3 items-center cursor-pointer" onClick={viewProfile} title={displayName}>
                    <div><img src={avatar} className='rounded-sm border-dark-2 w-[50px] h-[50px] xl:border-0'/></div>
                    
                    <div className='hidden xl:block text-xl'>{displayName}</div>
                </button>
                <div className='hidden xl:block'>
                    <Follow followUserId={recUserId} user={currentUser}/>
                </div>
            </div>
            {bio && bio !== '' &&
                <div className="mt-3">
                    <div className='hidden xl:block text-md bg-gray-100 px-3 py-2 rounded-sm'>{truncateBio(bio)}</div>
                </div>
            }
        </article>
    )
}

export default UserCard