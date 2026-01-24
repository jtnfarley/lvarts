'use client'

import { useEffect, useState } from "react"
import { useInView } from 'react-intersection-observer'
import { Spinner } from "../layout/Spinner"

export function LoadOldPosts(props:{getOldPosts:Function, endOfPosts:boolean}) {
    const {ref, inView} = useInView();
    const {getOldPosts, endOfPosts} = props;

    useEffect(() => {
        if (inView) {
            getOldPosts();
        }
    }, [inView])

    return (
        <div className="flex justify-center" ref={ref}>
            {
                !endOfPosts ?
                    <Spinner/>
                :
                    <div>That's all, folks!</div>
            }
        </div>
    )
}