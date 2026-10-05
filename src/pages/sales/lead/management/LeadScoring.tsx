import React from 'react';
import { ArrowUpRight, Flame, Snowflake, Sparkles, Target, Thermometer } from 'lucide-react';
import { Badge } from '../../../../components/ui/Badge';
import { PageHeader } from '../../../../components/ui/Layout';
import { salesLeads } from '../../../../components/sales/SalesData';

const LeadScoring: React.FC = () => {
  const ranked = [...salesLeads].sort((a, b) => b.totalScore - a.totalScore);
  const categories = [
    { label: 'Hot', count: 286, percent: 23, icon: Flame, tone: 'hot' },
    { label: 'Warm', count: 594, percent: 46, icon: Thermometer, tone: 'warm' },
    { label: 'Cold', count: 404, percent: 31, icon: Snowflake, tone: 'cold' },
  ];

  return (
    <div className="page-content animate-fade-in">
      <PageHeader title="Lead Scoring" subtitle="Understand which prospects are showing the strongest buying signals." />
      <div className="sales-scoring-overview">
        <section className="sales-scoring-distribution">
          <div className="sales-panel__header"><div><h2>Score distribution</h2><p>Lead temperature across your pipeline</p></div><Target size={17} /></div>
          <div className="sales-score-bars">
            {categories.map(({ label, count, percent, icon: Icon, tone }) => (
              <div className={`sales-score-bar sales-score-bar--${tone}`} key={label}>
                <div className="sales-score-bar__label"><span><Icon size={15} />{label}</span><strong>{count}</strong></div>
                <div className="sales-score-bar__track"><span style={{ width: `${percent}%` }} /></div>
                <small>{percent}% of scored leads</small>
              </div>
            ))}
          </div>
          <div className="sales-score-total"><span>Average score</span><strong>67.8</strong><span className="sales-score-positive"><ArrowUpRight size={14} /> 5.2% vs last month</span></div>
        </section>
        <section className="sales-score-breakdown">
          <div className="sales-panel__header"><div><h2>Scoring model</h2><p>Signals that influence lead score</p></div><Sparkles size={17} /></div>
          {[
            ['Engagement', 40, 'Visits, responses, content activity'],
            ['Purchase intent', 35, 'High-intent actions and timing'],
            ['Company fit', 25, 'Industry, size, and ideal profile'],
          ].map(([name, weight, description]) => (
            <div className="sales-score-factor" key={name}>
              <div><strong>{name}</strong><b>{weight}%</b></div><p>{description}</p><div className="sales-score-factor__track"><span style={{ width: `${weight}%` }} /></div>
            </div>
          ))}
        </section>
      </div>
      <section className="sales-ranked-leads">
        <div className="sales-section-heading"><div><h2>Highest scoring leads</h2><p>Ranked by combined engagement, intent, and company fit</p></div></div>
        <div className="sales-ranked-list">
          {ranked.map((lead, index) => (
            <article className="sales-ranked-lead" key={lead.id}>
              <span className="sales-rank">{String(index + 1).padStart(2, '0')}</span>
              <span className="sales-avatar">{lead.name.split(' ').map((part) => part[0]).join('')}</span>
              <span className="sales-ranked-lead__name"><strong>{lead.name}</strong><small>{lead.company}</small></span>
              <div className="sales-score-components"><span>Engagement <b>{lead.engagementScore}</b></span><span>Intent <b>{lead.intentScore}</b></span><span>Fit <b>{lead.companyFit}</b></span></div>
              <Badge variant={lead.category === 'Hot' ? 'error' : lead.category === 'Warm' ? 'warning' : 'neutral'} dot>{lead.category}</Badge>
              <strong className="sales-ranked-score">{lead.totalScore}</strong>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LeadScoring;
