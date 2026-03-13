
"use client"

import * as React from "react"
import { 
  Plus, 
  Search, 
  MoreHorizontal,
  ArrowUpRight,
  Filter,
  Loader2,
  Briefcase,
  History,
  Archive
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { motion } from "framer-motion"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"

function ScoreCircle({ score }: { score: number }) {
  const radius = 16
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const getColor = (s: number) => {
    if (s >= 80) return "stroke-emerald-400"
    if (s >= 60) return "stroke-orange-400"
    return "stroke-destructive"
  }
  return (
    <div className="relative h-10 w-10 flex items-center justify-center">
      <svg className="h-full w-full -rotate-90">
        <circle cx="20" cy="20" r={radius} className="stroke-muted fill-none" strokeWidth="3" />
        <motion.circle 
          cx="20" cy="20" r={radius} 
          className={`fill-none ${getColor(score)}`} 
          strokeWidth="3" 
          strokeDasharray={circumference} 
          strokeLinecap="round" 
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <span className="absolute text-[10px] font-bold">{score}</span>
    </div>
  )
}

export default function EvaluationsPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const [isAssignRoleOpen, setIsAssignRoleOpen] = React.useState(false)
  const [selectedEval, setSelectedEval] = React.useState<any>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [newRole, setNewRole] = React.useState("")

  const evalsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null
    return query(collection(db, "users", user.uid, "evaluations"), orderBy("createdAt", "desc"))
  }, [db, user?.uid])

  const jobsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null
    return query(collection(db, "users", user.uid, "jobDescriptions"), orderBy("title"))
  }, [db, user?.uid])

  const { data: evaluations, isLoading } = useCollection(evalsQuery)
  const { data: jobs } = useCollection(jobsQuery)

  const onAssignRoleClick = (evalItem: any) => {
    setSelectedEval(evalItem)
    setNewRole("")
    setIsAssignRoleOpen(true)
  }

  const handleAssignRole = async () => {
    if (!db || !user?.uid || !selectedEval || !newRole) return

    setIsSubmitting(true)
    try {
      // Find the job title for the selected role ID
      const job = jobs?.find(j => j.id === newRole);
      if (!job) return;

      // Update the candidate's target role
      const candidateRef = doc(db, "users", user.uid, "candidates", selectedEval.candidateId)
      await updateDoc(candidateRef, { role: job.title })
      
      toast({ title: "Role Assigned", description: `Candidate target role updated to ${job.title}.` })
      setIsAssignRoleOpen(false)
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update role." })
    } finally { setIsSubmitting(false) }
  }

  const handleArchiveEval = async (evalItem: any) => {
    if (!db || !user?.uid) return
    if (!confirm("Are you sure you want to archive this evaluation?")) return

    try {
      await deleteDoc(doc(db, "users", user.uid, "evaluations", evalItem.id))
      toast({ title: "Evaluation Archived", description: "Result has been removed from view." })
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to archive evaluation." })
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">Evaluations</h2>
          <p className="text-muted-foreground text-sm font-medium mt-1">{evaluations?.length || 0} total evaluations</p>
        </div>
        <Button asChild className="gap-2 bg-primary text-primary-foreground font-bold px-6">
          <Link href="/candidates"><Plus className="h-4 w-4" /> New Evaluation</Link>
        </Button>
      </div>

      <Dialog open={isAssignRoleOpen} onOpenChange={setIsAssignRoleOpen}>
        <DialogContent className="border-border/40 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>Assign Job Role</DialogTitle>
            <DialogDescription>Retarget {selectedEval?.candidateName} for a different open position.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Select New Position</Label>
              <Select onValueChange={setNewRole}>
                <SelectTrigger className="bg-muted/20 border-border/40">
                  <SelectValue placeholder="Choose a job profile" />
                </SelectTrigger>
                <SelectContent>
                  {jobs?.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title} <span className="text-[10px] opacity-50 ml-1">({job.department})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAssignRoleOpen(false)}>Cancel</Button>
            <Button onClick={handleAssignRole} disabled={isSubmitting || !newRole} className="font-bold">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Assign Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="border-border/40 bg-card/40 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border/40 flex items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search candidates..." className="pl-9 bg-muted/40 border-none" />
            </div>
          </div>
          
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-muted/5">
            {isLoading ? (
              <div className="col-span-full py-12 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : evaluations && evaluations.length > 0 ? (
              evaluations.map((evalItem, i) => (
                <motion.div
                  key={evalItem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                >
                  <Card className="glass-panel hover:bg-muted/10 transition-colors overflow-hidden group">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg tracking-tight mb-1">{evalItem.candidateName}</h3>
                          <span className="text-sm font-medium text-muted-foreground">{evalItem.createdAt?.toDate ? evalItem.createdAt.toDate().toLocaleDateString() : '—'}</span>
                        </div>
                        <ScoreCircle score={evalItem.confidenceScore} />
                      </div>
                      
                      <div className="mb-6">
                        <span className="text-[11px] font-black uppercase tracking-wider text-primary">{evalItem.recommendation?.substring(0, 50)}...</span>
                      </div>
                      
                      <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-auto">
                        <Button variant="ghost" size="sm" asChild className="h-8 group-hover:bg-primary/10 transition-colors">
                          <Link href={`/reports/${evalItem.candidateId}`} className="text-xs font-semibold gap-1">
                            View Report <ArrowUpRight className="h-3 w-3" />
                          </Link>
                        </Button>
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 glass-panel">
                            <DropdownMenuLabel>AI Panel Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/reports/${evalItem.candidateId}`} className="flex items-center gap-2">
                                <ArrowUpRight className="h-4 w-4" /> View Full Report
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2" onClick={() => onAssignRoleClick(evalItem)}>
                              <Briefcase className="h-4 w-4" /> Assign Job Role
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/evaluate/${evalItem.candidateId}`} className="flex items-center gap-2">
                                <History className="h-4 w-4" /> Re-run Deliberation
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border/40" />
                            <DropdownMenuItem className="text-destructive gap-2" onClick={() => handleArchiveEval(evalItem)}>
                              <Archive className="h-4 w-4" /> Archive Result
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
                <div className="col-span-full py-12 text-center text-muted-foreground">
                    No evaluations found.
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
