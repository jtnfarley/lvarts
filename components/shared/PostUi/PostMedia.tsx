import Post from '@/lib/models/post';
// import PostMediaImage from "./PostMediaImage";
// import PostMediaAudio from "./PostMediaAudio";
import PostMediaEmbed from "./PostMediaEmbed";

function PostMedia(props:{post:Post}) {

    return (
        <PostMediaEmbed post={props.post} />
    )
}

export default PostMedia;
