# HireNexus

HireNexus is a web application for structured candidate evaluation and hiring workflows. It provides AI-assisted evaluation flows, job and candidate management, reporting, and Firebase-backed authentication and storage.

## Use Cases & Roles

HireNexus provides targeted experiences for two primary types of users:

### 1. Recruiter / HR Professional
The primary administrative and operational role for managing the hiring lifecycle.
- **Candidate & Job Management**: Add, track, and review applicants across different job roles.
- **Bulk Resume Parsing**: Utilize AI agents to extract structured data from arrays of applicant resumes (e.g., CSV imports, bulk uploads) to minimize manual data entry.
- **AI-Driven Evaluation Flows**: AI automatically scores candidates based on standard criteria and acts as an intelligent assistant during the evaluation process.
- **Debate & Comprehensive Reporting**: Leverage advanced AI flows (including an 'AI Debate Streaming Flow') where different AI personas assess candidate strengths and weaknesses. Synthesize results into comprehensive final reports to aid in the final hiring decision.

### 2. Candidate
A streamlined portal for applicants to engage with the recruitment process.
- **Candidate Dashboard**: A personal hub to track application status, view relevant jobs, and manage profile/resume information.
- **Mock Interviews**: Interactive, AI-powered mock interview sessions that help candidates prepare for real scenarios. The AI acts as an interviewer, asking relevant questions and providing instant feedback based on the candidate's responses.
- **Skill Alignment**: Understand how their profile matches various open roles based on AI parsing and job requirements.

## Tech Stack

### Frontend
- **Next.js (App Router)**
- **React** (with TypeScript)
- **Tailwind CSS** (for styling)
- **Radix UI (shadcn/ui)** (for accessible components)
- **Framer Motion** (for animations)
- **Recharts** (for data visualization)
- **React Hook Form & Zod** (for form state and validation)

### Backend
- **Next.js API Routes / Server Actions** (Node.js environment)

### Database & Storage
- **Firebase Firestore** (NoSQL Database)

### Data Processing
- **jsPDF & jsPDF-AutoTable** (for PDF report generation)

### AI/ML
- **Google Genkit** (AI framework)
- **Google Gemini** (`@google/generative-ai`)
- **Groq** (`groq-sdk` for fast LLM inference)

### Security
- **Firebase Authentication** (User identity and access management)
- **Zod** (Schema validation for secure data handling)

## Quick Start (development)

1. **Install dependencies**

```bash
npm install
```

2. **Configure Firebase & Environment Parameters**
- Create a Firebase project and enable Auth + Firestore.
- Add your Firebase config to `src/firebase/config.ts` by ensuring the proper `.env.local` variables exist.

3. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Environment & Configuration
- Keep secrets out of version control; use `.env.local` for local environment variables.
- AI flows might require API keys (e.g., Gemini model references in your environment).

## Project Layout
- `src/app/` — Next.js pages and route layouts (handles routing for `/candidate` and `/` recruiter areas)
- `src/components/` — UI components and cohesive design system
- `src/firebase/` — Firebase initialization and data models
- `src/ai/` — AI logic including mock interview orchestration, prompt flows, and debate generation
- `src/hooks/` — Custom React hooks (e.g., `useUserRole` for managing candidate/recruiter experiences)

## NPM Scripts
- `npm run dev` — Start dev server
- `npm run build` — Build for production
- `npm run start` — Start production server after build

## Contributing
PRs and issues are welcome. Follow any repository contribution guidelines if present.

## License
Add a `LICENSE` file or state your preferred license here.
