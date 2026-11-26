import { useState } from 'react';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

export function DonutChart({
  segments,
  centerValue,
  centerLabel,
}: {
  segments: DonutSegment[];
  centerValue: string;
  centerLabel: string;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const total = segments.reduce((acc, s) => acc + s.value, 0);
  const radius = 58;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  return (
    <div className="flex flex-col items-center gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
        <svg viewBox="0 0 160 160" className="h-36 w-36 -rotate-90">
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="transparent"
            stroke="#e2e8f0"
            strokeWidth="20"
          />
          {total > 0 &&
            segments.map((seg) => {
              if (seg.value === 0) return null;
              const pct = seg.value / total;
              const dashLength = pct * circumference;
              const dashOffset = -cumulativePercent * circumference;
              cumulativePercent += pct;
              const isHovered = hovered === seg.label;

              return (
                <circle
                  key={seg.label}
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={isHovered ? 24 : 20}
                  strokeDasharray={`${dashLength} ${circumference}`}
                  strokeDashoffset={dashOffset}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHovered(seg.label)}
                  onMouseLeave={() => setHovered(null)}
                />
              );
            })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-bold text-slate-900">{centerValue}</span>
          <span className="text-[11px] font-medium text-slate-500">{centerLabel}</span>
        </div>
      </div>

      <div className="w-full min-w-0 flex-1 space-y-2">
        {segments.map((seg) => {
          const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0;
          return (
            <div
              key={seg.label}
              onMouseEnter={() => setHovered(seg.label)}
              onMouseLeave={() => setHovered(null)}
              className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-sm transition ${
                hovered === seg.label ? 'bg-slate-100' : ''
              }`}
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="truncate text-xs font-medium text-slate-700 sm:text-sm">
                  {seg.label}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-xs font-semibold text-slate-900 sm:text-sm">
                  {seg.value}
                </span>
                <span className="w-9 text-right text-xs text-slate-500">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export interface BarItem {
  label: string;
  value: number;
  secondaryValue?: number;
  color?: string;
}

export function GroupedBarChart({
  items,
  primaryLabel = 'Fallas',
  secondaryLabel = 'Mantenimientos',
}: {
  items: BarItem[];
  primaryLabel?: string;
  secondaryLabel?: string;
}) {
  const maxVal = Math.max(
    1,
    ...items.map((i) => Math.max(i.value, i.secondaryValue ?? 0))
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-xs bg-blue-600" />
          <span>{primaryLabel}</span>
        </div>
        {items.some((i) => i.secondaryValue !== undefined) && (
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-sky-300" />
            <span>{secondaryLabel}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-6 items-end gap-3 pt-2" style={{ height: '185px' }}>
        {items.map((item) => {
          const h1 = Math.max(6, Math.round((item.value / maxVal) * 135));
          const h2 =
            item.secondaryValue !== undefined
              ? Math.max(6, Math.round((item.secondaryValue / maxVal) * 135))
              : 0;

          return (
            <div key={item.label} className="group flex flex-col items-center gap-2">
              <div className="flex items-end gap-1">
                <div className="relative flex flex-col items-center">
                  <span className="mb-1 text-[11px] font-semibold text-slate-600">
                    {item.value}
                  </span>
                  <div
                    className="w-4 rounded-t-md bg-blue-600 transition-all duration-300 group-hover:bg-blue-700 sm:w-5"
                    style={{ height: `${h1}px` }}
                    title={`${item.label} - ${primaryLabel}: ${item.value}`}
                  />
                </div>
                {item.secondaryValue !== undefined && (
                  <div className="relative flex flex-col items-center">
                    <span className="mb-1 text-[11px] font-semibold text-slate-500">
                      {item.secondaryValue}
                    </span>
                    <div
                      className="w-4 rounded-t-md bg-sky-300 transition-all duration-300 group-hover:bg-sky-400 sm:w-5"
                      style={{ height: `${h2}px` }}
                      title={`${item.label} - ${secondaryLabel}: ${item.secondaryValue}`}
                    />
                  </div>
                )}
              </div>
              <span className="text-xs font-medium text-slate-500">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function HorizontalProgressBars({
  items,
}: {
  items: { label: string; value: number; max: number; colorClass: string; suffix?: string }[];
}) {
  return (
    <div className="space-y-3.5">
      {items.map((item) => {
        const pct = item.max > 0 ? Math.min(100, Math.round((item.value / item.max) * 100)) : 0;
        return (
          <div key={item.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">{item.label}</span>
              <span className="font-semibold text-slate-900">
                {item.value}
                {item.suffix ? ` ${item.suffix}` : ''}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all duration-300 ${item.colorClass}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
