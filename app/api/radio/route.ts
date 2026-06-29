import { NextRequest, NextResponse } from 'next/server'
 
export async function POST(request: NextRequest) {
    if (!request?.body) return NextResponse.json({ success: false });
    
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
            const res = JSON.parse(textChunk);

            if (!res.station?.id || res.station.id !== 614) {
                return NextResponse.json({ success: false });
            }
        }
    } finally {
        reader.releaseLock(); // Always release the lock when finished
    }

    return NextResponse.json({ success: true });
}