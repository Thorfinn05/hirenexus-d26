"use client"

import * as React from "react"
import {
  FileText,
  Search,
  MoreHorizontal,
  ArrowUpRight,
  Filter,
  Download,
  Share2,
  Trash2,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"

export default function ReportsListPage() {
  const { user } = useUser()
  const db = useFirestore()
  const router = useRouter()

  const reportsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null
    return query(collection(db, "users", user.uid, "evaluations"), orderBy("createdAt", "desc"))
  }, [db, user?.uid])

  const { data: reports, isLoading } = useCollection(reportsQuery)

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline text-foreground">Consensus Reports</h2>
          <p className="text-muted-foreground text-sm font-medium mt-1">
            Access final synthesized hiring recommendations from your AI panels.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 border-border/60">
            <Download className="h-4 w-4" />
            Bulk Export
          </Button>
        </div>
      </div>

      <Card className="glass-panel overflow-hidden border border-border/50 shadow-lg">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border/40 flex items-center justify-between gap-4 bg-muted/10">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates or roles..."
                className="pl-9 bg-card/50 border-border/40 focus-visible:ring-1 focus-visible:ring-primary/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="text-muted-foreground gap-2 border-border/60">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {isLoading ? (
              <div className="col-span-full py-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              </div>
            ) : reports && reports.length > 0 ? (
              reports.map((report, i) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <Card 
                    className="glass-panel overflow-hidden group hover:border-primary/40 transition-all h-full flex flex-col cursor-pointer border border-border/50 shadow-sm hover:shadow-md" 
                    onClick={() => router.push(`/reports/${report.candidateId}`)}
                  >
                    <CardContent className="p-6 flex-1 flex flex-col gap-5 bg-gradient-to-br from-transparent to-muted/5 group-hover:to-primary/5 transition-all duration-500">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-4">
                          <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 transition-colors group-hover:bg-primary/20">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="font-bold text-lg tracking-tight line-clamp-1 group-hover:text-primary transition-colors" title={report.candidateName}>{report.candidateName}</span>
                            <span className="text-xs text-muted-foreground mt-0.5 line-clamp-1">Synthesized Review</span>
                          </div>
                        </div>
                        <div className="p-1.5 rounded-full bg-muted/30 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowUpRight className="h-3.5 w-3.5 text-primary" />
                        </div>
                      </div>
                      
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">AI Confidence Level</span>
                          <span className="text-sm font-black text-primary font-code">{report.confidenceScore}%</span>
                        </div>
                        <Progress value={report.confidenceScore} className="h-1.5 bg-muted border-none overflow-hidden" />
                      </div>
                      
                      <div className="pt-4 border-t border-border/40 flex items-center justify-between mt-auto">
                        <Badge variant="outline" className="bg-emerald-500/5 text-emerald-500 border-emerald-500/20 text-[10px] uppercase font-bold tracking-wider px-2 h-5">
                          Consensus Reached
                        </Badge>
                         <span className="text-[11px] font-medium text-muted-foreground/80 flex items-center gap-1">
                          {report.createdAt?.toDate ? report.createdAt.toDate().toLocaleDateString() : '—'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
               <div className="col-span-full py-16 text-center text-muted-foreground flex flex-col items-center gap-4">
                 <div className="p-4 rounded-full bg-muted/30 border border-border/40">
                   <FileText className="h-8 w-8 text-foreground/20" />
                 </div>
                 <p className="font-medium">No consensus reports finalized yet.</p>
               </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
