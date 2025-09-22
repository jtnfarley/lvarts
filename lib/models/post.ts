import UserDetails from "./userDetails"

export default interface Post {
    id:string
	content:string
    userId:string 
	userDetailsId?:string
	userDetails:UserDetails
	createdAt:Date
    updatedAt:Date
    edited:boolean
	parentPostId?:string
	postFile?:string
	postType?:string
	privatePost?:boolean
	tempFile?:string
	userDir?:string
    chatId?:string
	likes?:number
}