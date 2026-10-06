import { useMemo, useState } from 'react';
import { ArrowDownUp, BriefcaseBusiness, Search, SlidersHorizontal } from 'lucide-react';
import { Input, Select } from '../../../components/ui/Input';
import { opportunityStages, opportunityLead, currency, displayDate, type SalesOpportunity } from './data';
import { DealIdentity, OpportunityDetail, OpportunityPage, OpportunityPanel, OpportunityStatus, ProbabilityBar, PriorityBadge } from './OpportunityComponents';
import { useOpportunityStore } from './store';

export default function OpportunityTracking() {
  const { opportunities } = useOpportunityStore();
  const [query, setQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('All stages');
  const [sortHigh, setSortHigh] = useState(true);
  const [selected, setSelected] = useState<SalesOpportunity | null>(null);
  const filtered = useMemo(() => opportunities.filter((deal) => {
    const lead = opportunityLead(deal.prospectId);
    const matches = `${deal.name} ${lead.company} ${lead.name} ${deal.product} ${deal.owner}`.toLowerCase().includes(query.toLowerCase());
    return matches && (stageFilter === 'All stages' || deal.stage === stageFilter);
  }).sort((a, b) => sortHigh ? b.value - a.value : a.value - b.value), [opportunities, query, stageFilter, sortHigh]);

  return <>
    <OpportunityPage title="Opportunity Tracking" subtitle="Search, prioritize, and inspect every active deal in your revenue pipeline.">
      <OpportunityPanel title="Opportunity portfolio" subtitle={`${filtered.length} opportunities · select a row for qualification and deal details`} icon={<BriefcaseBusiness size={17} />}>
        <div className="opportunity-toolbar">
          <Input aria-label="Search opportunities" placeholder="Search deal, company, product or owner..." value={query} onChange={(event) => setQuery(event.target.value)} leftIcon={<Search size={15} />} />
          <Select aria-label="Filter stage" value={stageFilter} onChange={(event) => setStageFilter(event.target.value)}
            options={['All stages', ...opportunityStages].map((stage) => ({ value: stage, label: stage }))} />
          <button type="button" className="opportunity-sort-button" onClick={() => setSortHigh((current) => !current)}><ArrowDownUp size={14} />Value {sortHigh ? 'high to low' : 'low to high'}</button>
        </div>
        <div className="opportunity-table-wrap">
          <table className="opportunity-table">
            <thead><tr><th>Opportunity / customer</th><th>Product / service</th><th>Deal value</th><th>Probability</th><th>Stage</th><th>Expected close</th><th>Owner / priority</th><th>Activity / next action</th></tr></thead>
            <tbody>{filtered.map((deal) => {
              const lead = opportunityLead(deal.prospectId);
              return <tr key={deal.id} onClick={() => setSelected(deal)} tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setSelected(deal); }}>
                <td><DealIdentity lead={lead} title={deal.name} /></td>
                <td>{deal.product}</td>
                <td><strong>{currency(deal.value)}</strong></td>
                <td><ProbabilityBar probability={deal.probability} /></td>
                <td><OpportunityStatus status={deal.stage} /></td>
                <td>{displayDate(deal.closeDate)}</td>
                <td><span className="opportunity-owner-cell"><strong>{deal.owner}</strong><PriorityBadge priority={deal.priority} /></span></td>
                <td><span className="opportunity-activity-cell"><strong>{deal.lastActivity}</strong><small>Next: {deal.nextAction}</small></span></td>
              </tr>;
            })}</tbody>
          </table>
          {!filtered.length && <div className="opportunity-empty"><SlidersHorizontal size={20} /><strong>No matching opportunities</strong><span>Adjust your search or stage filter.</span></div>}
        </div>
      </OpportunityPanel>
    </OpportunityPage>
    <OpportunityDetail opportunity={selected} onClose={() => setSelected(null)} />
  </>;
}
