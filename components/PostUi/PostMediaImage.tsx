import Image from 'next/image';
import Post from '@/lib/models/post';
import {useState} from 'react'
import imageUrl from '@/constants/imageUrl';

function PostMediaImage(props:{post:Post}) {
    const post = props.post;

    const imageFile = imageUrl+"/"+post.userDetails!.userDir+"/"+post.postFile;

    return (
        <div className='flex justify-center post-img relative'> 
            <Image
                src={imageFile}
                alt={`Image associated with ${post.userDetails?.displayName}'s post`}
                fill={true}
            />
        </div>
    )
}

export default PostMediaImage;