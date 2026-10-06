import { useSyncExternalStore } from 'react';
import {
  initialActivities,
  initialAvailability,
  initialMeetings,
  initialReminders,
  initialRequests,
  demoToday,
  prospectForMeeting,
  type AvailabilitySettings,
  type MeetingActivity,
  type MeetingActivityType,
  type MeetingReminder,
  type MeetingRequest,
  type SalesMeeting,
} from './data';

export interface MeetingStore {
  meetings: SalesMeeting[];
  requests: MeetingRequest[];
  reminders: MeetingReminder[];
  activities: MeetingActivity[];
  availability: AvailabilitySettings;
}

let sequence = 0;
let snapshot: MeetingStore = {
  meetings: initialMeetings,
  requests: initialRequests,
  reminders: initialReminders,
  activities: initialActivities,
  availability: initialAvailability,
};
const listeners = new Set<() => void>();

function commit(next: MeetingStore) {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

function newId(prefix: string) {
  sequence += 1;
  return `${prefix}-${Date.now()}-${sequence}`;
}

function addActivity(type: MeetingActivityType, prospectId: string, description: string): MeetingActivity {
  return {
    id: newId('activity'),
    type,
    prospectId,
    description,
    timestamp: new Date().toISOString(),
  };
}

export function subscribeMeetingStore(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getMeetingStore() {
  return snapshot;
}

export function useMeetingStore() {
  return useSyncExternalStore(subscribeMeetingStore, getMeetingStore, getMeetingStore);
}

export function createMeeting(meeting: Omit<SalesMeeting, 'id' | 'status'>) {
  const created: SalesMeeting = { ...meeting, id: newId('meeting'), status: 'Scheduled' };
  const prospect = prospectForMeeting(created.prospectId);
  const reminder: MeetingReminder = { id: newId('reminder'), meetingId: created.id, timing: '1 day before', status: 'Scheduled' };
  commit({
    ...snapshot,
    meetings: [created, ...snapshot.meetings],
    reminders: [reminder, ...snapshot.reminders],
    activities: [
      addActivity('Scheduled', created.prospectId, `${created.type} booked with ${prospect.company} for ${created.date} at ${created.time}.`),
      ...snapshot.activities,
    ],
  });
  return created;
}

export function updateMeeting(
  id: string,
  changes: Partial<SalesMeeting>,
  activity: { type: MeetingActivityType; description: string },
) {
  const current = snapshot.meetings.find((meeting) => meeting.id === id);
  if (!current) return;
  const updated = { ...current, ...changes };
  commit({
    ...snapshot,
    meetings: snapshot.meetings.map((meeting) => meeting.id === id ? updated : meeting),
    activities: [addActivity(activity.type, updated.prospectId, activity.description), ...snapshot.activities],
  });
}

export function updateRequest(id: string, status: MeetingRequest['status']) {
  const request = snapshot.requests.find((item) => item.id === id);
  if (!request) return;
  const prospect = prospectForMeeting(request.prospectId);
  const description = status === 'Accepted'
    ? `Meeting request accepted for ${request.preferredDate} at ${request.preferredTime}.`
    : status === 'Rejected'
      ? 'Meeting request declined.'
      : 'Suggested an alternative time for the meeting.';
  commit({
    ...snapshot,
    requests: snapshot.requests.map((item) => item.id === id ? { ...item, status } : item),
    activities: [addActivity('Requests', request.prospectId, `${description} · ${prospect.company}`), ...snapshot.activities],
  });
}

export function updateReminder(id: string, status: MeetingReminder['status']) {
  const reminder = snapshot.reminders.find((item) => item.id === id);
  const meeting = snapshot.meetings.find((item) => item.id === reminder?.meetingId);
  if (!reminder || !meeting) return;
  const prospect = prospectForMeeting(meeting.prospectId);
  const description = status === 'Sent'
    ? `Meeting reminder sent to ${prospect.name}.`
    : status === 'Cancelled'
      ? `Reminder cancelled for ${prospect.name}.`
      : `Reminder marked ${status.toLowerCase()} for ${prospect.name}.`;
  commit({
    ...snapshot,
    reminders: snapshot.reminders.map((item) => item.id === id ? { ...item, status } : item),
    activities: [addActivity('Reminders', meeting.prospectId, description), ...snapshot.activities],
  });
}

export function updateAvailability(changes: Partial<AvailabilitySettings>) {
  const availability = { ...snapshot.availability, ...changes };
  if (changes.startHour !== undefined && availability.startHour >= availability.endHour) {
    availability.endHour = Math.min(18, availability.startHour + 1);
  }
  if (changes.endHour !== undefined && availability.endHour <= availability.startHour) {
    availability.startHour = Math.max(6, availability.endHour - 1);
  }
  commit({ ...snapshot, availability });
}

export function availableMeetingTimes(date: string, excludeMeetingId?: string) {
  const { availability, meetings } = snapshot;
  const weekday = new Date(`${date}T12:00:00`).getDay();
  if (!availability.days.includes(weekday)) return [];
  const slots: string[] = [];
  const interval = availability.duration + availability.buffer;
  const now = new Date();
  const currentMinute = now.getHours() * 60 + now.getMinutes();
  for (let minute = availability.startHour * 60; minute + availability.duration <= availability.endHour * 60; minute += interval) {
    if (date === demoToday && minute <= currentMinute) continue;
    const hour = Math.floor(minute / 60);
    const minutePart = minute % 60;
    const time = new Date(2000, 0, 1, hour, minutePart).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const slotEnd = minute + availability.duration + availability.buffer;
    const overlapsLunch = minute < 13 * 60 && slotEnd > 12 * 60;
    const isTaken = overlapsLunch || meetings.some((meeting) => {
      if (meeting.id === excludeMeetingId || meeting.date !== date || meeting.status === 'Cancelled') return false;
      const [meetingHour, meetingMinute] = meeting.time.split(/[: ]/);
      const parsedHour = Number(meetingHour) % 12 + (meeting.time.includes('PM') ? 12 : 0);
      const meetingStart = parsedHour * 60 + Number(meetingMinute);
      const meetingEnd = meetingStart + meeting.duration + availability.buffer;
      return minute < meetingEnd && slotEnd > meetingStart;
    });
    if (!isTaken) slots.push(time);
  }
  return slots;
}

export function nextAvailableMeetingDate() {
  const start = new Date(`${demoToday}T12:00:00`);
  for (let offset = 1; offset <= 14; offset += 1) {
    const candidate = new Date(start);
    candidate.setDate(candidate.getDate() + offset);
    const date = `${candidate.getFullYear()}-${String(candidate.getMonth() + 1).padStart(2, '0')}-${String(candidate.getDate()).padStart(2, '0')}`;
    if (availableMeetingTimes(date).length) return date;
  }
  return demoToday;
}
