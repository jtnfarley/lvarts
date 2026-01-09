'use client'

import { useEffect, useState } from "react"
import { useInView } from 'react-intersection-observer'
import { Spinner } from "../layout/Spinner"

export function LoadOldPosts(props:{getOldPosts:Function, endOfPosts:boolean}) {
    const {ref, inView} = useInView();

    useEffect(() => {
        if (inView) {
            props.getOldPosts();
        }
    }, [inView])

    return (
        <div className="flex justify-center" ref={ref}><Spinner/></div>
    )
}