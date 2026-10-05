export interface SalesLead extends Record<string, string | number | undefined> {
  id: string;
  name: string;
  company: string;
  industry: string;
  location: string;
  source: string;
  contact: string;
  status: string;
  email: string;
  phone: string;
  companySize: string;
  qualificationScore: number;
  budget: string;
  businessNeed: string;
  buyingTimeline: string;
  decisionMaker: string;
  engagementScore: number;
  intentScore: number;
  companyFit: number;
  totalScore: number;
  category: 'Hot' | 'Warm' | 'Cold';
  salesRep: string;
  assignmentStatus: string;
  priority: 'High' | 'Medium' | 'Low';
  assignedDate: string;
}

export const salesLeads: SalesLead[] = [
  {
    id: 'l-1001', name: 'Maya Patel', company: 'Northstar Health', industry: 'Healthcare',
    location: 'Austin, TX', source: 'Website', contact: 'maya.patel@northstarhealth.com',
    status: 'New', email: 'maya.patel@northstarhealth.com', phone: '+1 (512) 555-0184',
    companySize: '500–1,000', qualificationScore: 92, budget: '$80k–$120k',
    businessNeed: 'Automate patient outreach', buyingTimeline: '0–3 months',
    decisionMaker: 'Yes', engagementScore: 94, intentScore: 91, companyFit: 88,
    totalScore: 91, category: 'Hot', salesRep: 'Jordan Lee', assignmentStatus: 'Assigned',
    priority: 'High', assignedDate: 'Oct 02, 2026',
  },
  {
    id: 'l-1002', name: 'Ethan Brooks', company: 'Vertex Commerce', industry: 'Retail',
    location: 'New York, NY', source: 'LinkedIn', contact: 'ethan@vertexcommerce.com',
    status: 'Contacted', email: 'ethan@vertexcommerce.com', phone: '+1 (212) 555-0140',
    companySize: '1,000–5,000', qualificationScore: 84, budget: '$50k–$80k',
    businessNeed: 'Improve lead conversion', buyingTimeline: '3–6 months',
    decisionMaker: 'Yes', engagementScore: 82, intentScore: 78, companyFit: 90,
    totalScore: 84, category: 'Hot', salesRep: 'Amara Okafor', assignmentStatus: 'Assigned',
    priority: 'High', assignedDate: 'Oct 01, 2026',
  },
  {
    id: 'l-1003', name: 'Sofia Chen', company: 'Brightpath Learning', industry: 'Education',
    location: 'Seattle, WA', source: 'Partner referral', contact: 'sofia@brightpath.edu',
    status: 'Qualified', email: 'sofia@brightpath.edu', phone: '+1 (206) 555-0117',
    companySize: '200–500', qualificationScore: 77, budget: '$30k–$50k',
    businessNeed: 'Centralize enrollment pipeline', buyingTimeline: '3–6 months',
    decisionMaker: 'Influencer', engagementScore: 71, intentScore: 74, companyFit: 82,
    totalScore: 76, category: 'Warm', salesRep: 'Jordan Lee', assignmentStatus: 'Assigned',
    priority: 'Medium', assignedDate: 'Sep 30, 2026',
  },
  {
    id: 'l-1004', name: 'Noah Williams', company: 'Apex Industrial', industry: 'Manufacturing',
    location: 'Chicago, IL', source: 'Webinar', contact: 'noah.w@apexindustrial.com',
    status: 'Researching', email: 'noah.w@apexindustrial.com', phone: '+1 (312) 555-0163',
    companySize: '1,000–5,000', qualificationScore: 69, budget: '$20k–$40k',
    businessNeed: 'Shorten enterprise sales cycle', buyingTimeline: '6–12 months',
    decisionMaker: 'Yes', engagementScore: 63, intentScore: 58, companyFit: 79,
    totalScore: 67, category: 'Warm', salesRep: 'Unassigned', assignmentStatus: 'Unassigned',
    priority: 'Medium', assignedDate: '—',
  },
  {
    id: 'l-1005', name: 'Isabella Garcia', company: 'Summit Financial', industry: 'Financial Services',
    location: 'Denver, CO', source: 'Outbound', contact: 'isabella@summitfinancial.io',
    status: 'New', email: 'isabella@summitfinancial.io', phone: '+1 (303) 555-0195',
    companySize: '500–1,000', qualificationScore: 54, budget: '$10k–$25k',
    businessNeed: 'Improve account research', buyingTimeline: '6–12 months',
    decisionMaker: 'Unknown', engagementScore: 48, intentScore: 39, companyFit: 70,
    totalScore: 52, category: 'Warm', salesRep: 'Unassigned', assignmentStatus: 'Unassigned',
    priority: 'Low', assignedDate: '—',
  },
  {
    id: 'l-1006', name: 'Liam Thompson', company: 'Evergreen Energy', industry: 'Energy',
    location: 'Portland, OR', source: 'Trade show', contact: 'liam.t@evergreenenergy.com',
    status: 'Nurturing', email: 'liam.t@evergreenenergy.com', phone: '+1 (503) 555-0131',
    companySize: '200–500', qualificationScore: 36, budget: 'Not confirmed',
    businessNeed: 'Explore workflow automation', buyingTimeline: '12+ months',
    decisionMaker: 'No', engagementScore: 31, intentScore: 25, companyFit: 58,
    totalScore: 38, category: 'Cold', salesRep: 'Amara Okafor', assignmentStatus: 'Assigned',
    priority: 'Low', assignedDate: 'Sep 28, 2026',
  },
];

export interface SalesActivity {
  id: string;
  type: 'Call' | 'Email' | 'Meeting' | 'Follow-up' | 'Lead update' | 'Qualification' | 'Score update';
  lead: string;
  company: string;
  description: string;
  owner: string;
  date: string;
  time: string;
}

export const salesActivities: SalesActivity[] = [
  { id: 'a-1', type: 'Call', lead: 'Maya Patel', company: 'Northstar Health', description: 'Discovery call completed; confirmed automation priorities.', owner: 'Jordan Lee', date: 'Oct 06, 2026', time: '10:24 AM' },
  { id: 'a-2', type: 'Email', lead: 'Ethan Brooks', company: 'Vertex Commerce', description: 'Sent product overview and conversion case study.', owner: 'Amara Okafor', date: 'Oct 06, 2026', time: '9:40 AM' },
  { id: 'a-3', type: 'Meeting', lead: 'Sofia Chen', company: 'Brightpath Learning', description: 'Product walkthrough scheduled for next week.', owner: 'Jordan Lee', date: 'Oct 05, 2026', time: '3:15 PM' },
  { id: 'a-4', type: 'Follow-up', lead: 'Noah Williams', company: 'Apex Industrial', description: 'Follow-up reminder added for the end of the month.', owner: 'Sales team', date: 'Oct 05, 2026', time: '1:05 PM' },
  { id: 'a-5', type: 'Qualification', lead: 'Sofia Chen', company: 'Brightpath Learning', description: 'Lead marked qualified after confirming use case and timeline.', owner: 'Jordan Lee', date: 'Oct 04, 2026', time: '11:32 AM' },
  { id: 'a-6', type: 'Score update', lead: 'Maya Patel', company: 'Northstar Health', description: 'Intent score increased after repeat product visits.', owner: 'System', date: 'Oct 04, 2026', time: '8:18 AM' },
  { id: 'a-7', type: 'Lead update', lead: 'Isabella Garcia', company: 'Summit Financial', description: 'Company profile and contact details reviewed.', owner: 'Sales team', date: 'Oct 03, 2026', time: '4:42 PM' },
];
