import { ai } from '@/ai/genkit';
import { AGENT_PERSONAS, type AgentPersona, type AgentResponse, type DebateMessage, type ConsensusReport } from '@/config/agent-personas';

export class MultiAgentOrchestrator {
  // Phase 1: Individual Analysis (Parallel)
  async conductIndividualAnalysis(
    resumeText: string,
    jobDescription?: string,
    githubData?: string
  ): Promise<AgentResponse[]> {
    const context = this.buildContext(resumeText, jobDescription, githubData);
    
    // Process all agents in parallel
    const promises = AGENT_PERSONAS.map(agent => this.runAgentAnalysis(agent, context));
    const results = await Promise.allSettled(promises);
    
    const allResponses: AgentResponse[] = [];
    results.forEach((result, idx) => {
      if (result.status === 'fulfilled') {
        allResponses.push(result.value);
      } else {
        console.error(`Agent ${AGENT_PERSONAS[idx].name} failed:`, result.reason);
      }
    });

    return allResponses;
  }

  // Phase 2: Debate Round (Sequential)
  async conductDebateRound(
    initialAnalyses: AgentResponse[],
    resumeText: string,
    rounds: number = 1
  ): Promise<DebateMessage[]> {
    const debateTranscript: DebateMessage[] = [];
    
    for (let round = 0; round < rounds; round++) {
      console.log(`\n🗣️ Debate Round ${round + 1}/${rounds}`);
      
      // Each agent responds to others' critiques sequentially
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
    // We use standard llama-3 to do the consensus
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

Generate a consensus report in strictly valid JSON format matching this structure exactly (do not wrap in markdown tags):
{
  "overallScore": number, /* 0-100, weighted average with your judgment */
  "strengths": ["...", "...", "..."], /* top 5 agreed-upon strengths */
  "weaknesses": ["...", "...", "..."], /* top 5 areas for improvement */
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
  "agentVotes": { "agentName": 85 }, /* map agent names to their scores */
  "consensusNarrative": "2-3 paragraph summary"
}`;

    const { text } = await ai.generate({
      model: 'groq/llama-3.3-70b-versatile',
      prompt: consensusPrompt,
      config: { temperature: 0.4 }
    });

    const consensus = this.parseJSON(text);

    return {
      ...consensus,
      debateTranscript
    } as ConsensusReport;
  }

  // Helper: Run single agent analysis
  private async runAgentAnalysis(
    agent: AgentPersona,
    context: string
  ): Promise<AgentResponse> {
    const prompt = `${agent.systemPrompt}

## Context to Analyze:
${context}

Provide your analysis in strictly valid JSON format matching this structure exactly (do not output markdown ticks like \`\`\`json):
{
  "score": number, /* 0-100 */
  "strengths": ["...", "...", "..."], /* list of 3-5 specific strengths */
  "weaknesses": ["...", "...", "..."], /* list of 3-5 specific weaknesses */
  "recommendations": ["...", "...", "..."], /* list of 3-5 actionable recommendations */
  "analysis": "Your detailed narrative analysis (2-3 paragraphs)"
}

Be specific, cite examples from the resume, and stay true to your expertise areas: ${agent.focusAreas.join(', ')}.`;

    const { text } = await ai.generate({
      model: agent.model,
      prompt,
      config: { 
        temperature: agent.temperature ?? 0.4
      }
    });

    const parsed = this.parseJSON(text);

    return {
      agentId: agent.id,
      agentName: agent.name,
      role: agent.role,
      timestamp: Date.now(),
      score: parsed.score || 0,
      strengths: parsed.strengths || [],
      weaknesses: parsed.weaknesses || [],
      recommendations: parsed.recommendations || [],
      analysis: parsed.analysis || "Analysis failed to generate properly."
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

Respond with ONE of the following (Format: Just your response text, no JSON):
1. **Agree** with another evaluator and add supporting evidence
2. **Disagree** and explain why from your expertise
3. **Add** a new perspective they missed
4. **Synthesize** different viewpoints

Keep your response to 2-3 sentences. Be specific and cite the resume.`;

    try {
      const { text } = await ai.generate({
        model: agent.model,
        prompt,
        config: { temperature: agent.temperature ?? 0.4 }
      });

      return {
        agentId: agent.id,
        agentName: agent.name,
        agentRole: agent.role,
        message: text.trim(),
        type: 'critique',
        timestamp: Date.now()
      };
    } catch (error) {
      console.error(`Debate response failed for ${agent.name}:`, error);
      return null;
    }
  }

  // Utilities
  private buildContext(resume: string, jd?: string, github?: string): string {
    let context = `## Resume:\n${resume}\n`;
    if (jd && jd.trim() !== '') context += `\n## Job Description:\n${jd}\n`;
    if (github && github.trim() !== '') context += `\n## GitHub Data:\n${github}\n`;
    return context;
  }

  private parseJSON(text: string): any {
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) ?? text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return {};
    
    try {
      return JSON.parse(jsonMatch[1] ?? jsonMatch[0]);
    } catch (e) {
      console.error("Failed to parse JSON:", e, text.substring(0, 50));
      return {};
    }
  }
}
