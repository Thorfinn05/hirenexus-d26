"use client"

import React, { useRef } from "react"
import Link from "next/link"
import { useUser } from "@/firebase"
import { motion, useScroll, useTransform } from "framer-motion"
import {
    BrainCircuit,
    ArrowRight,
    Users,
    ShieldCheck,
    Zap,
    MessageSquare,
    ChevronDown
} from "lucide-react"

export default function LandingPage() {
    const { user, isUserLoading } = useUser()
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    })

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

    return (
        <div ref={containerRef} className="min-h-screen bg-background text-foreground relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen animate-pulse-slow" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] bg-accent/20 blur-[150px] rounded-full pointer-events-none mix-blend-screen animate-pulse-slow block" style={{ animationDelay: '2s' }} />

            {/* Navigation */}
            <motion.nav 
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="fixed top-0 left-0 w-full z-50 px-4 pt-4"
            >
                <div className="glass-panel rounded-2xl px-6 h-16 flex items-center justify-between shadow-xl max-w-[2000px] mx-auto">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent p-[1px] glow-primary-hover">
                            <div className="h-full w-full bg-background/80 rounded-[11px] flex items-center justify-center backdrop-blur-md">
                                <BrainCircuit className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                            </div>
                        </div>
                        <span className="text-2xl font-black tracking-tight text-gradient">HireNexus</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <Link href="/dashboard" className="relative group overflow-hidden rounded-xl p-[1px]">
                                <span className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-70 group-hover:opacity-100 transition-opacity duration-300"></span>
                                <div className="relative bg-background/90 backdrop-blur-md px-6 py-2.5 rounded-[11px] flex items-center gap-2 group-hover:bg-background/80 transition-colors">
                                    <span className="font-semibold text-sm">Dashboard</span>
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="hidden sm:block text-sm font-medium text-white/70 hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full">
                                    Sign In
                                </Link>
                                <Link href="/login" className="relative group overflow-hidden rounded-xl p-[1px] ml-2">
                                    <span className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></span>
                                    <div className="relative bg-primary/20 backdrop-blur-md px-6 py-2.5 rounded-[11px] flex items-center gap-2 group-hover:bg-primary/30 transition-colors">
                                        <span className="font-semibold text-sm">Get Started</span>
                                    </div>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <motion.section 
                style={{ y, opacity }}
                className="relative pt-40 md:pt-56 pb-32 flex flex-col items-center justify-center min-h-[90vh] text-center z-10 px-6"
            >
                <div className="max-w-5xl mx-auto flex flex-col items-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="mb-8 p-[1px] rounded-full bg-gradient-to-r from-primary/50 to-accent/50 max-w-fit"
                    >
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/80 backdrop-blur-md text-xs font-bold uppercase tracking-widest text-primary">
                            <Zap className="h-4 w-4" fill="currentColor" />
                            <span>Next-Gen Hiring Protocol</span>
                        </div>
                    </motion.div>

                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
                        className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.95] mb-6"
                    >
                        Autonomous <br className="hidden md:block"/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary animate-gradient-x bg-[length:200%_auto]">Intelligence</span>
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                        className="text-lg md:text-2xl text-muted-foreground font-medium max-w-3xl leading-relaxed mb-12"
                    >
                        Deploy a council of specialized AI agents to evaluate engineers, 
                        eliminating bias and uncovering elite talent instantly.
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto"
                    >
                        <Link href={user ? "/dashboard" : "/login"} className="group relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-500 group-hover:duration-200"></div>
                            <button className="relative w-full sm:w-auto px-8 py-4 bg-background rounded-xl flex items-center justify-center gap-3 text-lg font-bold hover:bg-background/80 transition-colors">
                                <span>Initialize Council</span>
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Link>
                    </motion.div>
                </div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 animate-bounce"
                >
                    <span className="text-xs font-bold uppercase tracking-widest">Explore</span>
                    <ChevronDown className="h-5 w-5" />
                </motion.div>
            </motion.section>

            {/* Features Glass Showcase */}
            <section className="relative py-32 z-20 bg-background/40 backdrop-blur-3xl border-t border-white/5">
                <div className="container mx-auto px-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.7 }}
                        className="text-center mb-24"
                    >
                        <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Calculated. <span className="text-primary text-glow">Transparent.</span> Fair.</h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Our multi-agent architecture ensures every candidate is evaluated with mathematical precision and comprehensive debate.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-1">
                        <FeatureCard 
                            delay={0.1}
                            icon={Users}
                            title="Multi-Agent Consensus"
                            description="A synchronized network of specialized AI agents—Technical, Behavioral, and Diversity—collaborating to reach structural consensus."
                        />
                        <FeatureCard 
                            delay={0.3}
                            icon={MessageSquare}
                            title="Real-time Deliberation"
                            description="Observe as agents debate candidate merits in real-time, providing deep, transparent insights into every hiring conclusion."
                        />
                        <FeatureCard 
                            delay={0.5}
                            icon={ShieldCheck}
                            title="Zero-Bias Filtration"
                            description="Algorithmic guardrails strip away demographic indicators, enforcing a strict meritocratic evaluation framework."
                        />
                    </div>
                </div>
            </section>

            {/* Deep CTA */}
            <section className="relative py-40 z-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/10" />
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="container mx-auto px-6 relative flex flex-col items-center justify-center text-center"
                >
                    <div className="glass-card rounded-[3rem] p-12 md:p-20 max-w-5xl w-full border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                        
                        <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-tight">
                            Elevate Your <br className="hidden md:block"/> Pipeline Today.
                        </h2>
                        
                        <Link href={user ? "/dashboard" : "/login"}>
                            <button className="px-10 py-5 bg-white text-black rounded-2xl text-xl font-bold hover:bg-white/90 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all duration-300">
                                Deploy AI Council
                            </button>
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 bg-background/80 relative z-20 text-center">
                <div className="flex items-center justify-center gap-2 mb-6">
                    <BrainCircuit className="h-5 w-5 text-primary" />
                    <span className="text-xl font-bold">HireNexus</span>
                </div>
                <p className="text-sm text-white/30 font-medium">© {new Date().getFullYear()} hirenexus_os v2.0. All autonomous rights reserved.</p>
            </footer>
        </div>
    )
}

function FeatureCard({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay }}
            whileHover={{ y: -10 }}
            className="glass-panel p-10 rounded-3xl relative overflow-hidden group border border-white/5 hover:border-primary/30 transition-all duration-500"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[50px] group-hover:bg-primary/20 transition-colors duration-500" />
            
            <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 border border-white/5 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500">
                <Icon className="h-8 w-8 text-white/70 group-hover:text-primary transition-colors duration-500" />
            </div>
            <h3 className="text-3xl font-bold mb-4 tracking-tight">{title}</h3>
            <p className="text-white/50 leading-relaxed text-lg">
                {description}
            </p>
        </motion.div>
    )
}
