'use client'

import { useRouter } from "next/navigation"
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

    useEffect(() => {
        if (currentUser.userDetails?.following?.includes(recUserId)) {
            setFollowing(true)
        }
    }, [])

    return (
        <article className="user-card xl:w-full">
            <div className="flex items-center xl:bg-white rounded-full text-gray-700 p-2 text-sm gap-3 justify-between border-1 border-gray-300 shadow-md">
                <button className="flex gap-3 items-center" onClick={viewProfile} title={displayName}>
                    <div><img src={avatar} className='rounded-full border-dark-2 w-[50px] h-[50px] xl:w-[35px] xl:h-[35px] xl:border-0'/></div>
                    
                    <div className='hidden xl:block'>{displayName}</div>
                </button>
                <div className='hidden xl:block'>
                    <Follow followUserId={recUserId} user={currentUser}/>
                </div>
            </div>
        </article>
    )
}

export default UserCard