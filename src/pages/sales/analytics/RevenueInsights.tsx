import { useOpportunityStore } from '../opportunities/store';
import { opportunityLead } from '../opportunities/data';
import { AnalyticsMetric, AnalyticsPage, AnalyticsPanel, AnalyticsTable, DonutChart, HorizontalBars, LineChart } from './AnalyticsComponents';
import { currency, deriveProductRevenue, monthlyRevenueTrend } from './data';

export default function RevenueInsights() {
  const { opportunities } = useOpportunityStore();
  const won = opportunities.filter((deal) => deal.stage === 'Won');
  const active = opportunities.filter((deal) => !['Won', 'Lost'].includes(deal.stage));
  const totalRevenue = won.reduce((sum, deal) => sum + deal.value, 0);
  const expectedRevenue = active.reduce((sum, deal) => sum + deal.value * deal.probability / 100, 0);
  const products = deriveProductRevenue(opportunities);
  const segmentMap = new Map<string, { revenue: number; deals: number }>();
  const regionMap = new Map<string, number>();
  opportunities.forEach((deal) => {
    const lead = opportunityLead(deal.prospectId);
    const segment = lead.industry || 'Other';
    const segmentEntry = segmentMap.get(segment) ?? { revenue: 0, deals: 0 };
    if (deal.stage === 'Won') {
      segmentEntry.revenue += deal.value;
      segmentEntry.deals += 1;
    }
    segmentMap.set(segment, segmentEntry);
    const region = lead.location.split(',').pop()?.trim() || 'Other';
    regionMap.set(region, (regionMap.get(region) ?? 0) + (deal.stage === 'Won' ? deal.value : 0));
  });
  const segments = [...segmentMap].map(([segment, value]) => ({ segment, ...value }));
  const productRows = products.map((product) => [
    <strong key="product">{product.product}</strong>,
    currency(product.revenue),
    product.deals,
    currency(product.average),
    <span className="analytics-positive" key="growth">↑ {product.growth}%</span>,
  ]);
  const segmentRows = segments.map((segment) => [
    <strong key="segment">{segment.segment}</strong>,
    currency(segment.revenue),
    segment.deals,
    currency(segment.deals ? Math.round(segment.revenue / segment.deals) : 0),
  ]);
  const revenueSeries = monthlyRevenueTrend.map((item) => ({ ...item }));
  return <AnalyticsPage title="Revenue Insights" subtitle="Explore closed revenue, expected earnings and the products, markets and customers driving growth.">
    <section className="analytics-metrics analytics-metrics--six">
      <AnalyticsMetric label="Total Revenue" value={currency(totalRevenue, true)} detail="Closed-won deals" trend={14} />
      <AnalyticsMetric label="Monthly Recurring Revenue" value={currency(Math.round(totalRevenue / 12), true)} detail="Illustrative run rate" />
      <AnalyticsMetric label="Average Deal Value" value={currency(won.length ? Math.round(totalRevenue / won.length) : 0, true)} detail="Won deals" />
      <AnalyticsMetric label="Revenue Growth" value="14%" detail="Compared with prior period" trend={14} />
      <AnalyticsMetric label="Won Revenue" value={currency(totalRevenue, true)} detail={`${won.length} closed deals`} />
      <AnalyticsMetric label="Expected Revenue" value={currency(expectedRevenue, true)} detail="Weighted open pipeline" />
    </section>
    <AnalyticsPanel title="Revenue Trend" subtitle="Closed revenue and expected revenue, $K">
      <LineChart data={revenueSeries} series={[{ key: 'revenue', label: 'Closed revenue', color: '#2563eb' }, { key: 'expected', label: 'Expected revenue', color: '#8b5cf6' }]} />
    </AnalyticsPanel>
    <div className="analytics-two-column">
      <AnalyticsPanel title="Revenue by Product" subtitle="Closed revenue contribution">
        <DonutChart title="Won revenue" items={products.map((product, index) => ({ label: product.product, value: product.revenue, color: ['#2563eb', '#8b5cf6', '#10b981'][index % 3] }))} />
      </AnalyticsPanel>
      <AnalyticsPanel title="Revenue by Market" subtitle="Won revenue by customer location">
        <HorizontalBars items={[...regionMap].map(([label, value]) => ({ label, value }))} />
      </AnalyticsPanel>
    </div>
    <div className="analytics-two-column">
      <AnalyticsPanel title="Revenue by Product" subtitle="Product-level deal economics">
        <AnalyticsTable headers={['Product', 'Revenue', 'Deals', 'Avg. deal size', 'Growth']} rows={productRows} />
      </AnalyticsPanel>
      <AnalyticsPanel title="Revenue by Customer Segment" subtitle="Closed revenue and deal volume by industry">
        <AnalyticsTable headers={['Segment', 'Revenue', 'Deals', 'Average value']} rows={segmentRows} />
      </AnalyticsPanel>
    </div>
    <AnalyticsPanel title="Revenue by Salesperson" subtitle="Closed-won contribution">
      <HorizontalBars items={[...new Set(opportunities.map((deal) => deal.owner))].map((owner) => ({
        label: owner,
        value: won.filter((deal) => deal.owner === owner).reduce((sum, deal) => sum + deal.value, 0),
      }))} />
    </AnalyticsPanel>
  </AnalyticsPage>;
}
