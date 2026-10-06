import { useMemo } from 'react';
import { salesLeads } from '../../../components/sales/SalesData';
import { useMeetingStore } from '../meeting/scheduling/store';
import { opportunityLead } from '../opportunities/data';
import { useOpportunityStore } from '../opportunities/store';
import { AnalyticsMetric, AnalyticsPage, AnalyticsPanel, AnalyticsTable, LineChart } from './AnalyticsComponents';
import { demoAnalyticsActivities, performanceTimeSeries } from './data';

function activityGroup(type: string) {
  const value = type.toLowerCase();
  if (value.includes('call')) return 'Call';
  if (value.includes('email')) return 'Email';
  if (value.includes('meeting') || value.includes('schedule') || value.includes('reschedule') || value.includes('request')) return 'Meeting';
  if (value.includes('follow')) return 'Follow-up';
  if (value.includes('demo')) return 'Demo';
  if (value.includes('outreach')) return 'Outreach';
  if (value.includes('deal') || value.includes('stage') || value.includes('qualification')) return 'Deal update';
  return type;
}

export default function ActivityAnalytics() {
  const { opportunities, activities: dealActivities, followUps } = useOpportunityStore();
  const { activities: meetingActivities } = useMeetingStore();
  const allActivities = useMemo(() => {
    const opportunityItems = dealActivities.map((item) => {
      const deal = opportunities.find((candidate) => candidate.id === item.opportunityId);
      const lead = deal ? opportunityLead(deal.prospectId) : undefined;
      return { id: item.id, type: activityGroup(item.type), description: item.description, company: lead?.company ?? 'Sales account', owner: deal?.owner ?? 'Sales team', timestamp: item.timestamp };
    });
    const meetingItems = meetingActivities.map((item) => {
      const lead = salesLeads.find((candidate) => candidate.id === item.prospectId);
      return { id: item.id, type: activityGroup(item.type), description: item.description, company: lead?.company ?? 'Sales account', owner: lead?.salesRep ?? 'Sales team', timestamp: item.timestamp };
    });
    const samples = demoAnalyticsActivities.map((item) => ({ ...item, type: activityGroup(item.type) }));
    return [...opportunityItems, ...meetingItems, ...samples].sort((a, b) => {
      const dateA = Date.parse(a.timestamp);
      const dateB = Date.parse(b.timestamp);
      return Number.isNaN(dateA) || Number.isNaN(dateB) ? 0 : dateB - dateA;
    });
  }, [dealActivities, opportunities, meetingActivities]);
  const count = (type: string) => allActivities.filter((item) => item.type === type).length;
  const owners = [...new Set([...opportunities.map((deal) => deal.owner), ...allActivities.map((item) => item.owner)])];
  const representativeRows = owners.map((owner) => {
    const owned = allActivities.filter((item) => item.owner === owner);
    const ownerDeals = opportunities.filter((deal) => deal.owner === owner);
    return [
      <strong key="owner">{owner}</strong>,
      owned.filter((item) => item.type === 'Call').length,
      owned.filter((item) => item.type === 'Email').length,
      owned.filter((item) => item.type === 'Meeting').length,
      owned.filter((item) => item.type === 'Follow-up').length,
      ownerDeals.length,
      ownerDeals.filter((deal) => deal.stage === 'Won').length,
    ];
  });
  const trendData = performanceTimeSeries['This Year'].map(({ label, won, created }) => ({ label, activities: won * 5 + created * 3 }));
  return <AnalyticsPage title="Activity Analytics" subtitle="Understand how sales actions across the team support pipeline creation and deal outcomes.">
    <section className="analytics-metrics analytics-metrics--five">
      <AnalyticsMetric label="Total Activities" value={allActivities.length + followUps.length} detail="Across tracked sales workflows" trend={11} />
      <AnalyticsMetric label="Calls" value={count('Call')} detail="Logged sales calls" />
      <AnalyticsMetric label="Emails" value={count('Email')} detail="Outreach and follow-up emails" />
      <AnalyticsMetric label="Meetings" value={count('Meeting')} detail="Scheduled and completed" />
      <AnalyticsMetric label="Follow-ups" value={followUps.length + count('Follow-up')} detail="Created and completed" />
    </section>
    <div className="analytics-two-column">
      <AnalyticsPanel title="Activity Trend" subtitle="Demo activity volume by month">
        <LineChart data={trendData} axisFormat="number" series={[{ key: 'activities', label: 'Activities', color: '#2563eb' }]} />
      </AnalyticsPanel>
      <AnalyticsPanel title="Activity Mix" subtitle="Actions recorded across the sales workflow">
        <div className="analytics-activity-mix">{[
          ['Calls', count('Call'), '#2563eb'],
          ['Emails', count('Email'), '#8b5cf6'],
          ['Meetings', count('Meeting'), '#10b981'],
          ['Follow-ups', followUps.length + count('Follow-up'), '#f59e0b'],
          ['Outreach', count('Outreach'), '#0891b2'],
          ['Demos', count('Demo'), '#ec4899'],
          ['Deal updates', count('Deal update'), '#64748b'],
        ].map(([label, value, color]) => <span key={label}><i style={{ backgroundColor: String(color) }} /><strong>{label}</strong><b>{value}</b></span>)}</div>
      </AnalyticsPanel>
    </div>
    <AnalyticsPanel title="Activity by Salesperson" subtitle="Sales actions alongside opportunity outcomes">
      <AnalyticsTable headers={['Salesperson', 'Calls', 'Emails', 'Meetings', 'Follow-ups', 'Opportunities', 'Deals won']} rows={representativeRows} />
    </AnalyticsPanel>
    <AnalyticsPanel title="Recent Sales Activity" subtitle="Latest activity across deals, meetings and outreach">
      <div className="analytics-activity-timeline">{allActivities.slice(0, 14).map((item) => <article className="analytics-timeline-item" key={item.id}>
        <i className={`analytics-timeline-dot analytics-timeline-dot--${item.type.toLowerCase().replace(/[^a-z]+/g, '-')}`} />
        <div><div className="analytics-timeline-heading"><strong>{item.description}</strong><span>{item.type}</span></div><small>{item.company} · {item.owner}</small></div>
        <time>{new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</time>
      </article>)}</div>
    </AnalyticsPanel>
  </AnalyticsPage>;
}
