import React, { useState } from 'react';
import { Copy, Check, Sparkles, Tag, Info } from 'lucide-react';
import type { BulletImprovement } from '../types/analysis';


interface BulletImprovementCardProps {
  bullet: BulletImprovement;
  index: number;
}

export const BulletImprovementCard: React.FC<BulletImprovementCardProps> = ({ bullet, index }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(bullet.improved);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-indigo-200 hover:shadow-md transition-all space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Bullet Enhancement
          </span>
        </div>

        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            copied
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 border border-slate-200'
          }`}
          title="Copy improved bullet point"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Improved</span>
            </>
          )}
        </button>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Original */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <span>Original Bullet</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-normal italic">
            "{bullet.original || 'Original text not provided.'}"
          </p>
        </div>

        {/* Improved */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-50/60 via-white to-violet-50/60 border border-indigo-200 space-y-1.5 shadow-sm">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI Improved Version</span>
          </div>
          <p className="text-xs font-medium text-slate-900 leading-relaxed">
            "{bullet.improved}"
          </p>
        </div>
      </div>

      {/* Action Verbs & Explanation */}
      <div className="pt-2 border-t border-slate-100 space-y-2.5">
        {bullet.action_verbs_used && bullet.action_verbs_used.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mr-1">
              <Tag className="w-3 h-3 text-indigo-500" /> Action Verbs:
            </span>
            {bullet.action_verbs_used.map((verb, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100"
              >
                {verb}
              </span>
            ))}
          </div>
        )}

        {/* Explanation */}
        <p className="text-xs text-slate-600 leading-relaxed">
          <span className="font-semibold text-slate-800">Why it's better: </span>
          {bullet.explanation}
        </p>

        {/* Metrics Reminder Alert */}
        {bullet.metrics_note && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-900">
            <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span className="leading-tight">{bullet.metrics_note}</span>
          </div>
        )}
      </div>
    </div>
  );
};
