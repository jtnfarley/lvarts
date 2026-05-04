import parse from 'html-react-parser';
import { useEffect, useState } from 'react';
import createDOMPurify from 'dompurify';
import ConfirmationModal from "./ConfirmationModal";

export default function PostModal(props:{
    title:string,
    message:string,
    postContent:string,
    isOpen:boolean, 
}) {
    const { title, message, postContent, isOpen } = props;
    const [cleanPostContent, setCleanPostContent] = useState('');

    const truncateText = (text:string) => {
        return text.length > 100 ? text.slice(0, 100) + '...' : text;
    }

    useEffect(() => {
        setCleanPostContent(createDOMPurify(window).sanitize(truncateText(postContent)));
    }, [postContent]);

    return (
        <ConfirmationModal
            title="Delete Post"
            message="Are you sure you want to delete this post?"
            isOpen={isOpen}
        >
            <div className='bg-black/5 my-3 px-3 py-3 text-base rounded-lg'>
                {parse(cleanPostContent)}
            </div>
        </ConfirmationModal>
    );
};
