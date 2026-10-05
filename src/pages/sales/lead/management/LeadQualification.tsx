import React, { useState } from 'react';
import { Check, Circle, Clock3, DollarSign, Target, UserRoundCheck } from 'lucide-react';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { PageHeader } from '../../../../components/ui/Layout';
import { useToast } from '../../../../components/ui/Toast';
import { salesLeads } from '../../../../components/sales/SalesData';

const LeadQualification: React.FC = () => {
  const { showToast } = useToast();
  const [selectedId, setSelectedId] = useState(salesLeads[0].id);
  const [decisions, setDecisions] = useState<Record<string, string>>({});
  const lead = salesLeads.find((item) => item.id === selectedId) ?? salesLeads[0];
  const decision = decisions[lead.id] ?? lead.status;
  const qualifiedCount = salesLeads.filter((item) => item.qualificationScore >= 70).length;
  const criteria = [
    { label: 'Budget confirmed', value: lead.budget, icon: DollarSign, complete: lead.budget !== 'Not confirmed' },
    { label: 'Business need', value: lead.businessNeed, icon: Target, complete: Boolean(lead.businessNeed) },
    { label: 'Buying timeline', value: lead.buyingTimeline, icon: Clock3, complete: lead.buyingTimeline !== '12+ months' },
    { label: 'Decision authority', value: lead.decisionMaker, icon: UserRoundCheck, complete: lead.decisionMaker === 'Yes' },
  ];
  const decide = (value: string) => {
    setDecisions((current) => ({ ...current, [lead.id]: value }));
    showToast(`${lead.name} marked ${value.toLowerCase()}`, value === 'Qualified' ? 'success' : 'info');
  };

  return (
    <div className="page-content animate-fade-in">
      <PageHeader title="Lead Qualification" subtitle="Review fit and buying readiness, then decide which prospects advance." />
      <div className="sales-qualification-summary">
        <div><span>Reviewed</span><strong>{salesLeads.length + 128}</strong></div>
        <div><span>Qualified</span><strong>{qualifiedCount + 42}</strong></div>
        <div><span>Needs review</span><strong>18</strong></div>
        <div className="sales-qualification-split"><span>Qualified vs. unqualified</span><div><i style={{ width: '68%' }} /><i style={{ width: '32%' }} /></div><small>68% qualified · 32% unqualified</small></div>
      </div>
      <div className="sales-qualification-workspace">
        <aside className="sales-qualification-queue">
          <div className="sales-enrichment-list__heading"><h2>Review queue</h2><span>{salesLeads.length}</span></div>
          {salesLeads.map((item) => (
            <button type="button" key={item.id} className={`sales-qualification-queue__item${item.id === lead.id ? ' is-selected' : ''}`} onClick={() => setSelectedId(item.id)}>
              <span><strong>{item.name}</strong><small>{item.company}</small></span>
              <b>{item.qualificationScore}</b>
            </button>
          ))}
        </aside>
        <section className="sales-qualification-review">
          <div className="sales-qualification-review__hero">
            <div><span className="sales-eyebrow">QUALIFICATION SCORE</span><h2>{lead.name}</h2><p>{lead.company} · {lead.industry}</p></div>
            <div className="sales-score-ring" style={{ '--score': `${lead.qualificationScore}%` } as React.CSSProperties}><strong>{lead.qualificationScore}</strong><span>/100</span></div>
          </div>
          <div className="sales-criteria-grid">
            {criteria.map((criterion) => {
              const Icon = criterion.icon;
              return <article key={criterion.label} className="sales-criteria-card"><span className={`sales-criteria-card__icon${criterion.complete ? ' is-complete' : ''}`}><Icon size={16} /></span><span><small>{criterion.label}</small><strong>{criterion.value}</strong></span><span className="sales-criteria-state">{criterion.complete ? <Check size={15} /> : <Circle size={15} />}</span></article>;
            })}
          </div>
          <div className="sales-decision-panel">
            <div><span className="sales-eyebrow">RECOMMENDED DECISION</span><p>Based on the available fit, budget, and buying signals.</p><Badge variant={decision === 'Qualified' ? 'success' : 'warning'} dot>{decision}</Badge></div>
            <div className="sales-decision-actions"><Button onClick={() => decide('Qualified')}>Qualify lead</Button><Button variant="outline" onClick={() => decide('Unqualified')}>Mark unqualified</Button><Button variant="ghost" onClick={() => decide('Nurturing')}>Nurture</Button></div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LeadQualification;
