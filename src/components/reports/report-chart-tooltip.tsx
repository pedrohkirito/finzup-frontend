'use client';

import type { TooltipContentProps } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { CHART_TOOLTIP_STYLE } from './chart-utils';

export type ColoredTooltipItem = {
  label: string;
  value: string;
  color: string;
};

export type ReportChartTooltipProps = Partial<Pick<TooltipContentProps, 'active' | 'payload' | 'label'>> & {
  items?: ColoredTooltipItem[];
  colorByLabel?: Record<string, string>;
  seriesOrder?: string[];
  valueFormatter?: (value: number, label: string, dataKey?: string) => string;
};

function resolveColor(
  entry: NonNullable<TooltipContentProps['payload']>[number],
  colorByLabel?: Record<string, string>,
): string {
  const name = String(entry.name ?? '');
  if (colorByLabel?.[name]) return colorByLabel[name];
  if (entry.color && entry.color !== 'none') return String(entry.color);
  if ('fill' in entry && entry.fill) return String(entry.fill);
  const nested = entry.payload as { fill?: string; color?: string } | undefined;
  if (nested?.fill) return nested.fill;
  if (nested?.color) return nested.color;
  return '#ffffff';
}

function toNumber(value: unknown): number {
  if (Array.isArray(value)) return Number(value[0] ?? 0);
  return Number(value ?? 0);
}

export function ReportChartTooltip({
  active,
  payload,
  label,
  items,
  colorByLabel,
  seriesOrder,
  valueFormatter = (value) => formatCurrency(value),
}: ReportChartTooltipProps) {
  if (!active) return null;

  let displayItems: ColoredTooltipItem[] = items ?? [];

  if (!items && payload?.length) {
    const entries = seriesOrder
      ? seriesOrder
          .map((name) => payload.find((p) => p.name === name))
          .filter((p): p is NonNullable<typeof p> => !!p)
      : payload;

    displayItems = entries.map((entry) => {
      const entryLabel = String(entry.name ?? entry.dataKey ?? '');
      const color = resolveColor(entry, colorByLabel);
      return {
        label: entryLabel,
        value: valueFormatter(toNumber(entry.value), entryLabel, String(entry.dataKey ?? '')),
        color,
      };
    });
  }

  if (displayItems.length === 0) return null;

  return (
    <div style={CHART_TOOLTIP_STYLE.contentStyle}>
      {label != null && label !== '' && (
        <p className="mb-2 font-semibold text-white">{String(label)}</p>
      )}
      <ul className="space-y-1.5">
        {displayItems.map((item) => (
          <li key={item.label} className="flex items-center justify-between gap-6 text-sm">
            <span className="font-medium" style={{ color: item.color }}>
              {item.label}
            </span>
            <span className="font-semibold tabular-nums" style={{ color: item.color }}>
              {item.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
