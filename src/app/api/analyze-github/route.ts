import { NextResponse } from 'next/server';
import { analyzeGithubPortfolio } from '@/ai/flows/analyze-github-flow';

export async function POST(request: Request) {
  try {
    const { githubUrl, targetRole, stream, year } = await request.json();

    if (!githubUrl) {
      return NextResponse.json({ success: false, error: "githubUrl is required" }, { status: 400 });
    }

    const analysisResult = await analyzeGithubPortfolio(githubUrl, { targetRole, stream, year });
    
    if (!analysisResult.success) {
       return NextResponse.json({ success: false, error: analysisResult.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: analysisResult });
  } catch (error: any) {
    console.error("API /analyze-github error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
