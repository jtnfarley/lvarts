import Image from 'next/image';
import imageUrl from '@/constants/imageUrl';
import { FeedRow } from '@/lib/models/initFeedRow';

function PostMediaImage(props:{post:FeedRow}) {
    const post = props.post;

    const imageFile = imageUrl+"/"+post.userdetails!.userdir+"/"+post.postfile;

    return (
        <div className='flex justify-center post-img relative mt-3 overflow-hidden rounded-2xl'>
            <Image
                src={imageFile}
                alt={`Image associated with ${post.userdetails?.displayname}'s post`}
                fill={true}
            />
        </div>
    )
}

export default PostMediaImage;