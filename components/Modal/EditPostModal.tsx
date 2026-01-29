// import User from "@/lib/models/user";
// import GenericModal from "./GenericModal";
// import EditPostForm from "@/components/forms/EditPostForm";
// import EditEventPostForm from "@/components/forms/EditEventPostForm";

// export default function EditPostModal(props:{
//     title:string,
//     postContent:string,
//     postId:string,
//     user:User,
//     isOpen:boolean, 
//     postType?:string,
//     eventTitle?: string
//     eventDate?: Date
// }) {
//     const { postContent, postId, user, isOpen, postType, eventTitle, eventDate } = props;

//     return (
//         <GenericModal
//             title="Edit Post"
//             message=""
//             isOpen={isOpen}
//         >
//             <div className='text-base rounded-lg'>
//                 {
//                     postType === 'event' ?
//                         <EditEventPostForm content={postContent} postId={postId} user={user} eventDate={eventDate} eventTitle={eventTitle} />
//                         :
//                         <EditPostForm content={postContent} postId={postId} user={user} />
//                 }
//             </div>
//         </GenericModal>
//     );
// };