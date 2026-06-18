'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type Point = {
  day: string;
  accuracy: number;
  questions: number;
};

const defaultData: Point[] = [
  { day: 'Mon', accuracy: 62, questions: 32 },
  { day: 'Tue', accuracy: 68, questions: 41 },
  { day: 'Wed', accuracy: 71, questions: 38 },
  { day: 'Thu', accuracy: 74, questions: 55 },
  { day: 'Fri', accuracy: 79, questions: 48 },
  { day: 'Sat', accuracy: 83, questions: 64 },
  { day: 'Sun', accuracy: 86, questions: 51 },
];

export function ProgressChart({ data = defaultData }: { data?: Point[] }) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h3 className="text-base font-semibold">Weekly accuracy</h3>
          <p className="text-xs text-text-muted">
            Rolling % correct across all attempted MCQs.
          </p>
        </div>
        <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-success">
          +12.4% week-over-week
        </span>
      </div>

      <div className="mt-6 h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="accuracyFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9F67FF" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[40, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(15,15,26,0.95)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '0.75rem',
                color: '#F8FAFC',
                fontSize: '0.8rem',
              }}
              cursor={{ stroke: '#7C3AED', strokeDasharray: '3 3', strokeOpacity: 0.5 }}
            />
            <Area
              type="monotone"
              dataKey="accuracy"
              stroke="#9F67FF"
              strokeWidth={2.5}
              fill="url(#accuracyFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
