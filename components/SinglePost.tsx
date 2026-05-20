'use client'

import {APIProvider} from '@vis.gl/react-google-maps';
import User from '@/lib/models/user';
import PostUi from '@/components/PostUi/PostUi';
import type { FeedRow } from '@/lib/models/initFeedRow';

export default function SinglePost(props: {
    user:User,
    post:FeedRow,
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
