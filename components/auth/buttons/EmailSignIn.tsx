import { signIn } from "@/auth";

export default async function EmailSignIn() {
  return (
        <form
            action={async () => {
                "use server"
                await signIn()
            }}
        >
            <button type="submit">Sign in with email</button>
        </form>
  )
}
