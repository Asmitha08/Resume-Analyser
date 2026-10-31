import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { SkillCategoryScore } from '../types/analysis';


interface SkillsCategoryChartProps {
  categoryScores: SkillCategoryScore[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-slate-200 text-xs">
        <p className="font-semibold text-slate-900 mb-1.5">{label}</p>
        <div className="flex items-center justify-between gap-4 text-indigo-600 font-medium">
          <span>Your Resume:</span>
          <span className="font-bold">{payload[0]?.value}%</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-slate-500 font-medium mt-0.5">
          <span>Role Benchmark:</span>
          <span className="font-bold">{payload[1]?.value}%</span>
        </div>
      </div>
    );
  }
  return null;
};

export const SkillsCategoryChart: React.FC<SkillsCategoryChartProps> = ({ categoryScores }) => {
  if (!categoryScores || categoryScores.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        No category metrics available.
      </div>
    );
  }

  const data = categoryScores.map((item) => ({
    category: item.category,
    Candidate: item.candidate_score,
    TargetBenchmark: item.required_score,
  }));

  return (
    <div className="w-full">
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 15, right: 10, left: -15, bottom: 25 }}
            barSize={16}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="category"
              tick={{ fontSize: 11, fill: '#64748B' }}
              interval={0}
              angle={-15}
              textAnchor="end"
              axisLine={{ stroke: '#CBD5E1' }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: '#64748B' }}
              axisLine={{ stroke: '#CBD5E1' }}
              tickLine={false}
              ticks={[0, 25, 50, 75, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
              formatter={(value) => (
                <span className="text-slate-700 font-medium">
                  {value === 'Candidate' ? 'Your Resume Alignment' : 'Target Role Benchmark'}
                </span>
              )}
            />
            <Bar
              dataKey="Candidate"
              name="Candidate"
              fill="#4F46E5"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="TargetBenchmark"
              name="TargetBenchmark"
              fill="#CBD5E1"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
