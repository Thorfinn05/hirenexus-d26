"use client"

import * as React from "react"
import {
  Video,
  Mic,
  BrainCircuit,
  Settings,
  ArrowRight,
  Play
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function CandidateMockInterview() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight font-headline">Mock Interviews</h2>
        <p className="text-muted-foreground mt-1">Practice with our AI interviewers to prepare for the real thing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1, duration: 0.5 }}
           className="space-y-6"
        >
          <Card className="glass-panel overflow-hidden border-primary/20 bg-primary/5">
            <CardHeader className="pb-4 border-b border-primary/10">
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-primary"><BrainCircuit className="h-5 w-5" /> AI Technical Screen</CardTitle>
              <CardDescription>A 15-minute dialogue focusing on core CS concepts and your resume.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-sm font-medium">
                   <div className="p-2 rounded-lg bg-background/50 border border-border/40">
                      <Mic className="h-4 w-4 text-orange-400" />
                   </div>
                   Voice Enabled
                </div>
                <div className="flex items-center gap-4 text-sm font-medium">
                   <div className="p-2 rounded-lg bg-background/50 border border-border/40">
                      <Video className="h-4 w-4 text-blue-400" />
                   </div>
                   Video Optional
                </div>
                
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md shadow-primary/20 gap-2 mt-4">
                  <Play className="h-4 w-4 fill-current" /> Start Practice Session
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, x: 30 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.2, duration: 0.5 }}
           className="space-y-6"
        >
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2"><Settings className="h-5 w-5" /> Preferences</CardTitle>
              <CardDescription>Configure your practice environment.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-border/40 bg-muted/10 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">Strictness Level</span>
                    <span className="text-xs text-muted-foreground">Adjust AI leniency</span>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 text-xs font-semibold">Medium</Button>
                </div>
                <div className="p-4 rounded-xl border border-border/40 bg-muted/10 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">Focus Area</span>
                    <span className="text-xs text-muted-foreground">Tailor the questions</span>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 text-xs font-semibold">System Design</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card className="glass-panel mt-8">
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                 <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-white/10 shrink-0">
                    <BrainCircuit className="h-8 w-8 text-foreground" />
                 </div>
                 <div className="flex flex-col">
                    <h4 className="text-lg font-bold font-headline">Coming Soon: Multi-Agent Debate</h4>
                    <p className="text-sm text-muted-foreground max-w-lg mt-1">Soon you'll be able to watch our distinct AI personas debate your strengths and weaknesses in real-time after a mock interview.</p>
                 </div>
              </div>
              <Button variant="outline" className="shrink-0 gap-2 border-primary/20 text-primary hover:bg-primary/10">
                 Learn More <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
