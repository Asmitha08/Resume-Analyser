import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  BookOpen,
  FolderGit2,
  ChevronRight,
  Sparkles,
  Layers,
  Flame,
  Award,
} from 'lucide-react';
import type { SkillGapRoadmap, SkillRoadmapItem } from '../types/analysis';


interface RoadmapTimelineProps {
  roadmap: SkillGapRoadmap;
}

export const RoadmapTimeline: React.FC<RoadmapTimelineProps> = ({ roadmap }) => {
  const [activeTab, setActiveTab] = useState<'30day' | 'skills'>('30day');
  const [selectedPriority, setSelectedPriority] = useState<'High' | 'Medium' | 'Low'>('High');

  const { high_priority = [], medium_priority = [], low_priority = [], thirty_day_plan = [] } = roadmap;

  const currentPrioritySkills: SkillRoadmapItem[] =
    selectedPriority === 'High'
      ? high_priority
      : selectedPriority === 'Medium'
      ? medium_priority
      : low_priority;

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <span>Targeted Skill-Gap Learning Roadmap</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Personalized learning path designed to bridge key qualification gaps.
          </p>
        </div>

        <div className="flex p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('30day')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === '30day'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>30-Day Action Plan</span>
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'skills'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Skills by Priority</span>
          </button>
        </div>
      </div>

      {/* View 1: 30-Day Plan (Weekly Breakdown) */}
      {activeTab === '30day' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {thirty_day_plan.map((week) => (
            <div
              key={week.week_number}
              className="p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-indigo-200 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Week {week.week_number}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Milestone Sprint
                  </span>
                </div>

                <h4 className="font-heading font-bold text-sm text-slate-900 mb-2">
                  {week.focus_theme}
                </h4>

                <div className="space-y-2 mt-3">
                  {week.tasks.map((task, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="leading-snug">{task}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestone Box */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl">
                <Award className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
                    Deliverable Milestone:
                  </span>
                  <span className="text-xs font-medium text-slate-800">
                    {week.milestone_deliverable}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View 2: Skills by Priority */}
      {activeTab === 'skills' && (
        <div className="space-y-4">
          {/* Priority Filter Pills */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedPriority('High')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                selectedPriority === 'High'
                  ? 'bg-rose-50 text-rose-700 border-rose-200 ring-2 ring-rose-500/10'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              <span>High Priority ({high_priority.length})</span>
            </button>
            <button
              onClick={() => setSelectedPriority('Medium')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                selectedPriority === 'Medium'
                  ? 'bg-amber-50 text-amber-700 border-amber-200 ring-2 ring-amber-500/10'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>Medium Priority ({medium_priority.length})</span>
            </button>
            <button
              onClick={() => setSelectedPriority('Low')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                selectedPriority === 'Low'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-2 ring-indigo-500/10'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>Low Priority ({low_priority.length})</span>
            </button>
          </div>

          {/* Skill Cards */}
          {currentPrioritySkills.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
              No skills in this priority level.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentPrioritySkills.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-indigo-200 hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-heading font-bold text-sm text-slate-900">
                      {item.skill_name}
                    </h4>
                    <span className="text-[11px] font-semibold text-slate-400">
                      Order: #{item.recommended_order || idx + 1}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-start gap-1.5 text-slate-700">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900">What to Learn:</strong> {item.what_to_learn}
                      </span>
                    </div>

                    <div className="flex items-start gap-1.5 text-slate-600">
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-800">Why It Matters:</strong> {item.why_it_matters}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-start gap-2 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/60">
                    <FolderGit2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
                        Mini-Project:
                      </span>
                      <span className="text-xs text-indigo-950 font-medium">
                        {item.mini_project}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
