# HireNexus

HireNexus is an advanced, AI-powered platform designed to revolutionize the evaluation and hiring workflow. Built to bridge the gap between recruiters and candidates, the application offers structured evaluations, seamless candidate management, intelligent reporting, and Firebase-backed secure authentication.

By integrating state-of-the-art Generative AI frameworks like **Google Genkit** and **Gemini**, HireNexus automates intensive tasks such as bulk resume parsing, skill gap analysis, multi-agent evaluation debates, and interactive mock interviews, ensuring a standardized, unbiased, and hyper-efficient hiring lifecycle.

---

## 🌟 Key Features & Use Cases

HireNexus offers tailored, robust experiences for two primary user roles:

### 1. Recruiter / HR Professional (Administrative Portal)
The complete operational hub for managing the end-to-end recruitment process.
- **Job & Pipeline Management**: Effortlessly post jobs, track applicants across custom pipeline stages, and manage detailed candidate profiles.
- **Bulk AI Resume Parsing**: Automate the ingestion of applicant resumes (via file uploads or CSVs), utilizing AI agents to instantly extract structured schemas (skills, experience, education), drastically reducing manual data entry.
- **AI-Driven Evaluation Matrix**: Leverage AI to automatically score candidates against predefined, customizable job criteria, ensuring an objective baseline for all applicants.
- **Multi-Agent Evaluation Debate (Advanced AI Flow)**: Trigger a sophisticated streaming AI flow where distinct AI personas (e.g., Technical Reviewer, Culture Fit Specialist, HR Manager) debate a candidate's strengths and weaknesses. The system synthesizes this debate into a single, comprehensive final decision report.
- **Export & Reporting**: Generate comprehensive, formatted PDF reports of candidate evaluations and interview histories using `jsPDF`.

### 2. Candidate (Applicant Portal)
A streamlined, interactive portal designed to empower applicants and keep them engaged.
- **Candidate Dashboard**: A personalized hub to monitor application statuses, update public resumes, and discover well-aligned job opportunities.
- **Interactive Mock Interviews**: Dynamic, AI-powered mock interview sessions tailored to specific job roles. The AI acts as a rigorous conversational interviewer, prompting the candidate, processing their technical/behavioral responses, and delivering actionable, instant feedback.
- **Skill Gap Dashboard**: Candidates can visualize how their current skill set aligns with market demands or specific job postings via AI-generated skill gap analyses and actionable upskilling roadmaps.

---

## 🏗 Architecture & Tech Stack

The platform's architecture is deeply integrated into the modern Node ecosystem, focusing on high performance, server-side rendering, and scalable AI inference.

### Frontend
- **Framework**: **Next.js 15** (App Router paradigm)
- **Library**: **React 19** (with strict TypeScript)
- **Styling**: **Tailwind CSS** & **Framer Motion** (for fluid, modern animations)
- **Component Library**: **Radix UI** primitives and **shadcn/ui** for accessible, customizable components.
- **Data Visualization**: **Recharts**
- **State & Forms**: **React Hook Form** coupled with **Zod** schema validation.

### Backend & API
- **API Runtime**: Next.js Server Actions and API Routes executing securely in the Node.js environment.
- **Schema Validation**: End-to-end type safety using **Zod**.

### Database & Storage
- **Database**: **Firebase Firestore** (NoSQL Document Store for high-read scalability)
- **Authentication**: **Firebase Authentication** (Managing both Candidate and Recruiter identities, roles, and session security)

### AI & Machine Learning Integrations
- **Framework**: **Google Genkit** (`@genkit-ai/*`) for structured prompt engineering, tool calling, and flow orchestration.
- **Core Models**: **Google Gemini** (`@google/generative-ai`) and **Groq** (`groq-sdk` for ultra-fast, low-latency LLM inference).

---

## 🌊 Core Workflows

### 1. The Multi-Agent Debate Flow
1. **Trigger**: Recruiter selects a candidate and job role to evaluate.
2. **Orchestration**: The system dispatches the candidate's parsed resume and job description to `src/ai/flows`.
3. **Debate**: Different AI personas (defined in `personas.ts`) review the candidate from varying perspectives.
4. **Consensus**: The Genkit orchestrator forces the agents to reach a consensus, streaming the debate live to the frontend interface (`multi-agent-debate.tsx`), and generates a final PDF-ready score and summary.

### 2. Interactive Mock Interview Flow
1. **Trigger**: Candidate launches a mock interview for a target role.
2. **Contextualization**: The AI analyzes the user's resume alongside the target job requirements.
3. **Session Chat**: A real-time WebSocket or streaming HTTP connection is opened. The AI asks a behavioral/technical question.
4. **Feedback Loop**: Candidate replies. AI analyzes the answer's depth, correctness, and confidence, scoring it and guiding the next question dynamically.

---

## 📁 Project Structure

```text
hirenexus/
├── src/
│   ├── app/                # Next.js App Router (Pages, Layouts, API Routes)
│   │   ├── (marketing)/    # Landing pages and public-facing routes
│   │   ├── recruiter/      # Protected routes for HR professionals
│   │   ├── candidate/      # Protected routes for job applicants
│   │   └── api/            # Generic API endpoints and webhooks
│   ├── components/         # Reusable React components (UI library, forms, charts)
│   ├── firebase/           # Firebase configuration, initialization, and models
│   ├── ai/                 # AI Orchestration Logic
│   │   ├── flows/          # Genkit flow definitions (Debate, Mock Interview)
│   │   ├── personas.ts     # System prompts and definitions for AI agents
│   │   └── tools.ts        # Custom tools accessible to LLMs
│   ├── hooks/              # Custom React hooks (e.g., Role management)
│   ├── lib/                # Utility scripts, constants, formatting tools
│   └── services/           # External service wrappers (e.g., Firestore DAO)
├── .env.local              # Local environment variables (Not in VCS)
├── package.json            # Node.js dependencies and scripts
└── tailwind.config.ts      # Tailwind CSS configuration
```

---

## 🚀 Getting Started (Development)

### Prerequisites
- Node.js `v20+`
- A Firebase Project (with Firestore and Authentication enabled)
- AI API Keys (Google Gemini API, Groq API)

### 1. Installation
Clone the repository and install the dependencies:
```bash
git clone https://github.com/AitijhyaCoded/hirenexus-d26.git
cd hirenexus
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the root directory. You will need to populate it with your specific Firebase and API credentials. *Avoid committing this file to version control.*

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# AI Provider Keys
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key

#Github Provider
GITHUB_TOKEN=your_github_token

#Eleven Labs Provider
ELEVEN_LABS_API_KEY=your_eleven_labs_api_key
```

### 3. Start the Development Server
Run the application locally. We recommend utilizing Turbopack for improved build speeds.

```bash
npm run dev
```
Navigate to [http://localhost:8000](http://localhost:8000) (or the port specified) to view the application.

### 4. Running Genkit (AI Debugging)
To debug and trace your Genkit flows locally:
```bash
# Starts Genkit UI and local emulation for AI flows
npm run genkit:dev
```

---

## 📜 Available NPM Scripts

- `npm run dev`: Starts the Next.js development server with Turbopack on port 8000.
- `npm run build`: Compiles the application for production deployment.
- `npm run start`: Runs the compiled production application.
- `npm run lint`: Runs ESLint to catch syntax and style issues.
- `npm run typecheck`: Runs the TypeScript compiler recursively without emitting files to verify type safety.
- `npm run genkit:dev`: Starts the Google Genkit Developer UI and runtime for testing AI flows.
- `npm run genkit:watch`: Starts Genkit developer functionality in watch mode for hot-reloading AI logic.

---

## 🤝 Contributing

We welcome pull requests! For major changes, please open an issue first to discuss what you would like to change. 

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.
