import Image from "next/image";
import Link from "next/link";
import GoogleSignIn from "../auth/buttons/GoogleSignIn";
import EmailSignIn from "../auth/buttons/EmailSignIn";

export default function LandingPage() {
    return (
        <div className="flex flex-col lg:flex-row gap-5 p-5">
            <div className="flex justify-center">
                <Image src='/assets/logo.svg' alt='logo' width={400} height={400} className="w-1/2 lg:w-full"/>
            </div>
            <div className="flex flex-col items-center lg:items-start">
                <GoogleSignIn/>
                <EmailSignIn/>
                {/* <p>Don't have an account? <Link href='/register'>Sign up</Link></p> */}
            </div>
        </div>
    )
}