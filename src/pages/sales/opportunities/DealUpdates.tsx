import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, Check, Clock3, History } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input, Select, Textarea } from '../../../components/ui/Input';
import { useToast } from '../../../components/ui/Toast';
import { currency, displayDate, opportunityLead, opportunityStages, opportunityToday, type DealPriority, type OpportunityStage } from './data';
import { DealIdentity, OpportunityPage, OpportunityPanel, OpportunityStatus } from './OpportunityComponents';
import { updateOpportunity, useOpportunityStore } from './store';

const reps = ['Jordan Lee', 'Amara Okafor', 'Morgan Rivera', 'Priya Shah'];
const priorities: DealPriority[] = ['High', 'Medium', 'Low'];

export default function DealUpdates() {
  const { opportunities, activities } = useOpportunityStore();
  const [selectedId, setSelectedId] = useState(opportunities[0]?.id ?? '');
  const selected = opportunities.find((deal) => deal.id === selectedId);
  const { showToast } = useToast();
  const history = activities.filter((activity) => activity.opportunityId === selectedId);

  const saveChanges = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected) return;
    const form = new FormData(event.currentTarget);
    const amount = Number(form.get('value'));
    const probability = Number(form.get('probability'));
    const stage = String(form.get('stage')) as OpportunityStage;
    const changes = {
      value: amount,
      probability,
      stage,
      closeDate: String(form.get('closeDate')),
      owner: String(form.get('owner')),
      priority: String(form.get('priority')) as DealPriority,
      notes: String(form.get('notes')).trim(),
      nextAction: String(form.get('nextAction')).trim(),
    };
    updateOpportunity(selected.id, changes, stage === selected.stage ? 'Deal update' : 'Stage change',
      `${selected.name} updated: ${currency(selected.value)} → ${currency(amount)}; ${selected.stage} → ${stage}.`);
    showToast('Deal updates saved', 'success');
  };

  return <OpportunityPage title="Deal Updates" subtitle="Keep core deal details current and preserve a visible record of every change."
    actions={selected && <OpportunityStatus status={selected.stage} />}>
    <div className="opportunity-updates-layout">
      <OpportunityPanel title="Select a deal" subtitle="Open opportunities" icon={<History size={17} />} className="opportunity-deal-picker">
        {opportunities.map((deal) => {
          const lead = opportunityLead(deal.prospectId);
          return <button type="button" className={`opportunity-picker-row${deal.id === selectedId ? ' is-active' : ''}`} key={deal.id} onClick={() => setSelectedId(deal.id)}>
            <DealIdentity lead={lead} title={deal.name} compact /><span><strong>{currency(deal.value)}</strong><small>{deal.stage}</small></span>
          </button>;
        })}
      </OpportunityPanel>

      {selected && <div className="opportunity-updates-main">
        <OpportunityPanel title="Update deal details" subtitle={`${opportunityLead(selected.prospectId).company} · ${selected.product}`} icon={<Clock3 size={17} />}>
          <form className="opportunity-update-form" onSubmit={saveChanges}>
            <div className="opportunity-update-form__deal"><DealIdentity lead={opportunityLead(selected.prospectId)} title={selected.name} /><span><strong>{currency(selected.value)}</strong><small>Current deal value</small></span></div>
            <div className="opportunity-update-fields">
              <Input label="Deal value (USD)" name="value" type="number" min="0" step="1000" defaultValue={selected.value} required />
              <Input label="Probability (%)" name="probability" type="number" min="0" max="100" defaultValue={selected.probability} required />
              <Select label="Stage" name="stage" defaultValue={selected.stage} options={opportunityStages.map((stage) => ({ value: stage, label: stage }))} />
              <Input label="Expected close date" name="closeDate" type="date" min={opportunityToday} defaultValue={selected.closeDate} required />
              <Select label="Owner" name="owner" defaultValue={selected.owner} options={reps.map((rep) => ({ value: rep, label: rep }))} />
              <Select label="Priority" name="priority" defaultValue={selected.priority} options={priorities.map((priority) => ({ value: priority, label: priority }))} />
              <Input label="Next action" name="nextAction" defaultValue={selected.nextAction} required />
              <div className="opportunity-update-current"><span>Current close</span><strong>{displayDate(selected.closeDate)}</strong><ArrowRight size={14} /><small>Updates immediately after save</small></div>
              <Textarea label="Deal notes" name="notes" rows={4} defaultValue={selected.notes} className="opportunity-update-fields__wide" placeholder="Add the latest customer context..." />
            </div>
            <div className="opportunity-update-form__footer"><span>Changes are recorded in the opportunity activity history.</span><Button type="submit" icon={<Check size={14} />}>Save updates</Button></div>
          </form>
        </OpportunityPanel>

        <OpportunityPanel title="Update history" subtitle="Recent activity on this deal" icon={<History size={17} />}>
          <div className="opportunity-history">
            {history.map((activity) => <article className="opportunity-history__item" key={activity.id}>
              <span className={`opportunity-history__icon opportunity-history__icon--${activity.type.toLowerCase().replaceAll(' ', '-')}`} />
              <div><strong>{activity.description}</strong><small>{new Date(activity.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {new Date(activity.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</small></div>
            </article>)}
            {!history.length && <p className="opportunity-muted">No updates recorded yet.</p>}
          </div>
        </OpportunityPanel>
      </div>}
    </div>
  </OpportunityPage>;
}
