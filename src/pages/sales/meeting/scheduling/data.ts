import { salesLeads } from '../../../../components/sales/SalesData';

export const meetingBasePath = '/coming-soon/meeting-scheduling';

export const meetingNavigation = [
  { id: 'meeting-requests', label: 'Meeting Requests', href: `${meetingBasePath}/meeting-requests` },
  { id: 'availability', label: 'Availability', href: `${meetingBasePath}/availability` },
  { id: 'scheduling', label: 'Scheduling', href: `${meetingBasePath}/scheduling` },
  { id: 'rescheduling', label: 'Rescheduling', href: `${meetingBasePath}/rescheduling` },
  { id: 'reminders', label: 'Reminders', href: `${meetingBasePath}/reminders` },
  { id: 'activity', label: 'Activity', href: `${meetingBasePath}/activity` },
] as const;

export const meetingProspects = salesLeads;
const localToday = new Date();
export const demoToday = `${localToday.getFullYear()}-${String(localToday.getMonth() + 1).padStart(2, '0')}-${String(localToday.getDate()).padStart(2, '0')}`;

export type MeetingStatus = 'Scheduled' | 'In progress' | 'Completed' | 'Cancelled';
export type MeetingRequestStatus = 'Requested' | 'Accepted' | 'Rejected' | 'Time suggested';
export type ReminderStatus = 'Pending' | 'Scheduled' | 'Sent' | 'Completed' | 'Cancelled';
export type MeetingActivityType = 'Scheduled' | 'Rescheduled' | 'Cancelled' | 'Completed' | 'Started' | 'Reminders' | 'Requests';

export interface SalesMeeting {
  id: string;
  prospectId: string;
  type: string;
  date: string;
  time: string;
  duration: number;
  mode: 'Video call' | 'Phone call' | 'In person';
  status: MeetingStatus;
  notes: string;
}

export interface MeetingRequest {
  id: string;
  prospectId: string;
  type: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
  status: MeetingRequestStatus;
}

export interface MeetingReminder {
  id: string;
  meetingId: string;
  timing: string;
  status: ReminderStatus;
}

export interface MeetingActivity {
  id: string;
  type: MeetingActivityType;
  prospectId: string;
  description: string;
  timestamp: string;
}

export interface AvailabilitySettings {
  days: number[];
  startHour: number;
  endHour: number;
  duration: number;
  buffer: number;
}

const dateOffset = (offset: number) => {
  const date = new Date(`${demoToday}T12:00:00`);
  date.setDate(date.getDate() + offset);
  return date.toLocaleDateString('en-CA');
};

export const initialMeetings: SalesMeeting[] = [
  { id: 'sched-1001', prospectId: 'l-1001', type: 'Product discovery', date: demoToday, time: '9:00 AM', duration: 30, mode: 'Video call', status: 'Completed', notes: 'Review patient outreach workflows and success criteria.' },
  { id: 'sched-1002', prospectId: 'l-1002', type: 'Conversion strategy demo', date: demoToday, time: '11:00 AM', duration: 45, mode: 'Video call', status: 'Completed', notes: 'Walk through the conversion analytics workspace.' },
  { id: 'sched-1003', prospectId: 'l-1003', type: 'Product walkthrough', date: demoToday, time: '2:00 PM', duration: 45, mode: 'Video call', status: 'Completed', notes: 'Explore enrollment pipeline automation.' },
  { id: 'sched-1004', prospectId: 'l-1004', type: 'Enterprise discovery', date: dateOffset(1), time: '10:30 AM', duration: 30, mode: 'Phone call', status: 'Scheduled', notes: 'Understand sales cycle priorities.' },
  { id: 'sched-1005', prospectId: 'l-1005', type: 'Solution consultation', date: dateOffset(2), time: '1:30 PM', duration: 60, mode: 'Video call', status: 'Scheduled', notes: 'Discuss account research goals.' },
];

export const initialRequests: MeetingRequest[] = [
  { id: 'req-1001', prospectId: 'l-1001', type: 'Workflow consultation', preferredDate: dateOffset(1), preferredTime: '1:00 PM', message: 'Would like to see how the workflow handles patient follow-ups.', status: 'Requested' },
  { id: 'req-1002', prospectId: 'l-1006', type: 'Automation overview', preferredDate: dateOffset(2), preferredTime: '11:00 AM', message: 'Interested in a quick overview for our distributed team.', status: 'Requested' },
  { id: 'req-1003', prospectId: 'l-1002', type: 'Product demo', preferredDate: dateOffset(3), preferredTime: '10:00 AM', message: 'Please include conversion reporting and integrations.', status: 'Accepted' },
];

export const initialReminders: MeetingReminder[] = [
  { id: 'rem-1003', meetingId: 'sched-1004', timing: '1 day before', status: 'Sent' },
  { id: 'rem-1004', meetingId: 'sched-1005', timing: '1 day before', status: 'Pending' },
];

export const initialActivities: MeetingActivity[] = [
  { id: 'act-1001', type: 'Completed', prospectId: 'l-1002', description: 'Conversion strategy demo completed today at 11:00 AM.', timestamp: `${demoToday}T11:48:00` },
  { id: 'act-1002', type: 'Requests', prospectId: 'l-1001', description: 'Requested a workflow consultation for the next available day.', timestamp: `${demoToday}T08:05:00` },
  { id: 'act-1003', type: 'Completed', prospectId: 'l-1001', description: 'Product discovery completed; workflow priorities captured.', timestamp: `${demoToday}T09:32:00` },
  { id: 'act-1004', type: 'Reminders', prospectId: 'l-1004', description: 'A meeting reminder was sent for the enterprise discovery call.', timestamp: `${demoToday}T09:40:00` },
];

export const initialAvailability: AvailabilitySettings = {
  days: [1, 2, 3, 4, 5],
  startHour: 9,
  endHour: 17,
  duration: 30,
  buffer: 15,
};

export function prospectForMeeting(prospectId: string) {
  return meetingProspects.find((prospect) => prospect.id === prospectId) ?? meetingProspects[0];
}

export function formatMeetingDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatMeetingTime(date: string, time: string) {
  return `${formatMeetingDate(date)}, ${time}`;
}
