import React, { useState } from 'react';
import { BadgeCheck, CircleHelp, ClipboardCheck, Filter, UserRound } from 'lucide-react';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { PageHeader } from '../../../../components/ui/Layout';
import { QualificationCallButton } from '../../../../components/sales/lead/qualification/QualificationCallButton';
import { qualificationLeads } from '../../../../components/sales/lead/qualification/QualificationData';
import type { QualificationResult } from '../../../../components/sales/lead/qualification/QualificationData';

const resultVariant: Record<QualificationResult, 'success' | 'warning' | 'neutral'> = {
  Qualified: 'success',
  'Needs Review': 'warning',
  Unqualified: 'neutral',
};

const QualificationResults: React.FC = () => {
  const [filter, setFilter] = useState('All results');
  const [selectedId, setSelectedId] = useState(qualificationLeads[0].id);
  const [decisions, setDecisions] = useState<Record<string, QualificationResult>>({});
  const getResult = (id: string) => decisions[id] ?? qualificationLeads.find((lead) => lead.id === id)?.result ?? 'Needs Review';
  const visibleLeads = qualificationLeads.filter((lead) => filter === 'All results' || getResult(lead.id) === filter);
  const selected = qualificationLeads.find((lead) => lead.id === selectedId) ?? qualificationLeads[0];
  const result = getResult(selected.id);
  const setDecision = (next: QualificationResult) => setDecisions((current) => ({ ...current, [selected.id]: next }));

  return (
    <div className="page-content animate-fade-in qualification-page">
      <PageHeader title="Qualification Results" subtitle="Review lead decisions, rationale, and recommended next steps." />
      <div className="qualification-result-summary">
        <div><span><BadgeCheck size={16} /> Qualified</span><strong>{qualificationLeads.filter((lead) => getResult(lead.id) === 'Qualified').length + 42}</strong></div>
        <div><span><CircleHelp size={16} /> Needs review</span><strong>{qualificationLeads.filter((lead) => getResult(lead.id) === 'Needs Review').length + 18}</strong></div>
        <div><span><ClipboardCheck size={16} /> Unqualified</span><strong>{qualificationLeads.filter((lead) => getResult(lead.id) === 'Unqualified').length + 31}</strong></div>
      </div>
      <section className="qualification-results-workspace">
        <div className="qualification-results-queue">
          <div className="qualification-results-queue__heading"><div><h2>Decision queue</h2><p>{visibleLeads.length} sample leads</p></div><label><Filter size={14} /><select aria-label="Filter results" value={filter} onChange={(event) => setFilter(event.target.value)}><option>All results</option><option>Qualified</option><option>Needs Review</option><option>Unqualified</option></select></label></div>
          <div className="qualification-results-queue__list">
            {visibleLeads.map((lead) => {
              const leadResult = getResult(lead.id);
              return (
                <button type="button" key={lead.id} className={`qualification-result-item${lead.id === selected.id ? ' is-selected' : ''}`} onClick={() => setSelectedId(lead.id)}>
                  <span className="sales-avatar">{lead.name.split(' ').map((part) => part[0]).join('')}</span>
                  <span className="qualification-result-item__identity"><strong>{lead.name}</strong><small>{lead.company}</small><small>{lead.reason}</small></span>
                  <span className="qualification-result-item__score">{lead.qualificationScore}<small>score</small></span>
                  <Badge variant={resultVariant[leadResult]} dot>{leadResult}</Badge>
                </button>
              );
            })}
            {visibleLeads.length === 0 && <div className="sales-empty-state">No leads have this result.</div>}
          </div>
        </div>

        <aside className="qualification-result-detail">
          <div className="qualification-result-detail__banner">
            <span className="sales-avatar">{selected.name.split(' ').map((part) => part[0]).join('')}</span>
            <div><span className="qualification-eyebrow">QUALIFICATION DECISION</span><h2>{selected.name}</h2><p>{selected.company} · {selected.industry}</p></div>
          </div>
          <div className="qualification-result-detail__score"><div><span>Qualification score</span><strong>{selected.qualificationScore}<small>/100</small></strong></div><Badge variant={resultVariant[result]} dot>{result}</Badge></div>
          <div className="qualification-result-detail__facts">
            <div><span>Assigned rep</span><strong><UserRound size={14} />{selected.salesRep}</strong></div>
            <div><span>Review date</span><strong>{selected.reviewDate}</strong></div>
            <div><span>Intent level</span><strong>{selected.intentLevel} · {selected.confidence}%</strong></div>
          </div>
          <div className="qualification-result-detail__reason"><span className="qualification-eyebrow">DECISION RATIONALE</span><p>{selected.reason}</p></div>
          <div className="qualification-result-detail__recommendation"><span className="qualification-eyebrow">NEXT BEST ACTION</span><strong>{selected.recommendedAction}</strong></div>
          <QualificationCallButton contactName={selected.name} company={selected.company} phone={selected.phone} />
          <div className="qualification-result-detail__actions">
            <Button variant="primary" onClick={() => setDecision('Qualified')}>Mark qualified</Button>
            <Button variant="outline" onClick={() => setDecision('Needs Review')}>Needs review</Button>
            <Button variant="ghost" onClick={() => setDecision('Unqualified')}>Unqualified</Button>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default QualificationResults;
