import { useOpportunityStore } from '../opportunities/store';
import { AnalyticsMetric, AnalyticsPage, AnalyticsPanel, AnalyticsTable, HorizontalBars, InsightCard, LineChart } from './AnalyticsComponents';
import { derivePipeline, monthlyRevenueTrend, currency, pipelineProgression } from './data';

export default function PipelineAnalytics() {
  const { opportunities } = useOpportunityStore();
  const stages = derivePipeline(opportunities);
  const active = opportunities.filter((deal) => !['Won', 'Lost'].includes(deal.stage));
  const total = active.reduce((sum, deal) => sum + deal.value, 0);
  const weighted = stages.reduce((sum, stage) => sum + stage.weighted, 0);
  const rows = stages.map((stage, index) => [
    <strong key="stage">{stage.stage.replace(' Opportunity', '')}</strong>,
    stage.count,
    currency(stage.value),
    currency(stage.average),
    `${stage.probability}%`,
    index === stages.length - 1 ? '—' : `${pipelineProgression[index]}%`,
  ]);
  return <AnalyticsPage title="Pipeline Analytics" subtitle="Track pipeline health, stage velocity and deal progression across your sales process.">
    <section className="analytics-metrics analytics-metrics--five">
      <AnalyticsMetric label="Total Pipeline Value" value={currency(total, true)} detail="Open deal value" trend={18} />
      <AnalyticsMetric label="Weighted Pipeline" value={currency(weighted, true)} detail="Probability-adjusted value" />
      <AnalyticsMetric label="Opportunities" value={active.length} detail="Active deals" />
      <AnalyticsMetric label="Average Deal Value" value={currency(active.length ? Math.round(total / active.length) : 0, true)} detail="Across open pipeline" />
      <AnalyticsMetric label="Pipeline Growth" value="18%" detail="Compared with prior month" trend={18} />
    </section>
    <div className="analytics-two-column">
      <AnalyticsPanel title="Pipeline Stage Breakdown" subtitle="Deal value by current stage">
        <HorizontalBars items={stages.filter((stage) => !['Won', 'Lost'].includes(stage.stage)).map((stage) => ({ label: stage.stage.replace(' Opportunity', ''), value: stage.value }))} />
      </AnalyticsPanel>
      <AnalyticsPanel title="Pipeline Trend" subtitle="Historical revenue and forward expectation">
        <LineChart data={monthlyRevenueTrend} series={[{ key: 'revenue', label: 'Closed revenue', color: '#2563eb' }, { key: 'expected', label: 'Expected', color: '#8b5cf6' }]} />
      </AnalyticsPanel>
    </div>
    <AnalyticsPanel title="Stage Performance" subtitle="Deal volume, value, average size and stage conversion">
      <AnalyticsTable headers={['Stage', 'Deals', 'Total value', 'Average value', 'Probability', 'Progression']} rows={rows} />
    </AnalyticsPanel>
    <div className="analytics-bottleneck"><span>Pipeline bottleneck</span><strong>Proposal → Negotiation has the lowest progression rate.</strong><small>Demo estimate: 34% progression. Consider reviewing proposal follow-up timing and stakeholder alignment.</small></div>
    <InsightCard text={`The active pipeline carries ${currency(weighted, true)} in probability-weighted value. Keep late-stage opportunities on a clear next-step plan.`} />
  </AnalyticsPage>;
}
