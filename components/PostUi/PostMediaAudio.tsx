import imageUrl from '@/constants/imageUrl';
import { FeedRow } from '@/lib/models/initFeedRow';

function PostMediaAudio(props:{post:FeedRow}) {
    const post = props.post;

    const audioFile = `${imageUrl}/${post.userdetails!.userdir}/${post.postfile}`;

    return (
        <div className='flex justify-center'> 
            <audio src={audioFile} controls/>
        </div>
    )
}

export default PostMediaAudio;