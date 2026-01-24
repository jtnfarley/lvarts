'use client'

import {APIProvider} from '@vis.gl/react-google-maps';
import User from '@/lib/models/user';
import Post from '@/lib/models/post';
import PostUi from '@/components/PostUi/PostUi';

export default function SinglePost(props: {
    user:User,
    post:Post,
    googleMapsApiKey:string
}) {
    const user = props.user;
    const post = props.post;
    const googleMapsApiKey = props.googleMapsApiKey;

	return (
        <APIProvider apiKey={googleMapsApiKey || ''}>
            <PostUi postData={post} user={user} googleMapsApiKey={googleMapsApiKey} />
        </APIProvider>   
	);
}
