'use client'

import { useState, useRef, useEffect } from "react";
import { BiMessageRoundedDots, BiX, BiSend } from "react-icons/bi";
import { sendSupportMessage, SupportChatMessage } from "@/app/actions/supportChat";

export default function SupportChatWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<SupportChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    }, [messages, open]);

    const handleSend = async (event: React.FormEvent) => {
        event.preventDefault();

        const text = input.trim();
        if (!text || isSending) return;

        const history = messages;
        setMessages((prev) => [...prev, { role: 'user', text }]);
        setInput('');
        setIsSending(true);

        try {
            const { reply } = await sendSupportMessage(history, text);
            setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
        } catch (error) {
            console.error(error);
            setMessages((prev) => [...prev, { role: 'assistant', text: "Sorry, something went wrong. Please try again." }]);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="fixed bottom-36 md:bottom-28 right-4 md:right-6 z-[60] flex flex-col items-end">
            {open &&
                <div className="lvartsmusic-card mb-3 flex w-[320px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden shadow-xl">
                    <div className="flex items-center justify-between border-b border-lvartsmusic-border px-4 py-3">
                        <span className="font-bold">Support</span>
                        <button type="button" onClick={() => setOpen(false)} aria-label="Close support chat">
                            <BiX className="text-xl"/>
                        </button>
                    </div>

                    <div ref={scrollRef} className="custom-scrollbar flex h-[360px] flex-col gap-2 overflow-y-auto px-4 py-3">
                        {messages.length === 0 &&
                            <p className="text-sm opacity-70">Ask a usage question or report a technical issue.</p>
                        }
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                                    message.role === 'user'
                                        ? 'self-end bg-lvartsmusic-accent text-lvartsmusic-accent-foreground'
                                        : 'self-start bg-lvartsmusic-border/40'
                                }`}
                            >
                                {message.text}
                            </div>
                        ))}
                        {isSending &&
                            <div className="self-start rounded-2xl bg-lvartsmusic-border/40 px-3 py-2 text-sm opacity-70">…</div>
                        }
                    </div>

                    <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-lvartsmusic-border p-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(event) => setInput(event.target.value)}
                            placeholder="Type a message…"
                            disabled={isSending}
                            className="flex-1"
                        />
                        <button type="submit" disabled={isSending || !input.trim()} className="lvartsmusic-pill-accent px-3 py-2" aria-label="Send">
                            <BiSend/>
                        </button>
                    </form>
                </div>
            }

            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-lvartsmusic-accent text-2xl text-lvartsmusic-accent-foreground shadow-lg transition-opacity hover:opacity-90"
                aria-label={open ? "Close support chat" : "Open support chat"}
            >
                {open ? <BiX/> : <BiMessageRoundedDots/>}
            </button>
        </div>
    );
}
