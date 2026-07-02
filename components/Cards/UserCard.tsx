'use client'

import { useRouter } from "next/navigation"
import User from "@/lib/models/user"
import Follow from '../PostUi/Follow';
import Avatar from '@/components/shared/Avatar';

interface Props {
    currentUser: User
    recUserId: number
    displayname?: string | null
    handle?: string | null
    avatar?: string,
    biohtml?: string | null
}

const UserCard = ({currentUser, recUserId, displayname, handle, avatar, biohtml}: Props) => {

    const router = useRouter()

    const viewProfile = () => {
        router.push(`/user/${handle}`)
    }

    const bio = biohtml ? biohtml.replace(/<[^>]*>/g, '') : '';

    const truncateText = (text:string, length:number) => {
        return (text.length > length) ? `${text.substring(0, length)}...` : text;
    }

    return (
        <article className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-black/5 dark:hover:bg-white/10">
            <button className="flex min-w-0 flex-1 items-center gap-3 text-left cursor-pointer" onClick={viewProfile} title={displayname || (handle ? `@${handle}` : 'Profile')}>
                <Avatar imageUrl={avatar} displayName={displayname} handle={handle} size="sm" />

                <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] font-bold text-lvartsmusic-foreground">{truncateText(displayname || '', 17) || (handle ? `@${truncateText(handle, 10)}` : 'Artist')}</div>
                    {handle && <div className="truncate text-sm text-lvartsmusic-muted">@{truncateText(handle, 17)}</div>}
                    {bio && bio !== '' &&
                        <div className="truncate text-sm text-lvartsmusic-muted">{truncateText(bio, 60)}</div>
                    }
                </div>
            </button>
            <Follow followinguserdetailsid={recUserId} user={currentUser}/>
        </article>
    )
}

export default UserCard
