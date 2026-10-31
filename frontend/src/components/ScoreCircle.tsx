import React, { useEffect, useState } from 'react';

interface ScoreCircleProps {
  score: number;
  category: string;
  size?: number;
  strokeWidth?: number;
}

export const ScoreCircle: React.FC<ScoreCircleProps> = ({
  score,
  category,
  size = 200,
  strokeWidth = 14,
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Smooth counting animation
    let start = 0;
    const duration = 1200; // ms
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (score - start) * easeProgress);
      setAnimatedScore(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [score]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  // Determine color scheme
  const getColorScheme = (val: number) => {
    if (val >= 85) {
      return {
        stroke: 'url(#gradient-emerald)',
        textColor: 'text-emerald-600',
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        glow: 'rgba(16, 185, 129, 0.25)',
      };
    } else if (val >= 70) {
      return {
        stroke: 'url(#gradient-indigo)',
        textColor: 'text-indigo-600',
        badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        glow: 'rgba(99, 102, 241, 0.25)',
      };
    } else if (val >= 50) {
      return {
        stroke: 'url(#gradient-amber)',
        textColor: 'text-amber-600',
        badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
        glow: 'rgba(245, 158, 11, 0.25)',
      };
    } else {
      return {
        stroke: 'url(#gradient-rose)',
        textColor: 'text-rose-600',
        badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
        glow: 'rgba(244, 63, 94, 0.25)',
      };
    }
  };

  const scheme = getColorScheme(score);

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className="relative flex items-center justify-center transition-all"
        style={{
          width: size,
          height: size,
          filter: `drop-shadow(0 8px 16px ${scheme.glow})`,
        }}
      >
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            <linearGradient id="gradient-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="gradient-indigo" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#4338CA" />
            </linearGradient>
            <linearGradient id="gradient-amber" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="gradient-rose" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F43F5E" />
              <stop offset="100%" stopColor="#E11D48" />
            </linearGradient>
          </defs>

          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
          />

          {/* Animated progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={scheme.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Estimate
          </span>
          <div className="flex items-baseline">
            <span className={`font-heading font-extrabold text-4xl sm:text-5xl tracking-tight ${scheme.textColor}`}>
              {animatedScore}
            </span>
            <span className="text-slate-400 font-semibold text-lg ml-0.5">/100</span>
          </div>
          <span className={`text-[11px] font-bold px-2 py-0.5 mt-1 rounded-full border ${scheme.badgeBg}`}>
            {category}
          </span>
        </div>
      </div>
    </div>
  );
};
