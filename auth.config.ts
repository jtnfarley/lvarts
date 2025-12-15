import Google from "next-auth/providers/google"
// import Facebook from "next-auth/providers/facebook"
// import Apple from "next-auth/providers/apple"
import Nodemailer from "next-auth/providers/nodemailer"
import type { NextAuthConfig } from "next-auth"
 
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
    jwt({ token, user }) {
      if (user) { // User is available during sign-in
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      return session
    },
  },
} satisfies NextAuthConfig