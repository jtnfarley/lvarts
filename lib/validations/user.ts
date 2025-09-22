import * as z from 'zod'

export const UserValidation = z.object({
    bio: z.string().min(10, {
        message: 'Minimum 10 characters.'
    }).max(1000),

})

export const RegisterValidation = z.object({
    email: z.email(),
    displayName: z.optional(z.string().trim().max(30)),
})