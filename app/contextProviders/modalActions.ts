import { deletePost } from "../data/posts"

export const deleteThisPost = async (postid:number) => {
    const response = await deletePost(postid)
    
    if (response) {
        window.dispatchEvent(new CustomEvent("postsUpdated", {
            detail: {
                action: `delete`,
                postid: postid
            }
        }))
    }
}