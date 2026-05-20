import Post from '@/lib/models/post';
import PostMediaImage from "./PostMediaImage";
import PostMediaAudio from "./PostMediaAudio";
import PostMediaEmbed from "./PostMediaEmbed";
import { FeedRow } from '@/lib/models/initFeedRow';

function PostMedia(props:{post:FeedRow}) {
    let postfileType;

    if (props.post.postfile) {
        postfileType = 'image';
    }
    // postfileType =;

    return (
        <>
            {(postfileType === 'image') ?
                <PostMediaImage post={props.post} />
                :
                (postfileType === 'audio') ?
                <PostMediaAudio post={props.post} />
                :
                <PostMediaEmbed post={props.post} />
            }
        </>
    )
}

export default PostMedia;
