import { useMemo, useState } from 'react';
import { ArrowRight, BriefcaseBusiness, ChartNoAxesCombined, CircleDollarSign, Phone, Plus, Target, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { DialerModal } from '../../../components/product/DialerModal';
import { OpportunityDetail, OpportunityMetric, OpportunityPage, OpportunityPanel, OpportunityStatus, ProbabilityBar } from './OpportunityComponents';
import { currency, displayDate, opportunityStages, opportunityToday, opportunityLead, type SalesOpportunity } from './data';
import { useOpportunityStore } from './store';

export default function OpportunityManagementDashboard() {
  const { opportunities } = useOpportunityStore();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<SalesOpportunity | null>(null);
  const [dialerOpen, setDialerOpen] = useState(false);
  const active = opportunities.filter((deal) => !['Won', 'Lost'].includes(deal.stage));
  const pipeline = active.reduce((total, deal) => total + deal.value, 0);
  const weighted = active.reduce((total, deal) => total + deal.value * deal.probability / 100, 0);
  const wonDeals = opportunities.filter((deal) => deal.stage === 'Won');
  const closedDeals = opportunities.filter((deal) => ['Won', 'Lost'].includes(deal.stage));
  const winRate = closedDeals.length ? Math.round(wonDeals.length / closedDeals.length * 100) : 0;
  const averageDeal = opportunities.length ? Math.round(opportunities.reduce((total, deal) => total + deal.value, 0) / opportunities.length) : 0;
  const closingThisMonth = active.filter((deal) => deal.closeDate.slice(0, 7) === opportunityToday.slice(0, 7));
  const stageSummary = useMemo(() => opportunityStages.map((stage) => ({
    stage,
    count: opportunities.filter((deal) => deal.stage === stage).length,
    value: opportunities.filter((deal) => deal.stage === stage).reduce((total, deal) => total + deal.value, 0),
  })), [opportunities]);
  const latest = opportunities.filter((deal) => !['Won', 'Lost'].includes(deal.stage)).slice(0, 5);

  return <>
    <OpportunityPage title="Opportunity Management" subtitle="Turn qualified interest into predictable revenue, from first discovery through close."
      actions={<>
        <Button variant="outline" icon={<Phone size={15} />} onClick={() => setDialerOpen(true)}>Dial a Number</Button>
        <Button icon={<Plus size={15} />} onClick={() => navigate('/coming-soon/opportunity-management/opportunity-tracking')}>View Opportunities</Button>
      </>}>
      <DialerModal open={dialerOpen} onClose={() => setDialerOpen(false)} />
      <section className="opportunity-metrics">
        <OpportunityMetric label="Total Opportunities" value={opportunities.length} note="Across the active sales portfolio" />
        <OpportunityMetric label="Pipeline Value" value={currency(pipeline)} note="Open opportunity value" />
        <OpportunityMetric label="Weighted Pipeline" value={currency(weighted)} note="Value adjusted by probability" trend="+12%" />
        <OpportunityMetric label="Won Deals" value={wonDeals.length} note={`${currency(wonDeals.reduce((total, deal) => total + deal.value, 0))} closed revenue`} />
        <OpportunityMetric label="Win Rate" value={`${winRate}%`} note="Won deals across closed opportunities" trend="+6%" />
        <OpportunityMetric label="Average Deal Size" value={currency(averageDeal)} note="Across all opportunities" />
        <OpportunityMetric label="Expected Revenue" value={currency(weighted + wonDeals.reduce((total, deal) => total + deal.value, 0))} note="Weighted open pipeline + won" />
        <OpportunityMetric label="Closing This Month" value={closingThisMonth.length} note="Expected close this month" />
      </section>

      <OpportunityPanel title="Pipeline Overview" subtitle="Opportunity volume and deal value by stage" icon={<ChartNoAxesCombined size={17} />}
        action={<Button variant="ghost" size="sm" iconRight={<ArrowRight size={14} />} onClick={() => navigate('/coming-soon/opportunity-management/pipeline-management')}>Open pipeline</Button>}>
        <div className="opportunity-funnel">
          {stageSummary.map(({ stage, count, value }, index) => {
            const max = Math.max(...stageSummary.map((item) => item.value), 1);
            return <button type="button" className={`opportunity-funnel__stage opportunity-funnel__stage--${stage.toLowerCase().replaceAll(' ', '-')}`} key={stage}
              onClick={() => navigate('/coming-soon/opportunity-management/pipeline-management')}>
              <span className="opportunity-funnel__top"><strong>{stage}</strong><b>{count}</b></span>
              <span className="opportunity-funnel__bar"><i style={{ width: `${Math.max(value ? value / max * 100 : 0, count ? 8 : 0)}%` }} /></span>
              <small>{currency(value)}</small>
              {index < stageSummary.length - 1 && <ArrowRight size={14} className="opportunity-funnel__arrow" />}
            </button>;
          })}
        </div>
        <div className="opportunity-journey-note"><BriefcaseBusiness size={15} /><span>Lead</span><ArrowRight size={13} /><span>Qualified lead</span><ArrowRight size={13} /><strong>Opportunity</strong><ArrowRight size={13} /><span>Deal</span><ArrowRight size={13} /><span>Won / Lost</span></div>
      </OpportunityPanel>

      <div className="opportunity-dashboard-grid">
        <OpportunityPanel title="Priority Opportunities" subtitle="Deals that need a clear next step" icon={<Target size={17} />}
          action={<Button variant="ghost" size="sm" iconRight={<ArrowRight size={14} />} onClick={() => navigate('/coming-soon/opportunity-management/opportunity-tracking')}>View tracking</Button>}>
          <div className="opportunity-priority-list">
            {latest.map((deal) => {
              const lead = opportunityLead(deal.prospectId);
              return <button type="button" className="opportunity-priority-row" key={deal.id} onClick={() => setSelected(deal)}>
                <span className="opportunity-priority-row__lead"><strong>{deal.name}</strong><small>{lead.company} · {deal.product}</small></span>
                <strong className="opportunity-priority-row__value">{currency(deal.value)}</strong>
                <span className="opportunity-priority-row__stage"><OpportunityStatus status={deal.stage} /></span>
                <span className="opportunity-priority-row__close">Close {displayDate(deal.closeDate)}</span>
              </button>;
            })}
          </div>
        </OpportunityPanel>
        <OpportunityPanel title="Deal Health" subtitle="Qualification and close confidence" icon={<Trophy size={17} />}>
          <div className="opportunity-health">
            <div className="opportunity-health__hero"><span><CircleDollarSign size={17} />Weighted pipeline</span><strong>{currency(weighted)}</strong><small>Potential revenue based on current deal confidence</small></div>
            {active.slice(0, 4).map((deal) => <div className="opportunity-health__row" key={deal.id}><span><strong>{deal.name}</strong><small>{deal.owner}</small></span><ProbabilityBar probability={deal.probability} /></div>)}
          </div>
        </OpportunityPanel>
      </div>
    </OpportunityPage>
    <OpportunityDetail opportunity={selected} onClose={() => setSelected(null)} />
  </>;
}
