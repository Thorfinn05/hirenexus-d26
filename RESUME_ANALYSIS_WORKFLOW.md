# Resume Analysis Workflow: HireNexus Multi-Agent System

This document provides a detailed technical breakdown of the HireNexus resume analysis pipeline, from initial ingestion to the final executive verdict and candidate roadmap.

## 🌟 High-Level Architecture
The HireNexus analysis system is a **Multi-Agent Orchestration** framework. Instead of a single LLM pass, it utilizes a "panel of experts" approach where five specialized AI agents deliberate over a candidate's profile in a structured, multi-phase workflow.

---

## 🛠 Phase 0: Data Intake & Structured Parsing
The process begins when a candidate initiates an analysis from the **Resume Analysis Dashboard**.

1.  **Multi-Source Ingestion**: The system collects:
    *   **Resume**: Extracted text from the candidate's uploaded PDF.
    *   **Target Role & Experience**: User-defined parameters for the specific evaluation context.
    *   **GitHub Context**: If a URL is provided, the `fetchGithubProfile` flow retrieves a structured summary of repositories, languages, and contributions.
2.  **Initial Parsing (`parseResumeFlow`)**: 
    *   A Genkit-powered flow uses **Gemini 1.5 Flash** to convert raw resume text into a structured JSON object.
    *   It extracts key technical skills, condensed project descriptions, and core tech stacks, discarding "fluff" to optimize the token window for the subsequent multi-agent phase.

---

## 🤖 Phase 1: Individual Expert Analysis (Parallel)
The structured data is passed to the `MultiAgentOrchestrator`, which triggers five independent AI agents in parallel. Each agent is powered by a high-capacity model (Llama 3.3 70B or GPT-OSS 120B via Groq) and guided by a unique system persona.

| Agent | Role | Expertise | Key Scoring Criteria |
| :--- | :--- | :--- | :--- |
| **Marcus** | Senior Tech Lead | System Architecture | Depth vs. breadth, scalability, CI/CD, documentation. |
| **Sarah** | HR Director | Talent Assessment | Career trajectory, communication, cultural alignment. |
| **Alex** | Lead Product Manager | Product Strategy | Business impact, user-centric thinking, delivery. |
| **Elena** | Engineering Manager | Team Leadership | Mentorship, ambiguity handling, process improvement. |
| **Leo** | Startup CTO | Rapid Execution | Versatility, scrappiness, innovation, speed. |

**Output**: Each agent provides a score (0-100), specific strengths/weaknesses, and a detailed narrative analysis from their specific vantage point.

---

## 🗣️ Phase 2: The Agent Debate (Sequential)
To resolve conflicting views and uncover deeper insights, the agents enter a structured debate round.

1.  **Critique Loop**: Each agent is shown the scores and key findings of the other four agents.
2.  **Deliberation**: Agents respond sequentially, either agreeing with another's point (with evidence), disagreeing (citing counter-examples from the resume), or adding a new perspective.
3.  **Real-time Streaming**: In the UI, the `MultiAgentDebate` component visualizes this transcript, allowing the candidate to see the "hidden" deliberation process.

---

## 🤝 Phase 3: Consensus Building & Final Verdict
The **"Committee Chair"** is the high-reasoning model that oversees the final decision.

*   **The Model**: **Groq Llama 3.3 70B Versatile** is the designated high-reasoning model for this phase. It is specifically chosen for its superior synthesis and logical reconciliation capabilities, acting as the final judge between specialized agent perspectives.
*   **Consensus Synthesis**: The orchestrator calls `buildConsensus` in `src/services/multi-agent-orchestrator.ts`, passing all individual reports and the full debate transcript to this model.

### 📊 How the Final Score is Measured
The final **Overall Match Rate** is not a simple mathematical average. It is a **weighted, qualitative synthesis** performed by the Llama 3.3 model:
1.  **Individual Weights**: It reviews the scores from all 5 agents (Marcus, Sarah, Alex, Elena, Leo).
2.  **Debate Resolution**: It analyzes the "Panel Debate" to see which arguments were successfully defended. For example, if Marcus (Tech Lead) provides a compelling technical critique that survives cross-examination, the synthesis model weighs his score more heavily.
3.  **Holistic Judgment**: The model is instructed to provide a `weighted average with its own judgment`. This means it can adjust the final score based on the *quality* of evidence cited in the debate, rather than just treating all scores equally.
4.  **Consensus Reports**: It identifies the top 5 agreed-upon strengths and weaknesses that were cross-validated by the panel.
5.  **Actionable Output**: It generates the final **Consensus Narrative** and **Prioritized Action Items**.


---

## 🚀 Post-Verdict: Adaptive Skill Gap Roadmap
The workflow concludes by bridging the analysis to action.

*   **Gap Analysis**: The system compares the candidate's extracted skills against the requirements for the "Role Mastery" level of their target position.
*   **Personalized Roadmap**: The candidate is directed to a visual timeline that breaks down exactly what to learn, which projects to build, and which resources to use to reach a 100/100 match rate.

---

## 💻 Implementation Details
*   **Backend Service**: `src/services/multi-agent-orchestrator.ts`
*   **API Entry Point**: `/api/analyze-resume`
*   **Personas Config**: `src/config/agent-personas.ts`
*   **Frontend Component**: `src/components/multi-agent-debate.tsx`
*   **AI Infrastructure**: Google Genkit + Groq Inference Engine.
