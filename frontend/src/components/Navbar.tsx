import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, FileText, Settings, ShieldCheck, AlertCircle, Menu, X, ArrowRight } from 'lucide-react';
import { checkHealth, getStoredApiKey } from '../services/api';
import type { HealthResponse } from '../services/api';


interface NavbarProps {
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSettings }) => {
  const location = useLocation();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasStoredKey, setHasStoredKey] = useState(false);

  useEffect(() => {
    checkHealth()
      .then((data) => setHealth(data))
      .catch(() => setHealth(null));

    setHasStoredKey(Boolean(getStoredApiKey()));
  }, [location]);

  const isGeminiReady = health?.gemini_configured || hasStoredKey;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-bold text-xl text-slate-900 tracking-tight">
                Resume<span className="text-indigo-600">AI</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                PRO
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium -mt-1 hidden sm:inline">
              Smart Resume & Role Matcher
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors hover:text-indigo-600 ${
              location.pathname === '/' ? 'text-indigo-600 font-semibold' : 'text-slate-600'
            }`}
          >
            Home
          </Link>
          <Link
            to="/analyze"
            className={`text-sm font-medium transition-colors hover:text-indigo-600 ${
              location.pathname === '/analyze' ? 'text-indigo-600 font-semibold' : 'text-slate-600'
            }`}
          >
            Analyze Resume
          </Link>
          <a
            href="/#features"
            className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
          >
            Features
          </a>
          <a
            href="/#roles"
            className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
          >
            Supported Roles
          </a>
          <a
            href="/#how-it-works"
            className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
          >
            How It Works
          </a>
        </nav>

        {/* Right Action Buttons & Status */}
        <div className="hidden sm:flex items-center gap-3">
          {/* AI Connection Status Indicator */}
          <button
            onClick={onOpenSettings}
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full border transition-all ${
              isGeminiReady
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
            }`}
            title="Configure Gemini API Key"
          >
            {isGeminiReady ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="hidden lg:inline">Gemini AI Active</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 ml-0.5" />
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span className="hidden lg:inline">Configure API Key</span>
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 ml-0.5" />
              </>
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Primary CTA */}
          <Link
            to="/analyze"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/25 transition-all hover:shadow-md hover:shadow-indigo-600/30 active:scale-[0.98]"
          >
            <span>Analyze Resume</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Home
          </Link>
          <Link
            to="/analyze"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-indigo-600 bg-indigo-50"
          >
            Analyze Resume
          </Link>
          <a
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Features
          </a>
          <a
            href="/#roles"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Supported Roles
          </a>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenSettings();
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between"
          >
            <span>Gemini API Key Settings</span>
            <Settings className="w-4 h-4 text-slate-400" />
          </button>
          <div className="pt-2">
            <Link
              to="/analyze"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
            >
              <FileText className="w-4 h-4" />
              <span>Launch Analyzer</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
