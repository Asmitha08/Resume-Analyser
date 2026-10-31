import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Target,
  BarChart3,
  Flame,
  Download,
  ShieldCheck,
  Zap,
  Code2,
  Database,
  Cpu,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { ScoreCircle } from '../components/ScoreCircle';


export const LandingPage: React.FC = () => {
  const [activeRoleTab, setActiveRoleTab] = useState<string>('Software Developer');

  const roleCompetencies: Record<string, { desc: string; skills: string[]; icon: any }> = {
    'Software Developer': {
      desc: 'Evaluated for core algorithmic rigor, object-oriented design, version control, and system foundations.',
      skills: ['DSA & Complexity', 'OOP Architecture', 'Git/GitHub Flow', 'SQL Databases', 'RESTful Services', 'Testing & CI/CD'],
      icon: Code2,
    },
    'Data Analyst': {
      desc: 'Benchmarked on query performance, exploratory analysis, statistical modeling, and executive storytelling.',
      skills: ['Complex SQL & Window Funcs', 'Python (Pandas/NumPy)', 'Power BI / Tableau', 'Advanced Excel', 'Hypothesis Testing', 'Data Wrangling'],
      icon: BarChart3,
    },
    'AI/ML Engineer': {
      desc: 'Assessed on end-to-end model training, deep neural pipelines, mathematical foundations, and modern LLM / GenAI tools.',
      skills: ['PyTorch / TensorFlow', 'Scikit-learn', 'Feature Engineering', 'Generative AI & LLMs', 'Vector DBs / RAG', 'Model Evaluation'],
      icon: Cpu,
    },
    'Frontend Developer': {
      desc: 'Analyzed for modern UI/UX design implementation, component performance, TypeScript fidelity, and responsive design.',
      skills: ['React 18+ & TypeScript', 'Modern CSS & Tailwind', 'State Management', 'Web Performance & Core Vitals', 'Responsive Design', 'API Integration'],
      icon: Layers,
    },
    'Backend Developer': {
      desc: 'Evaluated on high-throughput microservices, database normalization, asynchronous task queues, and security.',
      skills: ['FastAPI / Node.js', 'PostgreSQL & Redis', 'Auth & Security (JWT)', 'Docker & Containers', 'API Architecture', 'Distributed Systems'],
      icon: Database,
    },
    'Full Stack Developer': {
      desc: 'Bridging client and server architectures with end-to-end system design and cloud deployment ownership.',
      skills: ['React + Node/Python', 'Database Schema Design', 'Docker Containers', 'End-to-End Testing', 'Cloud Deployment', 'API Contracts'],
      icon: Zap,
    },
  };

  const currentRole = roleCompetencies[activeRoleTab] || roleCompetencies['Software Developer'];
  const RoleIcon = currentRole.icon;

  return (
    <div className="space-y-24 subtle-mesh">
      {/* 1. HERO SECTION */}
      <section className="pt-12 md:pt-20 pb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
              <span>Powered by Official Google Gemini AI Engine</span>
            </div>

            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-slate-900 tracking-tight leading-[1.12]">
              Your Resume.{' '}
              <span className="gradient-text">Your Next Opportunity.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              Upload your resume and match it against any job description in seconds. Get an estimated
              AI job match score, truthful bullet improvements with strong action verbs, and a 30-day personalized skill roadmap.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                to="/analyze"
                className="px-6 py-3.5 rounded-2xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>Analyze My Resume</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#features"
                className="px-6 py-3.5 rounded-2xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <span>Explore Features</span>
              </a>
            </div>

            {/* Key Value Guarantees */}
            <div className="pt-6 border-t border-slate-200/70 grid grid-cols-3 gap-4 text-left">
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% Factual</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Zero fabricated achievements</p>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Role Tailored</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">7 core tech domains supported</p>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                  <Download className="w-3.5 h-3.5 text-violet-600" />
                  <span>PDF Export</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">ReportLab formatted reports</p>
              </div>
            </div>
          </div>

          {/* Right Hero Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-2xl shadow-indigo-500/10 space-y-6">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Live AI Evaluation</h3>
                    <p className="text-[11px] text-slate-400">Target: Full Stack Developer</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Strong Match
                </span>
              </div>

              {/* Circular Gauge Preview */}
              <div className="py-2 flex justify-center">
                <ScoreCircle score={84} category="Strong Match" size={170} />
              </div>

              {/* Skills Tags Preview */}
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Detected Skill Alignment</span>
                  <span className="text-indigo-600 font-bold">88%</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ✓ React 19
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ✓ Python FastAPI
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ✓ PostgreSQL
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                    ✗ Docker Kubernetes
                  </span>
                </div>
              </div>

              {/* Bullet Sample */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
                  AI Action-Verb Rewriter:
                </span>
                <p className="font-medium text-[11px] text-slate-900">
                  "Spearheaded microservice migration using FastAPI, reducing API response latency by [X%]."
                </p>
              </div>
            </div>

            {/* Decorative background glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-2xl -z-10 rounded-full" />
          </div>
        </div>
      </section>

      {/* 2. SUPPORTED ROLES SHOWCASE SECTION */}
      <section id="roles" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            Intelligent Role Specialization
          </span>
          <h2 className="font-heading font-extrabold text-3xl text-slate-900 tracking-tight">
            Tailored Criteria for Every Tech Trajectory
          </h2>
          <p className="text-sm text-slate-600">
            We don't penalize candidates for irrelevant tools. A Data Analyst is evaluated on SQL and analytics, not Kubernetes.
          </p>
        </div>

        {/* Role Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {Object.keys(roleCompetencies).map((role) => (
            <button
              key={role}
              onClick={() => setActiveRoleTab(role)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeRoleTab === role
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 scale-105'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-300'
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Selected Role Card */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                <RoleIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-xl text-slate-900">{activeRoleTab}</h3>
                <p className="text-xs text-slate-500">{currentRole.desc}</p>
              </div>
            </div>

            <Link
              to="/analyze"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              <span>Test with this role</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="pt-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Core Competency Domains Evaluated:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {currentRole.skills.map((skill, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs font-medium text-slate-800 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE FEATURES GRID */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            Precision Capabilities
          </span>
          <h2 className="font-heading font-extrabold text-3xl text-slate-900 tracking-tight">
            Engineered for Transparency & Impact
          </h2>
          <p className="text-sm text-slate-600">
            Move past opaque black-box resume filters. Get actionable, transparent diagnostics that elevate your career.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="glass-card p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-slate-900">
              AI Job Match Estimate
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Synthesizes skills, keywords, projects, and educational credentials into a clear 0-100 score with full transparency.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-card p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-slate-900">
              Zero Hallucinations Guarantee
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We never fabricate numbers, titles, or experiences. Missing metrics are framed with clear placeholders for candidate verification.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-card p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-slate-900">
              Action-Verb Bullet Rewriter
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Transforms passive duties into high-impact accomplishment bullets using proven XYZ impact formulas.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="glass-card p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-slate-900">
              30-Day Skill-Gap Roadmap
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Identifies missing qualifications and constructs a structured 4-week sprint complete with practical mini-projects.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="glass-card p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-slate-900">
              Visual Benchmark Analytics
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Interactive Recharts radar and bar graphs illustrating candidate alignment against real-world target benchmarks.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="glass-card p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-slate-900">
              Executive PDF Report
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              One-click download of a formatted ReportLab evaluation document for offline study, mentors, or portfolio presentation.
            </p>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              Streamlined Workflow
            </span>
            <h2 className="font-heading font-extrabold text-3xl text-slate-900 tracking-tight">
              Three Simple Steps to Interview Readiness
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 font-extrabold text-xl flex items-center justify-center mx-auto shadow-sm">
                1
              </div>
              <h3 className="font-heading font-bold text-base text-slate-900">Upload Your Resume</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Drag and drop your PDF or DOCX file, or paste raw text. PyMuPDF securely extracts your sections without storing documents permanently.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 font-extrabold text-xl flex items-center justify-center mx-auto shadow-sm">
                2
              </div>
              <h3 className="font-heading font-bold text-base text-slate-900">Select Role & Paste JD</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Choose from 7 specialized tech roles and supply the target job description (or click our instant sample JDs).
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 rounded-2xl gradient-bg text-white font-extrabold text-xl flex items-center justify-center mx-auto shadow-md shadow-indigo-500/20">
                3
              </div>
              <h3 className="font-heading font-bold text-base text-slate-900">Unlock Deep Analysis</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Review your match estimate, copy improved bullet points, follow your 30-day skill roadmap, and export your ReportLab PDF.
              </p>
            </div>
          </div>

          <div className="pt-4 text-center">
            <Link
              to="/analyze"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 transition-all"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
