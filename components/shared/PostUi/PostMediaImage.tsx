import Post from '@/lib/models/post';
import {useState, useEffect, useRef} from 'react'

function PostMediaImage(props:{post:Post}) {
    const post = props.post;

    const [imageLoaded, setImageLoaded] = useState(false);

    const imageFile = "https://lvartsmusic-ny.b-cdn.net/"+post.userDetails!.userDir+"/"+post.postFile;
console.log(imageFile)

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