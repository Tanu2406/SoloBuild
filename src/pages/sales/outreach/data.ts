import { salesLeads } from '../../../components/sales/SalesData';

export const outreachBasePath = '/coming-soon/sales-outreach';

export const outreachNavigation = [
  { id: 'lead-research', label: 'Lead Research', href: `${outreachBasePath}/lead-research` },
  { id: 'personalized-outreach', label: 'Personalized Outreach', href: `${outreachBasePath}/personalized-outreach` },
  { id: 'email-campaigns', label: 'Email Campaigns', href: `${outreachBasePath}/email-campaigns` },
  { id: 'follow-ups', label: 'Follow-ups', href: `${outreachBasePath}/follow-ups` },
  { id: 'meeting-booking', label: 'Meeting Booking', href: `${outreachBasePath}/meeting-booking` },
  { id: 'activity', label: 'Activity', href: `${outreachBasePath}/activity` },
] as const;

const prospectContext = [
  {
    productInterest: 'Revenue Intelligence',
    buyingSignal: 'Hiring 8 new account executives',
    researchNotes: 'Scaling sales team; recent expansion into two new regions.',
    role: 'VP, Operations',
  },
  {
    productInterest: 'Customer Data Platform',
    buyingSignal: 'Visited pricing page 3 times',
    researchNotes: 'Evaluating conversion tools ahead of holiday peak.',
    role: 'Director, Growth',
  },
  {
    productInterest: 'Workflow Automation',
    buyingSignal: 'Requested an enrollment workflow guide',
    researchNotes: 'Expanding online programs and consolidating enrollment systems.',
    role: 'VP, Enrollment',
  },
  {
    productInterest: 'Revenue Intelligence',
    buyingSignal: 'Downloaded enterprise sales-cycle report',
    researchNotes: 'Large account team with a multi-quarter sales cycle.',
    role: 'Sales Director',
  },
  {
    productInterest: 'Customer Data Platform',
    buyingSignal: 'Attended financial services webinar',
    researchNotes: 'Researching account intelligence and data quality options.',
    role: 'Operations Manager',
  },
  {
    productInterest: 'Workflow Automation',
    buyingSignal: 'Opened automation overview email',
    researchNotes: 'Exploring operational automation for a distributed team.',
    role: 'Business Development Lead',
  },
];

export const outreachProspects = salesLeads.map((lead, index) => ({
  ...lead,
  role: prospectContext[index].role,
  productInterest: prospectContext[index].productInterest,
  buyingSignal: prospectContext[index].buyingSignal,
  researchNotes: prospectContext[index].researchNotes,
}));

export type OutreachProspect = (typeof outreachProspects)[number];

export interface OutreachMeeting {
  id: string;
  prospectId: string;
  type: string;
  date: string;
  time: string;
  status: 'Confirmed' | 'Requested' | 'Proposed' | 'Cancelled';
}

export const initialMeetings: OutreachMeeting[] = [
  { id: 'meet-1', prospectId: 'l-1003', type: 'Product walkthrough', date: 'Oct 08, 2026', time: '10:30 AM', status: 'Confirmed' },
  { id: 'meet-2', prospectId: 'l-1002', type: 'Discovery call', date: 'Oct 08, 2026', time: '2:00 PM', status: 'Confirmed' },
  { id: 'meet-3', prospectId: 'l-1001', type: 'Solution consultation', date: 'Oct 09, 2026', time: '11:00 AM', status: 'Requested' },
  { id: 'meet-4', prospectId: 'l-1005', type: 'Platform overview', date: 'Oct 10, 2026', time: '9:30 AM', status: 'Proposed' },
];

export interface FollowUpItem {
  id: string;
  prospectId: string;
  lastContact: string;
  reason: string;
  nextAction: string;
  dueDate: string;
  status: 'Today' | 'Upcoming' | 'Overdue' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
}

export const initialFollowUps: FollowUpItem[] = [
  { id: 'follow-1', prospectId: 'l-1001', lastContact: 'Today, 9:15 AM', reason: 'Asked for a workflow overview', nextAction: 'Send tailored overview', dueDate: 'Today', status: 'Today', priority: 'High' },
  { id: 'follow-2', prospectId: 'l-1002', lastContact: 'Yesterday', reason: 'Pricing page revisit', nextAction: 'Discuss conversion goals', dueDate: 'Today', status: 'Today', priority: 'High' },
  { id: 'follow-3', prospectId: 'l-1004', lastContact: 'Oct 02, 2026', reason: 'Enterprise report download', nextAction: 'Share customer case study', dueDate: 'Oct 07, 2026', status: 'Overdue', priority: 'Medium' },
  { id: 'follow-4', prospectId: 'l-1005', lastContact: 'Oct 03, 2026', reason: 'Webinar attendance', nextAction: 'Confirm evaluation criteria', dueDate: 'Oct 09, 2026', status: 'Upcoming', priority: 'Low' },
  { id: 'follow-5', prospectId: 'l-1006', lastContact: 'Oct 01, 2026', reason: 'Requested automation resources', nextAction: 'Send workflow guide', dueDate: 'Oct 05, 2026', status: 'Completed', priority: 'Low' },
];

export interface OutreachCampaign {
  id: string;
  name: string;
  audience: string;
  sent: number;
  openRate: number;
  replyRate: number;
  positiveReplies: number;
  meetings: number;
  conversion: number;
  status: 'Draft' | 'Scheduled' | 'Running' | 'Paused' | 'Completed';
  objective?: string;
  product?: string;
  campaignType?: string;
  emailSubject?: string;
  emailMessage?: string;
  startDate?: string;
  startTime?: string;
  followUp?: boolean;
  prospectIds?: string[];
}

export const initialCampaigns: OutreachCampaign[] = [
  { id: 'camp-1', name: 'Q4 Revenue Intelligence', audience: 'VP Sales · SaaS · North America', sent: 1240, openRate: 48.2, replyRate: 12.4, positiveReplies: 86, meetings: 34, conversion: 8.1, status: 'Running' },
  { id: 'camp-2', name: 'Commerce Growth Playbook', audience: 'Growth leaders · Retail', sent: 860, openRate: 42.6, replyRate: 9.8, positiveReplies: 42, meetings: 18, conversion: 5.4, status: 'Scheduled' },
  { id: 'camp-3', name: 'Operations Automation Series', audience: 'Operations directors · Mid-market', sent: 2150, openRate: 51.7, replyRate: 15.2, positiveReplies: 194, meetings: 67, conversion: 10.3, status: 'Paused' },
  { id: 'camp-4', name: 'New Product Discovery', audience: 'Warm product-intent prospects', sent: 0, openRate: 0, replyRate: 0, positiveReplies: 0, meetings: 0, conversion: 0, status: 'Draft' },
  { id: 'camp-5', name: 'Summer Pipeline Re-engagement', audience: 'Dormant enterprise accounts', sent: 1740, openRate: 45.3, replyRate: 11.1, positiveReplies: 111, meetings: 49, conversion: 7.6, status: 'Completed' },
];

export interface OutreachActivityItem {
  id: string;
  prospectId: string;
  type: 'Research' | 'Email' | 'Call' | 'Meeting' | 'Follow-up' | 'Opportunity';
  action: string;
  detail: string;
  when: string;
}

export const outreachActivities: OutreachActivityItem[] = [
  { id: 'act-1', prospectId: 'l-1001', type: 'Research', action: 'Lead researched', detail: 'Buying signal identified: sales team expansion', when: 'Today · 10:42 AM' },
  { id: 'act-2', prospectId: 'l-1002', type: 'Email', action: 'Email opened', detail: 'Commerce Growth Playbook · 2 minutes after delivery', when: 'Today · 10:18 AM' },
  { id: 'act-3', prospectId: 'l-1003', type: 'Email', action: 'Reply received', detail: 'Requested a product walkthrough next week', when: 'Today · 9:52 AM' },
  { id: 'act-4', prospectId: 'l-1004', type: 'Follow-up', action: 'Follow-up completed', detail: 'Shared enterprise sales-cycle research', when: 'Today · 9:20 AM' },
  { id: 'act-5', prospectId: 'l-1005', type: 'Call', action: 'Call completed', detail: 'Discussed account research requirements', when: 'Yesterday · 4:16 PM' },
  { id: 'act-6', prospectId: 'l-1003', type: 'Meeting', action: 'Meeting booked', detail: 'Product walkthrough · Oct 08, 2026', when: 'Yesterday · 2:45 PM' },
  { id: 'act-7', prospectId: 'l-1006', type: 'Opportunity', action: 'Opportunity created', detail: 'Workflow Automation · $32,000 estimated value', when: 'Oct 05 · 11:06 AM' },
  { id: 'act-8', prospectId: 'l-1001', type: 'Email', action: 'Email sent', detail: 'Personalized workflow overview', when: 'Oct 05 · 10:30 AM' },
];

export const performanceStages = [
  { label: 'Sent', value: 2480, percent: 100, color: 'blue' },
  { label: 'Opened', value: 1282, percent: 52, color: 'indigo' },
  { label: 'Replied', value: 307, percent: 12.4, color: 'violet' },
  { label: 'Positive Replies', value: 186, percent: 7.5, color: 'cyan' },
  { label: 'Meetings', value: 83, percent: 3.3, color: 'green' },
  { label: 'Conversions', value: 41, percent: 1.7, color: 'amber' },
];

export const pipelineStages = [
  { label: 'New Lead', count: 284, value: '$1.42M' },
  { label: 'Contacted', count: 196, value: '$1.08M' },
  { label: 'Engaged', count: 112, value: '$740K' },
  { label: 'Qualified', count: 68, value: '$526K' },
  { label: 'Meeting', count: 41, value: '$382K' },
  { label: 'Opportunity', count: 24, value: '$264K' },
  { label: 'Won', count: 9, value: '$118K' },
];
