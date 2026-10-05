import React, { useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, Mail, Phone, Sparkles, UsersRound } from 'lucide-react';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { PageHeader } from '../../../../components/ui/Layout';
import { qualificationActivities } from '../../../../components/sales/lead/qualification/QualificationData';
import type { QualificationActivityType } from '../../../../components/sales/lead/qualification/QualificationData';

const filters = ['All', 'Calls', 'Emails', 'Meetings', 'Qualification'] as const;
type ActivityFilter = typeof filters[number];

const activityIcons: Record<QualificationActivityType, React.ReactNode> = {
  Call: <Phone size={15} />,
  Email: <Mail size={15} />,
  Meeting: <CalendarDays size={15} />,
  'Follow-up': <Clock3 size={15} />,
  Qualification: <CheckCircle2 size={15} />,
  'Score update': <ArrowRight size={15} />,
  'Intent update': <Sparkles size={15} />,
};

const activityFilterFor = (type: QualificationActivityType): ActivityFilter => {
  if (type === 'Call') return 'Calls';
  if (type === 'Email') return 'Emails';
  if (type === 'Meeting') return 'Meetings';
  return 'Qualification';
};

const Activity: React.FC = () => {
  const [filter, setFilter] = useState<ActivityFilter>('All');
  const items = useMemo(() => qualificationActivities.filter((item) => filter === 'All' || activityFilterFor(item.type) === filter), [filter]);
  const counts = {
    Calls: qualificationActivities.filter((item) => item.type === 'Call').length,
    Emails: qualificationActivities.filter((item) => item.type === 'Email').length,
    Meetings: qualificationActivities.filter((item) => item.type === 'Meeting').length,
    Qualification: qualificationActivities.filter((item) => !['Call', 'Email', 'Meeting'].includes(item.type)).length,
  };

  return (
    <div className="page-content animate-fade-in qualification-page">
      <PageHeader title="Qualification Activity" subtitle="A clear timeline of prospect conversations and qualification signals." />
      <div className="qualification-activity-layout">
        <section className="qualification-activity-main">
          <div className="qualification-activity-toolbar">
            <div><h2>Activity timeline</h2><p>Recent updates from your qualification team</p></div>
            <div className="qualification-activity-filters" aria-label="Filter activity">
              {filters.map((item) => <button type="button" className={filter === item ? 'is-active' : ''} key={item} onClick={() => setFilter(item)}>{item}</button>)}
            </div>
          </div>
          <div className="qualification-activity-date"><span>Recent updates</span><small>Sorted newest first</small></div>
          <div className="qualification-activity-timeline">
            {items.map((item, index) => (
              <article className="qualification-timeline-item" key={item.id}>
                <div className="qualification-timeline-rail"><span className={`qualification-timeline-icon qualification-timeline-icon--${item.type.toLowerCase().replaceAll(' ', '-')}`}>{activityIcons[item.type]}</span>{index < items.length - 1 && <i />}</div>
                <div className="qualification-timeline-card">
                  <div className="qualification-timeline-card__top"><Badge variant={item.type === 'Qualification' ? 'success' : item.type.includes('update') ? 'info' : 'neutral'}>{item.type}</Badge><time>{item.date} · {item.time}</time></div>
                  <h3>{item.lead} <span>· {item.company}</span></h3>
                  <p>{item.description}</p>
                  <div className="qualification-timeline-card__owner"><UsersRound size={13} /> {item.owner}</div>
                </div>
              </article>
            ))}
            {items.length === 0 && <div className="sales-empty-state">No activity matches this filter.</div>}
          </div>
        </section>
        <aside className="qualification-activity-aside">
          <div className="qualification-section-heading"><div><h2>Activity summary</h2><p>This qualification cycle</p></div><CalendarDays size={17} /></div>
          {Object.entries(counts).map(([name, count]) => <div className="qualification-activity-stat" key={name}><span>{name}</span><strong>{count + (name === 'Qualification' ? 18 : 6)}</strong></div>)}
          <div className="qualification-activity-aside__goal"><span>Review completion</span><strong>76%</strong><div className="qualification-meter"><span style={{ width: '76%' }} /></div><small>126 leads are waiting for review</small></div>
          <Button variant="outline" fullWidth onClick={() => setFilter('Qualification')}>See qualification updates <ArrowRight size={14} /></Button>
          <div className="qualification-activity-aside__note"><Sparkles size={15} /><span>AI intent and scoring updates are automatically added to the timeline.</span></div>
        </aside>
      </div>
    </div>
  );
};

export default Activity;
