"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useUser, useFirestore } from "@/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Github, GitCommit, GitPullRequest, Code2, AlertCircle } from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis
} from "recharts"

export default function CandidateGithubDashboard() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = React.useState(true)
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)
  const [githubUrl, setGithubUrl] = React.useState("")
  const [analysisData, setAnalysisData] = React.useState<any>(null)

  React.useEffect(() => {
    if (isUserLoading || !user || !db) return;

    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "users", user.uid)
        const snap = await getDoc(docRef)
        if (snap.exists()) {
          const data = snap.data()
          setGithubUrl(data.githubUrl || "")
          if (data.githubAnalysis) {
            setAnalysisData(data.githubAnalysis)
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

  const analyzeProfile = async () => {
    if (!githubUrl) {
      toast({ variant: "destructive", title: "Wait", description: "Please enter a GitHub URL first" })
      return
    }

    setIsAnalyzing(true)
    try {
      const res = await fetch("/api/analyze-github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubUrl })
      })
      const data = await res.json()
      if (data.success) {
        setAnalysisData(data.data)
        toast({ title: "Analysis Complete", description: "Your GitHub profile has been parsed." })
        
        if (user && db) {
          await updateDoc(doc(db, "users", user.uid), { 
            githubUrl,
            githubAnalysis: data.data 
          })
        }
      } else {
        throw new Error(data.error)
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "Analysis Failed", description: e.message || "Something went wrong." })
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
          <Github className="h-8 w-8" /> GitHub Intelligence
        </h2>
        <p className="text-muted-foreground mt-1 text-lg">AI-powered analytics and evaluation of your code portfolio.</p>
      </div>

      <Card className="glass-panel border-primary/20 bg-gradient-to-r from-background/40 to-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="space-y-2 flex-grow">
              <label className="text-sm font-bold text-foreground/80">GitHub Profile URL</label>
              <Input 
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/yourusername"
                className="bg-background/40 border-border/40 text-lg py-6"
              />
            </div>
            <Button 
              onClick={analyzeProfile} 
              disabled={isAnalyzing}
              className="py-6 px-8 bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20 w-full md:w-auto"
            >
              {isAnalyzing ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <GitPullRequest className="h-5 w-5 mr-2" />}
              {isAnalyzing ? "Extracting..." : analysisData ? "Re-Analyze" : "Analyze Profile"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {analysisData && analysisData.data && (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          
          {/* Top Line Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass-panel">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div className="p-3 bg-emerald-500/10 rounded-xl"><Code2 className="h-5 w-5 text-emerald-400" /></div>
                </div>
                <div className="mt-4">
                  <h3 className="text-3xl font-black">{analysisData.rawReposCount}</h3>
                  <p className="text-sm font-medium text-muted-foreground">Repositories Analyzed</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-panel">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div className="p-3 bg-blue-500/10 rounded-xl"><GitCommit className="h-5 w-5 text-blue-400" /></div>
                </div>
                <div className="mt-4">
                  <h3 className="text-3xl font-black">{analysisData.rawContributions}</h3>
                  <p className="text-sm font-medium text-muted-foreground">Yearly Contributions</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-panel md:col-span-2 bg-primary/5 border-primary/20">
              <CardContent className="p-6 flex flex-col justify-center h-full">
                <div className="flex items-start gap-4">
                  <AlertCircle className="h-6 w-6 text-primary shrink-0 mt-1" />
                  <div>
                     <h4 className="font-bold text-foreground mb-1">AI Summary</h4>
                     <p className="text-sm text-foreground/80 leading-relaxed">{analysisData.data.summary}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Tech Breadth Bar Chart */}
            <Card className="glass-panel lg:col-span-2">
              <CardHeader>
                <CardTitle>Technology Imprint</CardTitle>
                <CardDescription>Dominant languages across all analyzed repositories.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analysisData.data.techBreadth} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="language" stroke="rgba(255,255,255,0.5)" tick={{fill: "rgba(255,255,255,0.7)"}} />
                    <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: "rgba(255,255,255,0.7)"}} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                      itemStyle={{ color: "#fff" }}
                    />
                    <Bar dataKey="percentage" fill="var(--color-primary, #8884d8)" radius={[4, 4, 0, 0]} name="Usage %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Complexity Radar Chart */}
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>Engineering Depth</CardTitle>
                <CardDescription>AI evaluation of structural competency.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={analysisData.data.complexityAssessment}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} stroke="rgba(255,255,255,0.1)" />
                    <Radar name="Score" dataKey="score" stroke="var(--color-primary, #8884d8)" fill="var(--color-primary, #8884d8)" fillOpacity={0.4} />
                    <RechartsTooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Contribution Velocity</CardTitle>
              <CardDescription>Monthly commit volume over the last 12 months.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analysisData.data.commitConsistency} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary, #8884d8)" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="var(--color-primary, #8884d8)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" tick={{fill: "rgba(255,255,255,0.7)"}} />
                  <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: "rgba(255,255,255,0.7)"}} />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <RechartsTooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
                  <Area type="monotone" dataKey="commits" stroke="var(--color-primary, #8884d8)" fillOpacity={1} fill="url(#colorCommits)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {analysisData.data.topRepositories.map((repo: any, i: number) => (
              <Card key={i} className="glass-panel bg-gradient-to-br from-background to-muted/20 hover:border-primary/40 transition-colors">
                <CardContent className="p-6 space-y-3">
                   <div className="flex items-center gap-2 mb-4">
                     <Github className="h-5 w-5 text-muted-foreground" />
                     <h4 className="font-bold text-lg leading-none">{repo.name}</h4>
                   </div>
                   <p className="text-sm text-foreground/80">{repo.description}</p>
                   <div className="pt-4 border-t border-border/40 mt-4">
                     <p className="text-xs font-semibold text-primary/80 uppercase tracking-wider mb-1">Notable Feature</p>
                     <p className="text-xs text-muted-foreground">{repo.notableFeature}</p>
                   </div>
                   <div className="pt-2">
                     <span className="inline-flex items-center justify-center rounded-md bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                        {repo.role}
                     </span>
                   </div>
                </CardContent>
              </Card>
            ))}
          </div>

        </motion.div>
      )}
    </div>
  )
}
