'use client'

import PostForm from "./PostForm";
import User from "@/lib/models/user";

interface Props {
    user: User
    savePost:Function
}

const AddEventForm = ({user, savePost}: Props) => {
    return (
        <div className="bg-[#fcf9ef] rounded-lg p-5">
            <div className="mb-4 text-xl font-semibold">Add Audio Track to Streaming Radio</div>
            <div className="mb-4 text-sm text-gray-600">
                Add the MP3 file, track title, band name, and cover art to include in the streaming radio.
            </div>
            <PostForm
                user={user}
                post={{posttype:'audio'}}
                edited={false}
                savePost={savePost}
            />
        </div>
    )
}

export default AddEventForm
