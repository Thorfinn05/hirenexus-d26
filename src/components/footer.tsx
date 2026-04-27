import Link from "next/link";
import { Github, Twitter, Linkedin, Mail, BrainCircuit } from "lucide-react";

export function Footer() {
    return (
        <footer className="w-full relative overflow-hidden border-t border-white/[0.08] mt-auto">
            {/* Background elements to make it "alive" */}
            <div className="absolute inset-0 bg-gradient-to-b from-background to-background/40 z-0" />
            <div className="absolute inset-0 bg-primary/5 z-0" />
            
            {/* Subtle glowing accents */}
            <div className="absolute top-0 left-1/4 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent z-10" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[128px] z-0 pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-[128px] z-0 pointer-events-none" />

            <div className="container mx-auto px-6 py-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center gap-2.5 mb-5 group w-fit">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                                <BrainCircuit className="h-4.5 w-4.5 text-primary" />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-foreground/90">HireNexus</span>
                        </Link>
                        <p className="text-sm text-muted-foreground/80 max-w-sm leading-relaxed mb-6">
                            Autonomous AI council evaluating engineers fairly, instantly, and transparently. Welcome to the next generation of hiring.
                        </p>
                    </div>
                    
                    <div>
                        <h3 className="font-semibold mb-5 text-foreground/90 tracking-wide text-sm uppercase">Resources</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground/70">
                            <li><Link href="/about" className="hover:text-primary transition-colors flex items-center gap-2"><span className="h-px w-3 bg-primary/40 rounded-full" />About Us</Link></li>
                            <li><Link href="/privacy" className="hover:text-primary transition-colors flex items-center gap-2"><span className="h-px w-3 bg-primary/40 rounded-full" />Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-primary transition-colors flex items-center gap-2"><span className="h-px w-3 bg-primary/40 rounded-full" />Terms of Service</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-5 text-foreground/90 tracking-wide text-sm uppercase">Connect</h3>
                        <div className="flex items-center gap-3">
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all duration-300 group">
                                <Twitter className="h-4.5 w-4.5 group-hover:scale-110 transition-transform" />
                                <span className="sr-only">Twitter</span>
                            </a>
                            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all duration-300 group">
                                <Github className="h-4.5 w-4.5 group-hover:scale-110 transition-transform" />
                                <span className="sr-only">GitHub</span>
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all duration-300 group">
                                <Linkedin className="h-4.5 w-4.5 group-hover:scale-110 transition-transform" />
                                <span className="sr-only">LinkedIn</span>
                            </a>
                            <a href="mailto:contact@hirenexus.com" className="h-10 w-10 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all duration-300 group">
                                <Mail className="h-4.5 w-4.5 group-hover:scale-110 transition-transform" />
                                <span className="sr-only">Email</span>
                            </a>
                        </div>
                    </div>
                </div>
                
                <div className="mt-12 pt-8 mb-2 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground/50 font-medium">
                        &copy; {new Date().getFullYear()} HireNexus. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs text-muted-foreground/60 font-medium tracking-wide">All systems operational</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
