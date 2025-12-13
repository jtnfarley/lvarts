import User from "@/lib/models/user";
import GenericModal from "./GenericModal";
import EditPostForm from "@/components/forms/EditPostForm";

export default function PostModal(props:{
    title:string,
    message:string,
    postContent:string,
    postId:string,
    user:User,
    isOpen:boolean, 
    onClose:() => void, 
}) {
    const { postContent, postId, user, isOpen, onClose } = props;

    const truncateText = (text:string) => {
        return text.length > 100 ? text.slice(0, 100) + '...' : text;
    }

    return (
        <GenericModal
            title="Edit Post"
            message=""
            isOpen={isOpen}
            onClose={onClose}
        >
            <div className='text-base rounded-lg'>
                <EditPostForm content={postContent} postId={postId} user={user} />
            </div>
        </GenericModal>
    );
};