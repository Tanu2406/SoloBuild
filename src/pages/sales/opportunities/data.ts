import { salesLeads } from '../../../components/sales/SalesData';

export const opportunityBasePath = '/coming-soon/opportunity-management';

export const opportunityStages = ['New Opportunity', 'Discovery', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'] as const;
export type OpportunityStage = (typeof opportunityStages)[number];
export type QualificationStatus = 'Qualified' | 'Needs Review' | 'Disqualified';
export type DealPriority = 'High' | 'Medium' | 'Low';
export type FollowUpType = 'Call' | 'Email' | 'Meeting' | 'Demo' | 'Proposal' | 'Reminder';
export type FollowUpStatus = 'Upcoming' | 'Overdue' | 'Completed';
export type OpportunityActivityType = 'Call' | 'Email' | 'Meeting' | 'Note' | 'Deal update' | 'Stage change' | 'Follow-up' | 'Qualification';

export const opportunityNavigation = [
  { id: 'opportunity-tracking', label: 'Opportunity Tracking', href: `${opportunityBasePath}/opportunity-tracking` },
  { id: 'deal-qualification', label: 'Deal Qualification', href: `${opportunityBasePath}/deal-qualification` },
  { id: 'pipeline-management', label: 'Pipeline Management', href: `${opportunityBasePath}/pipeline-management` },
  { id: 'deal-updates', label: 'Deal Updates', href: `${opportunityBasePath}/deal-updates` },
  { id: 'follow-ups', label: 'Follow-ups', href: `${opportunityBasePath}/follow-ups` },
  { id: 'activity', label: 'Activity', href: `${opportunityBasePath}/activity` },
] as const;

export const opportunityProspects = salesLeads;
export const opportunityToday = (() => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
})();
const offsetDate = (offset: number) => {
  const date = new Date(`${opportunityToday}T12:00:00`);
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export interface SalesOpportunity {
  id: string;
  prospectId: string;
  name: string;
  product: string;
  value: number;
  probability: number;
  stage: OpportunityStage;
  closeDate: string;
  owner: string;
  priority: DealPriority;
  lastActivity: string;
  nextAction: string;
  budget: string;
  businessNeed: string;
  decisionMaker: string;
  timeline: string;
  productFit: number;
  qualificationScore: number;
  qualificationStatus: QualificationStatus;
  notes: string;
}

export interface OpportunityFollowUp {
  id: string;
  opportunityId: string;
  type: FollowUpType;
  dueDate: string;
  priority: DealPriority;
  owner: string;
  status: FollowUpStatus;
  nextAction: string;
}

export interface OpportunityActivity {
  id: string;
  opportunityId: string;
  type: OpportunityActivityType;
  description: string;
  timestamp: string;
}

export const initialOpportunities: SalesOpportunity[] = [
  { id: 'opp-2001', prospectId: 'l-1001', name: 'Patient outreach automation', product: 'Revenue Intelligence', value: 96000, probability: 70, stage: 'Proposal', closeDate: offsetDate(18), owner: 'Jordan Lee', priority: 'High', lastActivity: 'Proposal shared · Today', nextAction: 'Review workflow proposal', budget: '$80k–$120k', businessNeed: 'Automate patient outreach across regional care teams', decisionMaker: 'Yes · VP Operations', timeline: '0–3 months', productFit: 91, qualificationScore: 91, qualificationStatus: 'Qualified', notes: 'VP-level sponsor is engaged. Review security requirements and phased rollout.' },
  { id: 'opp-2002', prospectId: 'l-1002', name: 'Commerce conversion suite', product: 'Customer Data Platform', value: 72000, probability: 55, stage: 'Negotiation', closeDate: offsetDate(24), owner: 'Amara Okafor', priority: 'High', lastActivity: 'Commercial review · Yesterday', nextAction: 'Align on annual terms', budget: '$50k–$80k', businessNeed: 'Improve lead conversion before the holiday peak', decisionMaker: 'Yes · Director Growth', timeline: '3–6 months', productFit: 84, qualificationScore: 84, qualificationStatus: 'Qualified', notes: 'Comparing implementation options; confirm data onboarding scope.' },
  { id: 'opp-2003', prospectId: 'l-1003', name: 'Enrollment pipeline modernization', product: 'Workflow Automation', value: 44000, probability: 45, stage: 'Qualified', closeDate: offsetDate(35), owner: 'Jordan Lee', priority: 'Medium', lastActivity: 'Discovery completed · Oct 5', nextAction: 'Share tailored product demo', budget: '$30k–$50k', businessNeed: 'Centralize enrollment pipeline across online programs', decisionMaker: 'Influencer · VP Enrollment', timeline: '3–6 months', productFit: 78, qualificationScore: 76, qualificationStatus: 'Qualified', notes: 'Needs integrations review with operations stakeholders.' },
  { id: 'opp-2004', prospectId: 'l-1004', name: 'Enterprise sales-cycle acceleration', product: 'Revenue Intelligence', value: 128000, probability: 30, stage: 'Discovery', closeDate: offsetDate(56), owner: 'Jordan Lee', priority: 'Medium', lastActivity: 'Enterprise report downloaded · Oct 2', nextAction: 'Book technical discovery', budget: '$100k–$150k', businessNeed: 'Shorten enterprise sales cycle across a distributed team', decisionMaker: 'Yes · Sales Director', timeline: '6–12 months', productFit: 73, qualificationScore: 67, qualificationStatus: 'Needs Review', notes: 'Large potential value; validate purchasing process and implementation timeline.' },
  { id: 'opp-2005', prospectId: 'l-1005', name: 'Account intelligence expansion', product: 'Customer Data Platform', value: 28000, probability: 20, stage: 'New Opportunity', closeDate: offsetDate(73), owner: 'Amara Okafor', priority: 'Low', lastActivity: 'Webinar attended · Oct 3', nextAction: 'Confirm evaluation criteria', budget: '$10k–$25k', businessNeed: 'Improve account research and data quality', decisionMaker: 'Unknown · Operations Manager', timeline: '6–12 months', productFit: 59, qualificationScore: 52, qualificationStatus: 'Needs Review', notes: 'Early exploration; needs stronger buying signal and budget confirmation.' },
  { id: 'opp-2006', prospectId: 'l-1006', name: 'Distributed workflow automation', product: 'Workflow Automation', value: 36000, probability: 15, stage: 'New Opportunity', closeDate: offsetDate(94), owner: 'Amara Okafor', priority: 'Low', lastActivity: 'Automation guide requested · Oct 1', nextAction: 'Revisit after planning cycle', budget: 'Not confirmed', businessNeed: 'Explore workflow automation for a distributed team', decisionMaker: 'No · Business Development', timeline: '12+ months', productFit: 61, qualificationScore: 38, qualificationStatus: 'Needs Review', notes: 'Nurture until planning cycle; find an executive sponsor.' },
  { id: 'opp-2007', prospectId: 'l-1001', name: 'Patient engagement insights pilot', product: 'Customer Data Platform', value: 58000, probability: 100, stage: 'Won', closeDate: offsetDate(-8), owner: 'Jordan Lee', priority: 'Medium', lastActivity: 'Contract signed · Sep 28', nextAction: 'Coordinate customer onboarding', budget: '$50k–$80k', businessNeed: 'Unify patient engagement insights across regions', decisionMaker: 'Yes · VP Operations', timeline: 'Closed', productFit: 92, qualificationScore: 94, qualificationStatus: 'Qualified', notes: 'Closed-won pilot. Handoff to customer success completed.' },
  { id: 'opp-2008', prospectId: 'l-1002', name: 'Commerce forecasting pilot', product: 'Revenue Intelligence', value: 41000, probability: 0, stage: 'Lost', closeDate: offsetDate(-14), owner: 'Amara Okafor', priority: 'Low', lastActivity: 'Decision deferred · Sep 22', nextAction: 'Revisit next fiscal year', budget: '$30k–$50k', businessNeed: 'Improve forecast accuracy across commerce regions', decisionMaker: 'Yes · Director Growth', timeline: 'Deferred', productFit: 71, qualificationScore: 70, qualificationStatus: 'Disqualified', notes: 'Prospect deferred purchase until next fiscal year.' },
];

export const initialFollowUps: OpportunityFollowUp[] = [
  { id: 'ofu-1', opportunityId: 'opp-2001', type: 'Demo', dueDate: opportunityToday, priority: 'High', owner: 'Jordan Lee', status: 'Upcoming', nextAction: 'Walk through patient outreach proposal' },
  { id: 'ofu-2', opportunityId: 'opp-2002', type: 'Call', dueDate: offsetDate(-1), priority: 'High', owner: 'Amara Okafor', status: 'Overdue', nextAction: 'Discuss annual contract terms' },
  { id: 'ofu-3', opportunityId: 'opp-2003', type: 'Email', dueDate: offsetDate(1), priority: 'Medium', owner: 'Jordan Lee', status: 'Upcoming', nextAction: 'Send tailored demo recap' },
  { id: 'ofu-4', opportunityId: 'opp-2004', type: 'Meeting', dueDate: offsetDate(3), priority: 'Medium', owner: 'Jordan Lee', status: 'Upcoming', nextAction: 'Coordinate technical discovery' },
  { id: 'ofu-5', opportunityId: 'opp-2005', type: 'Reminder', dueDate: offsetDate(-3), priority: 'Low', owner: 'Amara Okafor', status: 'Completed', nextAction: 'Share webinar recording' },
];

export const initialOpportunityActivities: OpportunityActivity[] = [
  { id: 'oa-1', opportunityId: 'opp-2001', type: 'Deal update', description: 'Proposal shared with operations leadership.', timestamp: `${opportunityToday}T10:18:00` },
  { id: 'oa-2', opportunityId: 'opp-2002', type: 'Meeting', description: 'Commercial review held; annual terms are under discussion.', timestamp: `${opportunityToday}T09:15:00` },
  { id: 'oa-3', opportunityId: 'opp-2003', type: 'Stage change', description: 'Opportunity moved to Qualified after discovery.', timestamp: `${opportunityToday}T08:40:00` },
  { id: 'oa-4', opportunityId: 'opp-2004', type: 'Email', description: 'Enterprise sales-cycle report reviewed by the prospect.', timestamp: `${opportunityToday}T08:10:00` },
  { id: 'oa-5', opportunityId: 'opp-2005', type: 'Follow-up', description: 'Account intelligence follow-up added to the pipeline.', timestamp: `${opportunityToday}T07:50:00` },
  { id: 'oa-6', opportunityId: 'opp-2001', type: 'Call', description: 'Discovery call confirmed the need to automate patient outreach.', timestamp: `${opportunityToday}T07:25:00` },
  { id: 'oa-7', opportunityId: 'opp-2007', type: 'Note', description: 'Customer success handoff completed after contract signature.', timestamp: `${opportunityToday}T06:20:00` },
];

export function opportunityLead(prospectId: string) {
  return opportunityProspects.find((lead) => lead.id === prospectId) ?? opportunityProspects[0];
}

export function currency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export function displayDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
