import { useMemo, useState } from 'react';
import type React from 'react';
import { Activity as ActivityIcon, CalendarDays, CheckCheck, CircleDollarSign, Mail, Phone, StickyNote, Target } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { opportunityLead, type OpportunityActivityType } from './data';
import { OpportunityDetail, OpportunityPage, OpportunityPanel } from './OpportunityComponents';
import { useOpportunityStore } from './store';

type ActivityFilter = 'All' | 'Calls' | 'Emails' | 'Meetings' | 'Notes' | 'Deal updates' | 'Stage changes' | 'Follow-ups';
const filters: ActivityFilter[] = ['All', 'Calls', 'Emails', 'Meetings', 'Notes', 'Deal updates', 'Stage changes', 'Follow-ups'];
const typeToFilter: Record<OpportunityActivityType, ActivityFilter> = {
  Call: 'Calls',
  Email: 'Emails',
  Meeting: 'Meetings',
  Note: 'Notes',
  'Deal update': 'Deal updates',
  'Stage change': 'Stage changes',
  'Follow-up': 'Follow-ups',
  Qualification: 'Deal updates',
};
const activityIcons: Record<OpportunityActivityType, React.ReactNode> = {
  Call: <Phone size={15} />,
  Email: <Mail size={15} />,
  Meeting: <CalendarDays size={15} />,
  Note: <StickyNote size={15} />,
  'Deal update': <CircleDollarSign size={15} />,
  'Stage change': <Target size={15} />,
  'Follow-up': <CheckCheck size={15} />,
  Qualification: <ActivityIcon size={15} />,
};

export default function OpportunityActivity() {
  const { activities, opportunities } = useOpportunityStore();
  const [filter, setFilter] = useState<ActivityFilter>('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = opportunities.find((deal) => deal.id === selectedId) ?? null;
  const filtered = useMemo(() => activities.filter((item) => filter === 'All' || typeToFilter[item.type] === filter)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp)), [activities, filter]);

  return <>
    <OpportunityPage title="Opportunity Activity" subtitle="Follow every customer touch, qualification decision, and deal movement in one timeline.">
      <OpportunityPanel title="Deal activity" subtitle={`${filtered.length} events · newest first`} icon={<ActivityIcon size={17} />}>
        <div className="opportunity-activity-filters" role="group" aria-label="Filter opportunity activity">
          {filters.map((item) => <button type="button" className={filter === item ? 'is-active' : ''} aria-pressed={filter === item} key={item} onClick={() => setFilter(item)}>{item}</button>)}
        </div>
        {filtered.length ? <div className="opportunity-activity-feed">
          {filtered.map((item) => {
            const deal = opportunities.find((opportunity) => opportunity.id === item.opportunityId);
            if (!deal) return null;
            const lead = opportunityLead(deal.prospectId);
            const timestamp = new Date(item.timestamp);
            return <article className="opportunity-activity-item" key={item.id}>
              <span className={`opportunity-activity-item__icon opportunity-activity-item__icon--${item.type.toLowerCase().replaceAll(' ', '-')}`}>{activityIcons[item.type]}</span>
              <div className="opportunity-activity-item__content">
                <div className="opportunity-activity-item__top"><strong>{item.description}</strong><Badge variant={item.type === 'Stage change' ? 'warning' : item.type === 'Call' ? 'success' : 'info'}>{item.type}</Badge></div>
                <button type="button" className="opportunity-activity-item__deal" onClick={() => setSelectedId(deal.id)}><strong>{deal.name}</strong><span>{lead.company} · {deal.product}</span></button>
                <small>{timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} · {deal.owner}</small>
              </div>
            </article>;
          })}
        </div> : <div className="opportunity-empty"><ActivityIcon size={20} /><strong>No activity matches this filter</strong><span>Try another activity type or return to All.</span></div>}
      </OpportunityPanel>
    </OpportunityPage>
    <OpportunityDetail opportunity={selected} onClose={() => setSelectedId(null)} />
  </>;
}
