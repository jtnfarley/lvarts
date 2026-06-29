import PostMediaImage from "./PostMediaImage";
import PostMediaAudio from "./PostMediaAudio";
import PostMediaEmbed from "./PostMediaEmbed";
import { FeedRow } from '@/lib/models/initFeedRow';

function PostMedia(props:{post:FeedRow}) {
    return (
        <>
            {(props.post.filetype === 'image/webp') ?
                <PostMediaImage post={props.post} />
                :
                (props.post.filetype === 'audio/mpeg') ?
                <PostMediaAudio post={props.post} />
                :
                <PostMediaEmbed post={props.post} />
            }
        </>
    )
}

export default PostMedia;
