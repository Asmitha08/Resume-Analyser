import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  Trash2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Loader2,
  FileCheck2,
  Key,
} from 'lucide-react';
import {
  analyzeResumeFile,
  analyzeResumeText,
  getRoles,
} from '../services/api';
import type { RolesResponse } from '../services/api';
import type { ResumeAnalysisResponse, SupportedRole } from '../types/analysis';
import { AnalysisDashboard } from '../components/AnalysisDashboard';


interface AnalyzePageProps {
  onOpenSettings: () => void;
}

export const AnalyzePage: React.FC<AnalyzePageProps> = ({ onOpenSettings }) => {
  // Input mode: file or raw text
  const [inputMode, setInputMode] = useState<'upload' | 'text'>('upload');

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Text resume state
  const [resumeText, setResumeText] = useState('');

  // Role and Job Description state
  const [selectedRole, setSelectedRole] = useState<SupportedRole>('Software Developer');
  const [jobDescription, setJobDescription] = useState('');

  // Server metadata
  const [rolesData, setRolesData] = useState<RolesResponse | null>(null);

  // Analysis workflow states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgressStep, setAnalysisProgressStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isApiKeyError, setIsApiKeyError] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResponse | null>(null);

  // Multi-step analysis loader messages
  const progressMessages = [
    'Extracting resume structure and text with PyMuPDF...',
    'Parsing technical competencies, frameworks, and projects...',
    `Benchmarking against target requirements for ${selectedRole}...`,
    'Synthesizing AI Job Match estimate and skill gaps...',
    'Generating action-verb bullet enhancements and 30-day roadmap...',
  ];

  useEffect(() => {
    getRoles()
      .then((data) => {
        setRolesData(data);
        // Pre-fill with default example job description if empty
        if (!jobDescription && data.example_job_descriptions['Software Developer']) {
          setJobDescription(data.example_job_descriptions['Software Developer']);
        }
      })
      .catch(() => {
        // Fallback roles handled in dropdown
      });
  }, []);

  // Update example job description when role changes (if user clicks "Load Example")
  const handleLoadExampleJd = () => {
    if (rolesData?.example_job_descriptions[selectedRole]) {
      setJobDescription(rolesData.example_job_descriptions[selectedRole]);
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (uploadedFile: File) => {
    setErrorMessage(null);
    setIsApiKeyError(false);

    const name = uploadedFile.name.toLowerCase();
    const isValidExt = name.endsWith('.pdf') || name.endsWith('.docx');
    if (!isValidExt) {
      setErrorMessage('Please upload a PDF or DOCX file (.pdf or .docx).');
      return;
    }

    if (uploadedFile.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 10 MB limit.');
      return;
    }

    setFile(uploadedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit Analysis
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsApiKeyError(false);

    // Validation
    if (inputMode === 'upload' && !file) {
      setErrorMessage('Please upload your resume in PDF or DOCX format.');
      return;
    }
    if (inputMode === 'text' && (!resumeText.trim() || resumeText.trim().length < 50)) {
      setErrorMessage('Please paste at least 50 characters of resume content.');
      return;
    }
    let effectiveJd = jobDescription.trim();
    if (!effectiveJd || effectiveJd.length < 20) {
      if (rolesData?.example_job_descriptions[selectedRole]) {
        effectiveJd = rolesData.example_job_descriptions[selectedRole];
        setJobDescription(effectiveJd);
      } else {
        effectiveJd = `Standard industry qualifications, experience, and technical competencies for ${selectedRole}.`;
      }
    }

    setIsAnalyzing(true);
    setAnalysisProgressStep(0);

    // Progress step interval
    const interval = setInterval(() => {
      setAnalysisProgressStep((prev) => (prev < progressMessages.length - 1 ? prev + 1 : prev));
    }, 1800);

    try {
      let result: ResumeAnalysisResponse;
      if (inputMode === 'upload' && file) {
        result = await analyzeResumeFile(file, selectedRole, effectiveJd);
      } else {
        result = await analyzeResumeText(resumeText, selectedRole, effectiveJd);
      }

      setAnalysisResult(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      const msg = err.message || 'An error occurred during analysis.';
      setErrorMessage(msg);
      if (
        err.code === 'GEMINI_API_KEY_MISSING' ||
        msg.toLowerCase().includes('gemini_api_key') ||
        msg.toLowerCase().includes('api key')
      ) {
        setIsApiKeyError(true);
      }
    } finally {
      clearInterval(interval);
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setFile(null);
    setResumeText('');
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If analysis is already performed, show the full Dashboard
  if (analysisResult) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnalysisDashboard data={analysisResult} onReset={handleReset} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Intelligent Resume Evaluator</span>
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
          Analyze Your Resume Against Any Job
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Upload your resume, select the target role, and paste the job description to receive an
          honest evaluation, keyword gap analysis, and tailored bullet point rewrites.
        </p>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-900">Analysis Request Notice</p>
              <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
          {isApiKeyError && (
            <button
              onClick={onOpenSettings}
              className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 shrink-0 flex items-center gap-1.5 shadow-sm"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Configure Key</span>
            </button>
          )}
        </div>
      )}

      {/* Main Analysis Form Card */}
      <form onSubmit={handleAnalyze} className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-8">
        {/* Step 1: Resume Upload / Input */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              <span>Provide Your Resume</span>
            </label>

            {/* Input Mode Toggle */}
            <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-semibold self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setInputMode('upload')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  inputMode === 'upload' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'
                }`}
              >
                Upload File (PDF / DOCX)
              </button>
              <button
                type="button"
                onClick={() => setInputMode('text')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  inputMode === 'text' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'
                }`}
              >
                Paste Text
              </button>
            </div>
          </div>

          {inputMode === 'upload' ? (
            <div>
              {!file ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                    dragOver
                      ? 'border-indigo-600 bg-indigo-50/50 scale-[0.99]'
                      : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading font-semibold text-sm text-slate-800">
                    Click to upload or drag & drop your resume
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports PDF and DOCX files up to 10 MB
                  </p>
                </div>
              ) : (
                /* Selected File Card */
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                        {file.name}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for AI extraction
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-white border border-indigo-200 hover:bg-indigo-50"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste the full text of your resume here (experience, skills, education, projects)..."
                rows={6}
                className="w-full text-xs p-3.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
              <div className="text-[11px] text-slate-400 text-right">
                {resumeText.length} characters (min 50)
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Role Selector */}
        <div className="space-y-3">
          <label className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
              2
            </span>
            <span>Select Target Job Role</span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              'Software Developer',
              'Data Analyst',
              'AI/ML Engineer',
              'Frontend Developer',
              'Backend Developer',
              'Full Stack Developer',
              'Other',
            ].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => {
                  setSelectedRole(role as SupportedRole);
                  if (rolesData?.example_job_descriptions[role]) {
                    setJobDescription(rolesData.example_job_descriptions[role]);
                  }
                }}
                className={`p-3 rounded-xl text-xs font-semibold text-left transition-all border ${
                  selectedRole === role
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-300 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{role}</span>
                  {selectedRole === role && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Job Description Textarea */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <label className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                3
              </span>
              <span>Target Job Description</span>
            </label>

            <button
              type="button"
              onClick={handleLoadExampleJd}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold self-start sm:self-auto flex items-center gap-1"
            >
              <span>Load Example JD for {selectedRole}</span>
              <Sparkles className="w-3 h-3" />
            </button>
          </div>

          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the target job description (responsibilities, required qualifications, technical skills)..."
            rows={7}
            className="w-full text-xs p-3.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-sans leading-relaxed"
          />

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Minimum 20 characters required.</span>
            <span>{jobDescription.length} characters</span>
          </div>
        </div>

        {/* Loading Progress State */}
        {isAnalyzing && (
          <div className="p-6 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-indigo-900">
                  AI Multi-Dimensional Evaluation In Progress
                </h4>
                <p className="text-[11px] text-indigo-700">
                  {progressMessages[analysisProgressStep]}
                </p>
              </div>
            </div>

            {/* Stepper Dots */}
            <div className="grid grid-cols-5 gap-1.5">
              {progressMessages.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    idx <= analysisProgressStep ? 'bg-indigo-600' : 'bg-indigo-200'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isAnalyzing}
            className="w-full py-4 rounded-2xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running Gemini AI Analysis...</span>
              </>
            ) : (
              <>
                <span>Analyze Resume Now</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
