##Multi-Agent System Architecture
// types/agent.types.ts
export interface AgentPersona {
  id: string;
  name: string;
  role: string;
  modelProvider: 'groq' | 'gemini';
  model: string;
  systemPrompt: string;
  expertise: string[];
  focusAreas: string[];
  personality: string;
  temperature?: number;
}

export interface AgentResponse {
  agentId: string;
  agentName: string;
  role: string;
  analysis: string;
  score?: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  timestamp: number;
}

export interface DebateMessage {
  agentId: string;
  agentName: string;
  message: string;
  type: 'analysis' | 'critique' | 'defense' | 'consensus';
  targetAgentId?: string; // Who they're responding to
  timestamp: number;
}

export interface ConsensusReport {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  actionItems: PrioritizedAction[];
  debateTranscript: DebateMessage[];
  agentVotes: Record<string, number>;
}

##Agent Personas Definition
// config/agent-personas.ts
export const AGENT_PERSONAS: AgentPersona[] = [
  {
    id: 'tech-lead-marcus',
    name: 'Marcus',
    role: 'Senior Tech Lead',
    modelProvider: 'groq',
    model: 'llama-3.3-70b-versatile', // Most powerful for deep technical analysis
    systemPrompt: `You are Marcus, a Senior Tech Lead at a FAANG company with 12 years of experience. 
You specialize in evaluating technical depth, code quality, system design, and architectural decisions.
You are direct, fair, and focus on scalability and best practices. You appreciate well-documented 
projects and clear technical writing. You're skeptical of buzzwords without substance.

When analyzing resumes:
- Scrutinize technical claims with healthy skepticism
- Look for depth vs breadth in technology stacks
- Value practical problem-solving over theoretical knowledge
- Check for scalability and performance considerations
- Assess code quality indicators (testing, CI/CD, documentation)
- Prefer quantified achievements over vague descriptions

Your tone: Direct, technical, constructive. You speak in terms of systems, patterns, and trade-offs.`,
    expertise: ['System Design', 'Code Quality', 'Technical Leadership', 'Architecture'],
    focusAreas: ['technical_depth', 'code_quality', 'scalability', 'best_practices'],
    personality: 'direct_technical',
    temperature: 0.3 // Lower temp for consistent technical evaluation
  },

  {
    id: 'hr-director-sarah',
    name: 'Sarah',
    role: 'HR Director',
    modelProvider: 'gemini',
    model: 'googleai/gemini-2.5-flash',
    systemPrompt: `You are Sarah, an experienced HR Director who has hired for tech roles at both 
startups and enterprises for 10+ years. You focus on cultural fit, communication skills, career 
trajectory, and long-term potential. You're supportive but realistic about red flags.

When analyzing resumes:
- Evaluate career progression and growth trajectory
- Look for leadership potential and soft skills indicators
- Assess communication quality in resume writing
- Check for job-hopping patterns or unexplained gaps
- Value diversity of experience and adaptability
- Look for culture fit indicators (collaboration, mentorship, community involvement)

Your tone: Warm, supportive, people-focused. You speak about growth, potential, and team dynamics.`,
    expertise: ['Talent Assessment', 'Culture Fit', 'Career Development', 'Communication'],
    focusAreas: ['culture_fit', 'communication', 'career_growth', 'soft_skills'],
    personality: 'supportive_people_focused',
    temperature: 0.5
  },

  {
    id: 'product-manager-alex',
    name: 'Alex',
    role: 'Lead Product Manager',
    modelProvider: 'groq',
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    systemPrompt: `You are Alex, a Lead Product Manager who bridges technical and business worlds. 
You evaluate candidates based on user-centric thinking, business impact, prioritization skills, 
and ability to ship products.

When analyzing resumes:
- Look for product sense and user-centric problem solving
- Value measurable business impact (revenue, users, engagement)
- Assess prioritization and trade-off decision making
- Check for cross-functional collaboration skills
- Look for ownership and end-to-end delivery
- Appreciate data-driven decision making

Your tone: Strategic, outcome-focused, practical. You speak in terms of impact, users, and value delivery.`,
    expertise: ['Product Strategy', 'User Experience', 'Business Impact', 'Prioritization'],
    focusAreas: ['product_sense', 'business_impact', 'user_focus', 'execution'],
    personality: 'strategic_impact_driven',
    temperature: 0.4
  },

  {
    id: 'engineering-manager-elena',
    name: 'Elena',
    role: 'Engineering Manager',
    modelProvider: 'gemini',
    model: 'googleai/gemini-3-flash-preview',
    systemPrompt: `You are Elena, an Engineering Manager who has built and led multiple teams. 
You evaluate candidates on their ability to work in teams, mentor others, handle ambiguity, 
and grow into leadership roles.

When analyzing resumes:
- Look for collaboration and teamwork indicators
- Value mentorship, teaching, and knowledge sharing
- Assess ability to handle complex, ambiguous projects
- Check for process improvement and initiative
- Look for technical breadth to support team needs
- Appreciate documentation and knowledge transfer

Your tone: Balanced, team-oriented, growth-minded. You speak about collaboration, learning, and team success.`,
    expertise: ['Team Leadership', 'Mentorship', 'Process Improvement', 'Technical Management'],
    focusAreas: ['teamwork', 'mentorship', 'process', 'leadership_potential'],
    personality: 'collaborative_growth_minded',
    temperature: 0.45
  },

  {
    id: 'startup-cto-leo',
    name: 'Leo',
    role: 'Startup CTO',
    modelProvider: 'groq',
    model: 'qwen/qwen3-32b',
    systemPrompt: `You are Leo, a CTO at a fast-growing startup. You value versatility, speed of 
execution, entrepreneurial mindset, and ability to wear multiple hats. You're looking for builders 
who can thrive in ambiguity.

When analyzing resumes:
- Value scrappiness and resourcefulness
- Look for side projects, hackathons, open source contributions
- Assess speed of learning and adaptability
- Check for full-stack or multi-disciplinary skills
- Appreciate ownership and initiative
- Look for startup/fast-paced environment experience

Your tone: Energetic, fast-paced, opportunity-focused. You speak about shipping, learning, and impact.`,
    expertise: ['Rapid Execution', 'Versatility', 'Startup Mindset', 'Innovation'],
    focusAreas: ['versatility', 'speed', 'innovation', 'ownership'],
    personality: 'energetic_builder_focused',
    temperature: 0.6 // Higher temp for creative evaluation
  }
];

##Multi-Agent Orchestrator
// services/multi-agent-orchestrator.ts
import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AGENT_PERSONAS, type AgentPersona } from '@/config/agent-personas';

interface OrchestratorConfig {
  groqApiKey: string;
  geminiApiKey: string;
  maxConcurrentAgents?: number;
  enableDebate?: boolean;
}

export class MultiAgentOrchestrator {
  private groqClient: Groq;
  private geminiClient: GoogleGenerativeAI;
  private config: OrchestratorConfig;

  constructor(config: OrchestratorConfig) {
    this.config = {
      maxConcurrentAgents: 3,
      enableDebate: true,
      ...config
    };
    this.groqClient = new Groq({ apiKey: config.groqApiKey });
    this.geminiClient = new GoogleGenerativeAI(config.geminiApiKey);
  }

  // Phase 1: Individual Analysis (Parallel)
  async conductIndividualAnalysis(
    resumeText: string,
    jobDescription?: string,
    githubData?: any
  ): Promise<AgentResponse[]> {
    const context = this.buildContext(resumeText, jobDescription, githubData);
    
    // Run agents in batches to avoid rate limits
    const batches = this.batchAgents(AGENT_PERSONAS, this.config.maxConcurrentAgents!);
    const allResponses: AgentResponse[] = [];

    for (const batch of batches) {
      const batchPromises = batch.map(agent => 
        this.runAgentAnalysis(agent, context)
      );
      const batchResponses = await Promise.allSettled(batchPromises);
      
      batchResponses.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          allResponses.push(result.value);
        } else {
          console.error(`Agent ${batch[idx].name} failed:`, result.reason);
        }
      });

      // Small delay between batches to be nice to APIs
      if (batches.indexOf(batch) < batches.length - 1) {
        await this.delay(500);
      }
    }

    return allResponses;
  }

  // Phase 2: Debate Round (Sequential)
  async conductDebateRound(
    initialAnalyses: AgentResponse[],
    resumeText: string,
    rounds: number = 2
  ): Promise<DebateMessage[]> {
    const debateTranscript: DebateMessage[] = [];
    
    for (let round = 0; round < rounds; round++) {
      console.log(`🗣️ Debate Round ${round + 1}/${rounds}`);
      
      // Each agent responds to others' critiques
      for (const agent of AGENT_PERSONAS) {
        const otherAnalyses = initialAnalyses.filter(a => a.agentId !== agent.id);
        const debateMessage = await this.generateDebateResponse(
          agent,
          otherAnalyses,
          debateTranscript,
          resumeText
        );
        
        if (debateMessage) {
          debateTranscript.push(debateMessage);
        }
        
        await this.delay(300); // Rate limit protection
      }
    }

    return debateTranscript;
  }

  // Phase 3: Consensus Building
  async buildConsensus(
    analyses: AgentResponse[],
    debateTranscript: DebateMessage[],
    resumeText: string
  ): Promise<ConsensusReport> {
    // Use the most powerful model for final consensus
    const consensusAgent = AGENT_PERSONAS.find(a => 
      a.model === 'llama-3.3-70b-versatile'
    )!;

    const consensusPrompt = `You are synthesizing feedback from ${analyses.length} expert evaluators 
who reviewed a candidate's resume. Your job is to create a balanced, actionable consensus report.

## Individual Analyses:
${analyses.map(a => `
### ${a.agentName} (${a.role}):
Score: ${a.score}/100
Strengths: ${a.strengths.join(', ')}
Weaknesses: ${a.weaknesses.join(', ')}
Recommendations: ${a.recommendations.join('; ')}
`).join('\n')}

## Debate Highlights:
${debateTranscript.slice(-10).map(d => `${d.agentName}: ${d.message}`).join('\n')}

Generate a consensus report in JSON format:
{
  "overallScore": number (0-100, weighted average with your judgment),
  "strengths": [top 5 agreed-upon strengths],
  "weaknesses": [top 5 areas for improvement],
  "actionItems": [
    {
      "priority": "critical" | "high" | "medium" | "low",
      "category": "technical" | "experience" | "communication" | "format",
      "action": "specific action to take",
      "impact": "expected improvement",
      "effort": "low" | "medium" | "high",
      "timeline": "suggested timeframe"
    }
  ],
  "agentVotes": { "agentName": score },
  "consensusNarrative": "2-3 paragraph summary"
}`;

    const response = await this.callGroq(consensusAgent, consensusPrompt);
    const consensus = this.parseJSON(response);

    return {
      ...consensus,
      debateTranscript
    };
  }

  // Helper: Run single agent analysis
  private async runAgentAnalysis(
    agent: AgentPersona,
    context: string
  ): Promise<AgentResponse> {
    const prompt = `${agent.systemPrompt}

## Context to Analyze:
${context}

Provide your analysis in JSON format:
{
  "score": number (0-100),
  "strengths": [list of 3-5 specific strengths],
  "weaknesses": [list of 3-5 specific weaknesses],
  "recommendations": [list of 3-5 actionable recommendations],
  "analysis": "Your detailed narrative analysis (2-3 paragraphs)"
}

Be specific, cite examples from the resume, and stay true to your expertise areas: ${agent.focusAreas.join(', ')}.`;

    let responseText: string;
    
    if (agent.modelProvider === 'groq') {
      responseText = await this.callGroq(agent, prompt);
    } else {
      responseText = await this.callGemini(agent, prompt);
    }

    const parsed = this.parseJSON(responseText);

    return {
      agentId: agent.id,
      agentName: agent.name,
      role: agent.role,
      timestamp: Date.now(),
      ...parsed
    };
  }

  // Helper: Generate debate response
  private async generateDebateResponse(
    agent: AgentPersona,
    otherAnalyses: AgentResponse[],
    previousDebate: DebateMessage[],
    resumeText: string
  ): Promise<DebateMessage | null> {
    const prompt = `${agent.systemPrompt}

You're in a panel discussion about a candidate's resume. Other evaluators have shared their thoughts:

${otherAnalyses.map(a => `
**${a.agentName} (${a.role})**:
- Score: ${a.score}/100
- Key points: ${a.strengths.slice(0, 2).join('; ')} | Concerns: ${a.weaknesses.slice(0, 2).join('; ')}
`).join('\n')}

${previousDebate.length > 0 ? `
Recent debate points:
${previousDebate.slice(-5).map(d => `${d.agentName}: ${d.message}`).join('\n')}
` : ''}

Respond with ONE of the following:
1. **Agree** with another evaluator and add supporting evidence
2. **Disagree** and explain why from your expertise
3. **Add** a new perspective they missed
4. **Synthesize** different viewpoints

Keep your response to 2-3 sentences. Be specific and cite the resume.

Format: Just the response text, no JSON.`;

    try {
      const response = agent.modelProvider === 'groq'
        ? await this.callGroq(agent, prompt)
        : await this.callGemini(agent, prompt);

      return {
        agentId: agent.id,
        agentName: agent.name,
        message: response.trim(),
        type: 'critique',
        timestamp: Date.now()
      };
    } catch (error) {
      console.error(`Debate response failed for ${agent.name}:`, error);
      return null;
    }
  }

  // API Callers
  private async callGroq(agent: AgentPersona, prompt: string): Promise<string> {
    const response = await this.groqClient.chat.completions.create({
      model: agent.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: agent.temperature ?? 0.4,
      max_tokens: 2000
    });

    return response.choices[0]?.message?.content ?? '';
  }

  private async callGemini(agent: AgentPersona, prompt: string): Promise<string> {
    const model = this.geminiClient.getGenerativeModel({ 
      model: agent.model.replace('googleai/', '')
    });
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  // Utilities
  private buildContext(resume: string, jd?: string, github?: any): string {
    let context = `## Resume:\n${resume}\n`;
    if (jd) context += `\n## Job Description:\n${jd}\n`;
    if (github) context += `\n## GitHub Data:\n${JSON.stringify(github, null, 2)}\n`;
    return context;
  }

  private batchAgents(agents: AgentPersona[], batchSize: number): AgentPersona[][] {
    const batches: AgentPersona[][] = [];
    for (let i = 0; i < agents.length; i += batchSize) {
      batches.push(agents.slice(i, i + batchSize));
    }
    return batches;
  }

  private parseJSON(text: string): any {
    // Extract JSON from markdown code blocks or raw text
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) ?? text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return {};
    
    try {
      return JSON.parse(jsonMatch[1] ?? jsonMatch[0]);
    } catch {
      return {};
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

##Usage Example
// app/api/analyze-resume/route.ts
import { MultiAgentOrchestrator } from '@/services/multi-agent-orchestrator';

export async function POST(req: Request) {
  const { resumeText, jobDescription, githubData } = await req.json();

  const orchestrator = new MultiAgentOrchestrator({
    groqApiKey: process.env.GROQ_API_KEY!,
    geminiApiKey: process.env.GEMINI_API_KEY!,
    maxConcurrentAgents: 3,
    enableDebate: true
  });

  try {
    // Phase 1: Individual Analysis (parallel, batched)
    console.log('🤖 Phase 1: Individual Agent Analysis...');
    const analyses = await orchestrator.conductIndividualAnalysis(
      resumeText,
      jobDescription,
      githubData
    );

    // Phase 2: Debate Round (sequential)
    console.log('🗣️ Phase 2: Agent Debate...');
    const debateTranscript = await orchestrator.conductDebateRound(
      analyses,
      resumeText,
      2 // 2 rounds of debate
    );

    // Phase 3: Consensus Building
    console.log('🤝 Phase 3: Building Consensus...');
    const consensus = await orchestrator.buildConsensus(
      analyses,
      debateTranscript,
      resumeText
    );

    return Response.json({
      success: true,
      data: {
        individualAnalyses: analyses,
        debate: debateTranscript,
        consensus
      }
    });

  } catch (error) {
    console.error('Multi-agent analysis failed:', error);
    return Response.json({ 
      success: false, 
      error: 'Analysis failed' 
    }, { status: 500 });
  }
}

##React Component for Displaying Results
// components/MultiAgentDebate.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function MultiAgentDebate({ data }) {
  const [activeTab, setActiveTab] = useState<'analyses' | 'debate' | 'consensus'>('analyses');
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-700">
        {['analyses', 'debate', 'consensus'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-purple-500 text-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab === 'analyses' && '👥 Individual Analyses'}
            {tab === 'debate' && '🗣️ Panel Debate'}
            {tab === 'consensus' && '🤝 Final Consensus'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Individual Analyses */}
        {activeTab === 'analyses' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {data.individualAnalyses.map((analysis) => (
              <AgentCard
                key={analysis.agentId}
                analysis={analysis}
                expanded={expandedAgent === analysis.agentId}
                onToggle={() => setExpandedAgent(
                  expandedAgent === analysis.agentId ? null : analysis.agentId
                )}
              />
            ))}
          </motion.div>
        )}

        {/* Debate Transcript */}
        {activeTab === 'debate' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            {data.debate.map((message, idx) => (
              <DebateMessage key={idx} message={message} />
            ))}
          </motion.div>
        )}

        {/* Consensus Report */}
        {activeTab === 'consensus' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ConsensusReport consensus={data.consensus} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AgentCard({ analysis, expanded, onToggle }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl">
            {analysis.agentName[0]}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{analysis.agentName}</h3>
            <p className="text-sm text-gray-400">{analysis.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className={`text-3xl font-bold ${getScoreColor(analysis.score)}`}>
              {analysis.score}
            </div>
            <div className="text-xs text-gray-500">/ 100</div>
          </div>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            ▼
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-6 space-y-4 overflow-hidden"
          >
            {/* Analysis */}
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Analysis</h4>
              <p className="text-gray-300">{analysis.analysis}</p>
            </div>

            {/* Strengths */}
            <div>
              <h4 className="text-sm font-medium text-green-400 mb-2">✓ Strengths</h4>
              <ul className="space-y-1">
                {analysis.strengths.map((s, idx) => (
                  <li key={idx} className="text-gray-300 text-sm">• {s}</li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div>
              <h4 className="text-sm font-medium text-yellow-400 mb-2">⚠ Areas for Improvement</h4>
              <ul className="space-y-1">
                {analysis.weaknesses.map((w, idx) => (
                  <li key={idx} className="text-gray-300 text-sm">• {w}</li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="text-sm font-medium text-purple-400 mb-2">💡 Recommendations</h4>
              <ul className="space-y-1">
                {analysis.recommendations.map((r, idx) => (
                  <li key={idx} className="text-gray-300 text-sm">• {r}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DebateMessage({ message }) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center text-xs font-bold">
        {message.agentName[0]}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-purple-400">{message.agentName}</div>
        <p className="text-gray-300 mt-1">{message.message}</p>
      </div>
    </div>
  );
}