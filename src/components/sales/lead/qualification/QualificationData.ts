import { salesLeads } from '../../SalesData';
import type { SalesLead } from '../../SalesData';

export type IntentLevel = 'High' | 'Medium' | 'Low';
export type QualificationResult = 'Qualified' | 'Needs Review' | 'Unqualified';

export interface QualificationSignals {
  researchStatus: 'Researched' | 'In review' | 'Needs research';
  intent: string;
  intentLevel: IntentLevel;
  confidence: number;
  recentActivity: string;
  recommendedAction: string;
  result: QualificationResult;
  reason: string;
  reviewDate: string;
}

export type QualificationLead = SalesLead & QualificationSignals;

const leadSignals: Record<string, QualificationSignals> = {
  'l-1001': {
    researchStatus: 'Researched',
    intent: 'Evaluating patient engagement automation',
    intentLevel: 'High',
    confidence: 94,
    recentActivity: 'Viewed workflow automation guide · 12 min ago',
    recommendedAction: 'Schedule a discovery call',
    result: 'Qualified',
    reason: 'Strong company fit, confirmed budget, and near-term project.',
    reviewDate: 'Oct 06, 2026',
  },
  'l-1002': {
    researchStatus: 'Researched',
    intent: 'Comparing lead conversion platforms',
    intentLevel: 'High',
    confidence: 89,
    recentActivity: 'Requested a product walkthrough · 1 hr ago',
    recommendedAction: 'Share a tailored product demo',
    result: 'Qualified',
    reason: 'Decision maker with an active evaluation and defined use case.',
    reviewDate: 'Oct 06, 2026',
  },
  'l-1003': {
    researchStatus: 'In review',
    intent: 'Exploring enrollment workflow solutions',
    intentLevel: 'Medium',
    confidence: 77,
    recentActivity: 'Revisited enrollment case study · 3 hrs ago',
    recommendedAction: 'Confirm buying timeline',
    result: 'Qualified',
    reason: 'Good account fit and clear need; timeline is still developing.',
    reviewDate: 'Oct 05, 2026',
  },
  'l-1004': {
    researchStatus: 'In review',
    intent: 'Researching enterprise sales automation',
    intentLevel: 'Medium',
    confidence: 68,
    recentActivity: 'Attended enterprise workflow webinar · Yesterday',
    recommendedAction: 'Follow up with a discovery question',
    result: 'Needs Review',
    reason: 'Strong fit, but project timing and budget require confirmation.',
    reviewDate: 'Oct 05, 2026',
  },
  'l-1005': {
    researchStatus: 'Needs research',
    intent: 'Browsing account research resources',
    intentLevel: 'Low',
    confidence: 54,
    recentActivity: 'Opened account research overview · 2 days ago',
    recommendedAction: 'Enrich account profile',
    result: 'Needs Review',
    reason: 'Some engagement, but budget and decision authority are unknown.',
    reviewDate: 'Oct 04, 2026',
  },
  'l-1006': {
    researchStatus: 'Researched',
    intent: 'Early exploration of workflow automation',
    intentLevel: 'Low',
    confidence: 43,
    recentActivity: 'Downloaded automation checklist · 4 days ago',
    recommendedAction: 'Add to a long-term nurture sequence',
    result: 'Unqualified',
    reason: 'No near-term timeline and limited engagement signals.',
    reviewDate: 'Oct 03, 2026',
  },
};

export const qualificationLeads: QualificationLead[] = salesLeads.map((lead) => {
  const signals = leadSignals[lead.id];
  if (!signals) throw new Error(`Missing qualification sample data for lead "${lead.id}"`);
  return { ...lead, ...signals };
});

export const qualificationCriteria = [
  { id: 'company-fit', name: 'Company Fit', weight: 25, description: 'Industry, size, and ideal customer profile' },
  { id: 'budget', name: 'Budget', weight: 20, description: 'Funding and commercial readiness' },
  { id: 'business-need', name: 'Business Need', weight: 20, description: 'Clarity and urgency of the use case' },
  { id: 'buying-timeline', name: 'Buying Timeline', weight: 15, description: 'Expected decision and implementation date' },
  { id: 'decision-maker', name: 'Decision Maker', weight: 10, description: 'Access to the buyer or buying committee' },
  { id: 'engagement', name: 'Engagement Level', weight: 10, description: 'Recent interactions and product interest' },
] as const;

export type QualificationActivityType = 'Call' | 'Email' | 'Meeting' | 'Follow-up' | 'Qualification' | 'Score update' | 'Intent update';

export interface QualificationActivity {
  id: string;
  type: QualificationActivityType;
  lead: string;
  company: string;
  description: string;
  owner: string;
  date: string;
  time: string;
}

export const qualificationActivities: QualificationActivity[] = [
  { id: 'qa-1', type: 'Call', lead: 'Maya Patel', company: 'Northstar Health', description: 'Confirmed the team is evaluating patient outreach automation this quarter.', owner: 'Jordan Lee', date: 'Oct 06, 2026', time: '10:24 AM' },
  { id: 'qa-2', type: 'Qualification', lead: 'Ethan Brooks', company: 'Vertex Commerce', description: 'Qualification review completed; budget and decision authority confirmed.', owner: 'Amara Okafor', date: 'Oct 06, 2026', time: '9:52 AM' },
  { id: 'qa-3', type: 'Email', lead: 'Sofia Chen', company: 'Brightpath Learning', description: 'Sent follow-up questions to clarify enrollment workflow requirements.', owner: 'Jordan Lee', date: 'Oct 06, 2026', time: '9:20 AM' },
  { id: 'qa-4', type: 'Intent update', lead: 'Maya Patel', company: 'Northstar Health', description: 'High-intent signal detected after multiple visits to the automation guide.', owner: 'Rollo AI', date: 'Oct 05, 2026', time: '4:18 PM' },
  { id: 'qa-5', type: 'Meeting', lead: 'Noah Williams', company: 'Apex Industrial', description: 'Discovery session scheduled to validate timeline and project budget.', owner: 'Jordan Lee', date: 'Oct 05, 2026', time: '2:40 PM' },
  { id: 'qa-6', type: 'Score update', lead: 'Ethan Brooks', company: 'Vertex Commerce', description: 'Total qualification score increased to 84 after the latest product interaction.', owner: 'Rollo AI', date: 'Oct 05, 2026', time: '11:06 AM' },
  { id: 'qa-7', type: 'Follow-up', lead: 'Isabella Garcia', company: 'Summit Financial', description: 'Follow-up assigned to confirm budget range and decision process.', owner: 'Sales team', date: 'Oct 04, 2026', time: '3:32 PM' },
];
