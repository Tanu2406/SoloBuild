import { useState } from 'react';
import { ArrowRight, CalendarCheck2, Check, Clock3, Phone, Users, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../../components/ui/Button';
import { DialerModal } from '../../../../components/product/DialerModal';
import { demoToday, formatMeetingDate, prospectForMeeting } from './data';
import { useMeetingStore, updateMeeting, updateRequest } from './store';
import { EmptyMeetings, MeetingPage, MeetingStatusBadge, MetricCard, PanelHeading, ProspectIdentity } from './MeetingSchedulingComponents';

export default function MeetingSchedulingDashboard() {
  const { meetings, requests } = useMeetingStore();
  const navigate = useNavigate();
  const [dialerOpen, setDialerOpen] = useState(false);
  const todayMeetings = meetings.filter((meeting) => meeting.date === demoToday && meeting.status !== 'Cancelled');
  const upcomingMeetings = meetings.filter((meeting) => meeting.date >= demoToday && meeting.status === 'Scheduled').slice(0, 5);
  const pendingRequests = requests.filter((request) => request.status === 'Requested');
  const completedCount = meetings.filter((meeting) => meeting.status === 'Completed').length;
  const completionRate = meetings.length ? `${Math.round((completedCount / meetings.length) * 100)}%` : '0%';

  return (
    <MeetingPage title="Meeting & Scheduling" subtitle="Coordinate sales meetings, manage availability, and keep every prospect conversation on schedule."
      actions={<>
        <Button variant="outline" icon={<Phone size={15} />} onClick={() => setDialerOpen(true)}>Dial a Number</Button>
        <Button icon={<CalendarCheck2 size={15} />} onClick={() => navigate('/coming-soon/meeting-scheduling/scheduling')}>Schedule meeting</Button>
      </>}>
      <DialerModal open={dialerOpen} onClose={() => setDialerOpen(false)} />
      <section className="meeting-metrics">
        <MetricCard label="Meetings Today" value={todayMeetings.length} note="On your calendar today" accent="#2563eb" />
        <MetricCard label="Upcoming Meetings" value={meetings.filter((meeting) => meeting.date > demoToday && meeting.status === 'Scheduled').length} note="Confirmed and coming up" accent="#0891b2" />
        <MetricCard label="Pending Requests" value={pendingRequests.length} note="Waiting for your response" accent="#d97706" />
        <MetricCard label="Completed Meetings" value={completedCount} note="Sales conversations held" accent="#16a34a" />
        <MetricCard label="Meeting Conversion Rate" value={completionRate} note="Completed meetings to date" accent="#7c3aed" />
      </section>

      <div className="meeting-dashboard-grid">
        <section className="meeting-panel meeting-today-panel">
          <PanelHeading title="Today's Schedule" detail={`${formatMeetingDate(demoToday)} · ${todayMeetings.length} meetings`} icon={<Clock3 size={16} />} />
          {todayMeetings.length ? <div className="meeting-timeline">
            {todayMeetings.map((meeting) => {
              const prospect = prospectForMeeting(meeting.prospectId);
              return <article className="meeting-timeline__item" key={meeting.id}>
                <div className="meeting-timeline__time"><strong>{meeting.time}</strong><small>{meeting.duration} min</small></div>
                <span className={`meeting-timeline__dot meeting-timeline__dot--${meeting.status.toLowerCase()}`} />
                <div className="meeting-timeline__content">
                  <div className="meeting-timeline__top"><ProspectIdentity prospect={prospect} subtitle={`${prospect.company} · ${prospect.designation}`} /><MeetingStatusBadge status={meeting.status} /></div>
                  <p>{meeting.type} <span>·</span> {meeting.mode}</p>
                  <div className="meeting-inline-actions">
                    {meeting.status === 'Scheduled' && <Button size="sm" variant="ghost" icon={<ArrowRight size={13} />} onClick={() => updateMeeting(meeting.id, { status: 'In progress' }, { type: 'Started', description: `${meeting.type} started with ${prospect.company}.` })}>Start</Button>}
                    {['Scheduled', 'In progress'].includes(meeting.status) && <Button size="sm" variant="ghost" icon={<Check size={13} />} onClick={() => updateMeeting(meeting.id, { status: 'Completed' }, { type: 'Completed', description: `${meeting.type} completed with ${prospect.company}.` })}>Complete</Button>}
                    <Button size="sm" variant="ghost" icon={<ArrowRight size={13} />} onClick={() => navigate('/coming-soon/meeting-scheduling/rescheduling')}>Manage</Button>
                    {['Scheduled', 'In progress'].includes(meeting.status) && <Button size="sm" variant="ghost" icon={<X size={13} />} onClick={() => updateMeeting(meeting.id, { status: 'Cancelled' }, { type: 'Cancelled', description: `${meeting.type} with ${prospect.company} was cancelled.` })}>Cancel</Button>}
                  </div>
                </div>
              </article>;
            })}
          </div> : <EmptyMeetings title="Your day is clear" detail="Schedule a sales conversation to fill your calendar." />}
        </section>

        <section className="meeting-panel meeting-requests-panel">
          <PanelHeading title="Pending Meeting Requests" detail="Respond to interested prospects" icon={<Users size={16} />} />
          {pendingRequests.length ? <div className="meeting-request-list">
            {pendingRequests.map((request) => {
              const prospect = prospectForMeeting(request.prospectId);
              return <article className="meeting-request-card" key={request.id}>
                <ProspectIdentity prospect={prospect} subtitle={prospect.company} />
                <span className="meeting-request-card__type">{request.type}</span>
                <p>{formatMeetingDate(request.preferredDate)} · {request.preferredTime}</p>
                <small>{request.message}</small>
                <div className="meeting-inline-actions">
                  <Button size="sm" icon={<Check size={13} />} onClick={() => updateRequest(request.id, 'Accepted')}>Accept</Button>
                  <Button size="sm" variant="ghost" icon={<Clock3 size={13} />} onClick={() => updateRequest(request.id, 'Time suggested')}>Suggest time</Button>
                  <Button size="sm" variant="ghost" icon={<X size={13} />} onClick={() => updateRequest(request.id, 'Rejected')}>Reject</Button>
                </div>
              </article>;
            })}
          </div> : <EmptyMeetings title="All caught up" detail="New meeting requests will appear here." />}
          <Button variant="ghost" iconRight={<ArrowRight size={14} />} onClick={() => navigate('/coming-soon/meeting-scheduling/meeting-requests')}>View all requests</Button>
        </section>
      </div>

      <section className="meeting-panel meeting-upcoming-panel">
        <PanelHeading title="Upcoming Meetings" detail="Your next confirmed prospect conversations" icon={<CalendarCheck2 size={16} />} />
        <div className="meeting-upcoming-list">
          {upcomingMeetings.map((meeting) => {
            const prospect = prospectForMeeting(meeting.prospectId);
            return <article className="meeting-upcoming-row" key={meeting.id}>
              <div className="meeting-upcoming-row__date"><strong>{new Date(`${meeting.date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' })}</strong><span>{new Date(`${meeting.date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></div>
              <ProspectIdentity prospect={prospect} subtitle={prospect.company} />
              <div className="meeting-upcoming-row__details"><strong>{meeting.type}</strong><small>{meeting.time} · {meeting.duration} min · {meeting.mode}</small></div>
              <MeetingStatusBadge status={meeting.status} />
              <div className="meeting-upcoming-row__actions">
                <Button size="sm" variant="ghost" onClick={() => navigate('/coming-soon/meeting-scheduling/rescheduling')}>Manage</Button>
                <Button size="sm" variant="ghost" icon={<X size={13} />} aria-label={`Cancel meeting with ${prospect.name}`} onClick={() => updateMeeting(meeting.id, { status: 'Cancelled' }, { type: 'Cancelled', description: `${meeting.type} with ${prospect.company} was cancelled.` })}>Cancel</Button>
              </div>
            </article>;
          })}
          {!upcomingMeetings.length && <EmptyMeetings title="No upcoming meetings" detail="New bookings will show here." />}
        </div>
      </section>
    </MeetingPage>
  );
}
