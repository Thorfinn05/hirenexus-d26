import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/ai/genkit";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { analysisData, targetRole, resumeText } = await req.json();

    if (!analysisData) {
      return NextResponse.json(
        { success: false, error: "analysisData is required" },
        { status: 400 }
      );
    }

    const prompt = `You are an expert career strategist and technical mentor. 
Based on a recent multi-agent hiring panel evaluation, generate a comprehensive Skill Gap Analysis & Roadmap for this candidate.

## Target Role:
${targetRole || "Software Engineer"}

## Candidate Resume Summary:
${resumeText?.substring(0, 5000) || "Summary not available"}

## Hiring Panel Consensus:
Overall Score: ${analysisData.consensus?.overallScore}/100
Strengths: ${analysisData.consensus?.strengths?.join(", ")}
Gap Areas: ${analysisData.consensus?.weaknesses?.join(", ")}

Generate a detailed report in strictly valid JSON format matching this structure exactly (do not output markdown ticks like \`\`\`json):
{
  "summary": "2-3 sentence overview of the candidate's position relative to the target role.",
  "chartData": [
    { "skill": "Core Language Depth", "has": number, "needs": number },
    { "skill": "System Design", "has": number, "needs": number },
    { "skill": "Backend/Frontend", "has": number, "needs": number },
    { "skill": "DevOps/Testing", "has": number, "needs": number },
    { "skill": "Product Sense", "has": number, "needs": number },
    { "skill": "Soft Skills", "has": number, "needs": number }
  ], /* Scores out of 10 */
  "roadmap": [
    { 
      "phase": "Foundation & Quick Wins", 
      "duration": "1-2 Weeks", 
      "tasks": ["...", "..."], 
      "priority": "high" 
    },
    { 
      "phase": "...", 
      "duration": "...", 
      "tasks": ["...", "..."], 
      "priority": "..." 
    }
  ], /* Provide 3-4 clear phases */
  "resources": [
    { 
      "type": "course" | "project" | "certification", 
      "name": "...", 
      "description": "...", 
      "link": "...", 
      "priority": "essential" | "recommended" 
    }
  ] /* Provide at least 5 varied resources */
}

Focus on bridging the specific gap areas mentioned by the panel. Be specific with task names and resource types.`;

    let reportText = "";
    
    try {
      // Primary: Gemini 3.1 Flash Lite
      const { text } = await ai.generate({
        model: 'googleai/gemini-3.1-flash-lite-preview',
        prompt,
        config: { temperature: 0.4 }
      });
      reportText = text;
    } catch (e) {
      console.warn("Gemini 3.1 failed, falling back to GPT-OSS-120B", e);
      try {
        // Fallback 1: GPT-OSS-120B
        const { text } = await ai.generate({
          model: 'groq/openai/gpt-oss-120b',
          prompt,
          config: { temperature: 0.4 }
        });
        reportText = text;
      } catch (e2) {
        console.warn("GPT-OSS-120B failed, falling back to Llama 3.3", e2);
        try {
          // Fallback 2: Llama 3.3
          const { text } = await ai.generate({
            model: 'groq/llama-3.3-70b-versatile',
            prompt,
            config: { temperature: 0.4 }
          });
          reportText = text;
        } catch (e3) {
          console.error("All models failed", e3);
          throw new Error("All LLM models failed to generate roadmap.");
        }
      }
    }

    const report = parseJSON(reportText);

    return NextResponse.json({
      success: true,
      report
    });
  } catch (error: any) {
    console.error("Skill Gap generation failed:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate roadmap." },
      { status: 500 }
    );
  }
}

function parseJSON(text: string): any {
  const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) ?? text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return {};
  
  try {
    return JSON.parse(jsonMatch[1] ?? jsonMatch[0]);
  } catch (e) {
    console.error("Failed to parse JSON:", e, text.substring(0, 50));
    return {};
  }
}
