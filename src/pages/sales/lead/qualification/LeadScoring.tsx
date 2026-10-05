import React, { useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Flame, Snowflake, Sparkles, Target, Thermometer } from 'lucide-react';
import { Badge } from '../../../../components/ui/Badge';
import { PageHeader } from '../../../../components/ui/Layout';
import { QualificationCallButton } from '../../../../components/sales/lead/qualification/QualificationCallButton';
import { qualificationLeads } from '../../../../components/sales/lead/qualification/QualificationData';

const categories = [
  { label: 'Hot', count: 286, percent: 23, color: 'hot', icon: Flame },
  { label: 'Warm', count: 594, percent: 46, color: 'warm', icon: Thermometer },
  { label: 'Cold', count: 404, percent: 31, color: 'cold', icon: Snowflake },
];

const LeadScoring: React.FC = () => {
  const [category, setCategory] = useState('All');
  const ranked = useMemo(() => [...qualificationLeads]
    .filter((lead) => category === 'All' || lead.category === category)
    .sort((a, b) => b.qualificationScore - a.qualificationScore), [category]);

  return (
    <div className="page-content animate-fade-in qualification-page">
      <PageHeader title="Lead Scoring" subtitle="See how fit, engagement, and buying intent combine to surface your best opportunities." />
      <div className="qualification-scoring-hero">
        <section className="qualification-surface qualification-score-distribution">
          <div className="qualification-section-heading"><div><h2>Lead temperature</h2><p>Distribution across 1,284 scored prospects</p></div><Target size={18} /></div>
          <div className="qualification-category-bars">
            {categories.map(({ label, count, percent, color, icon: Icon }) => (
              <article className={`qualification-category-bar qualification-category-bar--${color}`} key={label}>
                <div className="qualification-category-bar__heading"><span><Icon size={16} />{label}</span><strong>{count}</strong></div>
                <div className="qualification-meter"><span style={{ width: `${percent}%` }} /></div>
                <small>{percent}% of your scored leads</small>
              </article>
            ))}
          </div>
          <div className="qualification-score-average"><div><span>Average qualification score</span><strong>72.4 <small>/100</small></strong></div><span className="qualification-score-average__trend"><ArrowUpRight size={15} /> 4.6 pts this month</span></div>
        </section>
        <section className="qualification-surface qualification-score-model">
          <div className="qualification-section-heading"><div><h2>Scoring model</h2><p>Weighted signals behind each score</p></div><Sparkles size={18} /></div>
          {[['Engagement', 30, 'Content views, replies, and repeat visits'], ['Company fit', 30, 'Industry, scale, and customer profile'], ['Purchase intent', 25, 'Evaluation signals and urgency'], ['Buying readiness', 15, 'Budget, authority, and timeline']].map(([name, weight, desc]) => (
            <div className="qualification-score-factor" key={name}>
              <div><strong>{name}</strong><b>{weight}%</b></div>
              <p>{desc}</p>
              <div className="qualification-meter"><span style={{ width: `${weight}%` }} /></div>
            </div>
          ))}
        </section>
      </div>

      <section className="qualification-ranked-workspace">
        <div className="qualification-ranked-heading">
          <div><span className="qualification-eyebrow">PRIORITY QUEUE</span><h2>Scored lead profiles</h2><p>Compare individual signals and prioritize the next conversation.</p></div>
          <div className="qualification-category-filters" aria-label="Filter by lead category">
            {['All', 'Hot', 'Warm', 'Cold'].map((item) => <button type="button" key={item} className={category === item ? 'is-active' : ''} onClick={() => setCategory(item)}>{item}</button>)}
          </div>
        </div>
        <div className="qualification-ranked-list">
          {ranked.map((lead, index) => (
            <article className="qualification-score-profile" key={lead.id}>
              <span className="qualification-rank">{String(index + 1).padStart(2, '0')}</span>
              <span className="sales-avatar">{lead.name.split(' ').map((part) => part[0]).join('')}</span>
              <div className="qualification-score-profile__identity"><strong>{lead.name}</strong><small>{lead.company} · {lead.industry}</small><span className="qualification-score-profile__intent">{lead.intentLevel} intent · {lead.confidence}% confidence</span></div>
              <div className="qualification-score-profile__signals">
                {[['Engagement', lead.engagementScore], ['Company fit', lead.companyFit], ['Intent', lead.intentScore]].map(([label, value]) => (
                  <div key={label}><span>{label}</span><strong>{value}</strong><div className="qualification-meter"><span style={{ width: `${value}%` }} /></div></div>
                ))}
              </div>
              <Badge variant={lead.category === 'Hot' ? 'error' : lead.category === 'Warm' ? 'warning' : 'neutral'} dot>{lead.category}</Badge>
              <div className="qualification-score-profile__total"><strong>{lead.qualificationScore}</strong><small>score</small></div>
              <QualificationCallButton contactName={lead.name} company={lead.company} phone={lead.phone} />
            </article>
          ))}
          {ranked.length === 0 && <div className="sales-empty-state">No leads in this category yet.</div>}
        </div>
        <div className="qualification-score-foot"><ArrowDownRight size={15} /> Scores update as new engagement and intent signals are detected.</div>
      </section>
    </div>
  );
};

export default LeadScoring;
