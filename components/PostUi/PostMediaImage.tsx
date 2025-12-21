import Post from '@/lib/models/post';
import {useState} from 'react'
import imageUrl from '@/constants/imageUrl';

function PostMediaImage(props:{post:Post}) {
    const post = props.post;

    const [imageLoaded, setImageLoaded] = useState(false);
console.log(post)
    const imageFile = imageUrl+"/"+post.userDetails!.userDir+"/"+post.postFile;

    const imageLoad = () => {
        setImageLoaded(true)
    }

    return (
        <div className='flex justify-center'> 
            {/* {(!imageLoaded) ?
            <CircularProgress sx={{}}/>
            :
            ""
            }    */}
            <img src={imageFile} onLoad={() => imageLoad()}/>
        </div>
    )
}

export default PostMediaImage;