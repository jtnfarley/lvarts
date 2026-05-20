import UserDetails from "./userDetails"

export default interface User {
    id: number
    createdat: Date
    email?: string | null
    emailverified?: Date | null
    image?: string | null
    name?: string | null
    updatedat: Date
    userdetails?: UserDetails | null
    anonymous?: boolean | null
}
