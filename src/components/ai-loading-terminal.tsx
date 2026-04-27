"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Cpu, Database, Network, Loader2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from './ui/card';

const LOADING_STEPS = [
  { id: 1, text: "Initializing Multi-Agent Consensus Engine...", delay: 0, color: "text-primary" },
  { id: 2, text: "Tech Lead is evaluating codebase patterns and architecture...", delay: 5000, role: "Tech Lead", color: "text-blue-400" },
  { id: 3, text: "HR Manager is analyzing communication and soft skills...", delay: 8000, role: "HR Manager", color: "text-emerald-400" },
  { id: 4, text: "Product Manager is reviewing business impact and product sense...", delay: 10000, role: "Product Manager", color: "text-amber-400" },
  { id: 5, text: "Engineering Manager is assessing leadership and delivery velocity...", delay: 12000, role: "Engineering Manager", color: "text-sky-400" },
  { id: 6, text: "CTO is drafting final verdict and high-level strategy...", delay: 15000, role: "CTO", color: "text-violet-400" },
  { id: 7, text: "Cross-referencing skill gaps with current market trends...", delay: 25000, color: "text-indigo-400" },
  { id: 8, text: "Generating personalized scoring analysis...", delay: 30000, color: "text-emerald-500" },
  { id: 9, text: "Finalizing consensus report...", delay: 35000, color: "text-primary" },
];

export function AILoadingTerminal({ onComplete }: { onComplete?: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timeoutIds: any[] = [];

    LOADING_STEPS.forEach((step, index) => {
      const id = setTimeout(() => {
        setCurrentStep(index);
        
        // If it's the last step, wait a moment for the user to see it and then call onComplete
        if (index === LOADING_STEPS.length - 1) {
          const finalId = setTimeout(() => {
            onComplete?.();
          }, 2000); // 2 second buffer after the last step shows up
          timeoutIds.push(finalId);
        }
      }, step.delay);
      timeoutIds.push(id);
    });

    return () => {
      timeoutIds.forEach(clearTimeout);
    };
  }, [onComplete]);

  return (
    <Card className="border-primary/20 bg-[#0A0A0A] overflow-hidden mt-6 shadow-2xl shadow-primary/10">
      <div className="bg-[#1A1A1A] px-4 py-2 flex items-center gap-2 border-b border-white/5">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
        </div>
        <div className="mx-auto flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <Terminal className="w-3 h-3" />
          <span>hirenexus_ai_engine.sh</span>
        </div>
      </div>
      <CardContent className="p-6 font-mono text-sm">
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {LOADING_STEPS.slice(0, currentStep + 1).map((step, index) => {
              const isLast = index === currentStep;
              const stepColor = step.color || "text-primary";
              
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -10, filter: "blur(4px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  className="flex items-start gap-3"
                >
                  <div className="mt-0.5 shrink-0">
                    {isLast ? (
                      <Loader2 className={`w-4 h-4 ${stepColor} animate-spin`} />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500/60" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <span className={isLast ? `${stepColor} font-bold tracking-tight` : "text-muted-foreground/60"}>
                      {step.text}
                    </span>
                    
                    {/* Add some fake processing visual for the active step */}
                    {isLast && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`flex gap-4 text-[10px] uppercase font-bold tracking-widest ${stepColor} opacity-70 mt-1`}
                      >
                        <span className="flex items-center gap-1.5"><Cpu className="w-3 h-3" /> Processing</span>
                        <span className="flex items-center gap-1.5"><Network className="w-3 h-3" /> {Math.floor(Math.random() * 100)}ms</span>
                        <span className="flex items-center gap-1.5"><Database className="w-3 h-3" /> Syncing</span>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
