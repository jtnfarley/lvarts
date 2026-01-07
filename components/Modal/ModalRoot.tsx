'use client'

import { useModal } from '@/app/contextProviders/modalProvider'

import GenericModal from '@/components/Modal/GenericModal'
import EditPostModal from '@/components/Modal/EditPostModal'
import PostModal from '@/components/Modal/PostModal'
import ConfirmationModal from '@/components/Modal/ConfirmationModal'

export const ModalRoot = () => {
    const { 
        isOpen,
        title,
        type, 
        message,
        postContent,
        user,
        actionData
    } = useModal()

    return (
        <>
            {
                type === 'PostModal' && 
                <PostModal
                    title={title}
                    message={message}
                    postContent={postContent}
                    isOpen={isOpen}
                />
            }
            {
                type === 'GenericModal' && 
                <GenericModal
                    title={title}
                    message={message}
                    isOpen={isOpen}
                    children={''}
                />
            }
            {
                type === 'EditPostModal' && 
                <EditPostModal
                    title={title}
                    postContent={postContent}
                    isOpen={isOpen}
                    user={user!}
                    postId={actionData.postId!}
                />
            }
        </>
    )
}