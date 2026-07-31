'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency, cn } from '@/lib/utils';
import { glassSurfaceClassName } from '@/lib/glass';

export type DonutSegment = {
  id: string;
  name: string;
  value: number;
  color: string;
};

interface PlanDonutChartProps {
  totalIncome: number;
  segments: DonutSegment[];
}

type PieLabelProps = {
  cx?: number;
  cy?: number;
  midAngle?: number;
  outerRadius?: number;
  percent?: number;
  name?: string;
  value?: number;
  fill?: string;
};

function useIsCompactChart(breakpointPx = 1024) {
  const [compact, setCompact] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`);
    const update = () => setCompact(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [breakpointPx]);

  return compact;
}

function shortenLabel(name: string, max = 14) {
  return name.length > max ? `${name.slice(0, max)}…` : name;
}

function renderPieLabel(props: PieLabelProps, totalIncome: number) {
  const {
    cx = 0,
    cy = 0,
    midAngle = 0,
    outerRadius = 0,
    percent = 0,
    name = '',
    value = 0,
    fill = '#94a3b8',
  } = props;

  if (percent < 0.025) return null;

  const RADIAN = Math.PI / 180;
  const angle = -midAngle * RADIAN;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const isRight = cos >= 0;

  const sx = cx + outerRadius * cos;
  const sy = cy + outerRadius * sin;
  const mx = cx + (outerRadius + 10) * cos;
  const my = cy + (outerRadius + 10) * sin;
  const ex = mx + (isRight ? 1 : -1) * 16;
  const ey = my;

  const textX = ex + (isRight ? 10 : -10);
  const textAnchor = isRight ? 'start' : 'end';
  const pct = totalIncome > 0 ? ((value / totalIncome) * 100).toFixed(0) : '0';

  return (
    <g>
      <polyline
        points={`${sx},${sy} ${mx},${my} ${ex},${ey}`}
        stroke={fill}
        fill="none"
        strokeWidth={1.5}
        opacity={0.55}
      />
      <circle cx={textX + (isRight ? -6 : 6)} cy={ey} r={4} fill={fill} />
      <text
        x={textX}
        y={ey - 6}
        textAnchor={textAnchor}
        dominantBaseline="middle"
        className="fill-slate-600 dark:fill-slate-200"
        style={{ fontSize: 12, fontWeight: 600 }}
      >
        {shortenLabel(name, 18)}
      </text>
      <text
        x={textX}
        y={ey + 10}
        textAnchor={textAnchor}
        dominantBaseline="middle"
        className="fill-slate-400 dark:fill-slate-500"
        style={{ fontSize: 11 }}
      >
        {pct}% · {formatCurrency(value)}
      </text>
    </g>
  );
}

function CustomTooltip({
  active,
  payload,
  totalIncome,
}: {
  active?: boolean;
  payload?: { payload: DonutSegment }[];
  totalIncome: number;
}) {
  if (!active || !payload?.length) return null;
  const seg = payload[0].payload;
  const pct = totalIncome > 0 ? ((seg.value / totalIncome) * 100).toFixed(1) : '0.0';
  return (
    <div className={cn('rounded-xl px-3 py-2 text-xs', glassSurfaceClassName)}>
      <p className="font-semibold text-slate-800 dark:text-white">{seg.name}</p>
      <p className="mt-0.5 tabular-nums text-slate-500 dark:text-slate-400">
        {formatCurrency(seg.value)} · {pct}%
      </p>
    </div>
  );
}

function ChartLegend({
  data,
  totalIncome,
}: {
  data: DonutSegment[];
  totalIncome: number;
}) {
  return (
    <ul className="mt-4 space-y-2.5">
      {data.map((seg) => {
        const pct = totalIncome > 0 ? ((seg.value / totalIncome) * 100).toFixed(0) : '0';
        return (
          <li key={seg.id} className="flex items-center gap-2.5">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: seg.color }}
            />
            <span className="min-w-0 flex-1 truncate text-sm text-slate-600 dark:text-slate-300">
              {seg.name}
            </span>
            <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-700 dark:text-slate-200">
              {formatCurrency(seg.value)}
            </span>
            <span className="w-10 shrink-0 text-right text-xs tabular-nums text-slate-400">
              {pct}%
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function PlanDonutChart({ totalIncome, segments }: PlanDonutChartProps) {
  const isCompact = useIsCompactChart();
  const allocated = segments.reduce((s, x) => s + x.value, 0);
  const free = Math.max(0, totalIncome - allocated);
  const over = allocated > totalIncome;

  const chartData: DonutSegment[] = [
    ...segments.filter((s) => s.value > 0),
    ...(free > 0
      ? [{ id: '__free__', name: 'Livre', value: free, color: '#34d399' }]
      : []),
    ...(over
      ? [{ id: '__over__', name: 'Excesso', value: allocated - totalIncome, color: '#f87171' }]
      : []),
  ];

  const isEmpty = totalIncome <= 0 || chartData.length === 0;
  const freePct = totalIncome > 0 ? ((free / totalIncome) * 100).toFixed(0) : '—';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-white/[0.1] dark:bg-white/[0.06] dark:shadow-[0_8px_32px_rgba(2,6,23,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] dark:backdrop-blur-xl">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">Distribuição</p>

      {isEmpty ? (
        <div className="flex h-48 items-center justify-center">
          <p className="text-xs text-slate-400">Adicione receitas para visualizar</p>
        </div>
      ) : (
        <>
          <div
            className={cn(
              'relative mx-auto w-full',
              isCompact
                ? 'h-[260px] max-w-[320px] sm:h-[300px] sm:max-w-[360px]'
                : 'aspect-square max-w-[560px] xl:max-w-[640px]',
            )}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart
                margin={
                  isCompact
                    ? { top: 8, right: 8, bottom: 8, left: 8 }
                    : { top: 48, right: 110, bottom: 48, left: 110 }
                }
              >
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={isCompact ? '52%' : '46%'}
                  outerRadius={isCompact ? '82%' : '64%'}
                  paddingAngle={2}
                  dataKey="value"
                  isAnimationActive
                  animationDuration={400}
                  animationEasing="ease-out"
                  strokeWidth={0}
                  label={isCompact ? false : (props) => renderPieLabel(props, totalIncome)}
                  labelLine={false}
                >
                  {chartData.map((seg) => (
                    <Cell key={seg.id} fill={seg.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => (
                    <CustomTooltip
                      active={active}
                      payload={payload as unknown as { payload: DonutSegment }[]}
                      totalIncome={totalIncome}
                    />
                  )}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <p
                className={cn(
                  'font-bold',
                  isCompact ? 'text-2xl sm:text-3xl' : 'text-3xl xl:text-4xl',
                  over ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400',
                )}
              >
                {over ? '-' : `${freePct}%`}
              </p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                {over ? 'acima' : 'livre'}
              </p>
            </div>
          </div>

          {isCompact && <ChartLegend data={chartData} totalIncome={totalIncome} />}
        </>
      )}
    </div>
  );
}
