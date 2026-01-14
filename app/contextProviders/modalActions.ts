import { deletePost } from "../actions/posts"

export const deleteThisPost = async (postId:string) => {
    const response = await deletePost(postId)
    
    if (response) {
        window.dispatchEvent(new CustomEvent("postsUpdated", {
            detail: {
                action: `delete`,
                postId: postId
            }
        }))
    }
}