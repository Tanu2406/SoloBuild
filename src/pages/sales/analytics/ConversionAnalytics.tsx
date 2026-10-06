import { useOpportunityStore } from '../opportunities/store';
import { AnalyticsFunnel, AnalyticsMetric, AnalyticsPage, AnalyticsPanel, AnalyticsTable, HorizontalBars, LineChart } from './AnalyticsComponents';
import { deriveProductRevenue, deriveSources, funnelStages, performanceTimeSeries } from './data';

export default function ConversionAnalytics() {
  const { opportunities } = useOpportunityStore();
  const sources = deriveSources(opportunities);
  const products = deriveProductRevenue(opportunities);
  const stepLabels = ['Lead → Qualified', 'Qualified → Outreach', 'Outreach → Meeting', 'Meeting → Opportunity', 'Opportunity → Won'];
  const steps = stepLabels.map((label, index) => ({
    label,
    value: funnelStages[index].count
      ? Math.round(funnelStages[index + 1].count / funnelStages[index].count * 100)
      : 0,
  }));
  const sourceRows = sources.map((source) => [
    <strong key="source">{source.source}</strong>,
    source.leads,
    source.qualified,
    source.opportunities,
    source.won,
    `${source.conversion}%`,
  ]);
  const trendData = performanceTimeSeries['This Year'].map(({ label, conversion }) => ({ label, conversion }));
  return <AnalyticsPage title="Conversion Analytics" subtitle="See where prospects advance, where they pause, and which channels create winning opportunities.">
    <section className="analytics-metrics analytics-metrics--five">
      {steps.map((step) => <AnalyticsMetric key={step.label} label={step.label} value={`${step.value}%`} detail="Demo conversion" trend={step.value >= 58 ? 4 : undefined} />)}
    </section>
    <div className="analytics-two-column">
      <AnalyticsPanel title="Sales Funnel" subtitle="Progression through the end-to-end sales journey">
        <AnalyticsFunnel stages={funnelStages} />
      </AnalyticsPanel>
      <AnalyticsPanel title="Conversion Trend" subtitle="Monthly conversion rate over the current year">
        <LineChart data={trendData} axisFormat="percent" series={[{ key: 'conversion', label: 'Conversion rate', color: '#2563eb' }]} />
        <div className="analytics-trend-summary"><strong>27%</strong><span>Current demo conversion</span><small>↑ 4.2 pts over the selected period</small></div>
      </AnalyticsPanel>
    </div>
    <AnalyticsPanel title="Conversion by Source" subtitle="Lead quality and closed-won conversion across acquisition channels">
      <AnalyticsTable headers={['Source', 'Leads', 'Qualified', 'Opportunities', 'Won', 'Conversion']} rows={sourceRows} />
    </AnalyticsPanel>
    <div className="analytics-two-column">
      <AnalyticsPanel title="Conversion by Product" subtitle="Closed-won share of opportunities">
        <HorizontalBars items={products.map((product) => ({ label: product.product, value: product.conversion }))} format="percent" />
      </AnalyticsPanel>
      <AnalyticsPanel title="Source efficiency" subtitle="Share of leads reaching qualified status">
        <HorizontalBars items={sources.map((source) => ({ label: source.source, value: Math.round(source.qualified / Math.max(source.leads, 1) * 100) }))} format="percent" />
      </AnalyticsPanel>
    </div>
  </AnalyticsPage>;
}
