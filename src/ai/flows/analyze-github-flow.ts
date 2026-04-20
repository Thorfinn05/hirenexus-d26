import { ai } from "../genkit"
import { z } from "zod"
import { fetchGithubGQL } from "./fetch-github-gql-flow"

const GithubAnalysisSchema = z.object({
  techBreadth: z.array(z.object({
    language: z.string(),
    percentage: z.number(),
    description: z.string()
  })).describe("Top 5 technologies used by the candidate based on repo languages."),
  
  complexityAssessment: z.array(z.object({
    metric: z.string(),
    score: z.number().min(0).max(100),
    fullMark: z.number().default(100)
  })).describe("Scores for Architecture, Complexity, Modularity, Testing, scaling from 0 to 100 based on repo structure, description, and PRs."),

  commitConsistency: z.array(z.object({
    month: z.string(),
    commits: z.number()
  })).describe("Monthly aggregated commit/contribution volume over the past year."),

  summary: z.string().describe("A 2 sentence summary of the developer's GitHub portfolio strengths."),
  
  topRepositories: z.array(z.object({
    name: z.string(),
    role: z.string(),
    description: z.string(),
    notableFeature: z.string()
  })).describe("Top 3 most impressive repositories.")
})

export async function analyzeGithubPortfolio(githubUrl: string) {
  try {
    // 1. Extract username from https://github.com/username
    const urlParts = githubUrl.split('/')
    const username = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2]
    
    if (!username) {
      throw new Error("Invalid GitHub URL")
    }

    // 2. Fetch GQL Data
    const gqlData = await fetchGithubGQL(username)

    // 3. Extract and simplify data for the prompt to avoid token limits
    const simplifiedRepos = gqlData.repositories.nodes.map((repo: any) => ({
      name: repo.name,
      description: repo.description,
      stars: repo.stargazerCount,
      forks: repo.forkCount,
      primaryLanguage: repo.primaryLanguage?.name,
      languages: repo.languages.edges.map((e: any) => e.node.name),
      commits: repo.defaultBranchRef?.target?.history?.totalCount || 0,
      mergedPRs: repo.pullRequests?.totalCount || 0,
      openIssues: repo.issues?.totalCount || 0
    }))

    // Simplify contributions down to monthly to save tokens
    const monthlyCommits: Record<string, number> = {}
    gqlData.contributionsCollection.contributionCalendar.weeks.forEach((week: any) => {
      week.contributionDays.forEach((day: any) => {
        const monthYear = day.date.substring(0, 7) // YYYY-MM
        monthlyCommits[monthYear] = (monthlyCommits[monthYear] || 0) + day.contributionCount
      })
    })

    const aiPrompt = `
      Analyze the following GitHub developer portfolio and extract structured visual data.
      
      Repositories:
      ${JSON.stringify(simplifiedRepos, null, 2)}
      
      Monthly Contributions:
      ${JSON.stringify(monthlyCommits, null, 2)}
      
      Total Yearly Contributions: ${gqlData.contributionsCollection.contributionCalendar.totalContributions}
      
      Instructions:
      1. Calculate 'techBreadth' percentages based on language frequency and repo counts, summing to roughly 100.
      2. For 'complexityAssessment', evaluate the candidate on 4 exact metrics: "Architecture", "Code Complexity", "Modularity", and "Testing/QA" on a scale of 0-100. Deduce these based on repo names, descriptions, merged PRs (indicates teamwork/modularity), and general repo hygiene.
      3. For 'commitConsistency', output an array of the chronological monthly contribution counts.
      4. Highlight the Top 3 repositories and infer the candidate's likely role/focus in them.
    `

    // 4. Generate Structured Output using Genkit + Groq
    const { output } = await ai.generate({
      model: 'groq/llama-3.3-70b-versatile',
      prompt: aiPrompt,
      output: {
        schema: GithubAnalysisSchema,
      },
    })

    return {
      success: true,
      data: output,
      rawUsername: username,
      rawContributions: gqlData.contributionsCollection.contributionCalendar.totalContributions,
      rawReposCount: gqlData.repositories.nodes.length
    }
  } catch (error: any) {
    console.error("Github Analysis Error:", error)
    return { success: false, error: error.message }
  }
}
