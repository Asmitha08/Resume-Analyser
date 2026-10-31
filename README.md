# ResumeAI – AI-Powered Resume Analyzer and Job Matcher

[![FastAPI](https://img.shields.io/badge/FastAPI-0.136.1-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.3-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.3-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4.svg?logo=google&logoColor=white)](https://ai.google.dev)
[![PyMuPDF](https://img.shields.io/badge/PyMuPDF-2.0-FF4B4B.svg)](https://pymupdf.readthedocs.io)
[![ReportLab](https://img.shields.io/badge/ReportLab-5.1-306998.svg)](https://www.reportlab.com)
[![GitHub](https://img.shields.io/badge/GitHub-Asmitha08%2FResume--Analyser-181717.svg?logo=github)](https://github.com/Asmitha08/Resume-Analyser)

**ResumeAI** is an enterprise-grade, full-stack web application designed for students, new graduates, and professionals to evaluate their resumes against target job roles and descriptions using the official Google Gen AI Python SDK.

---

## 🌐 Live Demo

| Service | URL |
|---|---|
| **Frontend App** | *Coming soon — Vercel* |
| **Backend API** | *Coming soon — Render* |
| **API Docs (Swagger)** | *Coming soon — Render `/docs`* |
| **GitHub Repository** | [github.com/Asmitha08/Resume-Analyser](https://github.com/Asmitha08/Resume-Analyser) |

---

## 🌟 Key Features

1. **AI Job Match Estimate (0–100)**
   - Computes a transparent, weighted alignment estimate across Skills (40%), Keywords (25%), Projects & Experience (25%), and Education & Domain Relevance (10%).
   - Explicitly framed as a semantic estimation rather than an opaque or proprietary ATS guarantee.
   - Displayed via an animated circular progress indicator with dynamic categorical status tags (*Exceptional Match*, *Strong Match*, *Moderate Match*, *Low Match*).

2. **ATS Compatibility Scanner**
   - Deterministic, explainable ATS score (0–100) computed across 5 heuristic dimensions:
     - **Resume Formatting & Readability** (25%) — word count, bullet structure, layout
     - **Standard Section Headings** (20%) — Experience, Skills, Education, Projects
     - **Contact Information & Document Structure** (15%) — email, phone, LinkedIn/GitHub
     - **Text Extraction & Parsing Quality** (20%) — encoding, word boundaries, image interference
     - **Job Description Keyword Alignment** (20%) — keyword coverage against JD or role benchmarks
   - Provides per-check pass/warning/fail badges with specific, actionable recommendations.
   - Honest disclaimer: score is a heuristic estimate, not an official vendor ATS result.

3. **Specialized Role Evaluation**
   - Separate, tailored benchmarks for 7 job trajectories:
     - **Software Developer**: DSA, OOP, Git/GitHub, Web Development, Databases, Software Engineering Fundamentals.
     - **Data Analyst**: SQL, Python, Excel, Power BI/Tableau, Applied Statistics, Data Cleaning/Wrangling.
     - **AI/ML Engineer**: PyTorch/TensorFlow, Scikit-learn, Feature Engineering, Neural Networks, Generative AI / LLMs.
     - **Frontend Developer**: React, TypeScript, Responsive CSS, State Management, Web Performance.
     - **Backend Developer**: Server Frameworks, REST/GraphQL APIs, PostgreSQL/Redis, Auth/Security, Microservices.
     - **Full Stack Developer**: End-to-end full-stack architectures and deployment.
     - **Other**: Custom evaluations based strictly on candidate qualifications and job description.
   - Candidates are **never penalized** for technologies irrelevant to their target role.

4. **100% Fact-Preserving Bullet Point Enhancer**
   - Rewrites weak or passive bullet points using high-impact active power verbs and the proven XYZ impact formula (*Accomplished [X] measured by [Y] by doing [Z]*).
   - **Zero Hallucinations Guarantee**: Never fabricates statistics, metrics, companies, or responsibilities.
   - Uses explicit `[X%]` or `[Y requests/sec]` placeholders and guides candidates on where to supply their authentic metrics.
   - One-click copy functionality with immediate visual feedback.

5. **Targeted Skill-Gap Roadmap & 30-Day Plan**
   - Categorizes missing skills into **High Priority** (mandatory), **Medium Priority** (valuable), and **Low Priority** (optional bonuses).
   - Provides *What to Learn*, *Why It Matters*, *Recommended Learning Order*, and a concrete *Mini-Project*.
   - Includes a structured **30-Day Learning Plan** divided into 4 weekly sprints with measurable deliverable milestones.

6. **Executive PDF Report Export**
   - One-click download of an executive-level multi-page PDF evaluation generated via **ReportLab** on the backend.
   - Includes full score breakdowns, ATS compatibility section, side-by-side skill matrix, keyword coverage, bullet rewrites, and the 30-day roadmap.

7. **Robust Text Extraction**
   - Fast, secure extraction from **PDF** files using **PyMuPDF** (`pymupdf`) and **DOCX** files using **python-docx**.
   - Handles multi-page documents, tables, and formatted columns.
   - File validation with size limits (10 MB) and malformed file safeguards.
   - Dual input modes: **file upload** (drag & drop) or **paste raw text**.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide React Icons, Recharts, React Router v7, Canvas Confetti |
| **Backend** | Python 3.11+, FastAPI 0.136, Pydantic v2, Uvicorn, Python-Multipart, python-dotenv |
| **AI Engine** | Google Gemini (`gemini-2.5-flash`) via the official `google-genai` Python SDK |
| **ATS Scanner** | Deterministic heuristic engine — pure Python regex, no external API calls |
| **Document Processing** | PyMuPDF (PDF text extraction), python-docx (DOCX parsing), ReportLab (PDF report generation) |
| **Deployment** | Vercel (Frontend SPA), Render (FastAPI Web Service with `render.yaml`) |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server health and AI configuration status |
| `GET` | `/api/roles` | Supported roles and example job descriptions |
| `POST` | `/api/analyze` | Full resume analysis (file upload or raw text) |
| `POST` | `/api/improve-resume` | Standalone bullet point enhancer |
| `POST` | `/api/download-report` | Generate and download executive PDF report |

---

## 📁 Repository Structure

```
Resume Analyser/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx              # Responsive header with live AI status
│   │   │   ├── Footer.tsx              # Footer with system architecture info
│   │   │   ├── ScoreCircle.tsx         # Animated circular progress indicator
│   │   │   ├── SkillsCategoryChart.tsx # Recharts bar graph comparing candidate vs benchmark
│   │   │   ├── BulletImprovementCard.tsx # Before-and-after rewrite cards
│   │   │   ├── RoadmapTimeline.tsx     # 30-day plan & priority skill tabs
│   │   │   ├── AnalysisDashboard.tsx   # Full analysis results dashboard
│   │   │   └── ApiKeyModal.tsx         # Gemini AI configuration modal
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx         # Marketing & feature showcase page
│   │   │   └── AnalyzePage.tsx         # Drag-and-drop resume upload & form
│   │   ├── services/
│   │   │   └── api.ts                  # Type-safe API client layer
│   │   ├── types/
│   │   │   └── analysis.ts             # Pydantic-mirrored TypeScript interfaces
│   │   ├── App.tsx                     # React Router configuration
│   │   ├── main.tsx                    # React root entrypoint
│   │   └── index.css                   # Tailwind CSS design system
│   ├── public/
│   │   └── favicon.svg                 # Custom ResumeAI branded SVG icon
│   ├── package.json
│   ├── vite.config.ts
│   ├── vercel.json                     # SPA routing configuration for Vercel
│   └── .env.example
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI application & CORS configuration
│   │   ├── routes/
│   │   │   ├── health.py               # GET /api/health
│   │   │   └── analysis.py             # POST /api/analyze, /improve-resume, /download-report
│   │   ├── services/
│   │   │   ├── extractor.py            # PyMuPDF & python-docx extraction
│   │   │   ├── gemini_analyzer.py      # Gemini Gen AI integration & Pydantic validation
│   │   │   ├── ats_scanner.py          # Deterministic ATS compatibility scorer
│   │   │   └── report_generator.py     # ReportLab PDF report generation
│   │   ├── schemas/
│   │   │   └── analysis.py             # Pydantic request & response models
│   │   └── utils/
│   │       └── role_definitions.py     # Evaluation criteria & example job descriptions
│   ├── tests/
│   │   ├── fixtures/                   # Test resumes (.pdf and .docx)
│   │   └── test_backend.py             # Integration test suite (8 tests)
│   ├── requirements.txt
│   ├── .env.example
│   └── render.yaml                     # Deployment configuration for Render
├── README.md
└── .gitignore
```

---

## 🚀 Getting Started Locally

### Prerequisites
- Python 3.11 or higher
- Node.js 18 or higher (v20+ recommended)
- A Google Gemini API Key ([Get one free at Google AI Studio](https://aistudio.google.com/app/apikey))

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/Asmitha08/Resume-Analyser.git
cd Resume-Analyser
```

---

### Step 2: Set Up Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. (Optional but recommended) Create and activate a virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Open `backend/.env` and paste your Gemini API Key:
   ```env
   GEMINI_API_KEY=AIzaSyYourActualKeyHere
   PORT=8000
   HOST=0.0.0.0
   CORS_ORIGINS=*
   ```

5. Run the backend tests:
   ```bash
   python tests/test_backend.py
   ```
   *Expected output: `ALL 8 BACKEND TESTS PASSED SUCCESSFULLY!`*

6. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   - Interactive Swagger API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
   - Health Check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

---

### Step 3: Set Up Frontend

1. In a new terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Verify `frontend/.env` points to your backend:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌐 Production Deployment

### 1. Deploy Backend to Render

1. Sign in to [Render](https://render.com) → **New +** → **Web Service**.
2. Connect your GitHub repository: `Asmitha08/Resume-Analyser`.
3. Configure the service:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add Environment Variables:
   - `GEMINI_API_KEY`: *Your Google Gemini API Key*
   - `PYTHON_VERSION`: `3.11.9`
   - `CORS_ORIGINS`: `https://your-frontend-app.vercel.app`
5. Click **Create Web Service** — Render provides your public backend URL.

*(Alternatively, deploy using the included `backend/render.yaml` blueprint.)*

---

### 2. Deploy Frontend to Vercel

1. Sign in to [Vercel](https://vercel.com) → **Add New...** → **Project**.
2. Import the GitHub repository: `Asmitha08/Resume-Analyser`.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
4. Add Environment Variables:
   - `VITE_API_URL`: `https://your-backend.onrender.com`
5. Click **Deploy** — Vercel builds the frontend using `vercel.json` for seamless SPA routing.

---

## 🔒 Security & Best Practices

- **Zero API Key Leakage**: The Google Gemini API key is securely managed on the backend via environment variables and is never exposed in client bundles.
- **In-Memory File Processing**: Resumes are parsed in memory via streams (`io.BytesIO`) and are never permanently persisted on disk or shared.
- **Upload Guards**: Strict file type (`.pdf`, `.docx`) and size validation (10 MB maximum) protect against malformed or malicious payloads.
- **Graceful Error Handling**: If API keys are missing or invalid, the application surfaces clear configuration instructions instead of displaying fake results or breaking.
- **ATS Scanner — No External Calls**: The ATS compatibility engine is fully deterministic and runs offline — no third-party API calls, no data sent externally.

---

## 🎓 Academic Demonstration & Portfolio Notes

- **Real Working AI Pipeline**: Demonstrates practical generative AI application engineering using the official `google-genai` SDK with strict JSON response schemas and Pydantic validation.
- **Modern Full-Stack Architecture**: Clean separation of concerns — React 19 UI with Tailwind CSS v4, asynchronous FastAPI backend microservice, and ReportLab document compilation.
- **Ethical AI Principles**: Adheres to strict truthfulness constraints — no fabricated numbers, no fake ATS claims, and explicit candidate guidance via metric placeholders.
- **Dual Scoring System**: Combines AI-generated semantic match scores with a fully deterministic, explainable ATS heuristic engine for comprehensive evaluation.

---

## 📄 License

This project is licensed under the MIT License.
