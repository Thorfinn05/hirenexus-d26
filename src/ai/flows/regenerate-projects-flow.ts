import { ai } from "../genkit"
import { z } from "zod"
import { fetchGithubGQL } from "./fetch-github-gql-flow"

// The 3 Groq models to use in fallback order (exactly as specified)
const PROJECT_RECOMMENDATION_MODELS = [
  'groq/llama-3.3-70b-versatile',
  'groq/meta-llama/llama-4-scout-17b-16e-instruct',
  'groq/openai/gpt-oss-120b',
] as const;

const ProjectRecommendationSchema = z.array(z.object({
  title: z.string(),
  description: z.string(),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  techStack: z.array(z.string()),
  whyRelevance: z.string(),
  isLevelUp: z.boolean()
})).describe("3-4 personalized project suggestions to bridge skill gaps for the target role.")

/**
 * Regenerates ONLY the project recommendations section using existing GitHub data.
 * Uses a 3-model Groq fallback chain — if one fails, the next picks up.
 */
export async function regenerateProjectRecommendations(
  githubUrl: string,
  targetRole: string,
  context?: { stream?: string; year?: string }
) {
  try {
    // 1. Extract username
    const urlParts = githubUrl.split('/')
    const username = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2]

    if (!username) {
      throw new Error("Invalid GitHub URL")
    }

    // 2. Fetch fresh GQL data (lightweight — GitHub API is fast)
    const gqlData = await fetchGithubGQL(username)

    // 3. Simplify repos for the prompt
    const simplifiedRepos = gqlData.repositories.nodes.map((repo: any) => ({
      name: repo.name,
      description: repo.description,
      stars: repo.stargazerCount,
      forks: repo.forkCount,
      primaryLanguage: repo.primaryLanguage?.name,
      languages: repo.languages.edges.map((e: any) => e.node.name),
      commits: repo.defaultBranchRef?.target?.history?.totalCount || 0,
      mergedPRs: repo.pullRequests?.totalCount || 0,
    }))

    const monthlyCommits: Record<string, number> = {}
    gqlData.contributionsCollection.contributionCalendar.weeks.forEach((week: any) => {
      week.contributionDays.forEach((day: any) => {
        const monthYear = day.date.substring(0, 7)
        monthlyCommits[monthYear] = (monthlyCommits[monthYear] || 0) + day.contributionCount
      })
    })

    const prompt = `
      You are a senior career advisor and portfolio strategist.
      Based on this developer's GitHub portfolio, generate 4 highly personalized project recommendations
      that would help them land a role as: **${targetRole}**.

      Repositories:
      ${JSON.stringify(simplifiedRepos, null, 2)}

      Monthly Contributions:
      ${JSON.stringify(monthlyCommits, null, 2)}

      Total Yearly Contributions: ${gqlData.contributionsCollection.contributionCalendar.totalContributions}

      User Context:
      - Target Role: ${targetRole}
      - Academic Stream: ${context?.stream || "Not specified"}
      - Academic Year: ${context?.year || "Not specified"}

      Instructions:
      1. **Level-Up Logic**: If they have a basic project in a field (e.g., Simple Todolist), suggest a high-level expansion (e.g., Real-time Collaborative Task Management with Redis). Set 'isLevelUp' to true for these.
      2. If they already have advanced projects in a field, focus suggestions on DIFFERENT skill gaps relevant to "${targetRole}", unless the field is a high-growth industry trend.
      3. Tailor project difficulty based on their academic year and experience level visible from repos.
      4. Each recommendation must include a clear "whyRelevance" explaining how it connects to the "${targetRole}" role specifically.
      5. Suggest a diverse tech stack that aligns with what "${targetRole}" roles typically require.
    `

    // 4. Try each model in order — fallback chain
    let lastError: Error | null = null

    for (const model of PROJECT_RECOMMENDATION_MODELS) {
      try {
        console.log(`[Regenerate Projects] Trying model: ${model}`)
        const { output } = await ai.generate({
          model,
          prompt,
          output: {
            schema: ProjectRecommendationSchema,
          },
        })

        console.log(`[Regenerate Projects] Success with model: ${model}`)
        return {
          success: true,
          projectRecommendations: output,
          modelUsed: model,
        }
      } catch (error: any) {
        console.warn(`[Regenerate Projects] Model ${model} failed: ${error.message}`)
        lastError = error
        // Continue to next model
      }
    }

    // All models failed
    throw lastError || new Error("All Groq models failed to generate project recommendations.")

  } catch (error: any) {
    console.error("Regenerate Projects Error:", error)
    return { success: false, error: error.message }
  }
}
