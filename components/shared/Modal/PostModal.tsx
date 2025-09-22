import { text } from "stream/consumers";
import ConfirmationModal from "./ConfirmationModal";

export default function PostModal(props:{
    title:string,
    message:string,
    postContent:string,
    isOpen:boolean, 
    onClose:() => void, 
    onConfirm: () => void
}) {
    const { title, message, postContent, isOpen, onClose, onConfirm } = props;

    const truncateText = (text:string) => {
        return text.length > 100 ? text.slice(0, 100) + '...' : text;
    }

    return (
        <ConfirmationModal
            title="Delete Post"
            message="Are you sure you want to delete this post?"
            isOpen={isOpen}
            onConfirm={onConfirm}
            onClose={onClose}
        >
            <div className='bg-black/5 my-3 px-3 py-3 text-base rounded-lg'>
                {truncateText(postContent)}
            </div>
        </ConfirmationModal>
    );
};