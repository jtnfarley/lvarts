import Post from '@/lib/models/post';
import {useState} from 'react'
import imageUrl from '@/constants/imageUrl';

function PostMediaAudio(props:{post:Post}) {
    const post = props.post;

    // const [imageLoaded, setImageLoaded] = useState(false);

    const audioFile = imageUrl+"/"+post.userDetails!.userDir+"/"+post.postFile;

    // const imageLoad = () => {
    //     setImageLoaded(true)
    // }

    return (
        <div className='flex justify-center'> 
            <audio src={audioFile} controls/>
        </div>
    )
}

export default PostMediaAudio;