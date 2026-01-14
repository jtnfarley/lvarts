'use client'

import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css'
import { BiCalendar } from "react-icons/bi";
import { editPost } from "@/app/actions/posts";
import PostForm from "./PostForm";
import { InitialEditorStateType } from "lexical";
import User from "@/lib/models/user";
import { useModal } from '@/app/contextProviders/modalProvider';
import Post from "@/lib/models/post";
import { useRef, useState } from "react";

interface Props {
    content:InitialEditorStateType
    postId:string
    user:User
    eventTitle?: string
    eventDate?: Date
}

const EditEventPostForm = ({content, postId, user, eventTitle, eventDate}: Props) => {
    const { triggerAction } = useModal();

    const [startDate, setStartDate] = useState<Date | null>(eventDate || null);
    
    const eventNameEl = useRef<HTMLInputElement | null>(null);

    const editEvent = (post:Post) => {
        if (!eventNameEl || !eventNameEl.current) return;
        post.eventTitle = eventNameEl.current.value;
        post.eventDate = startDate
        console.log(post)
        editPost(post);
        triggerAction();
        eventNameEl.current.value = '';
        setStartDate(null);
    }

    return (
        <div>
            <div className="bg-white rounded-lg p-3 flex flex-col gap-3">
                <div>Event name:</div>
                <div><input name='eventName' className="border-1 p-2 rounded-sm w-full" ref={eventNameEl} defaultValue={eventTitle}/></div>
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
                    <PostForm content={content} postId={postId} user={user} postType={'event'} edited={true} parentPostId={''} savePost={editEvent}/>
                </div>
            </div>
        </div>
    )
}

export default EditEventPostForm