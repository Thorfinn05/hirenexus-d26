
export const declaration = [
  {
    name: "fetch_resume_data",
    description: "Retrieves the candidate's resume summary and experience data.",
    parameters: {
      type: "object",
      properties: {
        candidate_id: {
          type: "string",
          description: "The unique ID of the candidate."
        }
      },
      required: ["candidate_id"]
    }
  },
  {
    name: "log_evaluation_score",
    description: "Logs a partial or final evaluation score for the candidate during the interview.",
    parameters: {
      type: "object",
      properties: {
        score: {
          type: "number",
          description: "A score from 1 to 10."
        },
        category: {
          type: "string",
          description: "The category being evaluated (e.g., technical, behavioral, communication)."
        },
        feedback: {
          type: "string",
          description: "Constructive feedback for the candidate."
        }
      },
      required: ["score", "category", "feedback"]
    }
  }
];

export const tools = {
  fetch_resume_data: async ({ candidate_id }: { candidate_id: string }) => {
    console.log(`Fetching resume for ${candidate_id}...`);
    // Mock response for now
    return {
      summary: "Experienced Full-stack Developer with 5 years in React and Node.js.",
      skills: ["React", "TypeScript", "Next.js", "Firebase", "Node.js"],
      experience: [
        { role: "Senior Engineer", company: "TechCorp", period: "2021-Present" }
      ]
    };
  },
  log_evaluation_score: async ({ score, category, feedback }: { score: number, category: string, feedback: string }) => {
    console.log(`Logging score: ${score} for ${category}. Feedback: ${feedback}`);
    // Here you would normally save to Firestore
    return { status: "success", message: "Evaluation logged" };
  }
};
