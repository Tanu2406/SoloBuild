import { useSyncExternalStore } from 'react';
import {
  initialFollowUps,
  initialOpportunities,
  initialOpportunityActivities,
  opportunityLead,
  type OpportunityActivity,
  type OpportunityActivityType,
  type OpportunityFollowUp,
  type SalesOpportunity,
} from './data';

interface OpportunityStore {
  opportunities: SalesOpportunity[];
  followUps: OpportunityFollowUp[];
  activities: OpportunityActivity[];
}

let sequence = 0;
let snapshot: OpportunityStore = {
  opportunities: initialOpportunities,
  followUps: initialFollowUps,
  activities: initialOpportunityActivities,
};
const listeners = new Set<() => void>();

function notify(next: OpportunityStore) {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

function newId(prefix: string) {
  sequence += 1;
  return `${prefix}-${Date.now()}-${sequence}`;
}

function makeActivity(opportunityId: string, type: OpportunityActivityType, description: string): OpportunityActivity {
  return { id: newId('opp-activity'), opportunityId, type, description, timestamp: new Date().toISOString() };
}

export function subscribeOpportunityStore(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getOpportunityStore() {
  return snapshot;
}

export function useOpportunityStore() {
  return useSyncExternalStore(subscribeOpportunityStore, getOpportunityStore, getOpportunityStore);
}

export function updateOpportunity(id: string, changes: Partial<SalesOpportunity>, type: OpportunityActivityType = 'Deal update', description?: string) {
  const current = snapshot.opportunities.find((opportunity) => opportunity.id === id);
  if (!current) return;
  const updated = { ...current, ...changes };
  const activities = description
    ? [makeActivity(id, type, description), ...snapshot.activities]
    : Object.entries(changes).map(([field, value]) => {
        if (field === 'stage') return makeActivity(id, 'Stage change', `Stage changed from ${current.stage} to ${value}.`);
        if (field === 'qualificationStatus') return makeActivity(id, 'Qualification', `Qualification status changed to ${value}.`);
        return makeActivity(id, type, `${field.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`)} updated to ${String(value)}.`);
      }).concat(snapshot.activities);
  notify({
    ...snapshot,
    opportunities: snapshot.opportunities.map((opportunity) => opportunity.id === id ? updated : opportunity),
    activities,
  });
}

export function addOpportunityActivity(opportunityId: string, type: OpportunityActivityType, description: string) {
  if (!snapshot.opportunities.some((opportunity) => opportunity.id === opportunityId)) return;
  notify({ ...snapshot, activities: [makeActivity(opportunityId, type, description), ...snapshot.activities] });
}

export function completeOpportunityFollowUp(id: string) {
  const followUp = snapshot.followUps.find((item) => item.id === id);
  if (!followUp || followUp.status === 'Completed') return;
  const opportunity = snapshot.opportunities.find((item) => item.id === followUp.opportunityId);
  const company = opportunity ? opportunityLead(opportunity.prospectId).company : 'account';
  const updated: OpportunityFollowUp = { ...followUp, status: 'Completed' };
  notify({
    ...snapshot,
    followUps: snapshot.followUps.map((item) => item.id === id ? updated : item),
    activities: [makeActivity(followUp.opportunityId, 'Follow-up', `${followUp.type} follow-up completed for ${company}: ${followUp.nextAction}.`), ...snapshot.activities],
  });
}

export function rescheduleOpportunityFollowUp(id: string, dueDate: string) {
  const followUp = snapshot.followUps.find((item) => item.id === id);
  if (!followUp || !dueDate) return;
  const updated: OpportunityFollowUp = {
    ...followUp,
    dueDate,
    status: 'Upcoming',
  };
  notify({
    ...snapshot,
    followUps: snapshot.followUps.map((item) => item.id === id ? updated : item),
    activities: [makeActivity(followUp.opportunityId, 'Follow-up', `${followUp.type} follow-up rescheduled to ${dueDate}.`), ...snapshot.activities],
  });
}

export function addFollowUp(opportunityId: string, type: OpportunityFollowUp['type'], dueDate: string, priority: OpportunityFollowUp['priority'], nextAction: string) {
  const opportunity = snapshot.opportunities.find((item) => item.id === opportunityId);
  if (!opportunity) return;
  const followUp: OpportunityFollowUp = {
    id: newId('follow-up'),
    opportunityId,
    type,
    dueDate,
    priority,
    owner: opportunity.owner,
    status: 'Upcoming',
    nextAction,
  };
  notify({
    ...snapshot,
    followUps: [followUp, ...snapshot.followUps],
    activities: [makeActivity(opportunityId, 'Follow-up', `${type} follow-up created: ${nextAction}.`), ...snapshot.activities],
  });
}
