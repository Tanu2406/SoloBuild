import { useState } from 'react';
import { Activity, ArrowRight, ChartNoAxesCombined, CircleDollarSign, Target, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { useMeetingStore } from '../meeting/scheduling/store';
import { useOpportunityStore } from '../opportunities/store';
import { deriveProductRevenue, deriveRepPerformance, funnelStages, performanceTimeSeries, type PerformanceRange } from './data';
import { AnalyticsFunnel, AnalyticsMetric, AnalyticsPage, AnalyticsPanel, InsightCard, LineChart, type ChartPoint } from './AnalyticsComponents';
import { currency, derivePipeline } from './data';

const ranges: PerformanceRange[] = ['7 Days', '30 Days', '90 Days', 'This Year'];

export default function SalesAnalyticsDashboard() {
  const navigate = useNavigate();
  const { opportunities, activities: dealActivities } = useOpportunityStore();
  const { activities: meetingActivities } = useMeetingStore();
  const [range, setRange] = useState<PerformanceRange>('30 Days');
  const [visibleMetrics, setVisibleMetrics] = useState(['revenue', 'won', 'created', 'conversion']);
  const active = opportunities.filter((deal) => !['Won', 'Lost'].includes(deal.stage));
  const won = opportunities.filter((deal) => deal.stage === 'Won');
  const closed = opportunities.filter((deal) => ['Won', 'Lost'].includes(deal.stage));
  const pipelineValue = active.reduce((sum, deal) => sum + deal.value, 0);
  const weighted = derivePipeline(opportunities).reduce((sum, stage) => sum + stage.weighted, 0);
  const wonRevenue = won.reduce((sum, deal) => sum + deal.value, 0);
  const winRate = closed.length ? Math.round(won.length / closed.length * 100) : 0;
  const averageDealSize = opportunities.length ? Math.round(opportunities.reduce((sum, deal) => sum + deal.value, 0) / opportunities.length) : 0;
  const meetingOpportunityRate = funnelStages[3].count ? Math.round(funnelStages[4].count / funnelStages[3].count * 100) : 0;
  const products = deriveProductRevenue(opportunities);
  const reps = deriveRepPerformance(opportunities);
  const chartData = performanceTimeSeries[range] as unknown as ChartPoint[];
  const chartSeries = [
    { key: 'revenue', label: 'Revenue ($K)', color: '#2563eb' },
    { key: 'won', label: 'Deals won', color: '#16a34a' },
    { key: 'created', label: 'Deals created', color: '#8b5cf6' },
    { key: 'conversion', label: 'Conversion', color: '#f59e0b' },
  ].filter((item) => visibleMetrics.includes(item.key));
  const recentActivityCount = dealActivities.length + meetingActivities.length;
  const toggleSeries = (key: string) => setVisibleMetrics((current) => current.includes(key) && current.length > 1 ? current.filter((item) => item !== key) : current.includes(key) ? current : [...current, key]);

  return <AnalyticsPage title="Sales Analytics" subtitle="Understand sales performance, pipeline health, revenue trends, and future opportunities from one workspace."
    actions={<Badge variant="info" dot>Live demo data</Badge>}>
    <section className="analytics-metrics analytics-metrics--dashboard">
      <AnalyticsMetric label="Total Revenue" value={currency(wonRevenue, true)} detail="Closed-won revenue" trend={14} icon={<CircleDollarSign size={16} />} />
      <AnalyticsMetric label="Pipeline Value" value={currency(pipelineValue, true)} detail="Open opportunities" trend={18} icon={<ChartNoAxesCombined size={16} />} />
      <AnalyticsMetric label="Won Deals" value={won.length} detail="Closed successfully" icon={<Trophy size={16} />} />
      <AnalyticsMetric label="Win Rate" value={`${winRate}%`} detail="Won of closed deals" trend={6} icon={<Target size={16} />} />
      <AnalyticsMetric label="Average Deal Size" value={currency(averageDealSize, true)} detail="Across all deals" />
      <AnalyticsMetric label="Conversion Rate" value={`${meetingOpportunityRate}%`} detail="Meetings to open opportunities" trend={4} />
      <AnalyticsMetric label="Active Opportunities" value={active.length} detail="Open in current pipeline" />
      <AnalyticsMetric label="Forecast Revenue" value={currency(wonRevenue + weighted, true)} detail="Won + weighted pipeline" trend={12} />
    </section>

    <AnalyticsPanel title="Sales Performance" subtitle="Revenue, wins, deal creation and conversion over time" icon={<ChartNoAxesCombined size={17} />}
      action={<div className="analytics-range-tabs" role="group" aria-label="Sales performance time range">{ranges.map((item) => <button type="button" className={range === item ? 'is-active' : ''} aria-pressed={range === item} key={item} onClick={() => setRange(item)}>{item}</button>)}</div>}>
      <div className="analytics-series-toggles">{[
        ['revenue', 'Revenue ($K)', '#2563eb'], ['won', 'Deals won', '#16a34a'], ['created', 'Deals created', '#8b5cf6'], ['conversion', 'Conversion', '#f59e0b'],
      ].map(([key, label, color]) => <button type="button" key={key} className={visibleMetrics.includes(key) ? 'is-active' : ''} onClick={() => toggleSeries(key)}><i style={{ backgroundColor: color }} />{label}</button>)}</div>
      <LineChart data={chartData} series={chartSeries} normalize />
    </AnalyticsPanel>

    <div className="analytics-dashboard-grid">
      <AnalyticsPanel title="Sales Funnel" subtitle="Lead to closed-won progression" icon={<Target size={17} />}
        action={<Button size="sm" variant="ghost" iconRight={<ArrowRight size={13} />} onClick={() => navigate('/coming-soon/sales-analytics/conversion-analytics')}>Conversion details</Button>}>
        <AnalyticsFunnel stages={funnelStages} compact />
      </AnalyticsPanel>
      <AnalyticsPanel title="AI Sales Insights" subtitle="Demo-generated observations" icon={<Activity size={17} />}>
        <div className="analytics-insights-stack">
          <InsightCard text="Pipeline value increased 18% this month, led by healthcare and commerce accounts." tone="blue" />
          <InsightCard text="Proposal-stage opportunities are taking longer than average; confirm next steps with owners." tone="amber" />
        </div>
        <small className="analytics-demo-note">Illustrative insights based on demo data. No live AI analysis.</small>
      </AnalyticsPanel>
    </div>

    <div className="analytics-dashboard-grid analytics-dashboard-grid--tables">
      <AnalyticsPanel title="Top Products" subtitle="Product revenue and sales conversion" icon={<CircleDollarSign size={17} />}>
        <div className="analytics-product-list">{products.map((product) => <div className="analytics-product-row" key={product.product}>
          <span><strong>{product.product}</strong><small>{product.deals} deals · {product.conversion}% conversion</small></span>
          <span><strong>{currency(product.revenue, true)}</strong><small className="analytics-growth">↑ {product.growth}%</small></span>
        </div>)}</div>
      </AnalyticsPanel>
      <AnalyticsPanel title="Top Sales Representatives" subtitle="Closed revenue and win performance" icon={<Trophy size={17} />}
        action={<Badge variant="neutral">{recentActivityCount} tracked events</Badge>}>
        <div className="analytics-rep-list">{reps.map((rep) => <div className="analytics-rep-row" key={rep.owner}>
          <span className="analytics-rep-avatar">{rep.owner.split(' ').map((part) => part[0]).join('')}</span>
          <span className="analytics-rep-name"><strong>{rep.owner}</strong><small>{rep.opportunities} opportunities · {rep.won} won</small></span>
          <span className="analytics-rep-revenue"><strong>{currency(rep.revenue, true)}</strong><small>{rep.winRate}% win</small></span>
        </div>)}</div>
      </AnalyticsPanel>
    </div>
    <AnalyticsPanel title="Recent Sales Activity" subtitle="Recent calls, emails, meetings and deal changes" icon={<Activity size={17} />}
      action={<Button size="sm" variant="ghost" iconRight={<ArrowRight size={13} />} onClick={() => navigate('/coming-soon/sales-analytics/activity')}>View activity</Button>}>
      <div className="analytics-recent-strip">{[
        { icon: '☎', title: 'Discovery call completed', company: 'Northstar Health', owner: 'Jordan Lee', type: 'Call' },
        { icon: '✉', title: 'Product overview sent', company: 'Vertex Commerce', owner: 'Amara Okafor', type: 'Email' },
        { icon: '▣', title: 'Product walkthrough scheduled', company: 'Brightpath Learning', owner: 'Jordan Lee', type: 'Meeting' },
        { icon: '↻', title: 'Follow-up reminder set', company: 'Summit Financial', owner: 'Amara Okafor', type: 'Follow-up' },
        { icon: '↗', title: 'Opportunity advanced to proposal', company: 'Northstar Health', owner: 'Jordan Lee', type: 'Deal update' },
      ].map((item) => <article className="analytics-recent-item" key={item.title}><span>{item.icon}</span><div><strong>{item.title}</strong><small>{item.company} · {item.owner}</small></div><Badge variant={item.type === 'Call' ? 'success' : item.type === 'Deal update' ? 'warning' : item.type === 'Follow-up' ? 'warning' : 'info'}>{item.type}</Badge></article>)}</div>
    </AnalyticsPanel>
  </AnalyticsPage>;
}
