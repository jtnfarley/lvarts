'use client'

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "../../ui/button"
import { followUser, unfollowUser } from "@/app/actions/user"
import User from "@/lib/models/user"
import { useEffect, useState } from "react"

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

    const toggleFollow = async () => {
        if (following) {
            await unfollowUser({userId:currentUser.id, toFollowId:recUserId})
            setFollowing(false)
            return
        }   
        await followUser({userId:currentUser.id, toFollowId:recUserId})
        setFollowing(true)
    }

    useEffect(() => {
        if (currentUser.userDetails?.following?.includes(recUserId)) {
            setFollowing(true)
        }
    }, [])

    return (
        <article className="user-card">
            <div className="user-card-avatar">
                <Image
                    src={avatar}
                    alt="user avatar"
                    width={48}
                    height={48}
                    className="rounded-full"
                />
            </div>
            <div className="flex-1 text-ellipsis">
                <Button className="user-card_btn" onClick={viewProfile}>
                    {displayName}
                </Button>
                {following ?
                    <Button className="user-card_btn" onClick={toggleFollow}>
                        Unfollow
                    </Button>
                    :
                    <Button className="user-card_btn" onClick={toggleFollow}>
                        Follow
                    </Button>
                }
            </div>
        </article>
    )
}

export default UserCard