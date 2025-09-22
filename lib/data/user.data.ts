'use server'

import { revalidatePath } from 'next/cache'
import User from '../models/user.model'
import dbConnect from '../mongooseConnect'
import { FilterQuery, SortOrder } from 'mongoose'

interface CreateUserParams {
    email: string,
    displayName?: string
}

interface UpdateUserParams {
    userId: string,
    email?: string,
    username?: string,
    name?: string,
    bio?: string,
    path?: string,
    image?: string
}

export const createUser = async ({
    email,
    displayName,
}:CreateUserParams): Promise<void> => {

    try {
        await dbConnect()
        await User.create({
            email,
            displayName,
            otp: generateOtp(),
            otpExpiry: new Date(Date.now() + 15 * 60 * 1000)
        })
    } catch (error:any) {
        throw new Error(`Failed to create user: ${error.message}`)
    }   
}

export const fetchUser = async (userId:string) => {

    try {
        await dbConnect()
        return await User.findById(userId)
    } catch (error:any) {
        console.log(error)
        throw new Error(`Failed to create user: ${error.message}`)
    }   
}

export const updateUser = async ({
    userId,
    email,
    username,
    name,
    image,
    bio,
    path
}:UpdateUserParams): Promise<void> => {

    try {
        await dbConnect()
        await User.findByIdAndUpdate(
            userId,
            {
                username: username?.toLowerCase(),
                email,
                name,
                image,
                bio,
                path,
                onboarded: true
            }
        )

        if (path === '/profile/edit') revalidatePath(path)
    } catch (error:any) {
        console.log(error)
        throw new Error(`Failed to update user: ${error.message}`)
    }   
}

export const fetchUsers = async ({
    userId,
    searchString = '',
    pageNumber = 1,
    pageSize = 20,
    sortBy = 'desc'
}: {
    userId: string;
    searchString?: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: SortOrder;
}) => {

    try {
        await dbConnect()
        const skipAmount = (pageNumber - 1) * pageSize
        const regex = new RegExp(searchString, 'i') 
        const query:FilterQuery<typeof User> = {
            _id: { $ne: userId }
        }

        if (searchString.trim() !== '') {
            query.$or = [
                { username: { $regex: regex } },
                { name: { $regex: regex } }
            ]
        }

        const sortOptions = {
            createdAt: sortBy
        }

        const userQuery = User.find(query)
            .sort(sortOptions)
            .skip(skipAmount)
            .limit(pageSize)

        const totalUserCount = await User.countDocuments(query)
        const users = await userQuery.exec()
        const isNext = totalUserCount > skipAmount + users.length

        return {
            users,
            isNext
        }
    } catch (error:any) {
        console.log(error)
        throw new Error(`Failed to fetch users: ${error.message}`)
    }   
}


const generateOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000)
    return otp.toString()
}