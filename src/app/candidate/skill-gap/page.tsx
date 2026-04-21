"use client";

import * as React from "react";
import { Suspense } from "react";
import { motion } from "framer-motion";
import { useUser, useFirestore } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Loader2, ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SkillGapDashboard } from "@/components/skill-gap-dashboard";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { History } from "lucide-react";

export default function SkillGapPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [historyIdx, setHistoryIdx] = React.useState(parseInt(searchParams.get("idx") || "0"));

  const [isLoading, setIsLoading] = React.useState(true);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [analysisHistory, setAnalysisHistory] = React.useState<any[]>([]);
  const [analysisData, setAnalysisData] = React.useState<any>(null);
  const [report, setReport] = React.useState<any>(null);
  const [targetRole, setTargetRole] = React.useState("");
  const [resumeText, setResumeText] = React.useState("");

  React.useEffect(() => {
    if (isUserLoading || !user || !db) return;

    const fetchData = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          const history = data.analysisHistory || [];
          setAnalysisHistory(history);
          
          const selectedAnalysis = history[historyIdx];
          if (selectedAnalysis) {
            setTargetRole(selectedAnalysis.targetRole || "Software Engineer");
            setResumeText(data.resumeText || "");
            setAnalysisData(selectedAnalysis.analysisData);
            if (selectedAnalysis.analysisData.consensus?.skillGapReport) {
              setReport(selectedAnalysis.analysisData.consensus.skillGapReport);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, isUserLoading, db, historyIdx]);

  const generateReport = async () => {
    if (!analysisData) {
      toast({ variant: "destructive", title: "No Analysis Found", description: "Please run a resume analysis first." });
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysisData,
          targetRole,
          resumeText,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReport(data.report);
        
        // Save back to Firestore at the correct history index
        if (user && db) {
          const docRef = doc(db, "users", user.uid);
          const updatedHistory = [...analysisHistory];
          if (updatedHistory[historyIdx]) {
            updatedHistory[historyIdx] = {
              ...updatedHistory[historyIdx],
              analysisData: {
                ...updatedHistory[historyIdx].analysisData,
                consensus: {
                    ...updatedHistory[historyIdx].analysisData.consensus,
                    skillGapReport: data.report
                }
              }
            };
            await updateDoc(docRef, { analysisHistory: updatedHistory });
            setAnalysisHistory(updatedHistory);
          }
        }
        
        toast({ title: "Roadmap Generated", description: "Your interactive skill gap analysis is ready." });
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "Generation Failed", description: e.message });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isUserLoading || isLoading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading analysis data...</p>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="flex flex-col h-screen items-center justify-center gap-6 max-w-md mx-auto text-center px-6">
        <div className="h-20 w-20 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
            <AlertCircle className="h-10 w-10 text-rose-500" />
        </div>
        <div className="space-y-2">
            <h2 className="text-2xl font-bold">No Analysis Found</h2>
            <p className="text-muted-foreground leading-relaxed">
                You haven't run a resume analysis yet. Our hiring panel needs to review your profile before we can generate a personalized skill gap roadmap.
            </p>
        </div>
        <Button asChild className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20">
            <Link href="/candidate/resume-analysis">Go to Resume Analysis</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-8 pb-20 max-w-7xl mx-auto px-4 md:px-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-8 border-b border-white/5">
        <div className="space-y-1">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon" className="rounded-full hover:bg-white/5">
                <Link href="/candidate/resume-analysis"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <h1 className="text-4xl font-bold font-headline tracking-tight">Growth Roadmap</h1>
          </div>
          <p className="text-muted-foreground flex items-center gap-2 ml-14">
             Targeting <span className="text-primary font-bold">{targetRole}</span>
          </p>
        </div>

        <div className="flex items-center gap-4 ml-14 md:ml-0">
            <Button 
                onClick={generateReport} 
                disabled={isGenerating}
                variant="outline"
                className="h-12 border-primary/20 hover:bg-primary/5 rounded-xl gap-2 px-6"
            >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                {report ? "Regenerate Roadmap" : "Generate Roadmap"}
            </Button>
        </div>
      </header>

      {isGenerating && !report && (
        <div className="flex flex-col h-[60vh] items-center justify-center gap-6 text-center">
            <div className="relative">
                <div className="h-24 w-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <RefreshCw className="h-8 w-8 text-primary animate-pulse" />
                </div>
            </div>
            <div className="space-y-2">
                <h3 className="text-2xl font-bold">Crafting your career path...</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                    Our AI models are analyzing gap areas and searching for the best resources to close them.
                </p>
            </div>
        </div>
      )}

      {!report && !isGenerating && (
        <div className="flex flex-col h-[50vh] items-center justify-center gap-8 text-center bg-gradient-to-br from-primary/10 via-transparent to-accent/5 rounded-3xl border border-white/5 p-12">
            <div className="h-20 w-20 rounded-3xl bg-primary/20 flex items-center justify-center border border-primary/30 rotate-12">
                <RefreshCw className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-4">
                <h3 className="text-3xl font-bold font-headline">Ready for a transformation?</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                    Click the button to generate a visual skill gap chart, a multi-phase learning roadmap, and curated resources specifically for you.
                </p>
                <Button 
                    onClick={generateReport}
                    className="h-14 px-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-2xl shadow-primary/30 text-lg"
                >
                    Generate My Roadmap
                </Button>
            </div>
        </div>
      )}

      {report && !isGenerating && (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SkillGapDashboard report={report} />
          </motion.div>

          <aside className="space-y-6 xl:sticky xl:top-8">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">
              <History className="h-4 w-4" /> Roadmap History
            </div>
            <div className="space-y-3">
              {analysisHistory.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setHistoryIdx(idx);
                    router.push(`${pathname}?idx=${idx}`, { scroll: false });
                  }}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 relative group overflow-hidden ${
                    historyIdx === idx
                      ? 'bg-primary/10 border-primary/40 shadow-lg'
                      : 'bg-background/40 border-border/40 hover:border-primary/20 hover:bg-background/60'
                  }`}
                >
                  {historyIdx === idx && (
                    <motion.div 
                      layoutId="active-history-skill"
                      className="absolute inset-y-0 left-0 w-1 bg-primary"
                    />
                  )}
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-tighter ${historyIdx === idx ? 'text-primary' : 'text-muted-foreground'}`}>
                      {idx === 0 ? 'Latest' : 'Previous'}
                    </span>
                  </div>
                  <h4 className="font-bold text-foreground mb-1 pr-4">{item.targetRole}</h4>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                  </div>
                </button>
              ))}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
