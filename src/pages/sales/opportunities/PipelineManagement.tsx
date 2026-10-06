import { useState } from 'react';
import { ArrowRight, GripVertical, Layers3 } from 'lucide-react';
import { Select } from '../../../components/ui/Input';
import { currency, displayDate, opportunityLead, opportunityStages, type OpportunityStage, type SalesOpportunity } from './data';
import { DealIdentity, OpportunityDetail, OpportunityPage, OpportunityPanel, OpportunityStatus, ProbabilityBar } from './OpportunityComponents';
import { updateOpportunity, useOpportunityStore } from './store';

export default function PipelineManagement() {
  const { opportunities } = useOpportunityStore();
  const [selected, setSelected] = useState<SalesOpportunity | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const moveDeal = (id: string, stage: OpportunityStage) => {
    updateOpportunity(id, { stage });
    setDraggedId(null);
  };

  return <>
    <OpportunityPage title="Pipeline Management" subtitle="Move deals forward, keep stage ownership clear, and see value at every point in the sales cycle.">
      <OpportunityPanel title="Revenue pipeline" subtitle="Drag a deal card to change stages, or use the stage selector on any card." icon={<Layers3 size={17} />}
        action={<span className="opportunity-pipeline-total">{currency(opportunities.filter((deal) => !['Won', 'Lost'].includes(deal.stage)).reduce((total, deal) => total + deal.value, 0))} open pipeline</span>}>
        <div className="opportunity-kanban">
          {opportunityStages.map((stage) => {
            const deals = opportunities.filter((deal) => deal.stage === stage);
            const total = deals.reduce((sum, deal) => sum + deal.value, 0);
            return <section className={`opportunity-kanban__column opportunity-kanban__column--${stage.toLowerCase().replaceAll(' ', '-')}${draggedId ? ' is-drop-target' : ''}`} key={stage}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                if (draggedId) moveDeal(draggedId, stage);
              }}>
              <header><div><span><i />{stage}</span><strong>{deals.length}</strong></div><small>{currency(total)}</small></header>
              <div className="opportunity-kanban__cards">
                {deals.map((deal) => {
                  const lead = opportunityLead(deal.prospectId);
                  return <article className="opportunity-deal-card" key={deal.id} draggable onDragStart={() => setDraggedId(deal.id)} onDragEnd={() => setDraggedId(null)}>
                    <div className="opportunity-deal-card__top"><span className="opportunity-deal-card__handle" aria-label="Drag deal"><GripVertical size={15} /></span><OpportunityStatus status={deal.stage} /><button type="button" onClick={() => setSelected(deal)} aria-label={`View ${deal.name}`}><ArrowRight size={14} /></button></div>
                    <button type="button" className="opportunity-deal-card__title" onClick={() => setSelected(deal)}>{deal.name}</button>
                    <DealIdentity lead={lead} compact />
                    <div className="opportunity-deal-card__value"><strong>{currency(deal.value)}</strong><span>{deal.product}</span></div>
                    <ProbabilityBar probability={deal.probability} />
                    <div className="opportunity-deal-card__foot"><span>{deal.owner}</span><span>Close {displayDate(deal.closeDate)}</span></div>
                    <Select aria-label={`Move ${deal.name} to stage`} value={deal.stage} onChange={(event) => moveDeal(deal.id, event.target.value as OpportunityStage)}
                      options={opportunityStages.map((item) => ({ value: item, label: `Move to ${item}` }))} />
                  </article>;
                })}
                {!deals.length && <div className="opportunity-kanban__empty">Drop a deal here</div>}
              </div>
            </section>;
          })}
        </div>
      </OpportunityPanel>
    </OpportunityPage>
    <OpportunityDetail opportunity={selected} onClose={() => setSelected(null)} />
  </>;
}
