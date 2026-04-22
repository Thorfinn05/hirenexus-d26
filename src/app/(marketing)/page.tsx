"use client"

import React, { useRef } from "react"
import Link from "next/link"
import { useUser } from "@/firebase"
import { motion, useScroll, useTransform, type Variants } from "framer-motion"
import {
    BrainCircuit,
    ArrowRight,
    Users,
    ShieldCheck,
    Zap,
    MessageSquare,
    ChevronDown,
    Sparkles
} from "lucide-react"

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
  }
}

export default function LandingPage() {
    const { user, isUserLoading } = useUser()
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    })

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"])
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.96])

    return (
        <div ref={containerRef} className="candidate-theme min-h-screen bg-background text-foreground relative overflow-hidden">
            {/* Ambient Background */}
            <div className="ambient-orb ambient-orb-1" />
            <div className="ambient-orb ambient-orb-2" />
            <div className="ambient-orb ambient-orb-3" />

            {/* Navigation */}
            <motion.nav 
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                className="fixed top-0 left-0 w-full z-50 px-4 pt-4"
            >
                <div className="liquid-glass rounded-xl px-5 h-14 flex items-center justify-between max-w-[1400px] mx-auto">
                    <div className="flex items-center gap-2.5 group cursor-pointer">
                        <div className="h-8 w-8 rounded-lg bg-primary/12 border border-primary/15 flex items-center justify-center">
                            <BrainCircuit className="h-4.5 w-4.5 text-primary group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-foreground/90">HireNexus</span>
                    </div>

                    <div className="flex items-center gap-3">
                        {user ? (
                            <Link href="/dashboard" className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/15 border border-primary/15 hover:border-primary/25 transition-all duration-300">
                                <span className="font-medium text-sm text-primary/90">Dashboard</span>
                                <ArrowRight className="h-3.5 w-3.5 text-primary/70 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="hidden sm:block text-sm font-medium text-foreground/50 hover:text-foreground/80 transition-colors duration-200">
                                    Sign In
                                </Link>
                                <Link href="/login" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/90 hover:bg-primary text-primary-foreground font-medium text-sm transition-all duration-300 hover:shadow-[0_0_20px_-4px_hsl(var(--primary)_/_0.4)]">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <motion.section 
                style={{ y, opacity, scale }}
                className="relative pt-36 md:pt-48 pb-24 flex flex-col items-center justify-center min-h-[88vh] text-center z-10 px-6"
            >
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="max-w-4xl mx-auto flex flex-col items-center"
                >
                    <motion.div variants={itemVariants} className="mb-6">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/8 border border-primary/12 text-[11px] font-medium text-primary/80 uppercase tracking-wider">
                            <Sparkles className="h-3 w-3" />
                            Next-Gen Hiring Protocol
                        </span>
                    </motion.div>

                    <motion.h1 
                        variants={itemVariants}
                        className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.95] mb-5 text-foreground/95"
                    >
                        Autonomous{" "}
                        <span className="text-gradient-primary">Intelligence</span>
                    </motion.h1>

                    <motion.p 
                        variants={itemVariants}
                        className="text-base md:text-lg text-muted-foreground font-medium max-w-2xl leading-relaxed mb-10"
                    >
                        Deploy a council of specialized AI agents to evaluate engineers, 
                        eliminating bias and uncovering elite talent instantly.
                    </motion.p>

                    <motion.div variants={itemVariants}>
                        <Link href={user ? "/dashboard" : "/login"} className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-primary/90 hover:bg-primary text-primary-foreground font-medium text-base transition-all duration-300 hover:shadow-[0_0_40px_-8px_hsl(var(--primary)_/_0.5)]">
                            Initialize Council
                            <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform duration-200" />
                        </Link>
                    </motion.div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 1 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-muted-foreground/25"
                >
                    <span className="text-[10px] font-medium uppercase tracking-[0.2em]">Explore</span>
                    <ChevronDown className="h-4 w-4 animate-bounce" />
                </motion.div>
            </motion.section>

            {/* Features Section */}
            <section className="relative py-24 z-20 border-t border-white/[0.04]">
                <div className="container mx-auto px-6 max-w-6xl">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground/95">
                            Calculated. <span className="text-primary">Transparent.</span> Fair.
                        </h2>
                        <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
                            Multi-agent architecture ensures every candidate is evaluated with precision and comprehensive debate.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <FeatureCard 
                            delay={0.1}
                            icon={Users}
                            title="Multi-Agent Consensus"
                            description="Synchronized AI agents—Technical, Behavioral, and Diversity—collaborating to reach structural consensus."
                        />
                        <FeatureCard 
                            delay={0.2}
                            icon={MessageSquare}
                            title="Real-time Deliberation"
                            description="Observe agents debate candidate merits in real-time, providing transparent insights into hiring conclusions."
                        />
                        <FeatureCard 
                            delay={0.3}
                            icon={ShieldCheck}
                            title="Zero-Bias Filtration"
                            description="Algorithmic guardrails strip away demographic indicators, enforcing strict meritocratic evaluation."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-28 z-20">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="container mx-auto px-6 max-w-4xl"
                >
                    <div className="liquid-glass-elevated rounded-2xl p-12 md:p-16 text-center relative overflow-hidden">
                        {/* Subtle top border accent */}
                        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                        
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-foreground/95 leading-tight">
                            Elevate Your<br className="hidden md:block" /> Pipeline Today.
                        </h2>
                        
                        <Link href={user ? "/dashboard" : "/login"}>
                            <button className="px-8 py-3.5 bg-foreground/90 text-background rounded-xl text-base font-medium hover:bg-foreground transition-all duration-300 hover:shadow-[0_0_40px_-8px_rgba(255,255,255,0.2)]">
                                Deploy AI Council
                            </button>
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="py-10 border-t border-white/[0.04] relative z-20 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <BrainCircuit className="h-4 w-4 text-primary/60" />
                    <span className="text-base font-semibold text-foreground/60">HireNexus</span>
                </div>
                <p className="text-[11px] text-muted-foreground/30 font-medium">© {new Date().getFullYear()} HireNexus v2.0. All rights reserved.</p>
            </footer>
        </div>
    )
}

function FeatureCard({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ y: -4 }}
            className="liquid-glass p-8 rounded-xl group cursor-default"
        >
            <div className="h-12 w-12 bg-white/[0.04] rounded-xl flex items-center justify-center mb-6 border border-white/[0.06] group-hover:bg-primary/8 group-hover:border-primary/15 transition-all duration-400">
                <Icon className="h-6 w-6 text-foreground/40 group-hover:text-primary/80 transition-colors duration-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 tracking-tight text-foreground/90">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
            </p>
        </motion.div>
    )
}
