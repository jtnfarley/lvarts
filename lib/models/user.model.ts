'use server'

import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true},
    displayName: String,
    image: String,
    bio: String,
    posts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}],
    retweets:  [{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}],
    likedPosts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}],
    comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
    onboarded: {type: Boolean, default: false},
    chats: [{type: mongoose.Schema.Types.ObjectId, ref: 'Chat'}],
    followers: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    following: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
    otp: String,
    otpExpiry: Date
}
// , {
// 	toJSON: {
// 		transform(doc, ret) {
// 			ret.id = ret._id;
// 			delete ret._id;
// 			delete ret.__v;
// 		}
// 	}

// }
)

const User = mongoose.models.User || mongoose.model('User', userSchema)

export default User