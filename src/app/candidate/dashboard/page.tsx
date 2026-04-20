"use client"

import * as React from "react"
import {
  FileText,
  Video,
  CheckCircle2,
  TrendingUp,
  Clock,
  ArrowRight,
  Loader2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { motion } from "framer-motion"
import { useUser, useFirestore } from "@/firebase"
import { doc, getDoc } from "firebase/firestore"

export default function CandidateDashboard() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const [profileData, setProfileData] = React.useState<any>(null)
  const [isProfileLoading, setIsProfileLoading] = React.useState(true)

  React.useEffect(() => {
    if (isUserLoading || !user || !db) return;

    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "users", user.uid)
        const snap = await getDoc(docRef)
        if (snap.exists()) {
          setProfileData(snap.data())
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setIsProfileLoading(false)
      }
    }

    fetchProfile()
  }, [user, isUserLoading, db])

  const hasResume = profileData?.hasResume || false;
  const hasAnalysis = !!profileData?.lastAnalysis;
  const consensusScore = profileData?.lastAnalysis?.consensus?.overallScore;

  const metrics = [
    {
      title: "Profile Completion",
      value: hasAnalysis ? "100%" : hasResume ? "80%" : "60%",
      change: hasAnalysis ? "Ready for jobs" : "Upload resume to improve",
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Consensus Score",
      value: consensusScore ? `${consensusScore}/100` : "-",
      change: hasAnalysis ? "From 5 AI Agents" : "Run analysis to view",
      icon: TrendingUp,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Mock Interviews",
      value: "0",
      change: "Practice recommended",
      icon: Video,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
    },
  ]

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">Welcome, {user?.displayName || 'Candidate'}</h2>
          <p className="text-muted-foreground mt-1">Here's your personal hub for matching with top tech roles.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 font-medium">
            <Link href="/candidate/profile">Upload Resume</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric, i) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <Card className="glass-panel overflow-hidden group hover:border-primary/40 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl ${metric.bgColor} backdrop-blur-sm`}>
                    <metric.icon className={`h-5 w-5 ${metric.color}`} />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-2xl font-bold tracking-tight">{metric.value}</h3>
                  <p className="text-sm font-medium text-foreground/80 mt-1">{metric.title}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <TrendingUp className="h-3 w-3 text-emerald-400" />
                    <span className="text-[11px] text-muted-foreground">{metric.change}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4, duration: 0.5 }}
           className="lg:col-span-2"
        >
          <Card className="glass-panel h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl font-bold">Action Items</CardTitle>
              <CardDescription>Tasks to improve your hiring chances.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 pt-4">
               {/* Fixed static action items for scaffolding */}
                <Link href="/candidate/profile" className="flex items-center justify-between p-4 rounded-xl hover:bg-muted/30 transition-all group cursor-pointer border border-transparent hover:border-border/60">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm text-primary group-hover:bg-primary/20 transition-colors">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">Upload your Resume</span>
                      <span className="text-xs text-muted-foreground">Let Gemini analyze your skills</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <Badge className="bg-orange-400/10 text-orange-400 border-orange-400/20">Pending</Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>

                <Link href="/candidate/mock-interview" className="flex items-center justify-between p-4 rounded-xl hover:bg-muted/30 transition-all group cursor-pointer border border-transparent hover:border-border/60">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center font-bold text-sm text-accent group-hover:bg-accent/20 transition-colors">
                      <Video className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">Try a Mock Interview</span>
                      <span className="text-xs text-muted-foreground">Practice with AI interviewers</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <Badge className="bg-orange-400/10 text-orange-400 border-orange-400/20">Recommended</Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
            </div>
          </CardContent>
          </Card>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, x: 30 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Card className="glass-panel h-full">
            <CardHeader>
            <CardTitle className="text-xl font-bold">Your Status</CardTitle>
            <CardDescription>AI panel readiness across your pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { label: "Profile Created", done: true, color: "text-emerald-400" },
                { label: "Resume Uploaded", done: hasResume, color: hasResume ? "text-emerald-400" : "text-muted-foreground" },
                { label: "AI Screening", done: hasAnalysis, color: hasAnalysis ? "text-emerald-400" : "text-muted-foreground" },
              ].map((act, i) => (
                <div key={i} className="flex gap-4 items-start relative pb-6 last:pb-0">
                  {i !== 2 && <div className="absolute left-[11px] top-[28px] bottom-0 w-px bg-border/40" />}
                  <div className={`h-[22px] w-[22px] rounded-full border-2 border-background z-10 ${act.done ? 'bg-emerald-400/20' : 'bg-muted'} flex items-center justify-center`}>
                    {act.done ? (
                       <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    ) : (
                       <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className={`text-sm font-medium ${act.color}`}>
                       {act.label}
                    </p>
                    {act.done && <span className="text-[11px] text-emerald-400/70">Completed</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
