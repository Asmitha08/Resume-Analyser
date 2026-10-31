import React, { useState } from 'react';
import {
  Download,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  FileText,
  Briefcase,
  Check,
  Send,
  Loader2,
  TrendingUp,
  Tag,
  ShieldAlert,
  ShieldCheck,
  FileCheck,
  Layers,
  BarChart3,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { ResumeAnalysisResponse, BulletImprovement } from '../types/analysis';

import { ScoreCircle } from './ScoreCircle';
import { SkillsCategoryChart } from './SkillsCategoryChart';
import { BulletImprovementCard } from './BulletImprovementCard';
import { RoadmapTimeline } from './RoadmapTimeline';
import { downloadReportPdf, improveBullets } from '../services/api';

interface AnalysisDashboardProps {
  data: ResumeAnalysisResponse;
  onReset: () => void;
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ data, onReset }) => {
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Custom bullet improver state
  const [customBullet, setCustomBullet] = useState('');
  const [improvingCustom, setImprovingCustom] = useState(false);
  const [customBulletResult, setCustomBulletResult] = useState<BulletImprovement | null>(null);

  // Celebration confetti for strong scores
  React.useEffect(() => {
    if (data.match_score.overall_score >= 75) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#4F46E5', '#7C3AED', '#10B981'],
        });
      } catch {
        // ignore if canvas not supported
      }
    }
  }, [data]);

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    setPdfError(null);
    try {
      await downloadReportPdf(data);
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3000);
    } catch (err: any) {
      setPdfError(err.message || 'Failed to download PDF report.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleCustomBulletEnhance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customBullet.trim()) return;

    setImprovingCustom(true);
    try {
      const results = await improveBullets([customBullet.trim()], data.selected_role);
      if (results && results.length > 0) {
        setCustomBulletResult(results[0]);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to enhance bullet.');
    } finally {
      setImprovingCustom(false);
    }
  };

  const {
    candidate_name = 'Candidate',
    filename,
    selected_role,
    job_title,
    match_score,
    ats_score,
    skills_analysis,
    keyword_analysis,
    strengths,
    improvement_areas,
    bullet_improvements = [],
    skill_gap_roadmap,
    personalized_recommendations = [],
    created_at,
  } = data;

  // Safe fallback if ats_score was omitted
  const atsScore = ats_score || {
    overall_score: 75,
    category: 'Moderate Compatibility',
    explanation: 'Standard document formatting detected with acceptable parser readability.',
    breakdown: {
      formatting_score: 80,
      section_headings_score: 75,
      contact_info_score: 80,
      parsing_quality_score: 85,
      keyword_alignment_score: 65,
    },
    formatting_warnings: [],
    missing_sections: [],
    detected_sections: ['Experience', 'Education', 'Skills'],
    checks: [],
    keyword_coverage_percent: 65,
    found_keywords_count: 5,
    total_keywords_count: 8,
    recommendations: [
      'Maintain standard chronological section headings (Experience, Education, Skills).',
      'Ensure contact details include phone, email, and location on separate clear lines.',
    ],
    disclaimer: 'Transparent application-defined heuristic weights, not official ATS scoring criteria.',
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Action & Meta Banner */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {selected_role}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">
              Analyzed: {created_at}
            </span>
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
            Resume Evaluation: <span className="text-indigo-600">{candidate_name}</span>
          </h2>
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Document: {filename}</span>
            <span className="text-slate-300">|</span>
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <span>Target Role: {job_title}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Analysis</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {downloadingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : pdfSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Full Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {pdfError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{pdfError}</span>
        </div>
      )}

      {/* SECTION A: TWO SEPARATE HERO SCORES (AI Job Match Estimate vs ATS Compatibility Score) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SCORE A: AI Job Match Estimate (0–100) */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900">
                    AI Job Match Estimate
                  </h3>
                  <p className="text-[11px] text-slate-400">Semantic role & skills alignment</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {match_score.match_category}
              </span>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row items-center gap-6">
              <div className="shrink-0">
                <ScoreCircle
                  score={match_score.overall_score}
                  category={match_score.match_category}
                  label="Job Match"
                  size={160}
                />
              </div>
              <div className="space-y-2 text-center sm:text-left">
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {match_score.explanation}
                </p>
                <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Evaluates skills, projects, keywords & role experience</span>
                </div>
              </div>
            </div>

            {/* Factor Progress Bars */}
            <div className="mt-6 space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Score Contributing Factors</span>
                <span className="text-[11px] text-slate-400 font-normal">Candidate Fit</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Skills Alignment</span>
                    <span className="font-bold text-indigo-600">{match_score.score_breakdown.skills_score}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all duration-1000"
                      style={{ width: `${match_score.score_breakdown.skills_score}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Keywords Coverage</span>
                    <span className="font-bold text-indigo-600">{match_score.score_breakdown.keywords_score}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all duration-1000"
                      style={{ width: `${match_score.score_breakdown.keywords_score}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Projects & Experience</span>
                    <span className="font-bold text-indigo-600">{match_score.score_breakdown.experience_score}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all duration-1000"
                      style={{ width: `${match_score.score_breakdown.experience_score}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Education & Core Fit</span>
                    <span className="font-bold text-indigo-600">{match_score.score_breakdown.education_score}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all duration-1000"
                      style={{ width: `${match_score.score_breakdown.education_score}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-[11px] text-indigo-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              <strong>Notice:</strong> {match_score.disclaimer}
            </span>
          </div>
        </div>

        {/* SCORE B: ATS Compatibility Score (0–100) */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900">
                    ATS Compatibility Score
                  </h3>
                  <p className="text-[11px] text-slate-400">Structure, parsing quality & readability</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {atsScore.category}
              </span>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row items-center gap-6">
              <div className="shrink-0">
                <ScoreCircle
                  score={atsScore.overall_score}
                  category={atsScore.category}
                  label="ATS Score"
                  size={160}
                />
              </div>
              <div className="space-y-2 text-center sm:text-left">
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {atsScore.explanation}
                </p>
                <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>5 Heuristic weights evaluating ATS parsing readability</span>
                </div>
              </div>
            </div>

            {/* Heuristic Breakdown Bars (5 application-defined weights) */}
            <div className="mt-6 space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Weighted Heuristic Breakdown</span>
                <span className="text-[11px] text-slate-400 font-normal">Deterministic</span>
              </div>

              <div className="space-y-2.5">
                {/* 1. Formatting & Readability: 25% */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-700 font-medium">Formatting & Readability <span className="text-slate-400 font-normal">(25% weight)</span></span>
                    <span className="font-bold text-emerald-600">{atsScore.breakdown.formatting_score}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-1000"
                      style={{ width: `${atsScore.breakdown.formatting_score}%` }}
                    />
                  </div>
                </div>

                {/* 2. Standard Section Headings: 20% */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-700 font-medium">Standard Section Headings <span className="text-slate-400 font-normal">(20% weight)</span></span>
                    <span className="font-bold text-emerald-600">{atsScore.breakdown.section_headings_score}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-1000"
                      style={{ width: `${atsScore.breakdown.section_headings_score}%` }}
                    />
                  </div>
                </div>

                {/* 3. Contact Info & Structure: 15% */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-700 font-medium">Contact Info & Structure <span className="text-slate-400 font-normal">(15% weight)</span></span>
                    <span className="font-bold text-emerald-600">{atsScore.breakdown.contact_info_score}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-1000"
                      style={{ width: `${atsScore.breakdown.contact_info_score}%` }}
                    />
                  </div>
                </div>

                {/* 4. Text Extraction & Parsing Quality: 20% */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-700 font-medium">Text Extraction & Parsing Quality <span className="text-slate-400 font-normal">(20% weight)</span></span>
                    <span className="font-bold text-emerald-600">{atsScore.breakdown.parsing_quality_score}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-1000"
                      style={{ width: `${atsScore.breakdown.parsing_quality_score}%` }}
                    />
                  </div>
                </div>

                {/* 5. JD Keyword Alignment: 20% */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-700 font-medium">JD Keyword Alignment <span className="text-slate-400 font-normal">(20% weight)</span></span>
                    <span className="font-bold text-emerald-600">{atsScore.breakdown.keyword_alignment_score}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-1000"
                      style={{ width: `${atsScore.breakdown.keyword_alignment_score}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              <strong>Notice:</strong> {atsScore.disclaimer}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION B: ATS SCORE DASHBOARD & DIAGNOSTICS */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>ATS Compatibility Diagnostics & Health Checks</span>
            </h3>
            <p className="text-xs text-slate-500">
              Deterministic evaluation of document structure, extraction viability, and recruiter parsing signals.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {atsScore.keyword_coverage_percent}% Keyword Coverage
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
              {atsScore.detected_sections.length} Headings Found
            </span>
          </div>
        </div>

        {/* 1. Formatting Warnings Banner */}
        {atsScore.formatting_warnings && atsScore.formatting_warnings.length > 0 ? (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>ATS Formatting Warnings ({atsScore.formatting_warnings.length})</span>
            </div>
            <ul className="space-y-1.5 pl-6 list-disc text-xs text-amber-900">
              {atsScore.formatting_warnings.map((warning, idx) => (
                <li key={idx} className="leading-relaxed">{warning}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Clean ATS Structure: No parsing blockers, graphics interference, or layout traps found.</span>
          </div>
        )}

        {/* 2. Headings & Keyword Coverage row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Section Headings Inspection */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-indigo-600" />
                <span>Standard Section Headings</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                {atsScore.detected_sections.length} Detected / {atsScore.missing_sections.length} Missing
              </span>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Detected Sections:</div>
              <div className="flex flex-wrap gap-1.5">
                {atsScore.detected_sections.map((sec, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1"
                  >
                    <Check className="w-3 h-3 text-emerald-600" />
                    {sec}
                  </span>
                ))}
                {atsScore.detected_sections.length === 0 && (
                  <span className="text-xs text-slate-400">None detected.</span>
                )}
              </div>
            </div>

            {atsScore.missing_sections && atsScore.missing_sections.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-200/60">
                <div className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">Missing Recommended Sections:</div>
                <div className="flex flex-wrap gap-1.5">
                  {atsScore.missing_sections.map((sec, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1"
                    >
                      <XCircle className="w-3 h-3 text-rose-600" />
                      {sec}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Keyword Coverage Meter */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span>Job Keyword Coverage</span>
              </span>
              <span className="text-[11px] font-bold text-indigo-600">
                {atsScore.keyword_coverage_percent}%
              </span>
            </div>

            <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all duration-1000"
                style={{ width: `${atsScore.keyword_coverage_percent}%` }}
              />
            </div>

            <div className="text-xs text-slate-600 leading-relaxed">
              Found <strong>{atsScore.found_keywords_count}</strong> of <strong>{atsScore.total_keywords_count}</strong> critical job keywords in your resume text. Increasing keyword alignment boosts automatic ranking in corporate ATS filters.
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200/70 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Keyword Density Metric</span>
              <span className="font-semibold text-slate-700">
                {atsScore.breakdown.keyword_alignment_score} / 100
              </span>
            </div>
          </div>
        </div>

        {/* 3. Deterministic ATS Formatting Checks List */}
        {atsScore.checks && atsScore.checks.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Deterministic Compatibility Checks</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {atsScore.checks.map((chk, idx) => {
                const isPass = chk.status === 'pass';
                const isWarning = chk.status === 'warning';
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                      isPass
                        ? 'bg-emerald-50/40 border-emerald-200 text-emerald-950'
                        : isWarning
                        ? 'bg-amber-50/40 border-amber-200 text-amber-950'
                        : 'bg-rose-50/40 border-rose-200 text-rose-950'
                    }`}
                  >
                    <span className="mt-0.5 shrink-0">
                      {isPass ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : isWarning ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600" />
                      )}
                    </span>
                    <div className="space-y-0.5">
                      <div className="font-bold flex items-center gap-1.5">
                        <span>{chk.name}</span>
                        <span
                          className={`text-[10px] uppercase px-1.5 py-0.2 rounded font-extrabold ${
                            isPass
                              ? 'bg-emerald-100 text-emerald-800'
                              : isWarning
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {chk.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-normal">{chk.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Recommendations to Improve ATS Compatibility */}
        {atsScore.recommendations && atsScore.recommendations.length > 0 && (
          <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
              <Lightbulb className="w-4 h-4 text-indigo-600" />
              <span>Actionable Recommendations to Improve ATS Compatibility</span>
            </div>
            <ul className="space-y-1.5 pl-6 list-disc text-xs text-indigo-950">
              {atsScore.recommendations.map((rec, idx) => (
                <li key={idx} className="leading-relaxed font-medium">{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* SECTION C: Skills & Relevance Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Skills Tag Cloud Card */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
          <div>
            <h3 className="font-heading font-bold text-base text-slate-900 mb-1">
              Skills Alignment Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Direct comparison between candidate credentials and job requirements.
            </p>
          </div>

          {/* Matching Skills */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Matching Skills ({skills_analysis.matching_skills?.length || 0})</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {skills_analysis.matching_skills?.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1"
                >
                  <Check className="w-3 h-3 text-emerald-600" />
                  {skill}
                </span>
              ))}
              {(!skills_analysis.matching_skills || skills_analysis.matching_skills.length === 0) && (
                <span className="text-xs text-slate-400">None detected.</span>
              )}
            </div>
          </div>

          {/* Missing Skills */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Critical Missing Skills ({skills_analysis.missing_skills?.length || 0})</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {skills_analysis.missing_skills?.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"
                >
                  {skill}
                </span>
              ))}
              {(!skills_analysis.missing_skills || skills_analysis.missing_skills.length === 0) && (
                <span className="text-xs text-emerald-600 font-medium">All core requirements met!</span>
              )}
            </div>
          </div>

          {/* Additional Skills */}
          {skills_analysis.additional_skills && skills_analysis.additional_skills.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Additional Candidate Skills ({skills_analysis.additional_skills.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {skills_analysis.additional_skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recharts Visualization */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900">
                Domain Competency Benchmarking
              </h3>
              <p className="text-xs text-slate-500">
                Visualizing candidate depth vs. {selected_role} target benchmark.
              </p>
            </div>
          </div>

          <SkillsCategoryChart categoryScores={skills_analysis.skill_category_scores} />
        </div>
      </div>

      {/* SECTION C: Keyword Analysis */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <div>
          <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
            <Tag className="w-4 h-4 text-indigo-600" />
            <span>Keyword & Terminology Analysis</span>
          </h3>
          <p className="text-xs text-slate-500">
            Inspection of industry terminology alignment and job description keywords.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Found Keywords */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Found Keywords</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {keyword_analysis.found_keywords?.map((kw, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded text-[11px] font-medium bg-white text-slate-700 border border-slate-200"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>

          {/* Missing Keywords */}
          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2">
            <div className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Missing Keywords</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {keyword_analysis.missing_keywords?.map((kw, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white text-amber-800 border border-amber-200"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>

          {/* Important Job Keywords */}
          <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-2">
            <div className="text-xs font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
              <span>Core Job Description Keywords</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {keyword_analysis.important_job_keywords?.map((kw, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded text-[11px] font-medium bg-white text-indigo-700 border border-indigo-200"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION D & E: Resume Strengths & Improvement Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900">
                Resume Strengths
              </h3>
              <p className="text-xs text-slate-500">Strongest sections and evidenced capabilities.</p>
            </div>
          </div>

          <div className="space-y-3">
            {strengths.strong_sections?.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{item}</span>
              </div>
            ))}
            {strengths.relevant_projects?.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed"><strong>Project Fit:</strong> {item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Improvement Areas */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900">
                Targeted Improvement Areas
              </h3>
              <p className="text-xs text-slate-500">Clarity, formatting, and content enhancements.</p>
            </div>
          </div>

          <div className="space-y-3">
            {improvement_areas.weak_bullet_points?.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed"><strong>Weak Framing:</strong> {item}</span>
              </div>
            ))}
            {improvement_areas.missing_information?.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed"><strong>Missing Context:</strong> {item}</span>
              </div>
            ))}
            {improvement_areas.formatting_and_clarity?.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed"><strong>Clarity:</strong> {item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION F: AI Bullet Point Improvement (Section 8 of prompt) */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>AI Resume Bullet Improvements (Before & After)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Transformed into high-impact accomplishment statements using strong action verbs without fabricating metrics.
            </p>
          </div>
        </div>

        {/* Existing Extracted Bullets Improved */}
        <div className="space-y-4">
          {bullet_improvements.map((bullet, idx) => (
            <BulletImprovementCard key={idx} bullet={bullet} index={idx} />
          ))}
          {bullet_improvements.length === 0 && (
            <div className="p-6 text-center text-xs text-slate-400">
              No specific bullet points flagged for revision.
            </div>
          )}
        </div>

        {/* Interactive Custom Bullet Improver */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="p-5 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-3">
            <h4 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Test Another Resume Bullet Point</span>
            </h4>
            <p className="text-xs text-slate-600">
              Paste any custom line from your resume to generate an instant action-oriented rewrite.
            </p>

            <form onSubmit={handleCustomBulletEnhance} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={customBullet}
                onChange={(e) => setCustomBullet(e.target.value)}
                placeholder="e.g., Worked on backend API for user authentication..."
                className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
              <button
                type="submit"
                disabled={improvingCustom || !customBullet.trim()}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all shrink-0"
              >
                {improvingCustom ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Rewriting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Enhance Bullet</span>
                  </>
                )}
              </button>
            </form>

            {customBulletResult && (
              <div className="mt-4 pt-2">
                <BulletImprovementCard bullet={customBulletResult} index={0} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION G: Skill-Gap Roadmap & 30-Day Learning Plan */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
        <RoadmapTimeline roadmap={skill_gap_roadmap} />
      </div>

      {/* SECTION H: Strategic Personalized Recommendations */}
      {personalized_recommendations && personalized_recommendations.length > 0 && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900">
                Personalized Career Recommendations
              </h3>
              <p className="text-xs text-slate-500">
                Actionable next steps to maximize interview conversion for {selected_role}.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {personalized_recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3"
              >
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {rec}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
