import { Badge } from '../../../components/ui/Badge';
import { useOpportunityStore } from '../opportunities/store';
import { AnalyticsMetric, AnalyticsPage, AnalyticsPanel, AnalyticsTable, HorizontalBars, InsightCard, LineChart } from './AnalyticsComponents';
import { currency, dateLabel, monthlyRevenueTrend } from './data';

export default function Forecasting() {
  const { opportunities } = useOpportunityStore();
  const open = opportunities.filter((deal) => !['Won', 'Lost'].includes(deal.stage));
  const won = opportunities.filter((deal) => deal.stage === 'Won');
  const committed = open.filter((deal) => deal.probability >= 70);
  const bestCase = open.filter((deal) => deal.probability >= 40);
  const expected = open.reduce((sum, deal) => sum + deal.value * deal.probability / 100, 0);
  const worst = open.reduce((sum, deal) => sum + deal.value * Math.max(deal.probability - 20, 0) / 100, 0);
  const forecast = won.reduce((sum, deal) => sum + deal.value, 0) + expected;
  const chartData = monthlyRevenueTrend.map((item, index) => ({ ...item, forecast: index < 6 ? item.revenue : Math.round(item.expected * 1.08) }));
  const rows = [...open].sort((a, b) => a.closeDate.localeCompare(b.closeDate)).map((deal) => [
    <span key="deal"><strong>{deal.name}</strong><small className="analytics-cell-sub">{deal.product}</small></span>,
    deal.owner,
    dateLabel(deal.closeDate),
    currency(deal.value),
    `${deal.probability}%`,
    <Badge key="category" variant={deal.probability >= 70 ? 'success' : deal.probability >= 40 ? 'info' : 'warning'}>{deal.probability >= 70 ? 'Committed' : deal.probability >= 40 ? 'Best Case' : 'At Risk'}</Badge>,
  ]);
  return <AnalyticsPage title="Forecasting" subtitle="Plan for upcoming revenue with transparent opportunity-weighted scenarios."
    actions={<Badge variant="warning" dot>Demo / estimated values</Badge>}>
    <section className="analytics-metrics analytics-metrics--six">
      <AnalyticsMetric label="Forecast Revenue" value={currency(forecast, true)} detail="Won + probability weighted" />
      <AnalyticsMetric label="Best Case" value={currency(won.reduce((sum, deal) => sum + deal.value, 0) + bestCase.reduce((sum, deal) => sum + deal.value, 0), true)} detail="High-potential open deals" />
      <AnalyticsMetric label="Expected Case" value={currency(forecast, true)} detail="Weighted estimate" />
      <AnalyticsMetric label="Worst Case" value={currency(won.reduce((sum, deal) => sum + deal.value, 0) + worst, true)} detail="Conservative estimate" />
      <AnalyticsMetric label="Pipeline Coverage" value="3.2×" detail="Against demo quota" />
      <AnalyticsMetric label="Forecast Accuracy" value="87%" detail="Historical demo estimate" trend={3} />
    </section>
    <AnalyticsPanel title="Revenue Forecast" subtitle="Historical revenue, current pipeline and expected outlook ($K)">
      <div className="analytics-forecast-flow"><span>Historical revenue</span><i>→</i><span>Current pipeline</span><i>→</i><span>Expected revenue</span><i>→</i><span>Future forecast</span></div>
      <LineChart data={chartData} series={[{ key: 'revenue', label: 'Historical revenue', color: '#2563eb' }, { key: 'expected', label: 'Current expected', color: '#8b5cf6' }, { key: 'forecast', label: 'Future forecast', color: '#10b981' }]} />
    </AnalyticsPanel>
    <div className="analytics-two-column">
      <AnalyticsPanel title="Forecast Categories" subtitle="Open pipeline distributed by confidence">
        <HorizontalBars items={[
          { label: 'Committed', value: committed.reduce((sum, deal) => sum + deal.value, 0) },
          { label: 'Best Case', value: bestCase.filter((deal) => deal.probability < 70).reduce((sum, deal) => sum + deal.value, 0) },
          { label: 'Pipeline', value: open.filter((deal) => deal.probability >= 20 && deal.probability < 40).reduce((sum, deal) => sum + deal.value, 0) },
          { label: 'At Risk', value: open.filter((deal) => deal.probability < 20).reduce((sum, deal) => sum + deal.value, 0) },
        ]} />
      </AnalyticsPanel>
      <div className="analytics-forecast-note"><strong>How to read this forecast</strong><p>Expected values apply each deal’s current probability to its opportunity amount. Scenarios are illustrative demo estimates, not predictions from a machine-learning model.</p><small>{open.length} active opportunities · {committed.length} committed</small></div>
    </div>
    <AnalyticsPanel title="Expected Opportunity Closes" subtitle="Open opportunities sorted by expected close date">
      <AnalyticsTable headers={['Opportunity', 'Owner', 'Close date', 'Value', 'Probability', 'Category']} rows={rows} />
    </AnalyticsPanel>
    <InsightCard text="Confirm close dates for at-risk opportunities and keep committed deals aligned to documented next steps." tone="amber" />
  </AnalyticsPage>;
}
