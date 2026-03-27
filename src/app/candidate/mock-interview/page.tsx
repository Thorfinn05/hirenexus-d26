"use client"

import * as React from "react"
import {
  Video,
  Mic,
  BrainCircuit,
  Settings,
  ArrowRight,
  Play,
  User,
  ShieldAlert,
  Zap,
  Coffee,
  Frown
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { personas } from "@/ai/personas"
import { Badge } from "@/components/ui/badge"

export default function CandidateMockInterview() {
  const router = useRouter()
  const [selectedPersonaId, setSelectedPersonaId] = React.useState("tech-lead")
  const [toughness, setToughness] = React.useState("medium")

  const selectedPersona = personas.find(p => p.id === selectedPersonaId) || personas[0]

  const toughnessLevels = [
    { id: "easy", label: "Easy", icon: <Coffee className="h-3 w-3" />, color: "text-emerald-400 border-emerald-400/20 bg-emerald-400/5" },
    { id: "medium", label: "Medium", icon: <Zap className="h-3 w-3" />, color: "text-blue-400 border-blue-400/20 bg-blue-400/5" },
    { id: "hard", label: "Hard", icon: <ShieldAlert className="h-3 w-3" />, color: "text-orange-400 border-orange-400/20 bg-orange-400/5" },
    { id: "stress", label: "Stress", icon: <Frown className="h-3 w-3" />, color: "text-rose-400 border-rose-400/20 bg-rose-400/5" }
  ]

  const handleStartSession = () => {
    router.push(`/candidate/mock-interview/session?persona=${selectedPersonaId}&toughness=${toughness}`)
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-bold tracking-tight font-headline">Mock Interviews</h2>
          <p className="text-muted-foreground mt-2 text-lg">Practice with real-time AI interviewers. Choose your challenge.</p>
        </div>
        <Badge variant="outline" className="w-fit py-1.5 px-4 bg-primary/5 border-primary/20 text-primary gap-2 h-fit">
            <Zap className="h-3.5 w-3.5 fill-current" />
            Gemini 3.1 Powered
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Persona Selection Grid */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-headline flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Select Your Interviewer
            </h3>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">{personas.length} Roles Available</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {personas.map((p) => (
              <motion.div
                key={p.id}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedPersonaId(p.id)}
              >
                <Card className={`cursor-pointer transition-all duration-300 border-2 overflow-hidden h-full ${
                  selectedPersonaId === p.id 
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" 
                  : "border-border/40 hover:border-primary/40 bg-card/50"
                  }`}
                >
                  <CardContent className="p-5 flex gap-4">
                    <div className={`h-12 w-12 rounded-xl ${p.avatarColor} flex items-center justify-center shrink-0 shadow-lg`}>
                        <User className="h-6 w-6 text-white" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{p.name}</span>
                        {selectedPersonaId === p.id && (
                             <Badge className="h-4 text-[8px] uppercase tracking-tighter px-1.5">Selected</Badge>
                        )}
                      </div>
                      <p className="text-xs font-medium text-foreground/80">{p.role}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                        {p.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Configuration & Start */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          <Card className="glass-panel border-primary/20 p-6 flex flex-col gap-8 shadow-xl">
            {/* Difficulty Selector */}
            <div className="space-y-4 text-center">
                <div className="space-y-1">
                    <h3 className="font-bold font-headline">Interview Difficulty</h3>
                    <p className="text-xs text-muted-foreground italic">Adjust AI logic and follow-up strictness</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                    {toughnessLevels.map((lvl) => (
                        <Button
                            key={lvl.id}
                            variant="outline"
                            size="sm"
                            onClick={() => setToughness(lvl.id)}
                            className={`h-12 rounded-xl gap-2 font-bold transition-all duration-300 ${
                                toughness === lvl.id 
                                ? lvl.color
                                : "opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0"
                            }`}
                        >
                            {lvl.icon}
                            {lvl.label}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="h-px bg-border/40 w-full" />

            {/* Selection Summary */}
            <AnimatePresence mode="wait">
                <motion.div 
                    key={selectedPersonaId}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-4">
                         <div className={`h-10 w-10 rounded-full ${selectedPersona.avatarColor} flex items-center justify-center shrink-0`}>
                            <User className="h-5 w-5 text-white" />
                         </div>
                         <div className="flex flex-col">
                            <span className="text-xs uppercase tracking-widest font-bold opacity-60">Session With</span>
                            <span className="font-bold leading-tight">{selectedPersona.name} • {selectedPersona.role}</span>
                         </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-3">
                        "{selectedPersona.systemInstruction.substring(0, 100)}..."
                    </p>
                </motion.div>
            </AnimatePresence>

            <Button 
                onClick={handleStartSession}
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xl shadow-primary/20 h-14 text-lg gap-3 rounded-2xl"
            >
                <Play className="h-5 w-5 fill-current" /> Start Interview
            </Button>

            <div className="flex items-center justify-center gap-6 text-[10px] uppercase font-bold tracking-widest opacity-40">
                <div className="flex items-center gap-1.5"><Mic className="h-3 w-3" /> Audio</div>
                <div className="flex items-center gap-1.5"><Zap className="h-3 w-3" /> Live</div>
                <div className="flex items-center gap-1.5"><BrainCircuit className="h-3 w-3" /> 24kHz</div>
            </div>
          </Card>

          <Card className="glass-panel border-white/5 bg-white/5 p-4">
             <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-background/50 border border-border/40">
                   <ShieldAlert className="h-4 w-4 text-primary" />
                </div>
                <div>
                   <h4 className="text-xs font-bold">Privacy Note</h4>
                   <p className="text-[10px] text-muted-foreground">Audio is processed in real-time and not stored.</p>
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
