import * as z from 'zod'

export const PostValidation = z.object({
    content: z.string().min(3, {
        message: 'Minimum 3 characters.'
    }).max(1000),
    userId: z.string(),
    postType: z.string(),
    edited: z.boolean(),
    // postFile: z.string(), 
    // privatePost: z.boolean(), 
    // parentPostId: z.string()
})