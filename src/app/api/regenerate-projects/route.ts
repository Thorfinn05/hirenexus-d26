import { NextResponse } from 'next/server';
import { regenerateProjectRecommendations } from '@/ai/flows/regenerate-projects-flow';

export async function POST(request: Request) {
  try {
    const { githubUrl, targetRole, stream, year } = await request.json();

    if (!githubUrl) {
      return NextResponse.json({ success: false, error: "githubUrl is required" }, { status: 400 });
    }

    if (!targetRole) {
      return NextResponse.json({ success: false, error: "targetRole is required" }, { status: 400 });
    }

    const result = await regenerateProjectRecommendations(githubUrl, targetRole, { stream, year });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      projectRecommendations: result.projectRecommendations,
      modelUsed: result.modelUsed,
    });
  } catch (error: any) {
    console.error("API /regenerate-projects error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
