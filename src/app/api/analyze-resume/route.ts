import { NextRequest, NextResponse } from "next/server";
import { MultiAgentOrchestrator } from "@/services/multi-agent-orchestrator";

// Allow a longer max duration for Vercel/Next since the agent debate can take time.
export const maxDuration = 60; // seconds

export async function POST(req: NextRequest) {
  try {
    const { resumeText, jobDescription, githubData } = await req.json();

    if (!resumeText) {
      return NextResponse.json(
        { success: false, error: "resumeText is required" },
        { status: 400 }
      );
    }

    const orchestrator = new MultiAgentOrchestrator();

    // Phase 1: Individual Analysis (parallel)
    console.log("🤖 Phase 1: Individual Agent Analysis...");
    const analyses = await orchestrator.conductIndividualAnalysis(
      resumeText,
      jobDescription,
      githubData
    );

    // Phase 2: Debate Round (sequential)
    console.log("🗣️ Phase 2: Agent Debate...");
    const debateTranscript = await orchestrator.conductDebateRound(
      analyses,
      resumeText,
      1 // 1 round of debate
    );

    // Phase 3: Consensus Building
    console.log("🤝 Phase 3: Building Consensus...");
    const consensus = await orchestrator.buildConsensus(
      analyses,
      debateTranscript,
      resumeText
    );

    return NextResponse.json({
      success: true,
      data: {
        individualAnalyses: analyses,
        debate: debateTranscript,
        consensus,
      },
    });
  } catch (error: any) {
    console.error("Multi-agent analysis failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to analyze resume.",
      },
      { status: 500 }
    );
  }
}
