import React, { useState } from 'react';
import { Building2, CalendarDays, Phone, UserRound } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { DialerModal } from '../../../components/product/DialerModal';
import { Modal } from '../../../components/ui/Modal';
import type { SalesLead } from '../../../components/sales/SalesData';
import type { DealPriority, SalesOpportunity } from './data';
import { currency, displayDate, opportunityLead } from './data';
import './opportunities.css';

export function OpportunityPage({ title, subtitle, actions, children }: {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return <main className="page-content animate-fade-in opportunity-page">
    <header className="opportunity-page-header">
      <div><h1>{title}</h1><p>{subtitle}</p></div>
      {actions && <div className="opportunity-page-header__actions">{actions}</div>}
    </header>
    {children}
  </main>;
}

export function OpportunityStatus({ status }: { status: string }) {
  const variant = ['Won', 'Qualified', 'Completed'].includes(status) ? 'success'
    : ['Lost', 'Disqualified', 'Overdue'].includes(status) ? 'error'
      : ['Proposal', 'Negotiation', 'Needs Review', 'Discovery'].includes(status) ? 'warning'
        : 'info';
  return <Badge variant={variant} dot>{status}</Badge>;
}

export function OpportunityPanel({ title, subtitle, icon, action, children, className = '' }: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`opportunity-panel ${className}`}>
    <div className="opportunity-panel__header">
      <div className="opportunity-panel__title">
        {icon && <span className="opportunity-panel__icon">{icon}</span>}
        <div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
      </div>
      {action}
    </div>
    {children}
  </section>;
}

export function OpportunityMetric({ label, value, note, trend }: { label: string; value: string | number; note: string; trend?: string }) {
  return <article className="opportunity-metric">
    <span>{label}</span><strong>{value}</strong><small>{trend && <b>{trend}</b>}{note}</small>
  </article>;
}

export function DealIdentity({ lead, title, compact = false }: { lead: SalesLead; title?: string; compact?: boolean }) {
  return <span className={`opportunity-identity${compact ? ' opportunity-identity--compact' : ''}`}>
    <span className="opportunity-identity__avatar"><UserRound size={compact ? 13 : 15} /></span>
    <span><strong>{title ?? lead.name}</strong><small><Building2 size={11} />{lead.company}</small></span>
  </span>;
}

export function ProbabilityBar({ probability }: { probability: number }) {
  return <span className="opportunity-probability"><span><i style={{ width: `${probability}%` }} /></span><b>{probability}%</b></span>;
}

export function OpportunityDetail({ opportunity, onClose }: { opportunity: SalesOpportunity | null; onClose: () => void }) {
  const [callOpen, setCallOpen] = useState(false);
  const lead = opportunity ? opportunityLead(opportunity.prospectId) : null;
  return <>
    <Modal open={!!opportunity && !!lead} onClose={onClose} title={opportunity?.name} size="lg" portal>
      {opportunity && lead && <div className="opportunity-detail">
        <div className="opportunity-detail__hero">
          <div><DealIdentity lead={lead} title={opportunity.name} /><p>{opportunity.product} <span>·</span> {lead.designation}</p></div>
          <div className="opportunity-detail__value"><strong>{currency(opportunity.value)}</strong><small>deal value</small></div>
        </div>
        <div className="opportunity-detail__quick">
          <span><small>Stage</small><OpportunityStatus status={opportunity.stage} /></span>
          <span><small>Probability</small><strong>{opportunity.probability}%</strong></span>
          <span><small>Expected close</small><strong>{displayDate(opportunity.closeDate)}</strong></span>
          <span><small>Owner</small><strong>{opportunity.owner}</strong></span>
        </div>
        <div className="opportunity-detail__grid">
          <span><small>Budget</small><strong>{opportunity.budget}</strong></span>
          <span><small>Decision maker</small><strong>{opportunity.decisionMaker}</strong></span>
          <span><small>Buying timeline</small><strong>{opportunity.timeline}</strong></span>
          <span><small>Product fit</small><strong>{opportunity.productFit}%</strong></span>
          <span><small>Qualification score</small><strong>{opportunity.qualificationScore}/100</strong></span>
          <span><small>Qualification status</small><OpportunityStatus status={opportunity.qualificationStatus} /></span>
        </div>
        <div className="opportunity-detail__notes"><strong>Business need</strong><p>{opportunity.businessNeed}</p><strong>Deal notes</strong><p>{opportunity.notes}</p></div>
        <div className="opportunity-detail__footer">
          <span><CalendarDays size={14} /> Next: {opportunity.nextAction}</span>
          <Button variant="outline" icon={<Phone size={14} />} onClick={() => setCallOpen(true)}>Call contact</Button>
        </div>
      </div>}
    </Modal>
    {lead && <DialerModal
      open={callOpen}
      onClose={() => setCallOpen(false)}
      initialPhone={lead.phone}
      initialCandidateName={lead.name}
      contactType="lead"
      contactContext={{
        company: lead.company,
        email: lead.email,
        designation: lead.designation,
        status: lead.status,
        score: lead.totalScore,
        interest: opportunity?.product ?? lead.businessNeed,
      }}
    />}
  </>;
}

export function OpportunityCallAction({ opportunity, label = 'Call' }: { opportunity: SalesOpportunity; label?: string }) {
  const [open, setOpen] = useState(false);
  const lead = opportunityLead(opportunity.prospectId);
  return <>
    <Button size="sm" variant="outline" icon={<Phone size={13} />} onClick={() => setOpen(true)}>{label}</Button>
    <DialerModal
      open={open}
      onClose={() => setOpen(false)}
      initialPhone={lead.phone}
      initialCandidateName={lead.name}
      contactType="lead"
      contactContext={{
        company: lead.company,
        email: lead.email,
        designation: lead.designation,
        status: lead.status,
        score: lead.totalScore,
        interest: opportunity.product,
      }}
    />
  </>;
}

export function PriorityBadge({ priority }: { priority: DealPriority }) {
  return <Badge variant={priority === 'High' ? 'error' : priority === 'Medium' ? 'warning' : 'neutral'}>{priority}</Badge>;
}
