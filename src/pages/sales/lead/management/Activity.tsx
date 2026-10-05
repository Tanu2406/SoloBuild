import React, { useMemo, useState } from 'react';
import { CalendarDays, Mail, MessageSquare, Phone, Search, SlidersHorizontal, UserRound, Video } from 'lucide-react';
import { Badge } from '../../../../components/ui/Badge';
import { Input } from '../../../../components/ui/Input';
import { PageHeader } from '../../../../components/ui/Layout';
import { salesActivities, type SalesActivity } from '../../../../components/sales/SalesData';

const activityIcons: Record<SalesActivity['type'], React.ComponentType<{ size?: number }>> = {
  Call: Phone,
  Email: Mail,
  Meeting: Video,
  'Follow-up': CalendarDays,
  'Lead update': UserRound,
  Qualification: MessageSquare,
  'Score update': SlidersHorizontal,
};
const filters = ['All activity', 'Calls', 'Emails', 'Meetings', 'Follow-ups', 'Lead updates'];

const SalesActivityPage: React.FC = () => {
  const [filter, setFilter] = useState('All activity');
  const [search, setSearch] = useState('');
  const items = useMemo(() => salesActivities.filter((activity) => {
    const matchesType = filter === 'All activity' ||
      (filter === 'Lead updates' ? ['Lead update', 'Qualification', 'Score update'].includes(activity.type) : activity.type.toLowerCase().startsWith(filter.replace(/s$/, '').toLowerCase()));
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || Object.values(activity).some((value) => String(value).toLowerCase().includes(query));
    return matchesType && matchesSearch;
  }), [filter, search]);

  return (
    <div className="page-content animate-fade-in">
      <PageHeader title="Sales Activity" subtitle="A live timeline of calls, emails, meetings, and pipeline changes." />
      <div className="sales-activity-toolbar">
        <div className="sales-activity-filters">{filters.map((item) => <button type="button" key={item} className={filter === item ? 'is-active' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div>
        <div className="sales-activity-search"><Input value={search} onChange={(event) => setSearch(event.target.value)} leftIcon={<Search size={14} />} placeholder="Search activity…" /></div>
      </div>
      <div className="sales-activity-layout">
        <section className="sales-activity-timeline">
          <div className="sales-timeline-date"><span>Today</span><small>Tuesday, October 06</small></div>
          {items.map((item) => {
            const Icon = activityIcons[item.type];
            return (
              <article className="sales-timeline-item" key={item.id}>
                <div className="sales-timeline-rail"><span className="sales-timeline-icon"><Icon size={15} /></span></div>
                <div className="sales-timeline-card">
                  <div className="sales-timeline-card__top"><Badge variant={item.type === 'Call' ? 'info' : item.type === 'Meeting' ? 'success' : item.type === 'Follow-up' ? 'warning' : 'neutral'} dot>{item.type}</Badge><time>{item.date} · {item.time}</time></div>
                  <h2>{item.lead} <span>at {item.company}</span></h2>
                  <p>{item.description}</p>
                  <div className="sales-timeline-card__owner"><span className="sales-avatar sales-avatar--small">{item.owner.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span>{item.owner}</div>
                </div>
              </article>
            );
          })}
          {items.length === 0 && <div className="sales-empty-state">No activity matches the selected filter.</div>}
        </section>
        <aside className="sales-activity-aside">
          <div className="sales-panel__header"><div><h2>Activity summary</h2><p>This week</p></div><CalendarDays size={16} /></div>
          {[['Calls', 42], ['Emails', 68], ['Meetings', 16], ['Follow-ups', 31]].map(([label, count]) => <div className="sales-activity-stat" key={label}><span>{label}</span><strong>{count}</strong></div>)}
          <div className="sales-activity-goal"><span>Weekly engagement goal</span><strong>78%</strong><div className="sales-completeness-track"><span style={{ width: '78%' }} /></div><small>157 of 200 activities completed</small></div>
        </aside>
      </div>
    </div>
  );
};

export default SalesActivityPage;
