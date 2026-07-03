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
        <article className="flex flex-1 basis-0 flex-col items-center gap-1 py-1 xl:flex-row xl:basis-auto xl:items-center xl:gap-3 xl:px-4 xl:py-3 xl:transition-colors xl:hover:bg-black/5 xl:dark:hover:bg-white/10">
            <button className="flex flex-col items-center gap-1 cursor-pointer xl:min-w-0 xl:flex-1 xl:flex-row xl:gap-3 xl:text-left" onClick={viewProfile} title={displayname || (handle ? `@${handle}` : 'Profile')}>
                <Avatar imageUrl={avatar} displayName={displayname} handle={handle} size="md" className="xl:hidden" />
                <Avatar imageUrl={avatar} displayName={displayname} handle={handle} size="sm" className="hidden xl:flex" />

                <div className="hidden min-w-0 flex-1 xl:block">
                    <div className="truncate text-[15px] font-bold text-lvartsmusic-foreground">{truncateText(displayname || '', 17) || (handle ? `@${truncateText(handle, 10)}` : 'Artist')}</div>
                    {handle && <div className="truncate text-sm text-lvartsmusic-muted">@{truncateText(handle, 17)}</div>}
                    {bio && bio !== '' &&
                        <div className="truncate text-sm text-lvartsmusic-muted">{truncateText(bio, 60)}</div>
                    }
                </div>
            </button>
            <div className="hidden xl:block">
                <Follow followinguserdetailsid={recUserId} user={currentUser}/>
            </div>
        </article>
    )
}

export default UserCard
