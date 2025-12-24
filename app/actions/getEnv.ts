'use server'

export const getEnv = async (envVar:string):Promise<any> => {
    return process.env[envVar];
}