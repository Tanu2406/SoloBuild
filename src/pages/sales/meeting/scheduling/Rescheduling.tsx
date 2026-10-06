import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, CalendarClock, Check, Clock3 } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Input, Select, Textarea } from '../../../../components/ui/Input';
import { useToast } from '../../../../components/ui/Toast';
import { demoToday, formatMeetingDate, meetingProspects, prospectForMeeting } from './data';
import { availableMeetingTimes, updateMeeting, useMeetingStore } from './store';
import { EmptyMeetings, MeetingPage, PanelHeading, ProspectIdentity } from './MeetingSchedulingComponents';

export default function Rescheduling() {
  const { meetings } = useMeetingStore();
  const scheduledMeetings = meetings.filter((meeting) => meeting.status === 'Scheduled');
  const [meetingId, setMeetingId] = useState(scheduledMeetings[0]?.id ?? '');
  const selected = scheduledMeetings.find((meeting) => meeting.id === meetingId);
  const [date, setDate] = useState(selected?.date ?? demoToday);
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState('');
  const { showToast } = useToast();
  const times = selected ? availableMeetingTimes(date, selected.id).filter((slot) => date !== selected.date || slot !== selected.time) : [];
  const selectedTime = times.includes(time) ? time : times[0] ?? '';
  const prospect = selected ? prospectForMeeting(selected.prospectId) : meetingProspects[0];

  const reschedule = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected || !reason.trim()) {
      setFormError('Select a meeting and enter a reason for the change.');
      return;
    }
    const validTimes = availableMeetingTimes(date, selected.id);
    if (!validTimes.includes(selectedTime) || (date === selected.date && selectedTime === selected.time)) {
      setFormError('That time is no longer available. Select another open slot.');
      return;
    }
    const from = `${formatMeetingDate(selected.date)}, ${selected.time}`;
    const to = `${formatMeetingDate(date)}, ${selectedTime}`;
    updateMeeting(selected.id, { date, time: selectedTime }, {
      type: 'Rescheduled',
      description: `Meeting rescheduled: ${from} → ${to}. Reason: ${reason.trim()}`,
    });
    showToast('Meeting rescheduled successfully', 'success');
    setReason('');
    setFormError('');
  };

  return (
    <MeetingPage title="Rescheduling" subtitle="Find a new time for a confirmed conversation without creating calendar conflicts.">
      {!selected ? <section className="meeting-panel"><EmptyMeetings title="No meetings to reschedule" detail="Confirmed meetings will be available here." /></section> : <div className="meeting-reschedule-layout">
        <section className="meeting-panel meeting-reschedule-form-panel">
          <PanelHeading title="Change meeting time" detail="Choose the meeting, then select a new open date and time." icon={<CalendarClock size={16} />} />
          <form className="meeting-reschedule-form" onSubmit={reschedule}>
            <Select label="Meeting to reschedule" value={meetingId} onChange={(event) => {
              const nextMeeting = scheduledMeetings.find((meeting) => meeting.id === event.target.value);
              setMeetingId(event.target.value);
              setDate(nextMeeting?.date ?? demoToday);
              setTime('');
            }}
              options={scheduledMeetings.map((meeting) => {
                const contact = prospectForMeeting(meeting.prospectId);
                return { value: meeting.id, label: `${contact.name} · ${meeting.type} · ${formatMeetingDate(meeting.date)}` };
              })} />
            <div className="meeting-change-preview">
              <ProspectIdentity prospect={prospect} subtitle={prospect.company} />
              <span><Clock3 size={14} /> Current: {formatMeetingDate(selected.date)} · {selected.time}</span>
            </div>
            <div className="meeting-reschedule-current"><span>{formatMeetingDate(selected.date)}<small>{selected.time}</small></span><ArrowRight size={18} /><strong>{`${formatMeetingDate(date)} · ${selectedTime || 'Select a slot'}`}</strong></div>
            <div className="meeting-form-grid">
              <Input label="New date" type="date" value={date} min={demoToday} onChange={(event) => { setDate(event.target.value); setTime(''); }} required />
              <Select label="New available time" value={selectedTime} onChange={(event) => setTime(event.target.value)} options={times.map((item) => ({ value: item, label: item }))} disabled={!times.length} />
            </div>
            <Textarea label="Reason for rescheduling" value={reason} onChange={(event) => setReason(event.target.value)} rows={3} placeholder="Share a short reason to include in the update..." required />
            {formError && <p className="meeting-form-error" role="alert">{formError}</p>}
            <Button type="submit" icon={<Check size={15} />} disabled={!times.length}>Confirm new time</Button>
          </form>
        </section>
        <aside className="meeting-panel meeting-reschedule-aside"><PanelHeading title="Upcoming confirmed" detail={`${scheduledMeetings.length} meetings`} />
          {scheduledMeetings.slice(0, 5).map((meeting) => {
            const contact = prospectForMeeting(meeting.prospectId);
            return <button type="button" className={`meeting-mini-row${meeting.id === meetingId ? ' is-selected' : ''}`} key={meeting.id} onClick={() => setMeetingId(meeting.id)}>
              <span><strong>{contact.name}</strong><small>{contact.company}</small></span><span>{formatMeetingDate(meeting.date)}<small>{meeting.time}</small></span>
            </button>;
          })}
        </aside>
      </div>}
    </MeetingPage>
  );
}
