import React from 'react';
import { ArrowDownRight, ArrowUpRight, Lightbulb } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { PageHeader } from '../../../components/ui/Layout';
import { currency } from './data';
import './sales-analytics.css';

export function AnalyticsPage({ title, subtitle, actions, children }: {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return <main className="page-content animate-fade-in sales-analytics-page">
    <PageHeader title={title} subtitle={subtitle} actions={actions} />
    {children}
  </main>;
}

export function AnalyticsPanel({ title, subtitle, icon, action, children, className = '' }: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`analytics-panel ${className}`}>
    <div className="analytics-panel__header"><div className="analytics-panel__heading">{icon && <span>{icon}</span>}<div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div></div>{action}</div>
    {children}
  </section>;
}

export function AnalyticsMetric({ label, value, detail, trend, icon }: {
  label: string;
  value: string | number;
  detail: string;
  trend?: number;
  icon?: React.ReactNode;
}) {
  return <article className="analytics-metric">
    <div className="analytics-metric__top"><span>{label}</span>{icon && <i>{icon}</i>}</div>
    <strong>{value}</strong>
    <small>{trend !== undefined && <b className={trend < 0 ? 'is-down' : 'is-up'}>{trend < 0 ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}{Math.abs(trend)}%</b>}{detail}</small>
  </article>;
}

export interface ChartPoint {
  label: string;
  [key: string]: string | number;
}

export interface ChartSeries {
  key: string;
  label: string;
  color: string;
}

export function LineChart({ data, series, normalize = false, axisFormat = 'currency' }: { data: ChartPoint[]; series: ChartSeries[]; normalize?: boolean; axisFormat?: 'currency' | 'number' | 'percent' }) {
  const width = 720;
  const height = 226;
  const pad = { top: 14, right: 15, bottom: 28, left: 32 };
  const innerWidth = width - pad.left - pad.right;
  const innerHeight = height - pad.top - pad.bottom;
  const allValues = data.flatMap((point) => series.map((item) => Number(point[item.key]) || 0));
  const max = Math.max(...allValues, 1);
  const min = Math.min(...allValues, 0);
  const valueRange = Math.max(max - min, 1);
  const x = (index: number) => pad.left + (data.length <= 1 ? innerWidth / 2 : index / (data.length - 1) * innerWidth);
  const y = (value: number, item: ChartSeries) => {
    const seriesValues = data.map((point) => Number(point[item.key]) || 0);
    const seriesMax = Math.max(...seriesValues, 1);
    const seriesMin = Math.min(...seriesValues, 0);
    const normalized = normalize ? (value - seriesMin) / Math.max(seriesMax - seriesMin, 1) : (value - min) / valueRange;
    return pad.top + innerHeight - normalized * innerHeight;
  };
  return <div className="analytics-chart">
    <div className="analytics-chart__plot">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${series.map((item) => item.label).join(', ')} trend chart`}>
        {[0, 1, 2, 3].map((index) => {
          const lineY = pad.top + index / 3 * innerHeight;
          const axisValue = max - (max - min) * index / 3;
          const axisLabel = normalize
            ? `${100 - index * 33}%`
            : axisFormat === 'percent'
              ? `${Math.round(axisValue)}%`
              : axisFormat === 'number'
                ? Math.round(axisValue).toLocaleString()
                : currency(axisValue, true);
          return <g key={index}><line x1={pad.left} y1={lineY} x2={width - pad.right} y2={lineY} className="analytics-chart__grid" /><text x={pad.left - 8} y={lineY + 4} textAnchor="end" className="analytics-chart__axis">{axisLabel}</text></g>;
        })}
        {series.map((item) => {
          const points = data.map((point, index) => `${x(index)},${y(Number(point[item.key]) || 0, item)}`).join(' ');
          return <g key={item.key}><polyline points={points} fill="none" stroke={item.color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />{data.map((point, index) => <circle key={`${item.key}-${point.label}`} cx={x(index)} cy={y(Number(point[item.key]) || 0, item)} r="3.5" fill="white" stroke={item.color} strokeWidth="2" />)}</g>;
        })}
        {data.map((point, index) => <text key={point.label} x={x(index)} y={height - 7} textAnchor="middle" className="analytics-chart__axis">{point.label}</text>)}
      </svg>
    </div>
    <div className="analytics-chart__legend">{series.map((item) => <span key={item.key}><i style={{ backgroundColor: item.color }} />{item.label}</span>)}</div>
  </div>;
}

export function AnalyticsFunnel({ stages, compact = false }: { stages: { label: string; count: number; color?: string }[]; compact?: boolean }) {
  const first = Math.max(stages[0]?.count ?? 1, 1);
  return <div className={`analytics-funnel${compact ? ' analytics-funnel--compact' : ''}`}>
    {stages.map((stage, index) => {
      const conversion = index === 0 ? 100 : Math.round(stage.count / Math.max(stages[index - 1].count, 1) * 100);
      return <div className="analytics-funnel__row" key={stage.label}>
        <span className="analytics-funnel__label">{stage.label}</span>
        <span className="analytics-funnel__bar"><i style={{ width: `${Math.max(stage.count / first * 100, stage.count ? 7 : 0)}%`, background: stage.color }} /></span>
        <strong>{stage.count.toLocaleString()}</strong>
        <small>{index === 0 ? 'Start' : `${conversion}%`}</small>
      </div>;
    })}
  </div>;
}

export function HorizontalBars({ items, valueKey = 'value', labelKey = 'label', format = 'currency' }: {
  items: Record<string, string | number>[];
  valueKey?: string;
  labelKey?: string;
  format?: 'currency' | 'number' | 'percent';
}) {
  const max = Math.max(...items.map((item) => Number(item[valueKey]) || 0), 1);
  return <div className="analytics-horizontal-bars">
    {items.map((item) => {
      const value = Number(item[valueKey]) || 0;
      const display = format === 'currency' ? currency(value, true) : format === 'percent' ? `${value}%` : value.toLocaleString();
      return <div className="analytics-horizontal-bars__row" key={String(item[labelKey])}>
        <div><strong>{item[labelKey]}</strong><b>{display}</b></div>
        <span><i style={{ width: `${value ? Math.max(value / max * 100, 3) : 0}%` }} /></span>
      </div>;
    })}
  </div>;
}

export function InsightCard({ text, tone = 'blue' }: { text: string; tone?: 'blue' | 'green' | 'amber' }) {
  return <article className={`analytics-insight analytics-insight--${tone}`}><span><Lightbulb size={15} /></span><p>{text}</p><Badge variant="info">Demo insight</Badge></article>;
}

export function AnalyticsTable({ headers, rows, className = '' }: { headers: string[]; rows: React.ReactNode[][]; className?: string }) {
  return <div className={`analytics-table-wrap ${className}`}><table className="analytics-table"><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>;
}

export function DonutChart({ items, title }: { items: { label: string; value: number; color: string }[]; title: string }) {
  const total = items.reduce((sum, item) => sum + item.value, 0) || 1;
  const gradient = items.map((item, index) => {
    const start = items.slice(0, index).reduce((sum, entry) => sum + entry.value, 0) / total * 100;
    const end = start + item.value / total * 100;
    return `${item.color} ${start}% ${end}%`;
  }).join(', ');
  return <div className="analytics-donut">
    <div className="analytics-donut__ring" style={{ background: `conic-gradient(${gradient})` }}><span><strong>{currency(total, true)}</strong><small>{title}</small></span></div>
    <div className="analytics-donut__legend">{items.map((item) => <span key={item.label}><i style={{ backgroundColor: item.color }} /><strong>{item.label}</strong><small>{Math.round(item.value / total * 100)}%</small></span>)}</div>
  </div>;
}
