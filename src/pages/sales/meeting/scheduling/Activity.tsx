import { useMemo, useState } from 'react';
import { Bell, CalendarCheck2, CalendarClock, CheckCircle2, CircleDot, XCircle } from 'lucide-react';
import { Badge } from '../../../../components/ui/Badge';
import { prospectForMeeting, type MeetingActivityType } from './data';
import { useMeetingStore } from './store';
import { EmptyMeetings, MeetingPage, PanelHeading, ProspectIdentity } from './MeetingSchedulingComponents';

type ActivityFilter = 'All' | 'Scheduled' | 'Rescheduled' | 'Cancelled' | 'Completed' | 'Reminders';
const filters: ActivityFilter[] = ['All', 'Scheduled', 'Rescheduled', 'Cancelled', 'Completed', 'Reminders'];

function activityIcon(type: MeetingActivityType) {
  if (type === 'Rescheduled') return <CalendarClock size={15} />;
  if (type === 'Completed') return <CheckCircle2 size={15} />;
  if (type === 'Cancelled') return <XCircle size={15} />;
  if (type === 'Reminders') return <Bell size={15} />;
  if (type === 'Scheduled') return <CalendarCheck2 size={15} />;
  return <CircleDot size={15} />;
}

export default function Activity() {
  const { activities } = useMeetingStore();
  const [filter, setFilter] = useState<ActivityFilter>('All');
  const visibleActivities = useMemo(() => activities.filter((activity) => filter === 'All' || activity.type === filter), [activities, filter]);

  return (
    <MeetingPage title="Meeting Activity" subtitle="A clear timeline of the conversations, changes, and reminders across your sales calendar.">
      <section className="meeting-panel meeting-activity-panel">
        <div className="meeting-activity-heading">
          <PanelHeading title="Scheduling timeline" detail={`${visibleActivities.length} events`} icon={<CircleDot size={16} />} />
          <div className="meeting-activity-filters" role="group" aria-label="Filter meeting activity">
            {filters.map((item) => <button type="button" key={item} className={filter === item ? 'is-active' : ''} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}
          </div>
        </div>
        {visibleActivities.length ? <div className="meeting-activity-feed">
          {visibleActivities.map((activity) => {
            const prospect = prospectForMeeting(activity.prospectId);
            const timestamp = new Date(activity.timestamp);
            return <article className="meeting-activity-item" key={activity.id}>
              <div className={`meeting-activity-item__icon meeting-activity-item__icon--${activity.type.toLowerCase()}`}>{activityIcon(activity.type)}</div>
              <div className="meeting-activity-item__body">
                <div className="meeting-activity-item__top"><strong>{activity.description}</strong><Badge variant={activity.type === 'Completed' ? 'success' : activity.type === 'Cancelled' ? 'neutral' : activity.type === 'Reminders' ? 'warning' : 'info'}>{activity.type}</Badge></div>
                <ProspectIdentity prospect={prospect} subtitle={prospect.company} />
                <small>{timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</small>
              </div>
            </article>;
          })}
        </div> : <EmptyMeetings title="No activity in this view" detail="Choose another filter or continue scheduling sales conversations." />}
      </section>
    </MeetingPage>
  );
}
