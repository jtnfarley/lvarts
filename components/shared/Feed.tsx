import ClientFeed from './ClientFeed';
import Post from '@/lib/models/post';
import { currentUser } from '@/app/actions/currentUser';
import { getFeed } from '@/app/actions/posts';

export default async function Feed() {
    const user = await currentUser()

    if (!user) return

    const getFeedArr = async ():Promise<Array<Post>> => {
        'use server'
        return await getFeed(user)
    }

    let feed:Array<Post> = await getFeedArr()

    return (
        <ClientFeed feed={feed} getFeed={getFeedArr} user={user}/>
    )
}