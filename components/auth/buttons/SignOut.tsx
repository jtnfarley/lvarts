import { signOut } from "@/auth"
import { BiSolidArrowToLeft } from "react-icons/bi";
 
export default async function SignOut() {
    return (
        <form
            action={async () => {
                "use server"
                await signOut()
            }}
        >
            <button type="submit" className='text-secondary-500 text-lg flex flex-row items-center'>
                <BiSolidArrowToLeft className='leftIcon'/>
                <div className='hidden lg:block'>Log Out</div>
            </button>
        </form>
    )
}