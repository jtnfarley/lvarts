'use client'

import { useRouter } from "next/navigation"
import User from "@/lib/models/user"
import Follow from '../PostUi/Follow';

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
        <article className="xl:w-full xl:border-b xl:border-dashed xl:border-b-gray-500 py-4">
            <div className="flex items-center text-gray-700 text-sm gap-3 justify-between">
                <button className="xl:flex w-full gap-3 items-center cursor-pointer" onClick={viewProfile} title={displayname || (handle ? `@${handle}` : 'Profile')}>
                    <div className="w-[45px]">
                        <img src={avatar} className='rounded-none border-2 border-black shadow-hard-sm rotate-[-3deg] w-[45px] h-[45px] object-cover'/>
                    </div>

                    <div className='hidden xl:block text-start'>
                        <div className='font-poster uppercase tracking-wide xl:text-gray-200 xl:text-[18px] leading-tight'>{truncateText(displayname || '', 17) || (handle ? `@${truncateText(handle, 10)}` : 'Artist')}</div>
                        {handle && <div className='hidden xl:block font-typewriter text-sm lowercase text-orange'>@{truncateText(handle, 17)}</div>}
                    </div>
                </button>
                <div className='hidden xl:block'>
                    <Follow followinguserdetailsid={recUserId} user={currentUser}/>
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
