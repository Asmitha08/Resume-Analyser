# ResumeAI – AI-Powered Resume Analyzer and Job Matcher

[![FastAPI](https://img.shields.io/badge/FastAPI-0.136.1-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.3-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.3-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4.svg?logo=google&logoColor=white)](https://ai.google.dev)
[![PyMuPDF](https://img.shields.io/badge/PyMuPDF-2.0-FF4B4B.svg)](https://pymupdf.readthedocs.io)
[![ReportLab](https://img.shields.io/badge/ReportLab-5.1-306998.svg)](https://www.reportlab.com)

**ResumeAI** is an enterprise-grade, full-stack web application designed for students, new graduates, and professionals to evaluate their resumes against target job roles and descriptions using the official Google Gen AI Python SDK.

---

## 🌟 Key Features

1. **AI Job Match Estimate (0–100)**
   - Computes a transparent, weighted alignment estimate across Skills (40%), Keywords (25%), Projects & Experience (25%), and Education & Domain Relevance (10%).
   - Explicitly framed as a semantic estimation rather than an opaque or proprietary ATS guarantee.
   - Displayed via an animated circular progress indicator with dynamic categorical status tags (*Exceptional Match*, *Strong Match*, *Moderate Match*, *Low Match*).

2. **Specialized Role Evaluation**
   - Separate, tailored benchmarks for 7 job trajectories:
     - **Software Developer**: DSA, OOP, Git/GitHub, Web Development, Databases, Software Engineering Fundamentals.
     - **Data Analyst**: SQL, Python, Excel, Power BI/Tableau, Applied Statistics, Data Cleaning/Wrangling.
     - **AI/ML Engineer**: PyTorch/TensorFlow, Scikit-learn, Feature Engineering, Neural Networks, Generative AI / LLMs.
     - **Frontend Developer**: React, TypeScript, Responsive CSS, State Management, Web Performance.
     - **Backend Developer**: Server Frameworks, REST/GraphQL APIs, PostgreSQL/Redis, Auth/Security, Microservices.
     - **Full Stack Developer**: End-to-end full-stack architectures and deployment.
     - **Other**: Custom evaluations based strictly on candidate qualifications and job description.
   - Candidates are **never penalized** for technologies irrelevant to their target role.

3. **100% Fact-Preserving Bullet Point Enhancer**
   - Rewrites weak or passive bullet points using high-impact active power verbs and the proven XYZ impact formula (*Accomplished [X] measured by [Y] by doing [Z]*).
   - **Zero Hallucinations Guarantee**: Never fabricates statistics, metrics, companies, or responsibilities.
   - Uses explicit `[X%]` or `[Y requests/sec]` placeholders and guides candidates on where to supply their authentic metrics.
   - One-click copy functionality with immediate visual feedback.

4. **Targeted Skill-Gap Roadmap & 30-Day Plan**
   - Categorizes missing skills into **High Priority** (mandatory), **Medium Priority** (valuable), and **Low Priority** (optional bonuses).
   - Provides *What to Learn*, *Why It Matters*, *Recommended Learning Order*, and a concrete *Mini-Project*.
   - Includes a structured **30-Day Learning Plan** divided into 4 weekly sprints with measurable deliverable milestones.

5. **Executive PDF Report Export**
   - One-click download of an executive-level multi-page PDF evaluation generated via **ReportLab** on the backend.
   - Includes full score breakdowns, side-by-side skill matrix, keyword coverage, bullet rewrites, and the 30-day roadmap.

6. **Robust Text Extraction**
   - Fast, secure extraction from **PDF** files using **PyMuPDF** (`pymupdf`) and **DOCX** files using **python-docx**.
   - Handles multi-page documents, tables, and formatted columns.
   - File validation with size limits (10 MB) and malformed file safeguards.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide React Icons, Recharts, React Router v7, Canvas Confetti |
| **Backend** | Python 3.11+, FastAPI, Pydantic v2, Uvicorn, Python-Multipart |
| **AI Engine** | Google Gemini (`gemini-2.5-flash`) via the official `google-genai` Python SDK |
| **Document Processing** | PyMuPDF (PDF text extraction), python-docx (DOCX parsing), ReportLab (PDF report generation) |
| **Deployment** | Vercel (Frontend SPA), Render (FastAPI Web Service with `render.yaml`) |

---

## 📁 Repository Structure

```
Resume Analyser/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx             # Responsive header with live AI status
│   │   │   ├── Footer.tsx             # Footer with system architecture info
│   │   │   ├── ScoreCircle.tsx        # Animated circular progress indicator
│   │   │   ├── SkillsCategoryChart.tsx# Recharts bar graph comparing candidate vs benchmark
│   │   │   ├── BulletImprovementCard.tsx # Before-and-after rewrite cards
│   │   │   ├── RoadmapTimeline.tsx    # 30-day plan & priority skill tabs
│   │   │   ├── AnalysisDashboard.tsx  # Full analysis results dashboard
│   │   │   └── ApiKeyModal.tsx        # Gemini AI configuration modal
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx        # Marketing & feature showcase page
│   │   │   └── AnalyzePage.tsx        # Drag-and-drop resume upload & form
│   │   ├── services/
│   │   │   └── api.ts                 # Type-safe API client layer
│   │   ├── types/
│   │   │   └── analysis.ts            # Pydantic-mirrored TypeScript interfaces
│   │   ├── App.tsx                    # React Router configuration
│   │   ├── main.tsx                   # React root entrypoint
│   │   └── index.css                  # Tailwind CSS design system
│   ├── public/
│   │   └── favicon.svg                # Custom ResumeAI branded SVG icon
│   ├── package.json
│   ├── vite.config.ts
│   ├── vercel.json                    # SPA routing configuration for Vercel
│   └── .env.example
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI application & CORS configuration
│   │   ├── routes/
│   │   │   ├── health.py              # GET /api/health
│   │   │   └── analysis.py            # POST /api/analyze, /improve-resume, /download-report
│   │   ├── services/
│   │   │   ├── extractor.py           # PyMuPDF & python-docx extraction
│   │   │   ├── gemini_analyzer.py     # Gemini Gen AI integration & Pydantic validation
│   │   │   └── report_generator.py    # ReportLab PDF report generation
│   │   ├── schemas/
│   │   │   └── analysis.py            # Pydantic request & response models
│   │   └── utils/
│   │       └── role_definitions.py    # Evaluation criteria & example job descriptions
│   ├── tests/
│   │   ├── fixtures/                  # Test resumes (.pdf and .docx)
│   │   └── test_backend.py            # Integration test suite (8 tests)
│   ├── requirements.txt
│   ├── .env.example
│   └── render.yaml                    # Deployment configuration for Render
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

### Step 1: Set Up Backend

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

### Step 2: Set Up Frontend

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
   Open [http://127.0.0.1:5173](http://127.0.0.1:5173) in your browser.

---

## 🌐 Production Deployment

### 1. Deploy Backend to Render

1. Push your repository to GitHub.
2. Sign in to [Render](https://render.com).
3. Click **New +** → **Web Service** and connect your GitHub repository.
4. Configure the service:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables in the Render dashboard:
   - `GEMINI_API_KEY`: *Your Google Gemini API Key*
   - `PYTHON_VERSION`: `3.11.9`
   - `CORS_ORIGINS`: `https://your-frontend-app.vercel.app` (or `*`)
6. Deploy! Render will provide your public backend URL (e.g., `https://resume-ai-backend.onrender.com`).

*(Alternatively, you can deploy using the included `backend/render.yaml` blueprint).*

---

### 2. Deploy Frontend to Vercel

1. Sign in to [Vercel](https://vercel.com).
2. Click **Add New...** → **Project** and import your GitHub repository.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
4. Add Environment Variables:
   - `VITE_API_URL`: `https://resume-ai-backend.onrender.com` (your deployed Render URL)
5. Click **Deploy**. Vercel will build the frontend using `vercel.json` for seamless client-side SPA routing.

---

## 🔒 Security & Best Practices

- **Zero API Key Leakage**: The Google Gemini API key is securely managed on the backend using environment variables and is never exposed in client bundles.
- **In-Memory File Processing**: Resumes are parsed in memory via streams (`io.BytesIO`) and are never permanently persisted on disk or shared.
- **Upload Guards**: Strict file type (`.pdf`, `.docx`) and size validation (10 MB maximum) protect against malformed or malicious payloads.
- **Graceful Error Handling**: If API keys are missing or invalid, the application surfaces clear configuration instructions instead of displaying fake results or breaking.

---

## 🎓 Academic Demonstration & Portfolio Notes

- **Real Working AI Pipeline**: Demonstrates practical generative AI application engineering using the official `google-genai` SDK with strict JSON response schemas and Pydantic validation.
- **Modern Full-Stack Architecture**: Demonstrates clean separation of concerns: React 19 UI with Tailwind CSS v4, asynchronous FastAPI backend microservice, and ReportLab document compilation.
- **Ethical AI Principles**: Adheres to strict truthfulness constraints—no fabricated numbers, no fake ATS claims, and explicit candidate guidance.

---

## 📄 License

This project is licensed under the MIT License.
