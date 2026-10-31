import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Code2, Server, FileCheck2, Cpu, Heart } from 'lucide-react';


export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-heading font-bold text-lg text-slate-900 tracking-tight">
                Resume<span className="text-indigo-600">AI</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enterprise-grade resume analysis and job-description matching powered by Google Gemini AI.
              Built for precision, truthfulness, and student career acceleration.
            </p>
            <div className="pt-2 text-xs text-slate-400">
              © {new Date().getFullYear()} ResumeAI. All rights reserved.
            </div>
          </div>

          {/* Core Features */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider font-heading">
              Platform Features
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link to="/analyze" className="hover:text-indigo-600 transition-colors">
                  AI Job Match Estimator
                </Link>
              </li>
              <li>
                <Link to="/analyze" className="hover:text-indigo-600 transition-colors">
                  Skills Gap & Relevance Matrix
                </Link>
              </li>
              <li>
                <Link to="/analyze" className="hover:text-indigo-600 transition-colors">
                  Fact-Preserving Bullet Rewriter
                </Link>
              </li>
              <li>
                <Link to="/analyze" className="hover:text-indigo-600 transition-colors">
                  30-Day Personalized Roadmap
                </Link>
              </li>
              <li>
                <Link to="/analyze" className="hover:text-indigo-600 transition-colors">
                  Executive PDF Report Export
                </Link>
              </li>
            </ul>
          </div>

          {/* Supported Roles */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider font-heading">
              Supported Job Roles
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>Software Developer (DSA & OOP)</li>
              <li>Data Analyst (SQL, Python & BI)</li>
              <li>AI / ML Engineer (PyTorch & LLMs)</li>
              <li>Frontend Developer (React & TypeScript)</li>
              <li>Backend Developer (APIs & Systems)</li>
              <li>Full Stack Developer</li>
            </ul>
          </div>

          {/* Tech Architecture & Credentials */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider font-heading">
              System Architecture
            </h4>
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 text-[11px] font-mono text-slate-700">
                <Cpu className="w-3 h-3 text-indigo-500" /> Google Gemini Flash
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 text-[11px] font-mono text-slate-700">
                <Server className="w-3 h-3 text-emerald-500" /> FastAPI Python
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 text-[11px] font-mono text-slate-700">
                <Code2 className="w-3 h-3 text-cyan-500" /> React 19 + Vite
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 text-[11px] font-mono text-slate-700">
                <FileCheck2 className="w-3 h-3 text-red-500" /> PyMuPDF & ReportLab
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal pt-2">
              Demonstration-ready college capstone & portfolio project. Zero hardcoded templates; 100% dynamic AI reasoning.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for engineers and career seekers.</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-slate-400">Deployable via Vercel & Render</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
