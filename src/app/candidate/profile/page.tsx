"use client"

import * as React from "react"
import {
  FileText,
  Upload,
  Loader2,
  FileCheck,
  Save,
  User,
  Github,
  BarChart
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useUser, useFirestore } from "@/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { parseResume } from "@/ai/flows/parse-resume-flow"
import { fetchGithubProfile } from "@/ai/flows/fetch-github-profile-flow"
import { motion } from "framer-motion"
import { MultiAgentDebate } from "@/components/multi-agent-debate"

export default function CandidateProfile() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)
  const [profileData, setProfileData] = React.useState<any>(null)
  const [analysisData, setAnalysisData] = React.useState<any>(null)

  const [fullName, setFullName] = React.useState("")
  const [githubUrl, setGithubUrl] = React.useState("")
  const [targetRole, setTargetRole] = React.useState("")
  const [bio, setBio] = React.useState("")
  const [resumeFileName, setResumeFileName] = React.useState("")
  const [skills, setSkills] = React.useState<string[]>([])

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (isUserLoading || !user || !db) return;

    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "users", user.uid)
        const snap = await getDoc(docRef)
        if (snap.exists()) {
          const data = snap.data()
          setProfileData(data)
          setFullName(data.displayName || data.fullName || "")
          setGithubUrl(data.githubUrl || "")
          setTargetRole(data.targetRole || "")
          setBio(data.bio || data.notes || "")
          setResumeFileName(data.resumeFileName || "")
          setSkills(data.skills || [])
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [user, isUserLoading, db])

  const handleSaveProfile = async () => {
    if (!user || !db) return
    setIsSaving(true)
    try {
      const docRef = doc(db, "users", user.uid)
      await updateDoc(docRef, {
        displayName: fullName,
        fullName: fullName,
        githubUrl,
        targetRole,
        bio,
      })
      toast({ title: "Profile Saved", description: "Your details have been updated." })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Save Failed", description: error.message || "Failed to save profile." })
    } finally {
      setIsSaving(false)
    }
  }

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user || !db) return

    setIsUploading(true)
    setResumeFileName(file.name)
    try {
      const dataUri = await fileToDataUri(file)
      const result = await parseResume({ pdfDataUri: dataUri })

      if (result.success) {
        const docRef = doc(db, "users", user.uid)
        await updateDoc(docRef, {
          resumeText: result.extractedText,
          skills: result.skills || [],
          projects: result.projects || [],
          resumeFileName: file.name,
          hasResume: true,
          status: "Parsed"
        })
        setSkills(result.skills || [])
        toast({ title: "Resume Analyzed", description: "Your skills and experience were successfully extracted." })
      } else {
        throw new Error(result.error || "Failed to parse resume")
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Analysis Failed", description: error.message })
      setResumeFileName(profileData?.resumeFileName || "")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const runComprehensiveAnalysis = async () => {
    if (!profileData?.resumeText) {
      toast({ variant: "destructive", title: "Error", description: "Please upload your resume first." })
      return
    }

    setIsAnalyzing(true)
    try {
      let githubData = "No GitHub URL provided"
      if (githubUrl) {
        githubData = await fetchGithubProfile(githubUrl)
      }

      const res = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: profileData.resumeText,
          jobDescription: targetRole,
          githubData
        })
      })

      const data = await res.json()
      if (data.success) {
         setAnalysisData(data.data)
         toast({ title: "Analysis Complete", description: "The agent panel has reached a consensus." })
         
         // Optionally save analysisData to user document
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
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight font-headline">My Profile</h2>
        <p className="text-muted-foreground mt-1">Manage your details and AI-parsed resume context.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1, duration: 0.5 }}
           className="md:col-span-2 space-y-6"
        >
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2"><User className="h-5 w-5" /> Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-xs font-bold">Full Name</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-muted/20 border-border/40" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetRole" className="text-xs font-bold">Target Role</Label>
                  <Input id="targetRole" placeholder="e.g. Senior Frontend Engineer" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="bg-muted/20 border-border/40" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="githubUrl" className="text-xs font-bold">GitHub URL</Label>
                <div className="relative">
                  <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="githubUrl" placeholder="https://github.com/yourusername" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className="pl-10 bg-muted/20 border-border/40" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-xs font-bold">Short Bio</Label>
                <Textarea id="bio" placeholder="Tell us a little about yourself..." value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-[100px] bg-muted/20 border-border/40" />
              </div>

              <div className="pt-2">
                <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md shadow-primary/20">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} Save Profile
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
              <CardTitle className="text-xl font-bold flex items-center gap-2"><FileText className="h-5 w-5" /> Resume</CardTitle>
              <CardDescription>Upload your PDF resume to let our AI extract your skills automatically.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <input type="file" accept=".pdf" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                <div onClick={() => !isUploading && fileInputRef.current?.click()} className={`w-full flex items-center justify-center flex-col gap-3 p-6 rounded-xl border-2 border-dashed transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${resumeFileName ? "bg-primary/5 border-primary/30 text-primary" : "bg-muted/10 border-border/60 text-muted-foreground hover:border-primary/40 hover:bg-background/60"}`}>
                  {isUploading ? (
                     <Loader2 className="h-8 w-8 animate-spin" />
                  ) : resumeFileName ? (
                     <FileCheck className="h-8 w-8" />
                  ) : (
                     <Upload className="h-8 w-8 opacity-70" />
                  )}
                  <div className="text-center">
                    <span className="text-sm font-bold block">{isUploading ? "Analyzing..." : resumeFileName || "Upload PDF"}</span>
                    {!resumeFileName && !isUploading && <span className="text-[10px] uppercase tracking-widest opacity-60 mt-1 block">Click to browse</span>}
                  </div>
                </div>

                {skills && skills.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Extracted Skills</h4>
                    <div className="flex flex-wrap gap-2">
                       {skills.map((skill, idx) => (
                         <div key={idx} className="bg-muted px-2.5 py-1 rounded-md text-xs font-medium text-foreground border border-border/40">
                           {skill}
                         </div>
                       ))}
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-border/40">
                      <Button onClick={runComprehensiveAnalysis} disabled={isAnalyzing} className="w-full bg-gradient-to-r from-purple-500 to-primary hover:from-purple-600 hover:to-primary/90 text-white font-bold shadow-lg shadow-purple-500/20">
                        {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <BarChart className="h-4 w-4 mr-2" />} 
                        {isAnalyzing ? "Agents are deliberating..." : "Run Multi-Agent Deep Analysis"}
                      </Button>
                      <p className="text-xs text-muted-foreground text-center mt-3">This invokes the 5-agent panel and may take 30-45 seconds.</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {analysisData && (
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

