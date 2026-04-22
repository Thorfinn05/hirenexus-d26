"use client";

import * as React from "react";
import { Suspense } from "react";
import { motion, type Variants } from "framer-motion";
import { useUser, useFirestore } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Loader2, ArrowLeft, RefreshCw, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SkillGapDashboard } from "@/components/skill-gap-dashboard";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { History } from "lucide-react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
};

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
      <div className="flex flex-col h-screen items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary/60" />
        <p className="text-xs text-muted-foreground">Loading analysis data…</p>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="flex flex-col h-screen items-center justify-center gap-6 max-w-sm mx-auto text-center px-6">
        <div className="h-16 w-16 rounded-xl bg-rose-500/10 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-rose-400/80" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground/95">No Analysis Found</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You haven't run a resume analysis yet. The hiring panel needs to review your profile first.
          </p>
        </div>
        <Button asChild className="w-full h-10 bg-primary/90 hover:bg-primary text-primary-foreground font-medium text-sm rounded-lg">
          <Link href="/candidate/resume-analysis">Go to Resume Analysis</Link>
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen space-y-6 pb-16 max-w-7xl mx-auto"
    >
      <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/[0.04]">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon" className="rounded-lg h-8 w-8 hover:bg-white/[0.04]">
              <Link href="/candidate/resume-analysis"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground/95">Growth Roadmap</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-11">
            Targeting <span className="text-primary font-medium">{targetRole}</span>
          </p>
        </div>

        <Button 
          onClick={generateReport} 
          disabled={isGenerating}
          variant="outline"
          className="h-10 border-white/[0.08] hover:bg-white/[0.04] rounded-lg gap-2 px-5 text-sm font-medium ml-11 md:ml-0"
        >
          {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          {report ? "Regenerate Roadmap" : "Generate Roadmap"}
        </Button>
      </motion.header>

      {isGenerating && !report && (
        <div className="flex flex-col h-[50vh] items-center justify-center gap-5 text-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-2 border-primary/15 border-t-primary/60 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary/60 animate-pulse" />
            </div>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-semibold text-foreground/90">Crafting your career path…</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              AI models are analyzing gap areas and curating the best resources.
            </p>
          </div>
        </div>
      )}

      {!report && !isGenerating && (
        <motion.div variants={itemVariants} className="flex flex-col h-[50vh] items-center justify-center gap-6 text-center liquid-glass rounded-2xl p-12">
          <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-primary/70" />
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-foreground/95">Ready for a transformation?</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Generate a visual skill gap chart, multi-phase learning roadmap, and curated resources.
            </p>
            <Button 
              onClick={generateReport}
              className="h-11 px-8 bg-primary/90 hover:bg-primary text-primary-foreground font-medium rounded-lg text-sm transition-all duration-300 hover:shadow-[0_0_30px_-6px_hsl(var(--primary)_/_0.4)]"
            >
              Generate My Roadmap
            </Button>
          </div>
        </motion.div>
      )}

      {report && !isGenerating && (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_260px] gap-6 items-start">
          <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <SkillGapDashboard report={report} />
          </motion.div>

          <aside className="space-y-4 xl:sticky xl:top-8">
            <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground/60">
              <History className="h-3.5 w-3.5" /> Roadmap History
            </div>
            <div className="space-y-2">
              {analysisHistory.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setHistoryIdx(idx);
                    router.push(`${pathname}?idx=${idx}`, { scroll: false });
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all duration-300 relative group overflow-hidden ${
                    historyIdx === idx
                      ? 'liquid-glass-elevated border-primary/15'
                      : 'bg-white/[0.02] border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.04]'
                  }`}
                >
                  {historyIdx === idx && (
                    <motion.div 
                      layoutId="active-history-skill"
                      className="absolute inset-y-0 left-0 w-[2px] bg-primary rounded-full"
                    />
                  )}
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-[10px] font-medium uppercase tracking-wider ${historyIdx === idx ? 'text-primary/80' : 'text-muted-foreground/50'}`}>
                      {idx === 0 ? 'Latest' : 'Previous'}
                    </span>
                  </div>
                  <h4 className={`font-medium text-sm mb-1 ${historyIdx === idx ? 'text-foreground/90' : 'text-muted-foreground/70'}`}>{item.targetRole}</h4>
                  <span className="text-[10px] text-muted-foreground/40">{new Date(item.timestamp).toLocaleDateString()}</span>
                </button>
              ))}
            </div>
          </aside>
        </div>
      )}
    </motion.div>
  );
}
