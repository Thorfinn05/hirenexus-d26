"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend 
} from "recharts";
import { 
  CheckCircle, BookOpen, ExternalLink, Calendar, 
  Zap, Award, Code, Globe, Lightbulb
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SkillGapReport } from "@/config/agent-personas";

interface SkillGapDashboardProps {
  report: SkillGapReport;
}

export function SkillGapDashboard({ report }: SkillGapDashboardProps) {
  if (!report) return null;

  return (
    <div className="space-y-12">
      {/* 1. Visual Gap Analysis (Radar Chart) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
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

      {/* 2. Prioritized Learning Roadmap (Timeline) */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <Badge className="bg-purple-500/20 text-purple-400 border-none px-3 py-1 text-xs">Strategic Timeline</Badge>
          <h2 className="text-3xl font-bold font-headline">Learning Roadmap</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">A phase-by-phase action plan to close your tech gaps and reach the target role proficiency.</p>
        </div>

        <div className="relative space-y-6 pt-4">
           {/* Timeline Line */}
           <div className="absolute left-[39px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-purple-500/50 to-transparent" />

           {report.roadmap.map((item, idx) => (
             <motion.div 
               key={idx}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: idx * 0.1 }}
               className={`flex flex-col md:flex-row gap-8 items-start md:items-center ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
             >
               <div className="flex-1 w-full flex justify-end">
                 <Card className="glass-panel border-white/10 hover:border-primary/40 transition-all duration-300 w-full md:max-w-md bg-muted/10 group">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between mb-2">
                            <Badge className={`${
                                item.priority === 'high' ? 'bg-rose-500/20 text-rose-400' :
                                item.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-blue-500/20 text-blue-400'
                            }`}>{item.priority} Priority</Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> {item.duration}
                            </span>
                        </div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">{item.phase}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {item.tasks.map((task, tidx) => (
                                <li key={tidx} className="flex items-start gap-3 text-sm text-muted-foreground">
                                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    </div>
                                    {task}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                 </Card>
               </div>

               <div className="h-20 w-20 rounded-2xl bg-background border-4 border-muted/50 flex items-center justify-center relative z-20 shrink-0 shadow-xl shadow-black/50">
                  <div className="text-lg font-bold text-primary">0{idx + 1}</div>
               </div>

               <div className="flex-1 hidden md:block" />
             </motion.div>
           ))}
        </div>
      </section>

      {/* 3. Suggested Resources */}
      <section className="space-y-8">
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
