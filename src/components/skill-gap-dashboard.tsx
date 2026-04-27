"use client";

import React from "react";
import { motion, useScroll, useTransform, useInView, useSpring } from "framer-motion";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend
} from "recharts";
import {
  CheckCircle, BookOpen, ExternalLink, Calendar,
  Zap, Award, Code, Globe, Lightbulb, Search, X, ShieldCheck, Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SkillGapReport } from "@/config/agent-personas";

interface SkillGapDashboardProps {
  report: SkillGapReport;
}

/* ─── Timeline Card (individual roadmap phase) ─── */
function TimelineCard({ item, idx, total }: { item: any; idx: number; total: number }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px 0px" });
  const isEven = idx % 2 === 0;

  return (
    <motion.div
      ref={ref}
      className={`flex flex-col md:flex-row gap-8 items-start md:items-center ${isEven ? 'md:flex-row-reverse' : ''}`}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } }
      }}
    >
      {/* Card */}
      <motion.div
        className="flex-1 w-full flex justify-end"
        variants={{
          hidden: {
            opacity: 0,
            x: isEven ? 60 : -60,
            scale: 0.92,
            filter: "blur(8px)"
          },
          visible: {
            opacity: 1,
            x: 0,
            scale: 1,
            filter: "blur(0px)",
            transition: {
              duration: 0.7,
              ease: [0.16, 1, 0.3, 1]
            }
          }
        }}
      >
        <Card className="glass-panel border-white/10 hover:border-primary/40 transition-all duration-500 w-full md:max-w-md bg-muted/10 group hover:shadow-[0_0_40px_-10px_hsl(var(--primary)_/_0.15)] hover:-translate-y-1">
          <CardHeader className="pb-2">
            <motion.div
              className="flex items-center justify-between mb-2"
              variants={{
                hidden: { opacity: 0, y: 8 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
              }}
            >
              <Badge className={`${item.priority === 'high' ? 'bg-rose-500/20 text-rose-400' :
                  item.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-blue-500/20 text-blue-400'
                }`}>{item.priority} Priority</Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {item.duration}
              </span>
            </motion.div>
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 8 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.05 } }
              }}
            >
              <CardTitle className="text-lg group-hover:text-primary transition-colors duration-300">{item.phase}</CardTitle>
            </motion.div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {item.tasks.map((task: string, tidx: number) => (
                <motion.li
                  key={tidx}
                  className="flex items-start gap-3 text-sm text-muted-foreground"
                  variants={{
                    hidden: { opacity: 0, x: -12 },
                    visible: {
                      opacity: 1,
                      x: 0,
                      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
                    }
                  }}
                >
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </div>
                  {task}
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* Center Node */}
      <motion.div
        className="relative z-20 shrink-0"
        variants={{
          hidden: { opacity: 0, scale: 0.3 },
          visible: {
            opacity: 1,
            scale: 1,
            transition: {
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.15
            }
          }
        }}
      >
        <div className="h-20 w-20 rounded-2xl bg-background border-4 border-muted/50 flex items-center justify-center shadow-xl shadow-black/50 relative overflow-hidden group">
          {/* Ambient glow */}
          <motion.div
            className="absolute inset-0 bg-primary/10 rounded-2xl"
            animate={{
              opacity: [0.05, 0.2, 0.05],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: idx * 0.5
            }}
          />
          <div className="text-lg font-bold text-primary relative z-10">
            {String(idx + 1).padStart(2, '0')}
          </div>
        </div>
        {/* Connector pulse */}
        {idx < total - 1 && (
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 top-full w-1.5 h-1.5 rounded-full bg-primary/60"
            animate={{
              opacity: [0.3, 1, 0.3],
              y: [0, 8, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: idx * 0.3
            }}
          />
        )}
      </motion.div>

      {/* Spacer (hidden on mobile) */}
      <div className="flex-1 hidden md:block" />
    </motion.div>
  );
}

/* ─── Roadmap Timeline Section ─── */
function RoadmapTimeline({ roadmap }: { roadmap: SkillGapReport['roadmap'] }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const headerRef = React.useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-40px 0px" });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 85%", "end 60%"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <section className="space-y-8" id="learning-roadmap">
      {/* Header */}
      <motion.div
        ref={headerRef}
        className="text-center space-y-2"
        initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
        animate={headerInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <Badge className="bg-purple-500/20 text-purple-400 border-none px-3 py-1 text-xs">Strategic Timeline</Badge>
        <h2 className="text-3xl font-bold font-headline">Learning Roadmap</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          A phase-by-phase action plan to close your tech gaps and reach the target role proficiency.
        </p>
      </motion.div>

      {/* Timeline */}
      <div ref={containerRef} className="relative space-y-6 pt-4">
        {/* Animated Timeline Line */}
        <div className="absolute left-[39px] md:left-1/2 top-0 bottom-0 w-px overflow-hidden">
          {/* Background track */}
          <div className="absolute inset-0 bg-white/[0.04]" />
          {/* Animated fill */}
          <motion.div
            className="absolute top-0 left-0 right-0 bg-gradient-to-b from-primary/70 via-purple-500/60 to-primary/30 origin-top"
            style={{ scaleY: smoothProgress, height: "100%" }}
          />
          {/* Glow overlay */}
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-3 bg-gradient-to-b from-primary/30 via-purple-500/20 to-transparent origin-top blur-sm"
            style={{ scaleY: smoothProgress, height: "100%" }}
          />
        </div>

        {roadmap.map((item, idx) => (
          <TimelineCard key={idx} item={item} idx={idx} total={roadmap.length} />
        ))}
      </div>
    </section>
  );
}

export function SkillGapDashboard({ report }: SkillGapDashboardProps) {
  if (!report) return null;

  return (
    <div className="space-y-12">
      {/* 1. Visual Gap Analysis (Radar Chart) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center" id="visual-gap-analysis">
        <div className="space-y-4">
          <Badge className="bg-primary/20 text-primary border-none px-3 py-1 text-xs">Visual Gap Analysis</Badge>
          <h2 className="text-3xl font-bold font-headline">Has vs. Needs</h2>
          <p className="text-muted-foreground leading-relaxed">
            {report.summary || "This radar chart visualizes your current skill levels compared to the target role's expectations. Focus on the largest gaps to optimize your career growth."}
          </p>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <span className="text-xs font-bold uppercase tracking-widest opacity-60">Current (Has)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-widest opacity-60">Required (Needs)</span>
            </div>
          </div>
        </div>

        <Card className="glass-panel p-6 border-primary/20 bg-primary/5 min-h-[400px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={report.chartData}>
              <PolarGrid stroke="#444" />
              <PolarAngleAxis dataKey="skill" tick={{ fill: '#888', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: '#666' }} />
              <Radar
                name="Current Skills"
                dataKey="has"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.6}
              />
              <Radar
                name="Required Skills"
                dataKey="needs"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#111', borderRadius: '12px', border: '1px solid #333' }}
                itemStyle={{ color: '#fff' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </section>

      {/* 2. ATS Keyword Optimization */}
      {report.atsKeywords && (report.atsKeywords.found?.length > 0 || report.atsKeywords.missing?.length > 0) && (
        <section className="space-y-8" id="keyword-scanner">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <Badge className="bg-amber-500/20 text-amber-400 border-none px-3 py-1 text-xs">ATS Optimization</Badge>
              <h2 className="text-3xl font-bold font-headline">Keyword Scanner</h2>
              <p className="text-muted-foreground max-w-xl">
                ATS systems filter resumes by matching keywords to the job description. Here's how your resume stacks up for <span className="text-primary font-medium">{report.summary?.match(/target role/i) ? 'the target role' : 'this role'}</span>.
              </p>
            </div>
            {(() => {
              const found = report.atsKeywords!.found?.length || 0;
              const missing = report.atsKeywords!.missing?.length || 0;
              const total = found + missing;
              const pct = total > 0 ? Math.round((found / total) * 100) : 0;
              return (
                <div className="flex items-center gap-4 shrink-0">
                  <div className="relative h-20 w-20">
                    <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="5" className="text-white/[0.06]" />
                      <circle
                        cx="40" cy="40" r="34" fill="none"
                        stroke={pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444'}
                        strokeWidth="5"
                        strokeDasharray={`${2 * Math.PI * 34}`}
                        strokeDashoffset={`${2 * Math.PI * 34 * (1 - pct / 100)}`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-foreground/90">{pct}%</span>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground/80">Match Rate</p>
                    <p className="text-[11px] text-muted-foreground">{found} of {total} keywords found</p>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Found Keywords */}
            <Card className="glass-panel border-emerald-500/10 bg-emerald-500/[0.03] overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base text-emerald-400">Found in Resume</CardTitle>
                    <CardDescription className="text-xs">These ATS keywords are already present</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {report.atsKeywords!.found?.map((kw, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.03 }}
                    >
                      <Badge
                        className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors cursor-default px-3 py-1.5 text-xs font-medium gap-1.5"
                      >
                        <Check className="h-3 w-3" />
                        {kw}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Missing Keywords */}
            <Card className="glass-panel border-rose-500/10 bg-rose-500/[0.03] overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-rose-500/15 flex items-center justify-center">
                    <Search className="h-5 w-5 text-rose-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base text-rose-400">Missing from Resume</CardTitle>
                    <CardDescription className="text-xs">Add these keywords to improve ATS ranking</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {report.atsKeywords!.missing?.map((kw, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.03 }}
                    >
                      <Badge
                        className="bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20 transition-colors cursor-default px-3 py-1.5 text-xs font-medium gap-1.5"
                      >
                        <X className="h-3 w-3" />
                        {kw}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 p-3 rounded-lg bg-amber-500/[0.06] border border-amber-500/10">
                  <p className="text-[11px] text-amber-300/80 leading-relaxed">
                    <span className="font-semibold">💡 Pro tip:</span> Don't just add these keywords blindly — use the roadmap and resources below to genuinely build these skills, then weave them naturally into your resume's experience descriptions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* 3. Prioritized Learning Roadmap (Timeline) */}
      <RoadmapTimeline roadmap={report.roadmap} />

      {/* 4. Suggested Resources */}
      <section className="space-y-8" id="recommended-resources">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <Badge className="bg-blue-500/20 text-blue-400 border-none px-3 py-1 text-xs">Curated Learning Path</Badge>
            <h2 className="text-3xl font-bold font-headline">Recommended Resources</h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm">Hand-picked by our AI experts based on your specific gap analysis.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {report.resources.map((res, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="h-full flex flex-col glass-panel border-white/5 bg-gradient-to-b from-white/5 to-transparent overflow-hidden">
                <div className="p-6 flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                      {res.type === 'course' && <BookOpen className="h-6 w-6 text-primary" />}
                      {res.type === 'project' && <Code className="h-6 w-6 text-primary" />}
                      {res.type === 'certification' && <Award className="h-6 w-6 text-primary" />}
                    </div>
                    {res.priority === 'essential' && (
                      <Badge className="bg-rose-500/20 text-rose-400">Essential</Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-lg leading-tight">{res.name}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{res.description}</p>
                  </div>
                </div>
                <div className="p-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-40">{res.type}</span>
                  <Button variant="ghost" size="sm" className="h-8 gap-2 text-primary hover:text-primary hover:bg-primary/10">
                    Learn More <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final Action Call */}
      <Card className="bg-primary/10 border-primary/20 p-8 rounded-3xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Lightbulb className="h-32 w-32 text-primary" />
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-bold">Ready to start the journey?</h3>
            <p className="text-muted-foreground">Follow this roadmap to bridge your gaps and land your dream role.</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="h-12 px-6 rounded-xl border-primary/30 flex items-center gap-2">
              <Globe className="h-4 w-4" /> Share Progress
            </Button>
            <Button className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold flex items-center gap-2 shadow-lg shadow-primary/20">
              <Zap className="h-4 w-4" /> Begin Now
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
