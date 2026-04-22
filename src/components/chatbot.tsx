"use client"

import React, { useState, useRef, useEffect } from "react"
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { generateSupportResponse, ChatMessage } from "@/app/actions/chat"
import { motion, AnimatePresence } from "framer-motion"

export function Chatbot() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: "model",
            content: "Hi! I'm the HireNexus AI assistant. How can I help you learn about our multi-agent evaluation platform today?"
        }
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMsg = input.trim()
        setInput("")

        // Add user message to UI
        const updatedMessages: ChatMessage[] = [...messages, { role: "user", content: userMsg }]
        setMessages(updatedMessages)
        setIsLoading(true)

        try {
            // Create history payload from all but the newest message
            const history = updatedMessages.slice(0, -1)
            const res = await generateSupportResponse(history, userMsg)

            if (res.success && res.response) {
                setMessages(prev => [...prev, { role: "model", content: res.response }])
            } else {
                setMessages(prev => [...prev, { role: "model", content: res.error || "An error occurred." }])
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: "model", content: "Sorry, I encountered an error connecting to our servers." }])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            {/* Floating Action Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-5 right-5 h-12 w-12 rounded-xl bg-primary/90 text-primary-foreground flex items-center justify-center hover:bg-primary hover:scale-105 transition-all duration-200 z-50 shadow-lg shadow-black/20"
                    >
                        <MessageSquare className="h-5 w-5" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed bottom-5 right-5 w-[340px] h-[460px] rounded-xl flex flex-col overflow-hidden z-50"
                        style={{
                            background: "linear-gradient(160deg, hsl(225 20% 8% / 0.95) 0%, hsl(225 20% 6% / 0.98) 100%)",
                            backdropFilter: "blur(32px) saturate(1.5)",
                            WebkitBackdropFilter: "blur(32px) saturate(1.5)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            boxShadow: "0 24px 80px -16px rgba(0,0,0,0.6), 0 0 1px 0 rgba(255,255,255,0.08) inset"
                        }}
                    >
                        {/* Header */}
                        <div className="h-14 flex items-center justify-between px-4 border-b border-white/[0.04] shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="h-7 w-7 rounded-lg bg-primary/12 flex items-center justify-center">
                                    <Bot className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-xs text-foreground/90">Hiru AI</h3>
                                    <div className="flex items-center gap-1">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400/60" />
                                        <p className="text-[9px] text-muted-foreground/50 font-medium">Online</p>
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-lg text-muted-foreground/40 hover:text-foreground/70 hover:bg-white/[0.04]"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="h-3.5 w-3.5" />
                            </Button>
                        </div>

                        {/* Messages */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-3.5 space-y-3"
                        >
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    {msg.role === "model" && (
                                        <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                            <Bot className="h-3 w-3 text-primary/70" />
                                        </div>
                                    )}

                                    <div
                                        className={`px-3 py-2 rounded-xl max-w-[80%] text-[13px] leading-relaxed ${msg.role === "user"
                                            ? "bg-primary/15 text-foreground/85 rounded-tr-sm"
                                            : "bg-white/[0.03] text-foreground/75 rounded-tl-sm border border-white/[0.05]"
                                            }`}
                                    >
                                        {msg.content}
                                    </div>

                                    {msg.role === "user" && (
                                        <div className="h-6 w-6 rounded-md bg-white/[0.04] flex items-center justify-center shrink-0 mt-0.5">
                                            <User className="h-3 w-3 text-muted-foreground/50" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-2.5 justify-start">
                                    <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                                        <Bot className="h-3 w-3 text-primary/70 animate-pulse" />
                                    </div>
                                    <div className="px-3 py-2.5 rounded-xl bg-white/[0.03] rounded-tl-sm border border-white/[0.05] flex items-center gap-1">
                                        <div className="h-1.5 w-1.5 bg-muted-foreground/30 rounded-full animate-bounce" />
                                        <div className="h-1.5 w-1.5 bg-muted-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                                        <div className="h-1.5 w-1.5 bg-muted-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-3 border-t border-white/[0.04] shrink-0">
                            <form onSubmit={handleSubmit} className="relative flex items-center">
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about HireNexus…"
                                    className="pr-9 bg-white/[0.03] border-white/[0.06] focus:border-primary/30 rounded-lg h-9 text-[13px] placeholder:text-muted-foreground/30"
                                    disabled={isLoading}
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={isLoading || !input.trim()}
                                    className="absolute right-1 h-7 w-7 rounded-md bg-primary/80 hover:bg-primary text-primary-foreground"
                                >
                                    {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3 ml-px" />}
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
