import User from "@/lib/models/user";
import GenericModal from "./GenericModal";
import EditPostForm from "@/components/forms/EditPostForm";

export default function EditPostModal(props:{
    title:string,
    postContent:string,
    postId:string,
    user:User,
    isOpen:boolean, 
}) {
    const { postContent, postId, user, isOpen } = props;

    return (
        <GenericModal
            title="Edit Post"
            message=""
            isOpen={isOpen}
        >
            <div className='text-base rounded-lg'>
                <EditPostForm content={postContent} postId={postId} user={user} />
            </div>
        </GenericModal>
    );
};