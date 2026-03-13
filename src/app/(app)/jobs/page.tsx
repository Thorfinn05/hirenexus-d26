
"use client"

import * as React from "react"
import {
  Plus,
  Search,
  MoreHorizontal,
  Filter,
  Layers,
  Loader2,
  Edit2,
  Archive,
  UserPlus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, addDoc, serverTimestamp, query, orderBy, doc, updateDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function JobsPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const router = useRouter()

  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [selectedJob, setSelectedJob] = React.useState<any>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isGeneratingJob, setIsGeneratingJob] = React.useState(false)

  const [newJobForm, setNewJobForm] = React.useState({
    title: "",
    department: "Engineering",
    level: "Senior (7+ Yrs exp)",
    skills: "",
    description: "",
    speciality: ""
  })

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (!isAddDialogOpen) {
      setNewJobForm({
        title: "",
        department: "Engineering",
        level: "Senior (7+ Yrs exp)",
        skills: "",
        description: "",
        speciality: ""
      })
    }
  }, [isAddDialogOpen])

  const jobsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null
    // Use a simple query to avoid complex composite index requirements
    return query(
      collection(db, "users", user.uid, "jobDescriptions"),
      orderBy("createdAt", "desc")
    )
  }, [db, user?.uid])

  const { data: allJobs, isLoading } = useCollection(jobsQuery)

  // Filter archived jobs and search query on the client side
  const activeJobs = React.useMemo(() => {
    if (!allJobs) return []
    return allJobs.filter(job => {
      const isNotArchived = job.status !== "Archived"
      const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.department.toLowerCase().includes(searchQuery.toLowerCase())
      return isNotArchived && matchesSearch
    })
  }, [allJobs, searchQuery])

  const handleTitleBlur = async () => {
    if (!newJobForm.title) return

    setIsGeneratingJob(true)
    try {
      const res = await fetch('/api/generate-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newJobForm.title })
      })
      if (!res.ok) throw new Error('Failed to generate job info')
      const data = await res.json()

      setNewJobForm(prev => ({
        ...prev,
        department: data.department || prev.department,
        level: data.level || prev.level,
        skills: data.skills ? data.skills.join(', ') : prev.skills,
        description: data.description || prev.description
      }))

      toast({ title: "AI Generation Complete", description: "Job fields have been automatically populated." })
    } catch (error) {
      console.error(error)
      toast({ variant: "destructive", title: "AI Generation Failed", description: "Could not auto-generate job fields." })
    } finally {
      setIsGeneratingJob(false)
    }
  }

  const handleAddJob = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user?.uid || !db) return

    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)

    try {
      await addDoc(collection(db, "users", user.uid, "jobDescriptions"), {
        title: formData.get("title") as string,
        department: formData.get("department") as string,
        level: formData.get("level") as string,
        skills: (formData.get("skills") as string).split(",").map(s => s.trim()),
        descriptionText: formData.get("description") as string,
        speciality: formData.get("speciality") as string,
        userId: user.uid,
        status: "Indexed",
        createdAt: serverTimestamp(),
      })

      toast({ title: "Job Created", description: "The new position has been added." })
      setIsAddDialogOpen(false)
    } catch (error: any) {
      console.error("Error creating job:", error)
      toast({ variant: "destructive", title: "Error", description: "Failed to create job. Please check permissions." })
    } finally { setIsSubmitting(false) }
  }

  const onEditClick = (job: any) => {
    setSelectedJob(job)
    setIsEditDialogOpen(true)
  }

  const handleEditJob = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user?.uid || !db || !selectedJob) return

    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)

    try {
      const jobRef = doc(db, "users", user.uid, "jobDescriptions", selectedJob.id)
      await updateDoc(jobRef, {
        title: formData.get("title") as string,
        department: formData.get("department") as string,
        level: formData.get("level") as string,
        skills: (formData.get("skills") as string).split(",").map(s => s.trim()),
        descriptionText: formData.get("description") as string,
        speciality: formData.get("speciality") as string,
        updatedAt: serverTimestamp(),
      })

      toast({ title: "Job Updated", description: "Changes have been saved." })
      setIsEditDialogOpen(false)
    } catch (error) {
      toast({ variant: "destructive", title: "Update Failed", description: "Failed to save changes." })
    } finally { setIsSubmitting(false) }
  }

  const handleArchiveJob = async (job: any) => {
    if (!user?.uid || !db) return
    if (!confirm(`Are you sure you want to archive "${job.title}"?`)) return

    try {
      const jobRef = doc(db, "users", user.uid, "jobDescriptions", job.id)
      await updateDoc(jobRef, { status: "Archived" })
      toast({ title: "Job Archived", description: "Position has been moved to archive." })
    } catch (error) {
      toast({ variant: "destructive", title: "Archive Failed", description: "Failed to archive job." })
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">Job Descriptions</h2>
          <p className="text-muted-foreground">{activeJobs.length} active positions</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold">
              <Plus className="h-4 w-4" />
              Add Job
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px] glass-panel p-0 overflow-hidden border-white/10 shadow-2xl">
            <form onSubmit={handleAddJob}>
              <div className="bg-gradient-to-b from-muted/20 to-transparent p-6 pb-4 border-b border-white/5">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold font-headline text-foreground">Create New Job Profile</DialogTitle>
                  <DialogDescription className="text-muted-foreground">Define parameters for AI panel deliberation.</DialogDescription>
                </DialogHeader>
              </div>
              <div className="grid gap-5 p-6 pt-5 max-h-[60vh] overflow-y-auto w-full">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="title">Job Title</Label>
                    {isGeneratingJob && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" /> Generating with AI...
                      </span>
                    )}
                  </div>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g. Senior Full-Stack Engineer"
                    required
                    className="bg-muted/20"
                    value={newJobForm.title}
                    onChange={(e) => setNewJobForm({ ...newJobForm, title: e.target.value })}
                    onBlur={handleTitleBlur}
                    disabled={isGeneratingJob}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="department">Department</Label>
                    <Select
                      name="department"
                      value={newJobForm.department}
                      onValueChange={(val) => setNewJobForm({ ...newJobForm, department: val })}
                      disabled={isGeneratingJob}
                    >
                      <SelectTrigger className="bg-muted/20"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="AI/ML">AI/ML</SelectItem>
                        <SelectItem value="Product">Product</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="level">Level</Label>
                    <Select
                      name="level"
                      value={newJobForm.level}
                      onValueChange={(val) => setNewJobForm({ ...newJobForm, level: val })}
                      disabled={isGeneratingJob}
                    >
                      <SelectTrigger className="bg-muted/20"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Junior (0-3 Yrs exp)">Junior (0-3 Yrs exp)</SelectItem>
                        <SelectItem value="Mid (3-7 Yrs exp)">Mid (3-7 Yrs exp)</SelectItem>
                        <SelectItem value="Senior (7+ Yrs exp)">Senior (7+ Yrs exp)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="skills">Skills (comma separated)</Label>
                  <Input
                    id="skills"
                    name="skills"
                    placeholder="React, Node.js, TypeScript"
                    required
                    className="bg-muted/20"
                    value={newJobForm.skills}
                    onChange={(e) => setNewJobForm({ ...newJobForm, skills: e.target.value })}
                    disabled={isGeneratingJob}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="speciality">Speciality (Optional)</Label>
                  <Input
                    id="speciality"
                    name="speciality"
                    placeholder="e.g. Needs security clearance, Night shift..."
                    className="bg-muted/20"
                    value={newJobForm.speciality}
                    onChange={(e) => setNewJobForm({ ...newJobForm, speciality: e.target.value })}
                    disabled={isGeneratingJob}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Context & Goals</Label>
                  <Textarea
                    id="description"
                    name="description"
                    className="min-h-[100px] bg-muted/20"
                    value={newJobForm.description}
                    onChange={(e) => setNewJobForm({ ...newJobForm, description: e.target.value })}
                    disabled={isGeneratingJob}
                  />
                </div>
              </div>
              <DialogFooter className="p-4 px-6 bg-muted/10 border-t border-white/5 gap-3 shrink-0 flex items-center">
                <Button type="button" variant="ghost" onClick={() => setIsAddDialogOpen(false)} className="font-semibold text-muted-foreground hover:text-foreground">Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-primary text-primary-foreground font-bold px-6 shadow-md shadow-primary/20 gap-2 rounded-full">
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />} Create Position
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px] glass-panel p-0 overflow-hidden border-white/10 shadow-2xl">
          <form onSubmit={handleEditJob}>
            <div className="bg-gradient-to-b from-muted/20 to-transparent p-6 pb-4 border-b border-white/5">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold font-headline text-foreground">Edit Job Profile</DialogTitle>
                <DialogDescription className="text-muted-foreground">Update the requirements for this position.</DialogDescription>
              </DialogHeader>
            </div>
            <div className="grid gap-5 p-6 pt-5 max-h-[60vh] overflow-y-auto w-full">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Job Title</Label>
                <Input id="edit-title" name="title" defaultValue={selectedJob?.title} required className="bg-muted/20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-dept">Department</Label>
                  <Select name="department" defaultValue={selectedJob?.department}>
                    <SelectTrigger className="bg-muted/20"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="AI/ML">AI/ML</SelectItem>
                      <SelectItem value="Product">Product</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-level">Level</Label>
                  <Select name="level" defaultValue={selectedJob?.level}>
                    <SelectTrigger className="bg-muted/20"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Junior (0-3 Yrs exp)">Junior (0-3 Yrs exp)</SelectItem>
                      <SelectItem value="Mid (3-7 Yrs exp)">Mid (3-7 Yrs exp)</SelectItem>
                      <SelectItem value="Senior (7+ Yrs exp)">Senior (7+ Yrs exp)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-skills">Skills</Label>
                <Input id="edit-skills" name="skills" defaultValue={selectedJob?.skills?.join(", ")} required className="bg-muted/20" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-speciality">Speciality (Optional)</Label>
                <Input id="edit-speciality" name="speciality" defaultValue={selectedJob?.speciality} className="bg-muted/20" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-desc">Context & Goals</Label>
                <Textarea id="edit-desc" name="description" defaultValue={selectedJob?.descriptionText} className="min-h-[100px] bg-muted/20" />
              </div>
            </div>
            <DialogFooter className="p-4 px-6 bg-muted/10 border-t border-white/5 gap-3 shrink-0 flex items-center">
              <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="font-semibold text-muted-foreground hover:text-foreground">Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary text-primary-foreground font-bold px-6 shadow-md shadow-primary/20 gap-2 rounded-full">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />} Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border/40 flex flex-wrap items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                className="pl-9 bg-muted/40 border-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-muted/5">
            {isLoading ? (
              <div className="col-span-full py-12 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground font-medium">Loading jobs...</p>
              </div>
            ) : activeJobs.length > 0 ? (
              activeJobs.map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <Card className="glass-panel overflow-hidden group hover:border-primary/40 transition-all h-full flex flex-col hover:bg-muted/10">
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4 gap-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg line-clamp-1" title={job.title}>{job.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{job.department} · {job.level}</p>
                        </div>
                        <Badge className="bg-emerald-400/10 text-emerald-400 border-emerald-400/20 shrink-0">
                          {job.status}
                        </Badge>
                      </div>
                      
                      <div className="mb-6 flex-1">
                         <div className="flex flex-wrap gap-1.5 mt-2">
                           {job.skills?.map((skill: string, idx: number) => (
                             <Badge key={idx} variant="outline" className="text-[10px] px-2 py-0.5 bg-muted/20 border-border/40 text-muted-foreground">
                               {skill}
                             </Badge>
                           ))}
                         </div>
                      </div>
                      
                      <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-auto">
                        <span className="text-[11px] text-muted-foreground font-medium">
                          {job.createdAt?.toDate ? `Added ${job.createdAt.toDate().toLocaleDateString()}` : '—'}
                        </span>
                        
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-all focus:ring-1 focus:ring-primary/50">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 glass-panel">
                            <DropdownMenuItem className="gap-2 focus:bg-primary/10 focus:text-primary transition-colors" onClick={() => router.push('/candidates')}>
                              <UserPlus className="h-4 w-4" /> Add Candidate
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 focus:bg-primary/10 focus:text-primary transition-colors">
                              <Layers className="h-4 w-4" /> Re-index Profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border/40" />
                            <DropdownMenuItem className="gap-2 focus:bg-primary/10 focus:text-primary transition-colors" onClick={() => onEditClick(job)}>
                              <Edit2 className="h-4 w-4" /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive gap-2 focus:bg-destructive/10 focus:text-destructive transition-colors" onClick={() => handleArchiveJob(job)}>
                              <Archive className="h-4 w-4" /> Archive Position
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-muted-foreground flex flex-col gap-4 items-center justify-center min-h-[40vh]">
                <Layers className="h-10 w-10 opacity-30 mx-auto" />
                <p>No active positions. Create a new job to get started.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
