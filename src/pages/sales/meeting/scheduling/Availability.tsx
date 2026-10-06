import { useState } from 'react';
import { CalendarDays, Check, Clock3, Coffee, Settings2 } from 'lucide-react';
import { Input, Select } from '../../../../components/ui/Input';
import { demoToday, formatMeetingDate } from './data';
import { availableMeetingTimes, updateAvailability, useMeetingStore } from './store';
import { MeetingPage, PanelHeading } from './MeetingSchedulingComponents';

const weekdayOptions = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const hourOptions = Array.from({ length: 13 }, (_, index) => index + 6);
const hourLabel = (hour: number) => new Date(2000, 0, 1, hour).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

export default function Availability() {
  const { availability, meetings } = useMeetingStore();
  const [date, setDate] = useState(demoToday);
  const weekday = new Date(`${date}T12:00:00`).getDay();
  const times = availableMeetingTimes(date);
  const dayIsAvailable = availability.days.includes(weekday);
  const takenMeetings = meetings.filter((meeting) => meeting.date === date && meeting.status === 'Scheduled');

  return (
    <MeetingPage title="Availability" subtitle="Set the hours and meeting preferences prospects can book against."
      actions={<span className="meeting-page-tag"><span /> Live availability</span>}>
      <div className="meeting-availability-layout">
        <section className="meeting-panel meeting-availability-settings">
          <PanelHeading title="Working preferences" detail="Changes update available slots throughout scheduling." icon={<Settings2 size={16} />} />
          <div className="meeting-availability-setting">
            <span className="meeting-setting-label">Available days</span>
            <div className="meeting-weekdays">{weekdayOptions.map((day, index) => {
              const active = availability.days.includes(index);
              return <button type="button" className={active ? 'is-active' : ''} key={day} aria-pressed={active} onClick={() => {
                const days = active ? availability.days.filter((item) => item !== index) : [...availability.days, index].sort();
                updateAvailability({ days });
              }}>{day}</button>;
            })}</div>
          </div>
          <div className="meeting-setting-grid">
            <Select label="Working hours start" value={availability.startHour} onChange={(event) => updateAvailability({ startHour: Number(event.target.value) })}
              options={hourOptions.slice(0, -1).map((hour) => ({ value: String(hour), label: hourLabel(hour) }))} />
            <Select label="Working hours end" value={availability.endHour} onChange={(event) => updateAvailability({ endHour: Number(event.target.value) })}
              options={hourOptions.slice(1).map((hour) => ({ value: String(hour), label: hourLabel(hour) }))} />
            <Select label="Meeting duration" value={availability.duration} onChange={(event) => updateAvailability({ duration: Number(event.target.value) })}
              options={[15, 30, 45, 60].map((minutes) => ({ value: String(minutes), label: `${minutes} minutes` }))} />
            <Select label="Buffer time" value={availability.buffer} onChange={(event) => updateAvailability({ buffer: Number(event.target.value) })}
              options={[0, 10, 15, 30].map((minutes) => ({ value: String(minutes), label: `${minutes} minutes` }))} />
          </div>
          <div className="meeting-availability-note"><Check size={15} /><span>Booked meetings and buffer time are automatically blocked from your calendar.</span></div>
        </section>

        <section className="meeting-panel meeting-slot-preview">
          <div className="meeting-slot-preview__head"><PanelHeading title="Availability preview" detail="Select a date to preview bookable times." icon={<CalendarDays size={16} />} /><Input aria-label="Preview date" type="date" value={date} onChange={(event) => setDate(event.target.value)} /></div>
          <div className="meeting-slot-preview__date">{formatMeetingDate(date)}<small>{dayIsAvailable ? `${times.length} bookable slots` : 'Not an available work day'}</small></div>
          <div className="meeting-slot-list">
            {!dayIsAvailable && <div className="meeting-day-off"><Coffee size={17} /><span>This day is not selected as a working day.</span></div>}
            {dayIsAvailable && Array.from({ length: Math.max(0, Math.floor((availability.endHour - availability.startHour) * 60 / 60)) }, (_, index) => {
              const hour = availability.startHour + index;
              const time = hourLabel(hour);
              const meeting = takenMeetings.find((item) => item.time === time);
              const available = times.includes(time);
              return <div className={`meeting-slot-row${meeting ? ' is-booked' : ''}${hour === 12 ? ' is-break' : ''}`} key={hour}>
                <span className="meeting-slot-row__time">{time}</span>
                <span className="meeting-slot-row__line" />
                {hour === 12 ? <span className="meeting-slot-state meeting-slot-state--break"><Coffee size={13} /> Break</span>
                  : meeting ? <span className="meeting-slot-state meeting-slot-state--booked"><Clock3 size={13} />{meeting.type}</span>
                    : <span className={`meeting-slot-state ${available ? 'meeting-slot-state--available' : 'meeting-slot-state--buffer'}`}>{available ? <><Check size={13} /> Available</> : 'Buffer / booked'}</span>}
              </div>;
            })}
            {dayIsAvailable && !times.length && <p className="meeting-no-slots">No bookable times for this date. Update your work hours or choose another day.</p>}
          </div>
          <p className="meeting-slot-footnote">Slots are offered in {availability.duration}-minute meetings with {availability.buffer} minutes between calls.</p>
        </section>
      </div>
    </MeetingPage>
  );
}
