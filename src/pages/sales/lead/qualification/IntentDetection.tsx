import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BrainCircuit, CircleDot, Clock3, Eye, MessageSquareText, Sparkles, TrendingUp } from 'lucide-react';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { PageHeader } from '../../../../components/ui/Layout';
import { QualificationCallButton } from '../../../../components/sales/lead/qualification/QualificationCallButton';
import { qualificationLeads } from '../../../../components/sales/lead/qualification/QualificationData';

const base = '/coming-soon/lead-qualification';

const IntentDetection: React.FC = () => {
  const navigate = useNavigate();
  const [level, setLevel] = useState('All');
  const leads = useMemo(() => qualificationLeads.filter((lead) => level === 'All' || lead.intentLevel === level), [level]);
  const highIntent = qualificationLeads.filter((lead) => lead.intentLevel === 'High').length;
  const averageConfidence = Math.round(qualificationLeads.reduce((sum, lead) => sum + lead.confidence, 0) / qualificationLeads.length);

  return (
    <div className="page-content animate-fade-in qualification-page">
      <PageHeader title="Intent Detection" subtitle="AI-powered signals help surface who is actively exploring a solution." />
      <section className="qualification-intent-overview">
        <div className="qualification-intent-overview__intro"><span><BrainCircuit size={22} /></span><div><span className="qualification-eyebrow">AI SIGNAL MONITOR</span><h2>Buying intent at a glance</h2><p>Signals are inferred from recent engagement, content activity, and buying readiness.</p></div></div>
        <div className="qualification-intent-overview__metrics"><div><strong>{highIntent + 86}</strong><span>High intent</span></div><div><strong>{averageConfidence}%</strong><span>Avg. confidence</span></div><div><strong>+18%</strong><span>Signals this week</span></div></div>
      </section>
      <div className="qualification-intent-toolbar">
        <div><h2>Detected intent</h2><p>Recent prospect signals and suggested follow-up</p></div>
        <div className="qualification-category-filters" aria-label="Filter by intent level">
          {['All', 'High', 'Medium', 'Low'].map((item) => <button type="button" key={item} className={level === item ? 'is-active' : ''} onClick={() => setLevel(item)}>{item}</button>)}
        </div>
      </div>
      <section className="qualification-intent-grid">
        {leads.map((lead) => {
          const icon = lead.recentActivity.toLowerCase().includes('view') ? <Eye size={15} /> : lead.recentActivity.toLowerCase().includes('call') ? <MessageSquareText size={15} /> : <TrendingUp size={15} />;
          return (
            <article className={`qualification-intent-card qualification-intent-card--${lead.intentLevel.toLowerCase()}`} key={lead.id}>
              <div className="qualification-intent-card__top">
                <span className="sales-avatar">{lead.name.split(' ').map((part) => part[0]).join('')}</span>
                <span><strong>{lead.name}</strong><small>{lead.company}</small></span>
                <Badge variant={lead.intentLevel === 'High' ? 'success' : lead.intentLevel === 'Medium' ? 'warning' : 'neutral'} dot>{lead.intentLevel} intent</Badge>
              </div>
              <div className="qualification-intent-card__detected"><span className="qualification-eyebrow">DETECTED INTENT</span><h2>{lead.intent}</h2></div>
              <div className="qualification-intent-confidence"><div><span>AI confidence</span><strong>{lead.confidence}%</strong></div><div className="qualification-meter"><span style={{ width: `${lead.confidence}%` }} /></div></div>
              <div className="qualification-intent-card__activity"><span>{icon}</span><span><small>Recent activity</small><strong>{lead.recentActivity}</strong></span><Clock3 size={14} /></div>
              <div className="qualification-intent-recommendation"><Sparkles size={15} /><span><small>Recommended action</small><strong>{lead.recommendedAction}</strong></span></div>
              <div className="qualification-intent-card__footer">
                <QualificationCallButton contactName={lead.name} company={lead.company} phone={lead.phone} />
                <Button size="sm" variant="primary" onClick={() => navigate(`${base}/qualification-criteria`)}>Review lead <ArrowRight size={13} /></Button>
              </div>
            </article>
          );
        })}
      </section>
      {leads.length === 0 && <div className="sales-empty-state">No intent signals match this filter.</div>}
      <div className="qualification-intent-note"><CircleDot size={14} /> Intent level reflects sample AI analysis and updates as activity changes.</div>
    </div>
  );
};

export default IntentDetection;
