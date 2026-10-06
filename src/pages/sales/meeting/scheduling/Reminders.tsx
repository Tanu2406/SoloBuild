import { Bell, CalendarClock, Check, Send, X } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { demoToday, formatMeetingDate, prospectForMeeting } from './data';
import { updateReminder, useMeetingStore } from './store';
import { EmptyMeetings, MeetingPage, MeetingStatusBadge, MetricCard, PanelHeading, ProspectIdentity } from './MeetingSchedulingComponents';

export default function Reminders() {
  const { meetings, reminders } = useMeetingStore();
  const activeMeetings = meetings.filter((meeting) => meeting.status === 'Scheduled');
  const pendingCount = reminders.filter((reminder) => ['Pending', 'Scheduled'].includes(reminder.status)).length;
  const sentCount = reminders.filter((reminder) => reminder.status === 'Sent').length;

  return (
    <MeetingPage title="Meeting Reminders" subtitle="Keep every prospect prepared with timely, locally simulated reminders."
      actions={<span className="meeting-page-tag"><Bell size={14} /> Demo delivery</span>}>
      <section className="meeting-reminder-metrics">
        <MetricCard label="Upcoming meetings" value={activeMeetings.length} note="Confirmed on your calendar" />
        <MetricCard label="Pending reminders" value={pendingCount} note="Scheduled or ready to send" accent="#d97706" />
        <MetricCard label="Sent reminders" value={sentCount} note="Demo reminders delivered" accent="#16a34a" />
      </section>
      <section className="meeting-panel meeting-reminder-panel">
        <PanelHeading title="Reminder schedule" detail="Send, mark sent, or cancel reminders for upcoming sales meetings." icon={<CalendarClock size={16} />} />
        {activeMeetings.length ? <div className="meeting-reminder-list">
          {activeMeetings.map((meeting) => {
            const prospect = prospectForMeeting(meeting.prospectId);
            const reminder = reminders.find((item) => item.meetingId === meeting.id);
            return <article className="meeting-reminder-row" key={meeting.id}>
              <ProspectIdentity prospect={prospect} subtitle={prospect.company} />
              <div className="meeting-reminder-row__meeting"><strong>{meeting.type}</strong><small>{formatMeetingDate(meeting.date)} · {meeting.time}</small></div>
              <div className="meeting-reminder-row__timing"><small>Reminder timing</small><strong>{reminder?.timing ?? '1 day before'}</strong></div>
              <MeetingStatusBadge status={reminder?.status ?? 'Pending'} />
              <div className="meeting-inline-actions">
                {(!reminder || ['Pending', 'Scheduled'].includes(reminder.status)) && <>
                  <Button size="sm" icon={<Send size={13} />} onClick={() => reminder && updateReminder(reminder.id, 'Sent')}>Send reminder</Button>
                  <Button size="sm" variant="ghost" icon={<Check size={13} />} onClick={() => reminder && updateReminder(reminder.id, 'Sent')}>Mark sent</Button>
                  {reminder && <Button size="sm" variant="ghost" icon={<X size={13} />} aria-label={`Cancel reminder for ${prospect.name}`} onClick={() => updateReminder(reminder.id, 'Cancelled')}>Cancel</Button>}
                </>}
                {reminder?.status === 'Sent' && <Button size="sm" variant="ghost" icon={<Check size={13} />} onClick={() => updateReminder(reminder.id, 'Completed')}>Mark complete</Button>}
              </div>
            </article>;
          })}
        </div> : <EmptyMeetings title="No reminders to manage" detail="Reminders will appear when upcoming meetings are booked." />}
      </section>
      <p className="meeting-demo-disclaimer">Reminder actions update this demo workspace only. No email or SMS is sent.</p>
      <span className="meeting-visually-hidden">Today is {demoToday}</span>
    </MeetingPage>
  );
}
