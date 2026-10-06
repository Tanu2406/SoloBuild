import { useState } from 'react';
import type { FormEvent } from 'react';
import { BellRing, CalendarClock, Check, CirclePlus } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input, Select } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';
import { OpportunityCallAction, OpportunityDetail, OpportunityPage, OpportunityPanel, OpportunityStatus, PriorityBadge } from './OpportunityComponents';
import { opportunityToday, currency, displayDate, opportunityLead, type DealPriority, type FollowUpStatus, type FollowUpType, type OpportunityFollowUp, type SalesOpportunity } from './data';
import { addFollowUp, completeOpportunityFollowUp, rescheduleOpportunityFollowUp, useOpportunityStore } from './store';

type FollowUpFilter = 'All' | FollowUpStatus;
const followUpTypes: FollowUpType[] = ['Call', 'Email', 'Meeting', 'Demo', 'Proposal', 'Reminder'];
const priorities: DealPriority[] = ['High', 'Medium', 'Low'];

export default function FollowUps() {
  const { opportunities, followUps } = useOpportunityStore();
  const [filter, setFilter] = useState<FollowUpFilter>('All');
  const [createOpen, setCreateOpen] = useState(false);
  const [detailDeal, setDetailDeal] = useState<SalesOpportunity | null>(null);
  const [newDateById, setNewDateById] = useState<Record<string, string>>({});
  const { showToast } = useToast();
  const filtered = followUps.filter((item) => filter === 'All' || item.status === filter);
  const createFollowUp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const opportunityId = String(form.get('opportunityId'));
    const type = String(form.get('type')) as FollowUpType;
    const dueDate = String(form.get('dueDate'));
    const priority = String(form.get('priority')) as DealPriority;
    const nextAction = String(form.get('nextAction')).trim();
    if (!nextAction || !dueDate) return;
    addFollowUp(opportunityId, type, dueDate, priority, nextAction);
    setCreateOpen(false);
    showToast('Follow-up added', 'success');
  };
  const updateFollowUpDate = (item: OpportunityFollowUp) => {
    const dueDate = newDateById[item.id];
    if (!dueDate) return;
    rescheduleOpportunityFollowUp(item.id, dueDate);
    showToast('Follow-up rescheduled', 'success');
  };

  return <>
    <OpportunityPage title="Opportunity Follow-ups" subtitle="Keep next steps visible and timely across active customer deals."
      actions={<Button icon={<CirclePlus size={15} />} onClick={() => setCreateOpen(true)}>Add follow-up</Button>}>
      <div className="opportunity-followup-summary">
        {(['Upcoming', 'Overdue', 'Completed'] as const).map((status) => <button type="button" className={`opportunity-followup-summary__item is-${status.toLowerCase()}`} key={status} onClick={() => setFilter(status)}>
          <span>{status}</span><strong>{followUps.filter((item) => item.status === status).length}</strong><small>{status === 'Overdue' ? 'Needs attention' : status === 'Completed' ? 'Recently closed' : 'On the calendar'}</small>
        </button>)}
      </div>
      <OpportunityPanel title="Follow-up queue" subtitle="Complete actions or choose a new due date." icon={<BellRing size={17} />}
        action={<div className="opportunity-followup-filters">{(['All', 'Upcoming', 'Overdue', 'Completed'] as FollowUpFilter[]).map((item) => <button type="button" className={filter === item ? 'is-active' : ''} key={item} onClick={() => setFilter(item)}>{item}</button>)}</div>}>
        {filtered.length ? <div className="opportunity-followup-list">
          {filtered.map((item) => {
            const deal = opportunities.find((opportunity) => opportunity.id === item.opportunityId);
            if (!deal) return null;
            const lead = opportunityLead(deal.prospectId);
            return <article className={`opportunity-followup-card is-${item.status.toLowerCase()}`} key={item.id}>
              <div className="opportunity-followup-card__date"><CalendarClock size={16} /><strong>{item.dueDate === opportunityToday ? 'Today' : displayDate(item.dueDate)}</strong></div>
              <div className="opportunity-followup-card__deal">
                <button type="button" onClick={() => setDetailDeal(deal)}><strong>{deal.name}</strong><small>{lead.company} · {currency(deal.value)}</small></button>
                <span><span className="opportunity-followup-type">{item.type}</span><OpportunityStatus status={item.status} /></span>
              </div>
              <div className="opportunity-followup-card__task"><strong>{item.nextAction}</strong><small>{item.owner} · {deal.product}</small></div>
              <div className="opportunity-followup-card__priority"><PriorityBadge priority={item.priority} /></div>
              <div className="opportunity-followup-card__actions">
                {item.status !== 'Completed' && <>
                  {item.type === 'Call' && <OpportunityCallAction opportunity={deal} />}
                  <Button size="sm" icon={<Check size={13} />} onClick={() => { completeOpportunityFollowUp(item.id); showToast('Follow-up completed', 'success'); }}>Complete</Button>
                  <Input aria-label={`New due date for ${deal.name}`} type="date" min={opportunityToday} value={newDateById[item.id] ?? ''} onChange={(event) => setNewDateById((current) => ({ ...current, [item.id]: event.target.value }))} />
                  <Button size="sm" variant="ghost" disabled={!newDateById[item.id]} onClick={() => updateFollowUpDate(item)}>Reschedule</Button>
                </>}
                <Button size="sm" variant="ghost" onClick={() => setDetailDeal(deal)}>Open deal</Button>
              </div>
            </article>;
          })}
        </div> : <div className="opportunity-empty"><BellRing size={20} /><strong>No follow-ups in this view</strong><span>Use Add follow-up to capture the next customer action.</span></div>}
      </OpportunityPanel>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add opportunity follow-up" size="md" portal>
        <form className="opportunity-create-followup" onSubmit={createFollowUp}>
          <Select label="Opportunity" name="opportunityId" required options={opportunities.filter((deal) => !['Won', 'Lost'].includes(deal.stage)).map((deal) => ({ value: deal.id, label: `${deal.name} · ${opportunityLead(deal.prospectId).company}` }))} />
          <div className="opportunity-form-grid">
            <Select label="Follow-up type" name="type" required options={followUpTypes.map((type) => ({ value: type, label: type }))} />
            <Select label="Priority" name="priority" required options={priorities.map((priority) => ({ value: priority, label: priority }))} />
            <Input label="Due date" name="dueDate" type="date" min={opportunityToday} defaultValue={opportunityToday} required />
            <Input label="Next action" name="nextAction" placeholder="e.g. Review proposal scope" required />
          </div>
          <div className="opportunity-modal-actions"><Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button><Button type="submit" icon={<Check size={14} />}>Add follow-up</Button></div>
        </form>
      </Modal>
    </OpportunityPage>
    <OpportunityDetail opportunity={detailDeal} onClose={() => setDetailDeal(null)} />
  </>;
}
