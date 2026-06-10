import type { NextRequest } from 'next/server'
 
export async function POST(request: NextRequest) {
    if (!request || ! request.body) return;
    
    const reader = request.body?.getReader(); // Locks the stream
    const decoder = new TextDecoder();

    try {
        while (true) {
            // read() returns an object with 'value' (Uint8Array) and 'done' (boolean)
            const { done, value } = await reader.read(); 
            
            if (done) {
            break; // Stream completed
            }
            
            const textChunk = decoder.decode(value, { stream: true });
            console.log("Received chunk:", textChunk);
        }
    } finally {
        reader.releaseLock(); // Always release the lock when finished
    }
}