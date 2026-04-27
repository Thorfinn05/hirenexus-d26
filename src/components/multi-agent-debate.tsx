"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, MessagesSquare, BarChart, ChevronDown, CheckCircle, 
  AlertTriangle, Lightbulb, Target, ArrowRight, TrendingUp, 
  FileText, ShieldCheck, Zap, Award, Quote
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Simple markdown formatter for **bold** text
const formatMarkdown = (text: string) => {
  if (!text) return "";
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="text-foreground font-bold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const AGENT_THEMES: Record<string, { color: string, border: string, bg: string, iconBg: string }> = {
  "Tech Lead": { color: "text-blue-400", border: "border-blue-500/30", bg: "bg-blue-500/5", iconBg: "bg-blue-500/20" },
  "HR Manager": { color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/5", iconBg: "bg-emerald-500/20" },
  "Product Manager": { color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/5", iconBg: "bg-amber-500/20" },
  "Engineering Manager": { color: "text-pink-400", border: "border-pink-500/30", bg: "bg-pink-500/5", iconBg: "bg-pink-500/20" },
  "CTO": { color: "text-violet-400", border: "border-violet-500/30", bg: "bg-violet-500/5", iconBg: "bg-violet-500/20" },
  "Default": { color: "text-purple-400", border: "border-purple-500/30", bg: "bg-purple-500/5", iconBg: "bg-purple-500/20" }
};

export function MultiAgentDebate({ data, historyIndex = 0 }: { data: any, historyIndex?: number }) {
  const [activeTab, setActiveTab] = useState<'analyses' | 'debate' | 'consensus'>('analyses');
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  if (!data) return null;

  return (
    <div className="space-y-8 w-full max-w-5xl mx-auto px-4 sm:px-6">
      {/* Premium Tab Navigation */}
      <div className="flex gap-2 p-1.5 bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-x-auto no-scrollbar">
        {[
          { id: 'analyses', label: 'Agent Analyses', icon: Users, color: 'text-blue-400' },
          { id: 'debate', label: 'Panel Debate', icon: MessagesSquare, color: 'text-purple-400' },
          { id: 'consensus', label: 'Final Verdict', icon: BarChart, color: 'text-emerald-400' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`relative min-w-[140px] flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-bold transition-all duration-500 outline-none ${
              activeTab === tab.id
                ? 'text-white'
                : 'text-muted-foreground hover:text-white hover:bg-white/10'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="active-tab-glow"
                className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/5 to-accent/20 rounded-xl border border-white/10 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]"
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              />
            )}
            <tab.icon className={`h-4.5 w-4.5 relative z-10 transition-colors duration-500 ${activeTab === tab.id ? tab.color : 'opacity-70'}`} />
            <span className="relative z-10 tracking-tight">{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Individual Analyses */}
        {activeTab === 'analyses' && (
          <motion.div
            key="analyses"
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -30, filter: "blur(10px)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-5"
          >
            <div className="flex items-center justify-between mb-2 px-2">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-bold tracking-tight">Agent Individual Scores</h3>
              </div>
              <Badge variant="outline" className="bg-blue-400/10 text-blue-400 border-blue-400/30">
                5 Active Personas
              </Badge>
            </div>
            {data.individualAnalyses?.map((analysis: any, idx: number) => (
              <AgentCard
                key={analysis.agentId || idx}
                analysis={analysis}
                expanded={expandedAgent === analysis.agentId}
                onToggle={() => setExpandedAgent(
                  expandedAgent === analysis.agentId ? null : analysis.agentId
                )}
                delay={idx * 0.08}
              />
            ))}
          </motion.div>
        )}

        {/* Debate Transcript */}
        {activeTab === 'debate' && (
          <motion.div
            key="debate"
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -30, filter: "blur(10px)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4 p-8 bg-white/[0.03] backdrop-blur-xl rounded-3xl border border-white/10 mb-2 relative overflow-hidden">
               <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
               <div className="h-14 w-14 rounded-2xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30 shadow-lg shadow-purple-500/10">
                <MessagesSquare className="h-7 w-7 text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-2xl font-headline tracking-tight">Agent Deliberation Room</h3>
                <p className="text-muted-foreground">Specialized personas debating your technical and cultural alignment.</p>
              </div>
            </div>

            <div className="space-y-4 px-2 sm:px-4">
              {data.debate?.map((message: any, idx: number) => (
                <DebateMessage key={idx} message={message} delay={idx * 0.12} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Consensus Report */}
        {activeTab === 'consensus' && (
          <motion.div
            key="consensus"
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <ConsensusReport consensus={data.consensus} historyIndex={historyIndex} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AgentCard({ analysis, expanded, onToggle, delay }: { analysis: any, expanded: boolean, onToggle: () => void, delay: number }) {
  const getScoreColorInfo = (score: number) => {
    if (score >= 80) return { text: 'text-emerald-400', from: 'from-emerald-400', border: 'border-emerald-400/30', bg: 'bg-emerald-400/10', glow: 'shadow-emerald-400/20' };
    if (score >= 60) return { text: 'text-amber-400', from: 'from-amber-400', border: 'border-amber-400/30', bg: 'bg-amber-400/10', glow: 'shadow-amber-400/20' };
    return { text: 'text-rose-400', from: 'from-rose-400', border: 'border-rose-400/30', bg: 'bg-rose-400/10', glow: 'shadow-rose-400/20' };
  };

  const colors = getScoreColorInfo(analysis.score);
  
  // Robust theme selection based on role or name keywords
  const getTheme = (role?: string, name?: string) => {
    const searchString = `${role || ''} ${name || ''}`.toLowerCase();
    if (searchString.includes('tech lead') || searchString.includes('marcus')) return AGENT_THEMES["Tech Lead"];
    if (searchString.includes('hr') || searchString.includes('human resources') || searchString.includes('sarah')) return AGENT_THEMES["HR Manager"];
    if (searchString.includes('product') || searchString.includes('alex')) return AGENT_THEMES["Product Manager"];
    if (searchString.includes('engineering manager') || searchString.includes('elena')) return AGENT_THEMES["Engineering Manager"];
    if (searchString.includes('cto') || searchString.includes('chief technology') || searchString.includes('leo')) return AGENT_THEMES["CTO"];
    return AGENT_THEMES.Default;
  };

  const theme = getTheme(analysis.role, analysis.agentName);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
    >
      <Card 
        className={`bg-white/[0.04] backdrop-blur-xl overflow-hidden transition-all duration-500 border-white/10 hover:border-white/20 ${
          expanded ? 'ring-1 ring-primary/40 shadow-[0_0_40px_-10px_rgba(var(--primary-rgb),0.2)]' : 'hover:bg-white/[0.08]'
        }`}
      >
        <div 
          className="p-6 flex items-center justify-between cursor-pointer group select-none"
          onClick={onToggle}
        >
          <div className="flex items-center gap-5">
            <div className="relative group-hover:scale-105 transition-transform duration-500">
              <div className={`w-16 h-16 ${theme.iconBg} rounded-2xl flex items-center justify-center text-2xl font-black ${theme.color} border ${theme.border} shadow-inner`}>
                {analysis.agentName[0]}
              </div>
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center">
                 <Zap className={`h-3 w-3 ${theme.color}`} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xl font-headline tracking-tight">{analysis.agentName}</h3>
                {analysis.score >= 90 && <ShieldCheck className="h-4 w-4 text-emerald-400" />}
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground/80">{analysis.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="hidden sm:flex flex-col items-end">
              <div className="flex items-baseline gap-0.5">
                <span className={`text-4xl font-black ${colors.text} tracking-tighter`}>{analysis.score}</span>
                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">/ 100</span>
              </div>
              <div className="h-1.5 w-24 bg-white/10 rounded-full mt-2 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${analysis.score}%` }}
                  transition={{ delay: delay + 0.5, duration: 1, ease: "easeOut" }}
                  className={`h-full bg-gradient-to-r ${colors.from} to-white/40 rounded-full`}
                />
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all border border-white/5">
              <motion.div 
                animate={{ rotate: expanded ? 180 : 0 }} 
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} 
                className={expanded ? 'text-primary' : 'text-muted-foreground'}
              >
                <ChevronDown className="h-6 w-6" />
              </motion.div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-white/10"
            >
              <div className="p-8 space-y-8 bg-gradient-to-b from-white/[0.02] to-transparent">
                {/* Detailed Analysis */}
                <div className="relative">
                  <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/50 to-transparent rounded-full" />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80 mb-4 flex items-center gap-2">
                    <Quote className="h-3 w-3" /> Professional Evaluation
                  </h4>
                  <p className="text-foreground/90 leading-relaxed text-[15px] font-medium tracking-tight">
                    {analysis.analysis}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <div className="bg-emerald-500/[0.07] rounded-2xl p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-emerald-400 mb-4 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" /> Distinguished Assets
                    </h4>
                    <ul className="space-y-3">
                      {analysis.strengths.map((s: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-foreground/80">
                          <div className="mt-1.5 h-1 w-3 bg-emerald-500/40 rounded-full shrink-0" />
                          <span className="font-medium tracking-tight">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="bg-rose-500/[0.07] rounded-2xl p-6 border border-rose-500/20 hover:border-rose-500/40 transition-colors">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-rose-400 mb-4 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" /> Optimization Gaps
                    </h4>
                    <ul className="space-y-3">
                      {analysis.weaknesses.map((w: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-foreground/80">
                          <div className="mt-1.5 h-1 w-3 bg-rose-500/40 rounded-full shrink-0" />
                          <span className="font-medium tracking-tight">{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-white/[0.05] rounded-2xl p-6 border border-white/10 relative group overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-colors" />
                  <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-white mb-5 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-primary" /> Tactical Strategy
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {analysis.recommendations.map((r: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 p-4 bg-white/[0.03] rounded-xl text-[13px] font-medium text-foreground/80 border border-white/10 hover:bg-white/[0.05] hover:border-white/20 transition-all">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.6)]" />
                        {r}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

function DebateMessage({ message, delay }: { message: any, delay: number }) {
  // Robust theme selection based on role or name keywords
  const getTheme = (role?: string, name?: string) => {
    const searchString = `${role || ''} ${name || ''}`.toLowerCase();
    if (searchString.includes('tech') || searchString.includes('marcus')) return AGENT_THEMES["Tech Lead"];
    if (searchString.includes('hr') || searchString.includes('human') || searchString.includes('sarah')) return AGENT_THEMES["HR Manager"];
    if (searchString.includes('product') || searchString.includes('alex')) return AGENT_THEMES["Product Manager"];
    if (searchString.includes('engineering') || searchString.includes('elena') || searchString.includes('manager')) return AGENT_THEMES["Engineering Manager"];
    if (searchString.includes('cto') || searchString.includes('chief') || searchString.includes('leo')) return AGENT_THEMES["CTO"];
    return AGENT_THEMES.Default;
  };

  const theme = getTheme(message.agentRole, message.agentName);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex gap-4 relative group"
    >
      {/* Agent Avatar */}
      <div className="shrink-0 pt-1">
        <div className={`w-12 h-12 ${theme.iconBg.replace('/20', '/40')} rounded-2xl flex items-center justify-center text-lg font-black ${theme.color} border ${theme.border.replace('/30', '/60')} shadow-lg shadow-black/40 group-hover:scale-110 transition-transform duration-500 relative overflow-hidden`}>
          <div className={`absolute inset-0 ${theme.bg.replace('/5', '/20')} opacity-50`} />
          <span className="relative z-10">{message.agentName[0]}</span>
        </div>
      </div>

      {/* Message Bubble */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2.5">
          <span className="font-bold text-[15px] tracking-tight text-white/90">{message.agentName}</span>
          <Badge variant="outline" className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border-none ${theme.bg.replace('/5', '/20')} ${theme.color} shadow-sm shadow-black/20`}>
            {message.type}
          </Badge>
        </div>
        
        <div className={`${theme.bg.replace('/5', '/12')} backdrop-blur-md p-5 rounded-2xl rounded-tl-none border ${theme.border.replace('/30', '/60')} group-hover:border-white/40 transition-all duration-500 shadow-xl shadow-black/20`}>
          <div className="text-[14px] sm:text-[15px] leading-relaxed text-foreground/90 tracking-tight font-medium">
            {formatMarkdown(message.message)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ConsensusReport({ consensus, historyIndex }: { consensus: any, historyIndex: number }) {
  if (!consensus) return null;
  
  return (
    <div className="space-y-8">
      {/* Executive Summary Card */}
      <Card className="bg-white/[0.05] backdrop-blur-2xl relative overflow-hidden border-emerald-500/30 shadow-[0_0_80px_-10px_rgba(16,185,129,0.1)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none" />
        
        <CardContent className="p-8 sm:p-12 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-emerald-500" />
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-400">Official Consensus Verdict</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold font-headline tracking-tighter leading-tight">The Committee’s Final Decision</h2>
              <p className="text-foreground/80 leading-relaxed text-lg font-medium max-w-2xl">
                {consensus.consensusNarrative || "The multi-agent committee has concluded its deliberation. We've synthesized all technical, leadership, and product perspectives into this executive verdict."}
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                 <div className="flex items-center gap-2 bg-emerald-500/15 px-4 py-2 rounded-full border border-emerald-500/30">
                    <Award className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400">Verified by 5 Agents</span>
                 </div>
                 <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
                    <BarChart className="h-4 w-4 text-white/80" />
                    <span className="text-xs font-bold text-white/80">Cross-Referenced</span>
                 </div>
              </div>
            </div>
            
            <div className="relative group shrink-0">
              <div className="absolute inset-0 bg-emerald-500/15 rounded-3xl blur-2xl group-hover:bg-emerald-500/25 transition-colors duration-500" />
              <div className="relative flex flex-col items-center justify-center p-10 bg-black/40 backdrop-blur-md rounded-[2.5rem] border border-emerald-500/30 min-w-[240px] shadow-2xl">
                <span className="text-[11px] uppercase tracking-[0.2em] font-black text-emerald-500/60 mb-3">Expert Match Rate</span>
                <div className="text-7xl font-black text-white tracking-tighter flex items-start">
                  {consensus.overallScore}
                  <span className="text-2xl mt-3 text-emerald-500/60">%</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full mt-6 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${consensus.overallScore}%` }}
                    transition={{ delay: 0.5, duration: 1.5, ease: "circOut" }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Consensus Strengths */}
        <Card className="bg-white/[0.05] backdrop-blur-xl p-8 border-emerald-500/20 hover:border-emerald-500/40 transition-all group">
          <h3 className="text-sm font-black uppercase tracking-[0.15em] text-emerald-400 flex items-center gap-3 mb-8">
            <CheckCircle className="h-5 w-5" /> Executive Highlights
          </h3>
          <ul className="space-y-5">
            {consensus.strengths?.map((s: string, i: number) => (
              <li key={i} className="flex gap-4 group/item">
                <div className="h-6 w-6 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0 mt-0.5 group-hover/item:bg-emerald-500/25 transition-colors">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                </div>
                <span className="text-foreground/90 font-medium tracking-tight leading-relaxed">{s}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Consensus Weaknesses */}
        <Card className="bg-white/[0.05] backdrop-blur-xl p-8 border-amber-500/20 hover:border-amber-500/40 transition-all group">
          <h3 className="text-sm font-black uppercase tracking-[0.15em] text-amber-400 flex items-center gap-3 mb-8">
            <Target className="h-5 w-5" /> Strategic Focus Areas
          </h3>
          <ul className="space-y-5">
            {consensus.weaknesses?.map((w: string, i: number) => (
              <li key={i} className="flex gap-4 group/item">
                <div className="h-6 w-6 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0 mt-0.5 group-hover/item:bg-amber-500/25 transition-colors">
                  <div className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                </div>
                <span className="text-foreground/90 font-medium tracking-tight leading-relaxed">{w}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Roadmap Call to Action */}
      <Card className="relative overflow-hidden group border-white/10 bg-white/[0.03]">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/10 opacity-50" />
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/25 rounded-full blur-[100px] opacity-25 pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-accent/25 rounded-full blur-[100px] opacity-25 pointer-events-none" />
        
        <CardContent className="p-10 sm:p-16 flex flex-col items-center text-center gap-10 relative z-10">
          <div className="h-24 w-24 rounded-[2rem] bg-gradient-to-br from-primary/40 to-accent/30 flex items-center justify-center border border-white/20 shadow-2xl group-hover:scale-110 transition-transform duration-700 ease-out">
            <TrendingUp className="h-12 w-12 text-primary drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-3xl sm:text-4xl font-bold font-headline tracking-tighter">Skill Gap & Accelerated Roadmap</h3>
            <p className="text-foreground/80 max-w-xl mx-auto text-lg leading-relaxed font-medium">
              We’ve prepared a personalized curriculum based on your committee report. 
              Visualize your path from <span className="text-white">current proficiency</span> to <span className="text-primary font-bold">role mastery</span>.
            </p>
          </div>
          
          <Button asChild size="lg" className="h-16 px-12 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl shadow-[0_20px_50px_-15px_rgba(var(--primary-rgb),0.4)] hover:shadow-[0_25px_60px_-10px_rgba(var(--primary-rgb),0.5)] hover:-translate-y-1 transition-all duration-300 gap-4 group">
            <Link href={`/candidate/skill-gap?idx=${historyIndex}`}>
              Launch My Roadmap <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform duration-500" />
            </Link>
          </Button>
          
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 pt-4 border-t border-white/10 w-full opacity-60 text-[11px] font-black uppercase tracking-[0.2em]">
             <div className="flex items-center gap-2"><Zap className="h-3.5 w-3.5 text-emerald-400" /> Gap Analysis</div>
             <div className="flex items-center gap-2"><Zap className="h-3.5 w-3.5 text-purple-400" /> Adaptive Timeline</div>
             <div className="flex items-center gap-2"><Zap className="h-3.5 w-3.5 text-blue-400" /> Resource Hub</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
