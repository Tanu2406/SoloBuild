import React from 'react';
import { useParams } from 'react-router-dom';

const destinationNames: Record<string, string> = {
  'talent-acquisition': 'Talent Acquisition',
  'employee-onboarding': 'Employee Onboarding',
  'learning-development': 'Learning & Development',
  'performance-reviews': 'Performance & Reviews',
  'payroll-benefits': 'Payroll & Benefits',
  'employee-support': 'Employee Support',
  offboarding: 'Offboarding',
  'lead-management': 'Lead Management',
  'lead-qualification': 'Lead Qualification',
  'sales-outreach': 'Sales Outreach',
  'meeting-scheduling': 'Meeting & Scheduling',
  'opportunity-management': 'Opportunity Management',
  'sales-analytics': 'Sales Analytics',
  'support-workflow': 'Ticket Management',
  'ticket-management': 'Ticket Management',
  'agent-assist': 'Agent Assist',
  'knowledge-resolution': 'Knowledge & Resolution',
  escalation: 'Escalation',
  'customer-communication': 'Customer Communication',
  'support-analytics': 'Support Analytics',
  'it-support': 'IT Support',
  'service-operations': 'Service Operations',
  'email-automation': 'Email Automation',
  'new-hires': 'New Hires',
  documents: 'Documents',
  'account-setup': 'Account Setup',
  'it-setup': 'IT Setup',
  orientation: 'Orientation',
  'learning-plans': 'Learning Plans',
  'skill-gaps': 'Skill Gaps',
  courses: 'Courses',
  training: 'Training',
  evaluations: 'Evaluations',
  goals: 'Goals',
  feedback: 'Feedback',
  sentiment: 'Sentiment',
  'development-plans': 'Development Plans',
  payroll: 'Payroll',
  'salary-tax': 'Salary & Tax',
  benefits: 'Benefits',
  payslips: 'Payslips',
  'leave-attendance': 'Leave & Attendance',
  'hr-queries': 'HR Queries',
  'policies-faqs': 'Policies & FAQs',
  leave: 'Leave',
  attendance: 'Attendance',
  'payroll-support': 'Payroll Support',
  'exit-requests': 'Exit Requests',
  'knowledge-transfer': 'Knowledge Transfer',
  'access-revocation': 'Access Revocation',
  'asset-return': 'Asset Return',
  'exit-interviews': 'Exit Interviews',
  'lead-research': 'Lead Research',
  'lead-enrichment': 'Lead Enrichment',
  'lead-scoring': 'Lead Scoring',
  'lead-assignment': 'Lead Assignment',
  'qualification-criteria': 'Qualification Criteria',
  'intent-detection': 'Intent Detection',
  'qualification-results': 'Qualification Results',
  'personalized-outreach': 'Personalized Outreach',
  'email-campaigns': 'Email Campaigns',
  'follow-ups': 'Follow-ups',
  'meeting-booking': 'Meeting Booking',
  'meeting-requests': 'Meeting Requests',
  availability: 'Availability',
  scheduling: 'Scheduling',
  rescheduling: 'Rescheduling',
  reminders: 'Reminders',
  'opportunity-tracking': 'Opportunity Tracking',
  'deal-qualification': 'Deal Qualification',
  'pipeline-management': 'Pipeline Management',
  'deal-updates': 'Deal Updates',
  'sales-dashboard': 'Sales Dashboard',
  'pipeline-analytics': 'Pipeline Analytics',
  'conversion-analytics': 'Conversion Analytics',
  'revenue-insights': 'Revenue Insights',
  forecasting: 'Forecasting',
  'ticket-creation': 'Ticket Creation',
  'ticket-classification': 'Ticket Classification',
  'priority-routing': 'Priority & Routing',
  'ticket-assignment': 'Ticket Assignment',
  'sla-management': 'SLA Management',
  'resolution-tracking': 'Resolution Tracking',
  'ticket-context': 'Ticket Context',
  'suggested-responses': 'Suggested Responses',
  'customer-information': 'Customer Information',
  'next-best-action': 'Next Best Action',
  'agent-guidance': 'Agent Guidance',
  'knowledge-search': 'Knowledge Search',
  'answer-generation': 'Answer Generation',
  'resolution-suggestions': 'Resolution Suggestions',
  'article-recommendations': 'Article Recommendations',
  'case-resolution': 'Case Resolution',
  'escalation-detection': 'Escalation Detection',
  'priority-management': 'Priority Management',
  'human-handoff': 'Human Handoff',
  'case-routing': 'Case Routing',
  'escalation-tracking': 'Escalation Tracking',
  'email-responses': 'Email Responses',
  'chat-responses': 'Chat Responses',
  'customer-updates': 'Customer Updates',
  notifications: 'Notifications',
  'support-dashboard': 'Support Dashboard',
  'ticket-analytics': 'Ticket Analytics',
  'resolution-analytics': 'Resolution Analytics',
  'response-time': 'Response Time',
  'customer-insights': 'Customer Insights',
  'it-requests': 'IT Requests',
  'incident-management': 'Incident Management',
  troubleshooting: 'Troubleshooting',
  'device-support': 'Device Support',
  'access-requests': 'Access Requests',
  'service-requests': 'Service Requests',
  'incident-tracking': 'Incident Tracking',
  'workflow-automation': 'Workflow Automation',
  approvals: 'Approvals',
  'service-monitoring': 'Service Monitoring',
  'email-classification': 'Email Classification',
  'email-drafting': 'Email Drafting',
  'email-routing': 'Email Routing',
  'response-automation': 'Response Automation',
  activity: 'Activity',
};

function formatName(value: string | undefined) {
  if (!value) return 'Solution';
  return destinationNames[value] ?? value.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export const SolutionDestination: React.FC = () => {
  const { group, solution, context, item } = useParams();
  const title = formatName(item ?? solution ?? context);
  const parent = formatName(solution ?? group ?? context);

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header__text">
          <h1 className="page-header__title">{title}</h1>
          <p className="page-header__subtitle">{parent}</p>
        </div>
      </div>
      <section className="solution-destination" aria-label={`${title} page`}>
        <h2>{title}</h2>
        <p>This solution destination is available, but its workflow is not connected in this application.</p>
      </section>
    </div>
  );
};

