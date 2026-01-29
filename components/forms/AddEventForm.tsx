'use client'

import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css'

import { BiCalendar } from "react-icons/bi";
import { savePost } from "@/app/actions/posts";
import PostForm from "./PostForm";
import User from "@/lib/models/user";
import Post from "@/lib/models/post";
import { useRef, useState } from "react";

interface Props {
    user: User
}

const AddEventForm = ({user}: Props) => {
    const [startDate, setStartDate] = useState<Date | null>(new Date());

    const eventNameEl = useRef<HTMLInputElement | null>(null);

    const saveEvent = (post:Post) => {
        if (!eventNameEl || !eventNameEl.current) return;
        post.eventTitle = eventNameEl.current.value;
        post.eventDate = startDate
        savePost(post);
        eventNameEl.current.value = '';
        setStartDate(null);
    }

    return (
        <div>
            <div className="bg-white rounded-lg p-3 flex flex-col gap-3">
                <div>Event name:</div>
                <div><input name='eventName' className="border-1 p-2 rounded-sm w-full" ref={eventNameEl} /></div>
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
                    <PostForm user={user} post={{postType:'event'} as Post} edited={false}  savePost={saveEvent}/>
                </div>
            </div>
        </div>
    )
}

export default AddEventForm