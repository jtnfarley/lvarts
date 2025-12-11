'use client'

import { useRouter } from "next/navigation"
import { Button } from "../../ui/button"
// import { followUser, unfollowUser } from "@/app/actions/user"
import User from "@/lib/models/user"
import { useEffect, useState } from "react"
import Follow from '../PostUi/Follow';

interface Props {
    currentUser: User
    recUserId: string
    displayName: string
    avatar?: string
}

const UserCard = ({currentUser, recUserId, displayName, avatar}: Props) => {

    const router = useRouter()
    const [following, setFollowing] = useState(false)

    const viewProfile = () => {
        router.push(`/user/${recUserId}`)
    }

    // const toggleFollow = async () => {
    //     if (following) {
    //         await unfollowUser({userId:currentUser.id, toFollowId:recUserId})
    //         setFollowing(false)
    //         return
    //     }   
    //     await followUser({userId:currentUser.id, toFollowId:recUserId})
    //     setFollowing(true)
    // }

    useEffect(() => {
        if (currentUser.userDetails?.following?.includes(recUserId)) {
            setFollowing(true)
        }
    }, [])

    return (
        <article className="user-card lg:w-full">
            <div className="flex items-center lg:bg-orange rounded-full text-white p-2 text-lg gap-3 justify-between">
                <button className="flex gap-3" onClick={viewProfile}>
                    <div><img src={avatar} className='rounded-full border-dark-2 w-[50px] h-[50px] lg:w-[35px] lg:h-[35px] lg:border-0'/></div>
                    
                    <div className='hidden lg:block font-semibold'>{displayName}</div>
                </button>
                <div className='hidden lg:block'>
                    <Follow followUserId={recUserId} user={currentUser}/>
                </div>
            </div>
        </article>
    )
}

export default UserCard