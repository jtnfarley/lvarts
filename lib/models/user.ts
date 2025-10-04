import UserDetails from "./userDetails"

export default interface User {
    id: string
    createdAt:Date
    email: string
    emailVerified: Date
    image: string
    name: string
    updatedAt: Date
    userDetails?: UserDetails
    following?: string[]
}