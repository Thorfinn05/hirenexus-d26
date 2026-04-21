"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, MessagesSquare, BarChart, ChevronDown, CheckCircle, AlertTriangle, Lightbulb, Target, ArrowRight, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import Link from "next/link";

export function MultiAgentDebate({ data, historyIndex = 0 }: { data: any, historyIndex?: number }) {
  const [activeTab, setActiveTab] = useState<'analyses' | 'debate' | 'consensus'>('analyses');
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  if (!data) return null;

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Premium Tab Navigation */}
      <div className="flex gap-2 p-1 bg-background/50 backdrop-blur-md rounded-2xl border border-border/50 shadow-inner">
        {[
          { id: 'analyses', label: 'Individual Analyses', icon: Users, color: 'text-blue-400' },
          { id: 'debate', label: 'Panel Debate', icon: MessagesSquare, color: 'text-purple-400' },
          { id: 'consensus', label: 'Final Consensus', icon: BarChart, color: 'text-emerald-400' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`relative flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-foreground/5 shadow-md shadow-black/20 text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <tab.icon className={`h-4 w-4 relative z-10 ${activeTab === tab.id ? tab.color : ''}`} />
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Individual Analyses */}
        {activeTab === 'analyses' && (
          <motion.div
            key="analyses"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {data.individualAnalyses?.map((analysis: any, idx: number) => (
              <AgentCard
                key={analysis.agentId || idx}
                analysis={analysis}
                expanded={expandedAgent === analysis.agentId}
                onToggle={() => setExpandedAgent(
                  expandedAgent === analysis.agentId ? null : analysis.agentId
                )}
                delay={idx * 0.1}
              />
            ))}
          </motion.div>
        )}

        {/* Debate Transcript */}
        {activeTab === 'debate' && (
          <motion.div
            key="debate"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4 p-6 bg-background/40 backdrop-blur-md rounded-2xl border border-border/50"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                <MessagesSquare className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg font-headline">Agent Deliberation Room</h3>
                <p className="text-sm text-muted-foreground">Expert agents discussing candidate viability.</p>
              </div>
            </div>

            <div className="space-y-6 pl-4 border-l-2 border-primary/20">
              {data.debate?.map((message: any, idx: number) => (
                <DebateMessage key={idx} message={message} delay={idx * 0.15} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Consensus Report */}
        {activeTab === 'consensus' && (
          <motion.div
            key="consensus"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
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
    if (score >= 80) return { text: 'text-emerald-400', border: 'border-emerald-400', bg: 'bg-emerald-400/10' };
    if (score >= 60) return { text: 'text-amber-400', border: 'border-amber-400', bg: 'bg-amber-400/10' };
    return { text: 'text-rose-400', border: 'border-rose-400', bg: 'bg-rose-400/10' };
  };

  const colors = getScoreColorInfo(analysis.score);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card className={`glass-panel overflow-hidden transition-all duration-300 ${expanded ? 'ring-1 ring-primary/30 shadow-lg shadow-primary/5' : 'hover:border-primary/40'}`}>
        <div 
          className="p-5 flex items-center justify-between cursor-pointer group"
          onClick={onToggle}
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-xl font-bold text-white shadow-inner">
                {analysis.agentName[0]}
              </div>
              <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-background flex items-center justify-center bg-gray-800`}>
                 {/* Small icon representing persona could go here */}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg font-headline group-hover:text-primary transition-colors">{analysis.agentName}</h3>
              <p className="text-sm font-medium text-muted-foreground">{analysis.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className={`flex flex-col items-end`}>
              <div className={`text-3xl font-extrabold ${colors.text} drop-shadow-sm`}>
                {analysis.score}
              </div>
              <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Score</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.3 }} className={expanded ? 'text-primary' : 'text-muted-foreground'}>
                <ChevronDown className="h-5 w-5" />
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
              transition={{ duration: 0.3 }}
              className="overflow-hidden bg-black/20"
            >
              <div className="p-6 border-t border-border/40 space-y-6">
                {/* Detailed Analysis */}
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Expert Narrative
                  </h4>
                  <p className="text-muted-foreground leading-relaxed text-sm">{analysis.analysis}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <div className="bg-emerald-950/20 rounded-xl p-4 border border-emerald-500/10">
                    <h4 className="text-sm font-bold uppercase tracking-wide text-emerald-400 mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" /> Core Strengths
                    </h4>
                    <ul className="space-y-2">
                      {analysis.strengths.map((s: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-emerald-100/70">
                          <span className="text-emerald-500 mt-0.5">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="bg-rose-950/20 rounded-xl p-4 border border-rose-500/10">
                    <h4 className="text-sm font-bold uppercase tracking-wide text-rose-400 mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" /> Gap Areas
                    </h4>
                    <ul className="space-y-2">
                      {analysis.weaknesses.map((w: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-rose-100/70">
                          <span className="text-rose-500 mt-0.5">•</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                  <h4 className="text-sm font-bold uppercase tracking-wide text-primary mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" /> Strategic Recommendations
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {analysis.recommendations.map((r: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-3 p-3 bg-background/50 rounded-lg text-sm text-muted-foreground border border-border/30">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        {r}
                      </li>
                    ))}
                  </ul>
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
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20, filter: 'blur(5px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      transition={{ delay, duration: 0.5 }}
      className="relative"
    >
      <div className="absolute -left-[25px] top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-purple-500 shadow-[0_0_10px_2px_rgba(168,85,247,0.4)]" />
      <div className="glass-panel p-4 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-colors">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center font-bold text-purple-400 border border-purple-500/30">
            {message.agentName[0]}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-foreground">{message.agentName}</span>
            <Badge variant="outline" className="text-[10px] uppercase border-purple-500/30 text-purple-400">{message.type}</Badge>
          </div>
        </div>
        <p className="text-muted-foreground text-sm ml-11 leading-relaxed">{message.message}</p>
      </div>
    </motion.div>
  );
}

function ConsensusReport({ consensus, historyIndex }: { consensus: any, historyIndex: number }) {
  if (!consensus) return null;
  
  return (
    <div className="space-y-6">
      <Card className="glass-panel relative overflow-hidden border-emerald-500/30 shadow-[0_0_30px_-5px_rgba(16,185,129,0.15)]">
        <div className="absolute top-0 right-0 p-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-4">
              <Badge className="bg-emerald-500/20 text-emerald-400 border-none px-3 py-1 text-xs">Official Consensus</Badge>
              <h2 className="text-2xl font-bold font-headline">Hiring Committee Report</h2>
              <p className="text-muted-foreground leading-relaxed">
                {consensus.consensusNarrative || "After extensive deliberation, the multi-agent committee has compiled this final evaluation based on technical, cultural, and executive perspectives."}
              </p>
            </div>
            
            <div className="flex flex-col items-center justify-center p-6 bg-background/50 backdrop-blur-sm rounded-2xl border border-emerald-500/20 min-w-[180px]">
              <span className="text-xs uppercase tracking-widest font-bold text-emerald-500/70 mb-2">Match Resonance</span>
              <div className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-teal-600 drop-shadow-sm">
                {consensus.overallScore}
              </div>
              <span className="text-sm font-medium text-emerald-400 mt-1">out of 100</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-panel p-6 border-emerald-500/20">
          <h3 className="font-bold text-emerald-400 flex items-center gap-2 mb-4">
            <CheckCircle className="h-5 w-5" /> Key Strengths
          </h3>
          <ul className="space-y-3">
            {consensus.strengths?.map((s: string, i: number) => (
              <li key={i} className="flex gap-3 text-sm">
                <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5 mt-0">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-emerald-100/90">{s}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="glass-panel p-6 border-amber-500/20">
          <h3 className="font-bold text-amber-400 flex items-center gap-2 mb-4">
            <Target className="h-5 w-5" /> Focus Areas
          </h3>
          <ul className="space-y-3">
            {consensus.weaknesses?.map((w: string, i: number) => (
              <li key={i} className="flex gap-3 text-sm">
                <div className="h-5 w-5 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                </div>
                <span className="text-amber-100/90">{w}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="glass-panel overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-transparent to-accent/5">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />
        <CardContent className="p-8 flex flex-col items-center text-center gap-6 relative z-10">
          <div className="h-20 w-20 rounded-3xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-2xl shadow-primary/20">
            <TrendingUp className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold font-headline">Interactive Skill Gap & Roadmap</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Our AI has identified specific technical gaps. Click below to view a visual gap analysis, prioritized learning timeline, and curated expert resources.
            </p>
          </div>
          
          <Button asChild size="lg" className="h-14 px-10 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-xl shadow-primary/30 gap-3 group">
            <Link href={`/candidate/skill-gap?idx=${historyIndex}`}>
              View Detailed Roadmap <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          
          <div className="flex items-center gap-8 pt-4 border-t border-border/40 w-full justify-center opacity-60 text-[10px] uppercase font-bold tracking-widest">
             <div className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3 text-emerald-400" /> Gap Chart</div>
             <div className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3 text-purple-400" /> Timeline</div>
             <div className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3 text-blue-400" /> Resources</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
