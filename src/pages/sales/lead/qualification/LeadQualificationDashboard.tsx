import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  CheckCircle2,
  ClipboardCheck,
  Flame,
  ListChecks,
  Search,
  Target,
  Users,
} from 'lucide-react';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { PageHeader } from '../../../../components/ui/Layout';
import { StatCard } from '../../../../components/ui/StatCard';
import { QualificationCallButton } from '../../../../components/sales/lead/qualification/QualificationCallButton';
import { qualificationActivities, qualificationLeads } from '../../../../components/sales/lead/qualification/QualificationData';

const base = '/coming-soon/lead-qualification';

const quickActions = [
  { label: 'Lead Research', description: 'Find and investigate prospects', route: 'lead-research', icon: <Search size={18} /> },
  { label: 'Qualification Criteria', description: 'Review fit and buying readiness', route: 'qualification-criteria', icon: <ListChecks size={18} /> },
  { label: 'Lead Scoring', description: 'Compare scores and lead priority', route: 'lead-scoring', icon: <Target size={18} /> },
  { label: 'Intent Detection', description: 'Explore AI-detected buying signals', route: 'intent-detection', icon: <BrainCircuit size={18} /> },
  { label: 'Qualification Results', description: 'Review qualification decisions', route: 'qualification-results', icon: <ClipboardCheck size={18} /> },
  { label: 'Activity', description: 'See qualification team activity', route: 'activity', icon: <Activity size={18} /> },
];

const LeadQualificationDashboard: React.FC = () => {
  const navigate = useNavigate();
  const qualifiedLeads = qualificationLeads.filter((lead) => lead.result === 'Qualified');
  const highIntentCount = qualificationLeads.filter((lead) => lead.intentLevel === 'High').length;
  const funnel = [
    { label: 'Researched', value: 100, count: '1,284', tone: 'research' },
    { label: 'Scored', value: 78, count: '1,002', tone: 'scored' },
    { label: 'Reviewed', value: 54, count: '694', tone: 'reviewed' },
    { label: 'Qualified', value: 31, count: '398', tone: 'qualified' },
  ];

  return (
    <div className="page-content animate-fade-in qualification-page">
      <PageHeader
        title="Lead Qualification"
        subtitle="Prioritize the prospects with the right fit, intent, and readiness to buy."
        actions={<Button variant="primary" onClick={() => navigate(`${base}/qualification-results`)}>Review results <ArrowRight size={15} /></Button>}
      />

      <div className="qualification-stats">
        <StatCard label="Total Leads" value="1,284" sub="In qualification pipeline" icon={<Users size={18} />} trend={{ value: '9.6% this month', positive: true }} />
        <StatCard label="Qualified Leads" value="398" sub="Ready for sales follow-up" icon={<BadgeCheck size={18} />} trend={{ value: '6.8% this month', positive: true }} />
        <StatCard label="Pending Review" value="126" sub="Awaiting a decision" icon={<ClipboardCheck size={18} />} />
        <StatCard label="Unqualified Leads" value="214" sub="Nurture or close out" icon={<CheckCircle2 size={18} />} />
        <StatCard label="High-Intent Leads" value={highIntentCount + 86} sub="Showing active buying signals" icon={<Flame size={18} />} trend={{ value: '14.2% this month', positive: true }} />
        <StatCard label="Avg. Qualification Score" value="72.4" sub="Across reviewed leads" icon={<Target size={18} />} trend={{ value: '3.4 pts this month', positive: true }} />
      </div>

      <div className="qualification-dashboard-grid">
        <section className="qualification-surface qualification-funnel">
          <div className="qualification-section-heading">
            <div><h2>Qualification funnel</h2><p>Prospects progressing through your review workflow</p></div>
            <span className="qualification-heading-icon"><Users size={17} /></span>
          </div>
          <div className="qualification-funnel__stages">
            {funnel.map((stage) => (
              <div className="qualification-funnel__stage" key={stage.label}>
                <div className="qualification-funnel__stage-copy"><span>{stage.label}</span><strong>{stage.count}</strong></div>
                <div className="qualification-meter"><span className={`qualification-meter__fill qualification-meter__fill--${stage.tone}`} style={{ width: `${stage.value}%` }} /></div>
                <small>{stage.value}% of researched leads</small>
              </div>
            ))}
          </div>
        </section>

        <section className="qualification-surface qualification-outcomes">
          <div className="qualification-section-heading">
            <div><h2>Qualification outcomes</h2><p>Decisions across the current review cycle</p></div>
            <span className="qualification-heading-icon qualification-heading-icon--green"><CheckCircle2 size={17} /></span>
          </div>
          <div className="qualification-outcomes__chart" aria-label="68% qualified, 22% needs review, 10% unqualified">
            <div className="qualification-outcomes__ring"><strong>68%</strong><span>qualified</span></div>
          </div>
          <div className="qualification-outcomes__legend">
            <span><i className="is-qualified" /> Qualified <strong>398</strong></span>
            <span><i className="is-review" /> Needs review <strong>126</strong></span>
            <span><i className="is-unqualified" /> Unqualified <strong>214</strong></span>
          </div>
        </section>
      </div>

      <div className="qualification-dashboard-grid qualification-dashboard-grid--lower">
        <section className="qualification-surface qualification-top-leads">
          <div className="qualification-section-heading">
            <div><h2>Top qualified leads</h2><p>Highest readiness scores in the queue</p></div>
            <Button variant="ghost" size="sm" onClick={() => navigate(`${base}/qualification-results`)}>View all <ArrowRight size={14} /></Button>
          </div>
          <div className="qualification-top-leads__list">
            {qualifiedLeads.slice(0, 3).map((lead, index) => (
              <article className="qualification-top-lead" key={lead.id}>
                <span className="qualification-rank">{String(index + 1).padStart(2, '0')}</span>
                <span className="sales-avatar">{lead.name.split(' ').map((part) => part[0]).join('')}</span>
                <span className="qualification-top-lead__identity"><strong>{lead.name}</strong><small>{lead.company}</small></span>
                <Badge variant={lead.intentLevel === 'High' ? 'success' : 'warning'} dot>{lead.intentLevel} intent</Badge>
                <strong className="qualification-top-lead__score">{lead.qualificationScore}</strong>
                <QualificationCallButton contactName={lead.name} company={lead.company} phone={lead.phone} />
              </article>
            ))}
          </div>
        </section>

        <section className="qualification-surface qualification-recent-activity">
          <div className="qualification-section-heading">
            <div><h2>Recent qualification activity</h2><p>Latest changes across the pipeline</p></div>
            <span className="qualification-heading-icon"><Activity size={17} /></span>
          </div>
          {qualificationActivities.slice(0, 4).map((item) => (
            <article className="qualification-activity-preview" key={item.id}>
              <span className="qualification-activity-preview__icon"><Activity size={14} /></span>
              <span><strong>{item.type} · {item.lead}</strong><small>{item.description}</small></span>
              <time>{item.time}</time>
            </article>
          ))}
          <button className="qualification-inline-link" type="button" onClick={() => navigate(`${base}/activity`)}>Open activity timeline <ArrowRight size={14} /></button>
        </section>
      </div>

      <section className="qualification-surface qualification-quick-actions">
        <div className="qualification-section-heading">
          <div><h2>Quick actions</h2><p>Jump into a focused qualification workspace</p></div>
          <span className="qualification-heading-icon"><Target size={17} /></span>
        </div>
        <div className="qualification-quick-actions__grid">
          {quickActions.map((action) => (
            <button type="button" className="qualification-quick-action" key={action.route} onClick={() => navigate(`${base}/${action.route}`)}>
              <span className="qualification-quick-action__icon">{action.icon}</span>
              <span><strong>{action.label}</strong><small>{action.description}</small></span>
              <ArrowRight size={14} />
            </button>
          ))}
        </div>
      </section>

      <div className="qualification-dashboard-footnote"><BrainCircuit size={14} /> Qualification insights are generated from sample pipeline data. <span>{qualifiedLeads.length} sample leads currently qualified.</span></div>
    </div>
  );
};

export default LeadQualificationDashboard;
