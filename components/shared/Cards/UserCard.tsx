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
                    <div><img src='https://static01.nyt.com/images/2021/09/30/fashion/29melting-face-emoji/29melting-face-emoji-mediumSquareAt3X-v2.jpg' className='rounded-full w-[50] h-[50] lg:w-[35] lg:h-[35]'/></div>
                    
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