import React, { useState } from 'react';
import { Building2, CheckCircle2, Mail, MapPin, Phone, RefreshCw, ShieldCheck, UserRound, Users } from 'lucide-react';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { PageHeader } from '../../../../components/ui/Layout';
import { useToast } from '../../../../components/ui/Toast';
import { salesLeads } from '../../../../components/sales/SalesData';
import { SalesCallButton } from '../../../../components/sales/SalesCallButton';

const LeadEnrichment: React.FC = () => {
  const { showToast } = useToast();
  const [selectedId, setSelectedId] = useState(salesLeads[0].id);
  const [refreshed, setRefreshed] = useState(false);
  const lead = salesLeads.find((item) => item.id === selectedId) ?? salesLeads[0];

  return (
    <div className="page-content animate-fade-in">
      <PageHeader title="Lead Enrichment" subtitle="Review verified contact and company data for each target account." actions={
        <Button icon={<RefreshCw size={14} />} onClick={() => { setRefreshed(true); showToast(`${lead.company} data refreshed`, 'success'); }}>Refresh data</Button>
      } />
      <div className="sales-enrichment-layout">
        <aside className="sales-enrichment-list">
          <div className="sales-enrichment-list__heading"><h2>Lead profiles</h2><span>{salesLeads.length}</span></div>
          {salesLeads.map((item) => (
            <button key={item.id} type="button" className={`sales-enrichment-list__item${item.id === lead.id ? ' is-selected' : ''}`} onClick={() => { setSelectedId(item.id); setRefreshed(false); }}>
              <span className="sales-avatar">{item.name.split(' ').map((part) => part[0]).join('')}</span>
              <span><strong>{item.name}</strong><small>{item.company}</small></span>
              <span className="sales-enrichment-dot" />
            </button>
          ))}
        </aside>
        <div className="sales-enrichment-main">
          <section className="sales-profile-hero">
            <span className="sales-avatar sales-avatar--large">{lead.name.split(' ').map((part) => part[0]).join('')}</span>
            <div className="sales-profile-hero__text"><h2>{lead.name}</h2><p>{lead.company} · {lead.industry}</p><span><MapPin size={14} />{lead.location}</span></div>
            <div className="sales-profile-hero__actions">
              <SalesCallButton contactName={lead.name} />
              <Badge variant="success" dot>{refreshed ? 'Just enriched' : 'Profile verified'}</Badge>
            </div>
          </section>
          <section className="sales-completeness-panel">
            <div><div className="sales-panel__header"><div><h2>Data completeness</h2><p>Profile coverage across verified fields</p></div><strong>92%</strong></div>
              <div className="sales-completeness-track"><span style={{ width: '92%' }} /></div>
              <div className="sales-completeness-caption"><span>11 of 12 fields complete</span><span><ShieldCheck size={13} /> Verified sources</span></div>
            </div>
          </section>
          <div className="sales-profile-grid">
            <section className="sales-profile-card">
              <div className="sales-profile-card__title"><UserRound size={16} /><h3>Contact information</h3></div>
              <div className="sales-profile-field"><Mail size={14} /><span><small>Work email</small><strong>{lead.email}</strong></span><CheckCircle2 size={14} className="sales-verified-icon" /></div>
              <div className="sales-profile-field"><Phone size={14} /><span><small>Direct phone</small><strong>{lead.phone}</strong></span><CheckCircle2 size={14} className="sales-verified-icon" /></div>
              <div className="sales-profile-field"><UserRound size={14} /><span><small>Role</small><strong>VP, Operations</strong></span><CheckCircle2 size={14} className="sales-verified-icon" /></div>
            </section>
            <section className="sales-profile-card">
              <div className="sales-profile-card__title"><Building2 size={16} /><h3>Company information</h3></div>
              <div className="sales-profile-field"><Building2 size={14} /><span><small>Industry</small><strong>{lead.industry}</strong></span></div>
              <div className="sales-profile-field"><Users size={14} /><span><small>Company size</small><strong>{lead.companySize} employees</strong></span></div>
              <div className="sales-profile-field"><MapPin size={14} /><span><small>Headquarters</small><strong>{lead.location}</strong></span></div>
            </section>
          </div>
          <section className="sales-enrichment-activity"><h3>Enrichment activity</h3><p><CheckCircle2 size={14} /> Email and company profile verified from public business sources <span>{refreshed ? 'Just now' : 'Today, 9:42 AM'}</span></p><p><CheckCircle2 size={14} /> Phone number matched to company directory <span>Yesterday</span></p></section>
        </div>
      </div>
    </div>
  );
};

export default LeadEnrichment;
