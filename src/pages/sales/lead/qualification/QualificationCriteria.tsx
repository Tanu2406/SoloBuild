import React, { useMemo, useState } from 'react';
import { Check, Circle, DollarSign, Target, Timer, UserRoundCheck, UsersRound } from 'lucide-react';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { PageHeader } from '../../../../components/ui/Layout';
import { QualificationCallButton } from '../../../../components/sales/lead/qualification/QualificationCallButton';
import { qualificationCriteria, qualificationLeads } from '../../../../components/sales/lead/qualification/QualificationData';

const criterionIcons = [Target, DollarSign, Check, Timer, UserRoundCheck, UsersRound];

const QualificationCriteria: React.FC = () => {
  const [selectedId, setSelectedId] = useState(qualificationLeads[0].id);
  const [reviewed, setReviewed] = useState<Record<string, boolean>>({});
  const lead = qualificationLeads.find((item) => item.id === selectedId) ?? qualificationLeads[0];
  const scoreAdjustments = useMemo(() => reviewed[lead.id] ? 2 : 0, [lead.id, reviewed]);
  const rows = [
    { score: lead.companyFit, result: lead.companyFit >= 75 ? 'Strong fit' : 'Fit gap', complete: lead.companyFit >= 65 },
    { score: lead.budget === 'Not confirmed' ? 38 : lead.totalScore >= 80 ? 90 : 72, result: lead.budget === 'Not confirmed' ? 'Confirm budget' : 'Budget indicated', complete: lead.budget !== 'Not confirmed' },
    { score: lead.businessNeed ? Math.max(62, lead.qualificationScore) : 35, result: lead.businessNeed ? 'Need identified' : 'Clarify need', complete: Boolean(lead.businessNeed) },
    { score: lead.buyingTimeline.startsWith('0') || lead.buyingTimeline.startsWith('3') ? 88 : 52, result: lead.buyingTimeline.startsWith('0') || lead.buyingTimeline.startsWith('3') ? 'Near-term' : 'Long-term', complete: !lead.buyingTimeline.startsWith('12') },
    { score: lead.decisionMaker === 'Yes' ? 92 : lead.decisionMaker === 'Influencer' ? 68 : 34, result: lead.decisionMaker === 'Yes' ? 'Decision maker' : lead.decisionMaker, complete: lead.decisionMaker === 'Yes' },
    { score: lead.engagementScore, result: lead.engagementScore >= 70 ? 'Active engagement' : 'Low engagement', complete: lead.engagementScore >= 60 },
  ];
  const overall = Math.min(100, lead.qualificationScore + scoreAdjustments);

  return (
    <div className="page-content animate-fade-in qualification-page">
      <PageHeader title="Qualification Criteria" subtitle="Evaluate each lead against consistent fit, budget, need, and readiness signals." />
      <div className="qualification-criteria-summary">
        <div><span>Criteria in model</span><strong>06</strong></div>
        <div><span>Weighted score</span><strong>{overall}<small> / 100</small></strong></div>
        <div><span>Criteria passed</span><strong>{rows.filter((row) => row.complete).length}<small> / 6</small></strong></div>
        <div><span>Review queue</span><strong>126</strong></div>
      </div>
      <div className="qualification-criteria-layout">
        <aside className="qualification-lead-queue">
          <div className="qualification-section-heading"><div><h2>Lead queue</h2><p>Select a profile to review</p></div><span>{qualificationLeads.length}</span></div>
          {qualificationLeads.map((item) => (
            <button type="button" className={`qualification-lead-queue__item${item.id === lead.id ? ' is-selected' : ''}`} key={item.id} onClick={() => setSelectedId(item.id)}>
              <span className="sales-avatar">{item.name.split(' ').map((part) => part[0]).join('')}</span>
              <span><strong>{item.name}</strong><small>{item.company}</small></span>
              <b>{item.qualificationScore}</b>
            </button>
          ))}
        </aside>
        <section className="qualification-criteria-workspace">
          <div className="qualification-profile-banner">
            <div className="qualification-profile-banner__identity">
              <span className="sales-avatar">{lead.name.split(' ').map((part) => part[0]).join('')}</span>
              <span><span className="qualification-eyebrow">QUALIFICATION REVIEW</span><h2>{lead.name}</h2><p>{lead.company} · {lead.industry}</p></span>
            </div>
            <div className="qualification-profile-banner__score"><span>Overall score</span><strong>{overall}<small>/100</small></strong><div className="qualification-meter"><span style={{ width: `${overall}%` }} /></div></div>
          </div>
          <div className="qualification-criteria-header"><span>Criterion</span><span>Status</span><span>Score</span><span>Weight</span><span>Result</span><span>Action</span></div>
          <div className="qualification-criteria-list">
            {qualificationCriteria.map((criterion, index) => {
              const Icon = criterionIcons[index];
              const row = rows[index];
              const isReviewed = reviewed[`${lead.id}:${criterion.id}`] ?? false;
              return (
                <article className="qualification-criterion-row" key={criterion.id}>
                  <span className="qualification-criterion-row__criterion"><i><Icon size={16} /></i><span><strong>{criterion.name}</strong><small>{criterion.description}</small></span></span>
                  <span className={`qualification-criterion-status${row.complete ? ' is-complete' : ' is-pending'}`}>{row.complete ? <Check size={14} /> : <Circle size={14} />}{isReviewed ? 'Reviewed' : row.complete ? 'Met' : 'Review'}</span>
                  <strong className="qualification-criterion-score">{row.score}</strong>
                  <span className="qualification-criterion-weight">{criterion.weight}%</span>
                  <Badge variant={row.complete ? 'success' : 'warning'}>{row.result}</Badge>
                  <Button size="sm" variant={isReviewed ? 'secondary' : 'outline'} onClick={() => setReviewed((current) => ({ ...current, [`${lead.id}:${criterion.id}`]: !current[`${lead.id}:${criterion.id}`] }))}>{isReviewed ? 'Updated' : 'Review / Update'}</Button>
                </article>
              );
            })}
          </div>
          <div className="qualification-criteria-footer">
            <span>Score weighted across the six qualification criteria.</span>
            <div><QualificationCallButton contactName={lead.name} company={lead.company} phone={lead.phone} /><Button variant="primary" onClick={() => setReviewed((current) => ({ ...current, [lead.id]: !current[lead.id] }))}>Update qualification score</Button></div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default QualificationCriteria;
