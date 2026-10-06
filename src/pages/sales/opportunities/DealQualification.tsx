import { useState } from 'react';
import { Check, CircleAlert, ClipboardCheck, X } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { currency, opportunityLead, type QualificationStatus, type SalesOpportunity } from './data';
import { DealIdentity, OpportunityDetail, OpportunityPage, OpportunityPanel, OpportunityStatus, PriorityBadge } from './OpportunityComponents';
import { updateOpportunity, useOpportunityStore } from './store';

const qualificationStates: QualificationStatus[] = ['Needs Review', 'Qualified', 'Disqualified'];

export default function DealQualification() {
  const { opportunities } = useOpportunityStore();
  const [selected, setSelected] = useState<SalesOpportunity | null>(null);
  const needsReview = opportunities.filter((deal) => deal.qualificationStatus === 'Needs Review');
  return <>
    <OpportunityPage title="Deal Qualification" subtitle="Validate budget, authority, need, timing, and product fit before forecasting deal revenue."
      actions={<span className="opportunity-page-chip"><CircleAlert size={14} />{needsReview.length} need review</span>}>
      <div className="qualification-summary">
        {qualificationStates.map((status) => <button type="button" className={`qualification-summary__card${status === 'Qualified' ? ' is-qualified' : status === 'Disqualified' ? ' is-disqualified' : ''}`} key={status}
          onClick={() => document.getElementById(`qualification-${status.replaceAll(' ', '-')}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
          <span>{status}</span><strong>{opportunities.filter((deal) => deal.qualificationStatus === status).length}</strong><small>{status === 'Qualified' ? 'Ready for forecast' : status === 'Needs Review' ? 'More information required' : 'Not progressing'}</small>
        </button>)}
      </div>
      <OpportunityPanel title="Qualification reviews" subtitle="Use the decision criteria to advance or disqualify an opportunity." icon={<ClipboardCheck size={17} />}>
        <div className="qualification-list">
          {opportunities.map((deal) => {
            const lead = opportunityLead(deal.prospectId);
            return <article className="qualification-card" key={deal.id} id={`qualification-${deal.qualificationStatus.replaceAll(' ', '-')}`}>
              <div className="qualification-card__header">
                <button type="button" className="qualification-card__deal" onClick={() => setSelected(deal)}><DealIdentity lead={lead} title={deal.name} /></button>
                <OpportunityStatus status={deal.qualificationStatus} />
              </div>
              <div className="qualification-score">
                <div><strong>{deal.qualificationScore}</strong><small>Qualification score</small></div>
                <span><i style={{ width: `${deal.qualificationScore}%` }} /></span>
                <small>{currency(deal.value)} deal</small>
              </div>
              <div className="qualification-criteria">
                <span><small>Budget</small><strong>{deal.budget}</strong></span>
                <span><small>Business need</small><strong>{deal.businessNeed}</strong></span>
                <span><small>Decision maker</small><strong>{deal.decisionMaker}</strong></span>
                <span><small>Buying timeline</small><strong>{deal.timeline}</strong></span>
                <span><small>Product fit</small><strong>{deal.productFit}%</strong></span>
                <span><small>Notes</small><strong>{deal.notes}</strong></span>
              </div>
              <div className="qualification-card__footer"><PriorityBadge priority={deal.priority} />
                <div className="opportunity-inline-actions">
                  <Button size="sm" variant={deal.qualificationStatus === 'Qualified' ? 'primary' : 'outline'} icon={<Check size={13} />} onClick={() => updateOpportunity(deal.id, { qualificationStatus: 'Qualified' })}>Qualified</Button>
                  <Button size="sm" variant={deal.qualificationStatus === 'Needs Review' ? 'secondary' : 'ghost'} onClick={() => updateOpportunity(deal.id, { qualificationStatus: 'Needs Review' })}>Needs Review</Button>
                  <Button size="sm" variant={deal.qualificationStatus === 'Disqualified' ? 'danger' : 'ghost'} icon={<X size={13} />} onClick={() => updateOpportunity(deal.id, { qualificationStatus: 'Disqualified' })}>Disqualify</Button>
                </div>
              </div>
            </article>;
          })}
        </div>
      </OpportunityPanel>
    </OpportunityPage>
    <OpportunityDetail opportunity={selected} onClose={() => setSelected(null)} />
  </>;
}
