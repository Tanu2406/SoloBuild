import React, { useState } from 'react';
import { ArrowRightLeft, Check, Users, UserRound } from 'lucide-react';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { PageHeader } from '../../../../components/ui/Layout';
import { useToast } from '../../../../components/ui/Toast';
import { salesLeads, type SalesLead } from '../../../../components/sales/SalesData';

const representatives = [
  { name: 'Jordan Lee', initials: 'JL', role: 'Enterprise · West', capacity: 78, color: 'blue' },
  { name: 'Amara Okafor', initials: 'AO', role: 'Mid-market · Central', capacity: 64, color: 'purple' },
  { name: 'Ravi Shah', initials: 'RS', role: 'SMB · East', capacity: 42, color: 'green' },
];

const LeadAssignment: React.FC = () => {
  const { showToast } = useToast();
  const [leads, setLeads] = useState(salesLeads);
  const [repByLead, setRepByLead] = useState<Record<string, string>>({});
  const reps = representatives.map((rep) => ({ ...rep, assigned: leads.filter((lead) => (repByLead[lead.id] ?? lead.salesRep) === rep.name).length }));
  const assign = (lead: SalesLead) => {
    const rep = repByLead[lead.id] ?? lead.salesRep;
    if (rep === 'Unassigned') {
      showToast('Choose a sales representative before assigning this lead', 'info');
      return;
    }
    setLeads((current) => current.map((item) => item.id === lead.id ? { ...item, salesRep: rep, assignmentStatus: 'Assigned', assignedDate: 'Oct 06, 2026' } : item));
    showToast(`${lead.name} assigned to ${rep}`, 'success');
  };

  return (
    <div className="page-content animate-fade-in">
      <PageHeader title="Lead Assignment" subtitle="Balance representative workloads and route the next best lead." />
      <section className="sales-rep-grid">
        {reps.map((rep) => (
          <article className="sales-rep-card" key={rep.name}>
            <div className="sales-rep-card__identity"><span className={`sales-avatar sales-avatar--${rep.color}`}>{rep.initials}</span><span><strong>{rep.name}</strong><small>{rep.role}</small></span><Badge variant={rep.capacity > 75 ? 'warning' : 'success'}>{rep.capacity}% load</Badge></div>
            <div className="sales-rep-card__workload"><span>Active lead capacity</span><strong>{rep.assigned} assigned</strong></div>
            <div className="sales-workload-track"><span style={{ width: `${rep.capacity}%` }} /></div>
          </article>
        ))}
      </section>
      <section className="sales-assignment-summary">
        <div><Users size={17} /><span>Leads in queue</span><strong>{leads.filter((lead) => lead.salesRep === 'Unassigned').length + 18}</strong></div>
        <div><UserRound size={17} /><span>Assigned today</span><strong>24</strong></div>
        <div><ArrowRightLeft size={17} /><span>Balanced distribution</span><strong>86%</strong></div>
      </section>
      <section className="sales-assignment-queue">
        <div className="sales-section-heading"><div><h2>Assignment queue</h2><p>Prioritize high-intent leads and assign an owner</p></div><Badge variant="warning" dot>4 need an owner</Badge></div>
        {leads.map((lead) => (
          <article className="sales-assignment-row" key={lead.id}>
            <div className="sales-assignment-lead"><span className="sales-avatar">{lead.name.split(' ').map((part) => part[0]).join('')}</span><span><strong>{lead.name}</strong><small>{lead.company} · score {lead.totalScore}</small></span></div>
            <Badge variant={lead.priority === 'High' ? 'error' : lead.priority === 'Medium' ? 'warning' : 'neutral'}>{lead.priority} priority</Badge>
            <select className="sales-table-select" aria-label={`Assign ${lead.name}`} value={repByLead[lead.id] ?? lead.salesRep} onChange={(event) => setRepByLead((current) => ({ ...current, [lead.id]: event.target.value }))}>
              <option>Unassigned</option>{representatives.map((rep) => <option key={rep.name}>{rep.name}</option>)}
            </select>
            <Button size="sm" variant={lead.assignmentStatus === 'Assigned' ? 'outline' : 'primary'} icon={lead.assignmentStatus === 'Assigned' ? <ArrowRightLeft size={13} /> : <Check size={13} />} onClick={() => assign(lead)}>
              {lead.assignmentStatus === 'Assigned' ? 'Reassign' : 'Assign'}
            </Button>
          </article>
        ))}
      </section>
    </div>
  );
};

export default LeadAssignment;
