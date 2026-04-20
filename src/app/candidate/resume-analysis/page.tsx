"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUser, useFirestore } from "@/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Users, FileText, BarChart } from "lucide-react"
import { MultiAgentDebate } from "@/components/multi-agent-debate"
import { fetchGithubProfile } from "@/ai/flows/fetch-github-profile-flow"
import Link from "next/link"

export default function ResumeAnalysisDashboard() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = React.useState(true)
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)
  const [profileData, setProfileData] = React.useState<any>(null)
  const [analysisData, setAnalysisData] = React.useState<any>(null)

  const [localTargetRole, setLocalTargetRole] = React.useState("")
  const [localExperience, setLocalExperience] = React.useState("")
  const [localLinkedin, setLocalLinkedin] = React.useState("")
  const [localGithub, setLocalGithub] = React.useState("")

  React.useEffect(() => {
    if (isUserLoading || !user || !db) return;

    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "users", user.uid)
        const snap = await getDoc(docRef)
        if (snap.exists()) {
          const data = snap.data()
          setProfileData(data)
          if (!localTargetRole && data.targetRole) setLocalTargetRole(data.targetRole)
          if (!localGithub && data.githubUrl) setLocalGithub(data.githubUrl)
          if (data.lastAnalysis) {
            setAnalysisData(data.lastAnalysis)
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [user, isUserLoading, db])

  const runComprehensiveAnalysis = async () => {
    if (!profileData?.resumeText) {
      toast({ variant: "destructive", title: "Missing Resume", description: "Please upload your resume in the Profile page first." })
      return
    }

    setIsAnalyzing(true)
    try {
      let githubData = "No GitHub URL provided"
      if (localGithub) {
        githubData = await fetchGithubProfile(localGithub)
      }

      // Combine info into job description context
      const fullContext = `Target Role: ${localTargetRole || "Software Engineer"}
Experience Level: ${localExperience || "Not specified"}
LinkedIn: ${localLinkedin || "Not provided"}

The candidate wants to be evaluated for the above position.`

      const res = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: profileData.resumeText,
          jobDescription: fullContext,
          githubData
        })
      })

      const data = await res.json()
      if (data.success) {
         setAnalysisData(data.data)
         toast({ title: "Analysis Complete", description: "The agent panel has reached a consensus." })
         
         if(user && db) {
           const docRef = doc(db, "users", user.uid)
           await updateDoc(docRef, { lastAnalysis: data.data })
         }
      } else {
         throw new Error(data.error)
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "Analysis Failed", description: e.message || "Failed to analyze" })
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (isUserLoading || isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" /> AI Resume Panel
        </h2>
        <p className="text-muted-foreground mt-1 text-lg">Simulate an interview panel evaluating your resume.</p>
      </div>

      {!profileData?.hasResume ? (
        <Card className="glass-panel border-orange-500/20 bg-orange-500/5">
          <CardContent className="p-8 text-center space-y-4">
            <FileText className="h-12 w-12 mx-auto text-orange-400 opacity-80" />
            <h3 className="text-xl font-bold text-foreground">Resume Required</h3>
            <p className="text-muted-foreground">You need to upload and parse a resume before our AI panel can deliberate on it.</p>
            <Button asChild className="bg-orange-500 hover:bg-orange-600 font-bold text-white shadow-lg shadow-orange-500/20">
              <Link href="/candidate/profile">Go to Profile</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass-panel border-primary/20 bg-gradient-to-r from-background/40 to-primary/5">
          <CardHeader>
            <CardTitle>Configure Analysis Parameters</CardTitle>
            <CardDescription>
              Our 5 specialized AI personas (Tech Lead, HR, PM, EM, CTO) will review your extracted skills and debate your fit based on these details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="role" className="font-bold">Target Job Role</Label>
                <Input id="role" placeholder="e.g. Senior Fullstack Engineer" value={localTargetRole} onChange={e => setLocalTargetRole(e.target.value)} className="bg-background/40 border-border/40" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience" className="font-bold">Experience Level</Label>
                <Input id="experience" placeholder="e.g. 5 Years, Mid-Level" value={localExperience} onChange={e => setLocalExperience(e.target.value)} className="bg-background/40 border-border/40" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin" className="font-bold">LinkedIn URL (Optional)</Label>
                <Input id="linkedin" placeholder="https://linkedin.com/in/..." value={localLinkedin} onChange={e => setLocalLinkedin(e.target.value)} className="bg-background/40 border-border/40" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github" className="font-bold">GitHub URL (Optional)</Label>
                <Input id="github" placeholder="https://github.com/..." value={localGithub} onChange={e => setLocalGithub(e.target.value)} className="bg-background/40 border-border/40" />
              </div>
            </div>

            <div className="pt-4 border-t border-border/40 flex justify-end">
              <Button 
                onClick={runComprehensiveAnalysis} 
                disabled={isAnalyzing}
                className="py-6 px-8 bg-gradient-to-r from-purple-500 to-primary hover:from-purple-600 hover:to-primary/90 text-white font-bold shadow-lg shadow-purple-500/20 w-full md:w-auto text-lg whitespace-nowrap"
              >
                {isAnalyzing ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <BarChart className="h-5 w-5 mr-2" />}
                {isAnalyzing ? "Panel is Deliberating..." : analysisData ? "Re-Run Analysis" : "Start Live Deliberation"}
              </Button>
            </div>
            {isAnalyzing && (
              <p className="text-xs text-muted-foreground text-right">Depending on the model size, this multi-agent consensus can take 30-45 seconds.</p>
            )}
          </CardContent>
        </Card>
      )}

      {analysisData && !isAnalyzing && (
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           className="mt-12"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight font-headline">Hiring Panel Evaluation</h2>
            <p className="text-muted-foreground mt-1">Multi-agent debate results and consensus roadmap.</p>
          </div>
          <MultiAgentDebate data={analysisData} />
        </motion.div>
      )}
    </div>
  )
}
