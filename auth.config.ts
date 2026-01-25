import Google from "next-auth/providers/google"
// import Facebook from "next-auth/providers/facebook"
// import Apple from "next-auth/providers/apple"
import Nodemailer from "next-auth/providers/nodemailer"
import type { DefaultSession, NextAuthConfig } from "next-auth"
import { prisma } from '@/prisma';
import UserDetails from "./lib/models/userDetails";

const getUserDetails = async (userId:string):Promise<UserDetails | null> => {
  return new Promise(async resolve => {
    const userDetails = await prisma.userDetails.findFirst({
        omit: {
            postIds: true
        },
        where: {
            userId
        }
    })

    return resolve(userDetails);
  })
}

declare module "next-auth" {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's postal address. */
      userDetails: UserDetails | null
      /**
       * By default, TypeScript merges new interface properties and overwrites existing ones.
       * In this case, the default session user properties will be overwritten,
       * with the new ones defined above. To keep the default session user properties,
       * you need to add them back into the newly declared interface.
       */
    } & DefaultSession["user"]
  }
}
 
// Notice this is only an object, not a full Auth.js instance
export default {
  providers: [
    Google,
    Nodemailer({
      name: 'email',
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { // User is available during sign-in
        token.id = user.id
        token.userDetails = await getUserDetails(token.id as string);
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.userDetails = await getUserDetails(token.id as string);
      return session
    },
  },
} satisfies NextAuthConfig