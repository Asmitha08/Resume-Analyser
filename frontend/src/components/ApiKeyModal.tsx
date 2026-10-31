import React, { useState, useEffect } from 'react';
import { Key, ShieldCheck, X, ExternalLink, Check, RefreshCw } from 'lucide-react';
import { getStoredApiKey, setStoredApiKey, checkHealth } from '../services/api';
import type { HealthResponse } from '../services/api';



interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated?: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeyUpdated }) => {
  const [apiKey, setApiKey] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getStoredApiKey());
      verifyBackendHealth();
    }
  }, [isOpen]);

  const verifyBackendHealth = async () => {
    setChecking(true);
    try {
      const data = await checkHealth();
      setHealth(data);
    } catch {
      setHealth(null);
    } finally {
      setChecking(false);
    }
  };

  if (!isOpen) return null;

  const handleSave = () => {
    setStoredApiKey(apiKey.trim());
    setSavedSuccess(true);
    if (onKeyUpdated) onKeyUpdated();
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleClear = () => {
    setStoredApiKey('');
    setApiKey('');
    if (onKeyUpdated) onKeyUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-slate-900">
                Gemini AI Configuration
              </h3>
              <p className="text-xs text-slate-500">
                Configure your official Google Gemini API Key
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Backend Status Card */}
        <div className="my-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                health?.gemini_configured || apiKey
                  ? 'bg-emerald-500 ring-4 ring-emerald-100'
                  : 'bg-amber-500 ring-4 ring-amber-100'
              }`}
            />
            <div>
              <div className="text-xs font-semibold text-slate-900">
                {health?.gemini_configured
                  ? 'Backend .env Key Active'
                  : apiKey
                  ? 'Session Key Configured'
                  : 'No Gemini Key Detected'}
              </div>
              <div className="text-[11px] text-slate-500">
                {health ? `Connected to FastAPI (${health.version})` : 'Connecting to backend...'}
              </div>
            </div>
          </div>
          <button
            onClick={verifyBackendHealth}
            disabled={checking}
            className="p-1.5 text-slate-500 hover:text-indigo-600 rounded hover:bg-slate-200 transition-colors"
            title="Refresh status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Input Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              API Key (Stored locally in your browser session)
            </label>
            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full text-sm font-mono px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
              <span>Don't have a key?</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 hover:underline inline-flex items-center gap-0.5 font-medium"
              >
                <span>Get a free Gemini API Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          {/* Recommended Option: Backend .env */}
          <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-950 space-y-1">
            <div className="font-semibold text-indigo-900 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Production Best Practice: Backend Environment</span>
            </div>
            <p className="text-[11px] text-indigo-800 leading-relaxed">
              Add your key directly to <code className="bg-indigo-100 px-1 py-0.5 rounded text-indigo-900 font-mono">backend/.env</code>:
            </p>
            <pre className="bg-white/80 p-2 rounded text-[11px] font-mono text-slate-800 border border-indigo-100 overflow-x-auto">
              GEMINI_API_KEY=AIzaSy...
            </pre>
            <p className="text-[10px] text-indigo-700">
              The backend will automatically prioritize this key securely without exposing it to the client.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-slate-500 hover:text-rose-600 font-medium"
          >
            Clear Browser Key
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm flex items-center gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Key</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
