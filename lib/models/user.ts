import UserDetails from "./userDetails"

export default interface User {
    id: string
    createdAt: Date
    email?: string | null
    emailVerified?: Date | null
    image?: string | null
    name?: string | null
    updatedAt: Date
    userDetails?: UserDetails
    following?: string[]
}
