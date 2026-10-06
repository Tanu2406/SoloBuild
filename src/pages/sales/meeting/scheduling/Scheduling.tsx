import { useState } from 'react';
import type { FormEvent } from 'react';
import { CalendarCheck2, Check, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../../components/ui/Button';
import { Input, Select, Textarea } from '../../../../components/ui/Input';
import { useToast } from '../../../../components/ui/Toast';
import { demoToday, meetingProspects } from './data';
import { availableMeetingTimes, createMeeting, getMeetingStore, nextAvailableMeetingDate, useMeetingStore } from './store';
import { MeetingPage, PanelHeading, ProspectIdentity } from './MeetingSchedulingComponents';

const meetingTypes = ['Product demo', 'Discovery call', 'Product walkthrough', 'Solution consultation', 'Quarterly review'];
const meetingModes = ['Video call', 'Phone call', 'In person'] as const;

export default function Scheduling() {
  const { availability, requests } = useMeetingStore();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [prospectId, setProspectId] = useState(meetingProspects[0].id);
  const [meetingType, setMeetingType] = useState(meetingTypes[0]);
  const [date, setDate] = useState(nextAvailableMeetingDate);
  const [time, setTime] = useState(() => availableMeetingTimes(nextAvailableMeetingDate())[0] ?? '');
  const [mode, setMode] = useState<(typeof meetingModes)[number]>('Video call');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const availableTimes = availableMeetingTimes(date);
  const selectedTime = availableTimes.includes(time) ? time : availableTimes[0] ?? '';
  const selectedProspect = meetingProspects.find((prospect) => prospect.id === prospectId) ?? meetingProspects[0];

  const submitMeeting = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    const latestTimes = availableMeetingTimes(date);
    if (!selectedTime || !latestTimes.includes(selectedTime)) {
      setFormError('That time is no longer available. Select another open slot.');
      return;
    }
    createMeeting({
      prospectId,
      type: meetingType,
      date,
      time: selectedTime,
      duration: getMeetingStore().availability.duration,
      mode,
      notes: notes.trim(),
    });
    showToast('Meeting booked successfully', 'success');
    navigate('/coming-soon/meeting-scheduling');
  };

  return (
    <MeetingPage title="Schedule a Meeting" subtitle="Book a time that works for your prospect and your calendar."
      actions={<span className="meeting-page-tag"><CalendarCheck2 size={14} /> Prospect booking</span>}>
      <div className="meeting-booking-layout">
        <section className="meeting-panel meeting-booking-panel">
          <PanelHeading title="Create a booking" detail="Choose the prospect, conversation format, and an open time." icon={<CalendarCheck2 size={16} />} />
          {requests.some((request) => ['Accepted', 'Time suggested'].includes(request.status)) && <div className="meeting-accepted-requests">
            <div><strong>Requests ready to schedule</strong><small>Continue scheduling accepted requests or follow up on a suggested time.</small></div>
            {requests.filter((request) => ['Accepted', 'Time suggested'].includes(request.status)).map((request) => {
              const prospect = meetingProspects.find((item) => item.id === request.prospectId) ?? meetingProspects[0];
              return <article className="meeting-accepted-request" key={request.id}>
                <span><strong>{prospect.name}</strong><small>{prospect.company} · {request.type} · {request.status}</small></span>
                <Button size="sm" variant="outline" onClick={() => {
                  const requestTimes = availableMeetingTimes(request.preferredDate);
                  setProspectId(request.prospectId);
                  setDate(request.preferredDate);
                  setTime(requestTimes.includes(request.preferredTime) ? request.preferredTime : requestTimes[0] ?? '');
                }}>Use request</Button>
              </article>;
            })}
          </div>}
          <div className="meeting-booking-steps" aria-label="Booking steps">
            {['Prospect', 'Meeting details', 'Date & time', 'Confirm'].map((step, index) => <span key={step}><i>{index + 1}</i>{step}</span>)}
          </div>
          <form className="meeting-booking-form" onSubmit={submitMeeting}>
            <Select label="Select prospect" value={prospectId} onChange={(event) => setProspectId(event.target.value)}
              options={meetingProspects.map((prospect) => ({ value: prospect.id, label: `${prospect.name} · ${prospect.company}` }))} />
            <div className="meeting-selected-prospect"><ProspectIdentity prospect={selectedProspect} subtitle={`${selectedProspect.designation} · ${selectedProspect.company}`} /><span>{selectedProspect.status}</span></div>
            <div className="meeting-form-grid">
              <Select label="Meeting type" value={meetingType} onChange={(event) => setMeetingType(event.target.value)} options={meetingTypes.map((item) => ({ value: item, label: item }))} />
              <Select label="Meeting mode" value={mode} onChange={(event) => {
                const nextMode = meetingModes.find((item) => item === event.target.value);
                if (nextMode) setMode(nextMode);
              }} options={meetingModes.map((item) => ({ value: item, label: item }))} />
              <Input label="Date" type="date" value={date} min={demoToday} onChange={(event) => { setDate(event.target.value); setTime(''); }} required />
              <Select label="Available time" value={selectedTime} onChange={(event) => setTime(event.target.value)} options={availableTimes.map((item) => ({ value: item, label: item }))} disabled={!availableTimes.length} />
              <div className="meeting-duration-field"><span>Duration</span><strong>{availability.duration} minutes</strong><small>Set in Availability preferences</small></div>
              <div className="meeting-duration-field"><span>Buffer</span><strong>{availability.buffer} minutes</strong><small>Protected between meetings</small></div>
            </div>
            <Textarea label="Meeting notes" value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} placeholder="Add an agenda or context for the conversation..." />
            {formError && <p className="meeting-form-error" role="alert">{formError}</p>}
            <div className="meeting-booking-form__footer"><span><Video size={15} /> Calendar invite will use your selected meeting mode.</span><Button type="submit" icon={<Check size={15} />} disabled={!availableTimes.length}>Confirm Meeting</Button></div>
          </form>
        </section>

        <aside className="meeting-panel meeting-booking-summary">
          <PanelHeading title="Booking summary" detail="Review before confirming" />
          <div className="meeting-booking-summary__prospect"><ProspectIdentity prospect={selectedProspect} subtitle={selectedProspect.company} /></div>
          <div className="meeting-booking-summary__details">
            <span><small>Meeting</small><strong>{meetingType}</strong></span>
            <span><small>Date & time</small><strong>{new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {selectedTime || 'Choose a slot'}</strong></span>
            <span><small>Format</small><strong>{mode}</strong></span>
            <span><small>Duration</small><strong>{availability.duration} minutes</strong></span>
          </div>
          <div className="meeting-booking-summary__safe"><Check size={15} /><span>Only open times are shown. Existing meetings and buffer time are protected.</span></div>
        </aside>
      </div>
    </MeetingPage>
  );
}
