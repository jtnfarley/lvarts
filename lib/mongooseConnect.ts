import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
    throw new Error("Please add your MONGODB_URI to .env.local");
}

const MONGODB_URI: string = process.env.MONGODB_URI;

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let globalWithMongoose = global as typeof globalThis & {
    mongoose: any;
};
let cached = globalWithMongoose.mongoose;

if (!cached) {
    cached = globalWithMongoose.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            return mongoose;
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}

export default dbConnect;

// import mongoose from 'mongoose'

// let isConnected: boolean = false

// export const connectToDB = async (): Promise<void> => {
//     mongoose.set('strictQuery', true)

//     if (!process.env.MONGODB_URI) return console.log('Missing Mongodb Url')
    
//     if (isConnected) {
//         console.log('MongoDB is already connected')
//         return
//     }

//     try {
//         await mongoose.connect(process.env.MONGODB_URI as string)
//         isConnected = true
//         console.log('MongoDB connected')
//     } catch (error) {
//         console.log(error)
//     }
    
// }
