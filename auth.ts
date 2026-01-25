import NextAuth from "next-auth"
import authConfig from "./auth.config"
 
import { PrismaClient } from "@prisma/client"
import { PrismaAdapter } from "@auth/prisma-adapter"
 
const prisma = new PrismaClient()
 
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/", // Specifies the path to your custom sign-in page
  },
  ...authConfig,
})

// import Google from "next-auth/providers/google"
// // import Nodemailer from "next-auth/providers/nodemailer"
// import NextAuth from "next-auth"
// import { PrismaAdapter } from "@auth/prisma-adapter"
// import { prisma } from "@/prisma"

 
// export const { handlers, auth, signIn, signOut } = NextAuth({
//     adapter: PrismaAdapter(prisma),
//     providers: [
//         Google,
//         // Nodemailer({
//         //     server: process.env.EMAIL_SERVER,
//         //     from: process.env.EMAIL_FROM,
//         // })
//     ],
// })