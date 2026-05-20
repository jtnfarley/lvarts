'use client';

import { useEffect } from 'react';
import { useFollowsStore } from '@/stores/follows-store';
import { useLikesStore } from '@/stores/user-likes-store';

type Props = {
    followers: number[];
    following: number[];
    likes: number[];
};

export default function Initializer({ followers, following, likes }: Props) {
    const setFollows = useFollowsStore((state) => state.setFollows);
    const setLikes = useLikesStore((state) => state.setLikes);

    useEffect(() => {
        setFollows({ followers, following });
    }, [followers, following, setFollows]);

    useEffect(() => {
        setLikes(likes);
    }, [likes, setLikes]);

    return null;
}