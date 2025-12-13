import Post from '@/lib/models/post';
import PostMediaImage from "./PostMediaImage";
// import PostMediaAudio from "./PostMediaAudio";
import PostMediaEmbed from "./PostMediaEmbed";

function PostMedia(props:{post:Post}) {
    const postFileType = props.post.postFileType;

    return (
        <>
            {postFileType?.match('image') ?
                <PostMediaImage post={props.post} />
                :
                <PostMediaEmbed post={props.post} />
            }
        </>
    )
}

export default PostMedia;
