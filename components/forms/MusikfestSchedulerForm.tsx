'use client'

import PostForm from "./PostForm";
import User from "@/lib/models/user";

interface Props {
    user: User
    savePost:Function
}

const MusikfestSchedulerForm = ({user, savePost}: Props) => {
    return (
        <div className="bg-[#fcf9ef] rounded-lg p-5">
            <div className="mb-4 text-xl font-semibold">Vibe your Musikfest Schedule!</div>
            <div className="mb-4 text-sm text-gray-600">
                Describe your perfect 'fest experience and let the LVA&M Festbot build the a schedule.
            </div>
            <PostForm user={user} post={{posttype:'festbot'}} edited={false} savePost={savePost}/>
        </div>
    )
}

export default MusikfestSchedulerForm
