'use client'

import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css'
import { BiCalendar } from "react-icons/bi";
import PostForm from "./PostForm";
import User from "@/lib/models/user";
import Post from "@/lib/models/post";
import { useRef, useState } from "react";

interface Props {
    post: Post
    user: User
    savePost: Function
}

const EditEventPostForm = ({post, user, savePost}: Props) => {
    const [startDate, setStartDate] = useState<Date | null>(post.eventDate || null);
    
    const eventNameEl = useRef<HTMLInputElement | null>(null);

    const editEvent = (post:Post) => {
        if (!eventNameEl || !eventNameEl.current) return;
        post.eventTitle = eventNameEl.current.value;
        post.eventDate = startDate
        console.log(post)
        savePost(post);
    }

    return (
        <div>
            <div className="bg-white rounded-lg p-3 flex flex-col gap-3">
                <div>Event name:</div>
                <div><input name='eventName' className="border-1 p-2 rounded-sm w-full" ref={eventNameEl} defaultValue={post.eventTitle || ''}/></div>
                <div>Date & Time:</div>
                <div>
                    <DatePicker 
                        selected={startDate} 
                        onChange={(date:Date | null) => setStartDate(date)} 
                        showTimeSelect 
                        showIcon 
                        dateFormat="MMMM d, yyyy h:mm aa"
                        icon={<BiCalendar />}
                    />
                </div>
                <div className="mt-4">
                    <div>Description</div>
                    <PostForm post={post} user={user} postType={'event'} edited={true} savePost={editEvent}/>
                </div>
            </div>
        </div>
    )
}

export default EditEventPostForm