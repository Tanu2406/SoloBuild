import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Database,
  Flame,
  Gauge,
  Megaphone,
  Phone,
  Search,
  Target,
  TrendingUp,
  UserRound,
  Users,
} from 'lucide-react';
import { PageHeader } from '../../../../components/ui/Layout';
import { StatCard } from '../../../../components/ui/StatCard';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { salesLeads, type SalesLead } from '../../../../components/sales/SalesData';
import { DialerModal } from '../../../../components/product/DialerModal';

const LeadManagementDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dialerLead, setDialerLead] = useState<SalesLead | null>(null);
  const [dialerOpen, setDialerOpen] = useState(false);
  const hotLeads = salesLeads.filter((lead) => lead.category === 'Hot').length;
  const qualified = salesLeads.filter((lead) => lead.status === 'Qualified').length;
  const pipeline = [
    { label: 'New', value: 34, color: 'var(--brand-primary)' },
    { label: 'Contacted', value: 25, color: 'var(--status-info-text)' },
    { label: 'Qualified', value: 18, color: 'var(--status-success-text)' },
    { label: 'Nurturing', value: 13, color: 'var(--status-warning-text)' },
  ];
  const tools = [
    { label: 'Campaigns', description: 'Manage and track sales campaigns', route: 'campaigns', icon: <Megaphone size={19} /> },
    { label: 'Lead Research', description: 'Discover and research potential leads', route: 'lead-research', icon: <Search size={19} /> },
    { label: 'Lead Enrichment', description: 'Enrich lead and company information', route: 'lead-enrichment', icon: <Database size={19} /> },
    { label: 'Lead Qualification', description: 'Evaluate and qualify leads', route: 'lead-qualification', icon: <CheckCircle2 size={19} /> },
    { label: 'Lead Scoring', description: 'Analyze and prioritize lead scores', route: 'lead-scoring', icon: <Gauge size={19} /> },
    { label: 'Lead Assignment', description: 'Assign leads to sales representatives', route: 'lead-assignment', icon: <UserRound size={19} /> },
    { label: 'Activity', description: 'Track calls, emails and meetings', route: 'activity', icon: <Activity size={19} /> },
  ];

  return (
    <div className="page-content animate-fade-in">
      <PageHeader
        title="Sales Operations"
        subtitle="Track, qualify, and convert your sales pipeline from one workspace."
        actions={
          <>
            <Button
              variant="outline"
              icon={<Phone size={15} />}
              onClick={() => {
                setDialerLead(null);
                setDialerOpen(true);
              }}
            >
              Dial a Number
            </Button>
            <Button variant="primary" onClick={() => navigate('/sales/lead-management/lead-research')}>
              Explore leads <ArrowRight size={15} />
            </Button>
          </>
        }
      />

      <div className="sales-stats-grid">
        <StatCard label="Total Leads" value="1,284" sub="Across all sources" icon={<Users size={18} />} trend={{ value: '12.8% this month', positive: true }} />
        <StatCard label="New Leads" value="186" sub="Added this month" icon={<TrendingUp size={18} />} trend={{ value: '8.4% this month', positive: true }} />
        <StatCard label="Qualified Leads" value={qualified + 142} sub="Sales-ready prospects" icon={<Target size={18} />} trend={{ value: '6.2% this month', positive: true }} />
        <StatCard label="Hot Leads" value={hotLeads + 73} sub="High intent and fit" icon={<Flame size={18} />} trend={{ value: '4.1% this month', positive: true }} />
        <StatCard label="Conversion Rate" value="18.6%" sub="Lead to opportunity" icon={<TrendingUp size={18} />} trend={{ value: '2.3% this month', positive: true }} />
        <StatCard label="Active Campaigns" value="12" sub="Currently generating leads" icon={<Megaphone size={18} />} />
      </div>

      <div className="sales-dashboard-grid">
        <section className="sales-panel">
          <div className="sales-panel__header">
            <div><h2>Lead pipeline</h2><p>Current lead distribution by stage</p></div>
            <Building2 size={18} color="var(--text-tertiary)" />
          </div>
          <div className="sales-pipeline">
            {pipeline.map((stage) => (
              <div key={stage.label} className="sales-pipeline__row">
                <div className="sales-pipeline__label"><span>{stage.label}</span><strong>{stage.value}%</strong></div>
                <div className="sales-pipeline__track"><span style={{ width: `${stage.value}%`, background: stage.color }} /></div>
              </div>
            ))}
          </div>
        </section>
        <section className="sales-panel">
          <div className="sales-panel__header">
            <div><h2>Conversion overview</h2><p>Progress from new lead to opportunity</p></div>
            <TrendingUp size={17} color="var(--status-success-text)" />
          </div>
          <div className="sales-conversion-overview">
            <div><span>Lead-to-qualified</span><strong>32.4%</strong><small>+4.8% this month</small></div>
            <div><span>Qualified-to-opportunity</span><strong>57.2%</strong><small>+2.1% this month</small></div>
            <div className="sales-conversion-track"><span style={{ width: '32.4%' }} /><span style={{ width: '57.2%' }} /></div>
            <div className="sales-conversion-legend"><span>Lead → Qualified</span><span>Qualified → Opportunity</span></div>
          </div>
        </section>
      </div>
      <section className="sales-panel sales-panel--quick-links">
        <div className="sales-panel__header">
          <div><h2>Quick actions</h2><p>Choose a workspace to move your pipeline forward</p></div>
        </div>
        <button
          className="sales-workspace-cta"
          type="button"
          onClick={() => navigate('/sales/lead-management/lead-research')}
        >
          <span className="sales-workspace-cta__icon"><BriefcaseBusiness size={20} /></span>
          <span className="sales-workspace-cta__copy">
            <strong>Open a lead management workspace</strong>
            <small>Explore leads and manage your sales pipeline</small>
          </span>
          <span className="sales-workspace-cta__arrow"><ArrowRight size={17} /></span>
        </button>
        <div className="sales-quick-actions">
          {tools.map((tool) => (
            <button
              key={tool.route}
              className="sales-quick-action"
              type="button"
              onClick={() => navigate(`/sales/lead-management/${tool.route}`)}
            >
              <span className="sales-quick-action__icon">{tool.icon}</span>
              <span className="sales-quick-action__copy">
                <strong>{tool.label}</strong>
                <small>{tool.description}</small>
              </span>
              <ArrowRight className="sales-quick-action__arrow" size={15} />
            </button>
          ))}
        </div>
      </section>

      <section className="sales-dashboard-table">
        <div className="sales-section-heading">
          <div><h2>Recent leads</h2><p>Recently added prospects across your pipeline</p></div>
          <Button variant="outline" size="sm" onClick={() => navigate('/sales/lead-management/lead-scoring')}>View lead scores</Button>
        </div>
        <div className="sales-recent-leads">
          {salesLeads.slice(0, 5).map((lead) => (
            <article key={lead.id} className="sales-recent-lead">
              <span className="sales-avatar">{lead.name.split(' ').map((part) => part[0]).join('')}</span>
              <span className="sales-recent-lead__person"><strong>{lead.name}</strong><small>{lead.company} · {lead.source}</small></span>
              <span className="sales-recent-lead__owner">{lead.salesRep}</span>
              <Badge variant={lead.category === 'Hot' ? 'error' : lead.category === 'Warm' ? 'warning' : 'neutral'} dot>{lead.category}</Badge>
              <strong className="sales-recent-lead__score">{lead.totalScore}</strong>
              {lead.phone && (
                <Button
                  size="sm"
                  variant="outline"
                  icon={<Phone size={13} />}
                  onClick={() => {
                    setDialerLead(lead);
                    setDialerOpen(true);
                  }}
                >
                  Call
                </Button>
              )}
            </article>
          ))}
        </div>
      </section>
      <DialerModal
        open={dialerOpen}
        onClose={() => {
          setDialerOpen(false);
          setDialerLead(null);
        }}
        initialPhone={dialerLead?.phone}
        initialCandidateName={dialerLead?.name}
        initialPurpose="general"
        contactType="lead"
        contactContext={dialerLead ? {
          company: dialerLead.company,
          email: dialerLead.email,
          designation: dialerLead.designation,
          status: dialerLead.status,
          score: dialerLead.totalScore,
          interest: dialerLead.businessNeed,
        } : undefined}
      />
    </div>
  );
};

export default LeadManagementDashboard;
