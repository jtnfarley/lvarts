import GenericModal from "./GenericModal";
import EditPostForm from "@/components/forms/EditPostForm";

export default function PostModal(props:{
    title:string,
    message:string,
    postContent:string,
    postId:string,
    isOpen:boolean, 
    onClose:() => void, 
}) {
    const { title, message, postContent, postId, isOpen, onClose } = props;

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
                <EditPostForm content={postContent} postId={postId} />
            </div>
        </GenericModal>
    );
};