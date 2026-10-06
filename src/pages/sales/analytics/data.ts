import { salesActivities, salesLeads } from '../../../components/sales/SalesData';
import { outreachActivities } from '../outreach/data';
import { initialMeetings } from '../meeting/scheduling/data';
import { initialOpportunities, opportunityStages, type SalesOpportunity } from '../opportunities/data';

export const analyticsBasePath = '/coming-soon/sales-analytics';

export const analyticsNavigation = [
  { id: 'sales-dashboard', label: 'Sales Dashboard', href: `${analyticsBasePath}/sales-dashboard` },
  { id: 'pipeline-analytics', label: 'Pipeline Analytics', href: `${analyticsBasePath}/pipeline-analytics` },
  { id: 'conversion-analytics', label: 'Conversion Analytics', href: `${analyticsBasePath}/conversion-analytics` },
  { id: 'revenue-insights', label: 'Revenue Insights', href: `${analyticsBasePath}/revenue-insights` },
  { id: 'forecasting', label: 'Forecasting', href: `${analyticsBasePath}/forecasting` },
  { id: 'activity', label: 'Activity', href: `${analyticsBasePath}/activity` },
] as const;

const qualifiedLeadCount = salesLeads.filter((lead) => lead.qualificationScore >= 65).length;
const outreachLeadCount = new Set(outreachActivities.filter((item) => ['Email', 'Call'].includes(item.type)).map((item) => item.prospectId)).size;
const meetingLeadCount = new Set(initialMeetings.filter((meeting) => meeting.status !== 'Cancelled').map((meeting) => meeting.prospectId)).size;
const opportunityLeadCount = new Set(initialOpportunities.map((deal) => deal.prospectId)).size;
const funnelOutreachCount = Math.min(qualifiedLeadCount, outreachLeadCount);
const funnelMeetingCount = Math.min(funnelOutreachCount, meetingLeadCount);
const funnelOpportunityCount = Math.min(funnelMeetingCount, opportunityLeadCount);
const funnelWonCount = Math.min(funnelOpportunityCount, initialOpportunities.filter((deal) => deal.stage === 'Won').length);

export const funnelStages = [
  { label: 'Leads', count: salesLeads.length, color: '#2563eb' },
  { label: 'Qualified Leads', count: qualifiedLeadCount, color: '#4f46e5' },
  { label: 'Outreach', count: funnelOutreachCount, color: '#7c3aed' },
  { label: 'Meetings', count: funnelMeetingCount, color: '#0891b2' },
  { label: 'Opportunities', count: funnelOpportunityCount, color: '#0284c7' },
  { label: 'Won Deals', count: funnelWonCount, color: '#16a34a' },
];

export const performanceTimeSeries = {
  '7 Days': [
    { label: 'Mon', revenue: 18, won: 2, created: 4, conversion: 18 },
    { label: 'Tue', revenue: 22, won: 3, created: 5, conversion: 22 },
    { label: 'Wed', revenue: 16, won: 1, created: 3, conversion: 17 },
    { label: 'Thu', revenue: 29, won: 4, created: 6, conversion: 25 },
    { label: 'Fri', revenue: 24, won: 3, created: 5, conversion: 23 },
    { label: 'Sat', revenue: 12, won: 1, created: 2, conversion: 14 },
    { label: 'Sun', revenue: 20, won: 2, created: 4, conversion: 20 },
  ],
  '30 Days': [
    { label: 'Wk 1', revenue: 92, won: 7, created: 14, conversion: 21 },
    { label: 'Wk 2', revenue: 116, won: 9, created: 18, conversion: 24 },
    { label: 'Wk 3', revenue: 104, won: 8, created: 16, conversion: 22 },
    { label: 'Wk 4', revenue: 138, won: 11, created: 21, conversion: 27 },
  ],
  '90 Days': [
    { label: 'Aug', revenue: 310, won: 24, created: 44, conversion: 20 },
    { label: 'Sep', revenue: 352, won: 29, created: 51, conversion: 23 },
    { label: 'Oct', revenue: 418, won: 34, created: 62, conversion: 27 },
  ],
  'This Year': [
    { label: 'Jan', revenue: 184, won: 14, created: 28, conversion: 18 },
    { label: 'Feb', revenue: 205, won: 17, created: 33, conversion: 20 },
    { label: 'Mar', revenue: 231, won: 19, created: 36, conversion: 21 },
    { label: 'Apr', revenue: 248, won: 20, created: 40, conversion: 22 },
    { label: 'May', revenue: 276, won: 22, created: 42, conversion: 23 },
    { label: 'Jun', revenue: 294, won: 23, created: 46, conversion: 22 },
    { label: 'Jul', revenue: 310, won: 24, created: 44, conversion: 24 },
    { label: 'Aug', revenue: 310, won: 24, created: 44, conversion: 20 },
    { label: 'Sep', revenue: 352, won: 29, created: 51, conversion: 23 },
    { label: 'Oct', revenue: 418, won: 34, created: 62, conversion: 27 },
  ],
} as const;

export type PerformanceRange = keyof typeof performanceTimeSeries;
export type PerformanceMetric = 'Revenue' | 'Deals Won' | 'Deals Created' | 'Conversion Rate';

export const stageLabels = opportunityStages.map((stage) => stage.replace(' Opportunity', ''));
export const pipelineProgression = [62, 54, 48, 34, 52, 100, 0];
export const pipelineStageProbability = [12, 25, 40, 60, 82, 100, 0];

export const monthlyRevenueTrend = [
  { label: 'May', revenue: 276, expected: 295 },
  { label: 'Jun', revenue: 294, expected: 322 },
  { label: 'Jul', revenue: 310, expected: 345 },
  { label: 'Aug', revenue: 310, expected: 372 },
  { label: 'Sep', revenue: 352, expected: 399 },
  { label: 'Oct', revenue: 418, expected: 444 },
  { label: 'Nov', revenue: 0, expected: 486 },
  { label: 'Dec', revenue: 0, expected: 532 },
];

export interface AnalyticsActivity {
  id: string;
  type: string;
  description: string;
  company: string;
  owner: string;
  timestamp: string;
}

export const demoAnalyticsActivities: AnalyticsActivity[] = [
  ...salesActivities.map((item) => ({
    id: `sales-${item.id}`,
    type: item.type,
    description: item.description,
    company: item.company,
    owner: item.owner,
    timestamp: `${item.date} · ${item.time}`,
  })),
  ...outreachActivities.map((item) => {
    const lead = salesLeads.find((candidate) => candidate.id === item.prospectId);
    return {
      id: `outreach-${item.id}`,
      type: item.type,
      description: `${item.action}: ${item.detail}`,
      company: lead?.company ?? 'Sales account',
      owner: lead?.salesRep ?? 'Sales team',
      timestamp: item.when,
    };
  }),
];

export function currency(value: number, compact = false) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: 0,
  }).format(value);
}

export function dateLabel(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function derivePipeline(opportunities: SalesOpportunity[]) {
  return opportunityStages.map((stage, index) => {
    const deals = opportunities.filter((deal) => deal.stage === stage);
    const value = deals.reduce((sum, deal) => sum + deal.value, 0);
    const active = deals.filter((deal) => !['Won', 'Lost'].includes(deal.stage));
    const probability = deals.length ? Math.round(deals.reduce((sum, deal) => sum + deal.probability, 0) / deals.length) : pipelineStageProbability[index];
    return {
      stage,
      count: deals.length,
      value,
      average: deals.length ? Math.round(value / deals.length) : 0,
      probability,
      progression: pipelineProgression[index],
      weighted: active.reduce((sum, deal) => sum + deal.value * deal.probability / 100, 0),
    };
  });
}

export function deriveProductRevenue(opportunities: SalesOpportunity[]) {
  const products = [...new Set(opportunities.map((deal) => deal.product))];
  return products.map((product, index) => {
    const deals = opportunities.filter((deal) => deal.product === product);
    const won = deals.filter((deal) => deal.stage === 'Won');
    const revenue = won.reduce((sum, deal) => sum + deal.value, 0);
    return {
      product,
      deals: deals.length,
      revenue,
      average: deals.length ? Math.round(deals.reduce((sum, deal) => sum + deal.value, 0) / deals.length) : 0,
      growth: [18, 24, 13][index % 3],
      conversion: deals.length ? Math.round(won.length / deals.length * 100) : 0,
    };
  }).sort((a, b) => b.revenue - a.revenue);
}

export function deriveRepPerformance(opportunities: SalesOpportunity[]) {
  const reps = [...new Set(opportunities.map((deal) => deal.owner))];
  return reps.map((owner) => {
    const deals = opportunities.filter((deal) => deal.owner === owner);
    const won = deals.filter((deal) => deal.stage === 'Won');
    const revenue = won.reduce((sum, deal) => sum + deal.value, 0);
    return {
      owner,
      opportunities: deals.length,
      won: won.length,
      revenue,
      winRate: deals.length ? Math.round(won.length / deals.length * 100) : 0,
      calls: owner === 'Jordan Lee' ? 18 : 15,
      emails: owner === 'Jordan Lee' ? 32 : 28,
      meetings: owner === 'Jordan Lee' ? 11 : 9,
      followUps: owner === 'Jordan Lee' ? 14 : 12,
    };
  }).sort((a, b) => b.revenue - a.revenue);
}

export function deriveSources(opportunities: SalesOpportunity[]) {
  const sourceNames = ['Website', 'Referral', 'LinkedIn', 'Email', 'Campaign', 'Direct'];
  const productForSource = ['Revenue Intelligence', 'Workflow Automation', 'Customer Data Platform', 'Revenue Intelligence', 'Workflow Automation', 'Customer Data Platform'];
  return sourceNames.map((source, index) => {
    const lead = salesLeads[index % salesLeads.length];
    const leads = salesLeads.filter((item) => item.source.toLowerCase().includes(source.toLowerCase()) || (index > 2 && item.source.toLowerCase().includes(['outbound', 'webinar', 'trade show'][index - 3] ?? '')));
    const count = leads.length || [28, 22, 19, 17, 14, 11][index];
    const qualified = Math.round(count * [0.61, 0.68, 0.52, 0.48, 0.57, 0.42][index]);
    const linked = opportunities.filter((deal) => deal.product === productForSource[index]);
    const won = linked.filter((deal) => deal.stage === 'Won').length;
    const opps = linked.length || Math.max(1, Math.round(qualified * 0.32));
    return {
      source,
      leads: count,
      qualified,
      opportunities: opps,
      won,
      conversion: Math.round(won / count * 100),
      contact: lead.name,
    };
  });
}

export function stageForOpportunity(deal: SalesOpportunity) {
  return deal.stage.replace(' Opportunity', '');
}
