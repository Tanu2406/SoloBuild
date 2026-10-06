import React, { useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Copy,
  Mail,
  MessageSquareText,
  MoreHorizontal,
  Plus,
  Phone,
  Search,
  Send,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Input, Select, Textarea } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { DialerModal } from '../../../components/product/DialerModal';
import { PageHeader } from '../../../components/ui/Layout';
import { StatCard } from '../../../components/ui/StatCard';
import { useToast } from '../../../components/ui/Toast';
import { ProspectCallButton } from './ProspectCallButton';
import {
  initialCampaigns,
  initialFollowUps,
  initialMeetings,
  outreachActivities,
  outreachBasePath,
  outreachNavigation,
  outreachProspects,
  performanceStages,
  pipelineStages,
  type FollowUpItem,
  type OutreachCampaign,
  type OutreachMeeting,
  type OutreachProspect,
} from './data';
import './sales-outreach.css';

function prospectById(id: string) {
  return outreachProspects.find((prospect) => prospect.id === id) ?? outreachProspects[0];
}

function WorkspaceHeader({ title, subtitle, actions }: { title: string; subtitle: string; actions?: React.ReactNode }) {
  return <PageHeader title={title} subtitle={subtitle} actions={actions} />;
}

function StatusBadge({ status }: { status: string }) {
  const variant = status === 'Running' || status === 'Confirmed' || status === 'Completed' || status === 'Qualified'
    ? 'success'
    : status === 'Paused' || status === 'Overdue' || status === 'Requested'
      ? 'warning'
      : status === 'Scheduled' || status === 'Engaged' || status === 'Proposed'
        ? 'info'
        : 'neutral';
  return <Badge variant={variant} dot>{status}</Badge>;
}

function QuickAction({ href, icon, title, description }: { href: string; icon: React.ReactNode; title: string; description: string }) {
  return (
    <Link className="sales-outreach-quick-action" to={href}>
      <span className="sales-outreach-quick-action__icon">{icon}</span>
      <span className="sales-outreach-quick-action__text"><strong>{title}</strong><small>{description}</small></span>
      <ArrowRight size={16} />
    </Link>
  );
}

function MeetingsList({ meetings }: { meetings: OutreachMeeting[] }) {
  return (
    <div className="sales-outreach-meeting-list">
      {meetings.map((meeting) => {
        const prospect = prospectById(meeting.prospectId);
        return (
          <article className="sales-outreach-meeting" key={meeting.id}>
            <span className="sales-outreach-meeting__date"><CalendarDays size={16} /><small>{meeting.date}</small><strong>{meeting.time}</strong></span>
            <span className="sales-outreach-meeting__person"><strong>{prospect.name}</strong><small>{prospect.company} · {meeting.type}</small></span>
            <StatusBadge status={meeting.status} />
          </article>
        );
      })}
      {meetings.length === 0 && <p className="sales-outreach-empty">No meetings in this view yet.</p>}
    </div>
  );
}

export function SalesOutreachDashboard() {
  const navigate = useNavigate();
  const todayMeetings = initialMeetings.filter((meeting) => meeting.status !== 'Cancelled').slice(0, 3);
  return (
    <div className="page-content animate-fade-in sales-outreach-page">
      <WorkspaceHeader
        title="Sales Outreach"
        subtitle="Build pipeline with relevant, timely conversations across your target accounts."
        actions={<Button icon={<Plus size={15} />} onClick={() => navigate(`${outreachBasePath}/personalized-outreach`)}>Create outreach</Button>}
      />

      <section className="sales-outreach-kpis" aria-label="Sales outreach performance">
        <StatCard label="Active Prospects" value="284" sub="Across 6 target segments" icon={<Users size={18} />} trend={{ value: '12.4% this month', positive: true }} />
        <StatCard label="Outreach Sent" value="2,480" sub="This quarter" icon={<Send size={18} />} trend={{ value: '8.6% this month', positive: true }} />
        <StatCard label="Reply Rate" value="12.4%" sub="307 replies received" icon={<MessageSquareText size={18} />} trend={{ value: '2.1% this month', positive: true }} />
        <StatCard label="Meetings Booked" value="83" sub="From sales outreach" icon={<CalendarDays size={18} />} trend={{ value: '14.2% this month', positive: true }} />
        <StatCard label="Qualified Opportunities" value="41" sub="Ready for discovery" icon={<Target size={18} />} trend={{ value: '6.8% this month', positive: true }} />
        <StatCard label="Pipeline Value" value="$1.42M" sub="Weighted opportunity value" icon={<CircleDollarSign size={18} />} trend={{ value: '11.3% this month', positive: true }} />
      </section>

      <div className="sales-outreach-dashboard-grid">
        <section className="sales-outreach-panel sales-outreach-performance">
          <div className="sales-outreach-panel__heading">
            <div><h2>Outreach performance</h2><p>Quarter-to-date engagement through the funnel</p></div>
            <span className="sales-outreach-panel__icon"><BarChart3 size={17} /></span>
          </div>
          <div className="sales-outreach-funnel">
            {performanceStages.map((stage) => (
              <div className="sales-outreach-funnel__row" key={stage.label}>
                <span>{stage.label}</span>
                <div className="sales-outreach-funnel__track"><span className={`is-${stage.color}`} style={{ width: `${Math.max(4, stage.percent)}%` }} /></div>
                <strong>{stage.value.toLocaleString()}</strong>
                <small>{stage.percent}%</small>
              </div>
            ))}
          </div>
          <div className="sales-outreach-performance__foot"><span><ArrowUpRight size={14} /> 18.6% conversion lift</span><span>Compared with last quarter</span></div>
        </section>

        <section className="sales-outreach-panel sales-outreach-pipeline">
          <div className="sales-outreach-panel__heading">
            <div><h2>Sales pipeline</h2><p>Prospects moving toward revenue</p></div>
            <span className="sales-outreach-panel__icon"><Target size={17} /></span>
          </div>
          <div className="sales-outreach-pipeline__stages">
            {pipelineStages.map((stage, index) => (
              <div className="sales-outreach-pipeline__stage" key={stage.label}>
                <span className="sales-outreach-pipeline__stage-marker">{index + 1}</span>
                <span className="sales-outreach-pipeline__stage-copy"><strong>{stage.label}</strong><small>{stage.count} prospects · {stage.value}</small></span>
                {index < pipelineStages.length - 1 && <ChevronRight className="sales-outreach-pipeline__arrow" size={15} />}
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="sales-outreach-quick-actions">
        <div className="sales-outreach-section-heading"><div><h2>Quick actions</h2><p>Move an account forward with a focused next step.</p></div></div>
        <div className="sales-outreach-quick-grid">
          <QuickAction href={outreachNavigation[0].href} icon={<Search size={18} />} title="Research leads" description="Find and qualify new prospects" />
          <QuickAction href={outreachNavigation[1].href} icon={<Sparkles size={18} />} title="Create outreach" description="Draft a relevant first touch" />
          <QuickAction href={outreachNavigation[2].href} icon={<Mail size={18} />} title="Start campaign" description="Reach a targeted audience" />
          <QuickAction href={outreachNavigation[3].href} icon={<Clock3 size={18} />} title="View follow-ups" description="Stay on top of next steps" />
          <QuickAction href={outreachNavigation[4].href} icon={<CalendarDays size={18} />} title="Book meeting" description="Turn interest into a conversation" />
        </div>
      </section>

      <section className="sales-outreach-panel sales-outreach-today">
        <div className="sales-outreach-section-heading">
          <div><h2>Today’s outreach</h2><p>High-priority prospect conversations and next steps</p></div>
          <Link to={outreachNavigation[0].href} className="sales-outreach-text-link">View all prospects <ArrowRight size={14} /></Link>
        </div>
        <div className="sales-outreach-table-wrap">
          <table className="sales-outreach-table">
            <thead><tr><th>Prospect</th><th>Role / Company</th><th>Product interest</th><th>Status</th><th>Last contact</th><th>Next action</th><th>Actions</th></tr></thead>
            <tbody>
              {outreachProspects.slice(0, 4).map((prospect, index) => (
                <tr key={prospect.id}>
                  <td><strong>{prospect.name}</strong><small>{prospect.email}</small></td>
                  <td>{prospect.role}<small>{prospect.company}</small></td>
                  <td>{prospect.productInterest}</td>
                  <td><StatusBadge status={prospect.status === 'New' ? 'New lead' : prospect.status} /></td>
                  <td>{['Today, 9:15 AM', 'Yesterday', 'Oct 05, 2026', 'Oct 02, 2026'][index]}</td>
                  <td>{['Send overview', 'Confirm interest', 'Book walkthrough', 'Share case study'][index]}</td>
                  <td><div className="sales-outreach-row-actions"><Link to={outreachNavigation[0].href} state={{ prospectId: prospect.id }} className="sales-outreach-inline-link">View</Link><ProspectCallButton prospect={prospect} /><Link to={outreachNavigation[3].href} className="sales-outreach-inline-link">Follow-up</Link></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="sales-outreach-panel sales-outreach-upcoming">
        <div className="sales-outreach-section-heading"><div><h2>Upcoming meetings</h2><p>Confirmed and requested prospect conversations</p></div><Link to={outreachNavigation[4].href} className="sales-outreach-text-link">Meeting calendar <ArrowRight size={14} /></Link></div>
        <MeetingsList meetings={todayMeetings} />
      </section>
    </div>
  );
}

export function SalesOutreachLeadResearch() {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('All industries');
  const [selected, setSelected] = useState<OutreachProspect | null>(() => {
    const prospectId = (location.state as { prospectId?: string } | null)?.prospectId;
    return prospectId ? outreachProspects.find((prospect) => prospect.id === prospectId) ?? null : null;
  });
  const { showToast } = useToast();
  const industries = ['All industries', ...new Set(outreachProspects.map((prospect) => prospect.industry))];
  const results = useMemo(() => outreachProspects.filter((prospect) => {
    const query = search.trim().toLowerCase();
    const matchesText = !query || `${prospect.name} ${prospect.company} ${prospect.productInterest} ${prospect.role}`.toLowerCase().includes(query);
    return matchesText && (industry === 'All industries' || prospect.industry === industry);
  }), [industry, search]);

  return (
    <div className="page-content animate-fade-in sales-outreach-page">
      <WorkspaceHeader title="Lead Research" subtitle="Research accounts, spot buying signals, and prioritize the right prospects." />
      <section className="sales-outreach-research-toolbar">
        <div className="sales-outreach-research-search"><Input aria-label="Search prospects" value={search} onChange={(event) => setSearch(event.target.value)} leftIcon={<Search size={15} />} placeholder="Search prospects, accounts, or products..." /></div>
        <Select aria-label="Filter by industry" value={industry} onChange={(event) => setIndustry(event.target.value)} options={industries.map((value) => ({ value, label: value }))} />
        <span className="sales-outreach-result-count">{results.length} researched prospects</span>
      </section>
      <section className="sales-outreach-panel sales-outreach-research-panel">
        <div className="sales-outreach-panel__heading"><div><h2>Prospect intelligence</h2><p>Signals and account context to personalize your first touch</p></div><Badge variant="info">{results.length} prospects</Badge></div>
        <div className="sales-outreach-table-wrap">
          <table className="sales-outreach-table sales-outreach-table--research">
            <thead><tr><th>Prospect / Company</th><th>Job title</th><th>Industry / Size</th><th>Product interest</th><th>Buying signal</th><th>Score</th><th>Research notes</th><th>Actions</th></tr></thead>
            <tbody>{results.map((prospect) => (
              <tr key={prospect.id}>
                <td><strong>{prospect.name}</strong><small>{prospect.company}</small></td>
                <td>{prospect.role}</td>
                <td>{prospect.industry}<small>{prospect.companySize} employees</small></td>
                <td>{prospect.productInterest}</td>
                <td>{prospect.buyingSignal}</td>
                <td><span className="sales-outreach-score">{prospect.totalScore}</span></td>
                <td className="sales-outreach-notes">{prospect.researchNotes}</td>
                <td><div className="sales-outreach-row-actions">
                  <Button size="sm" variant="ghost" onClick={() => setSelected(prospect)}>View lead</Button>
                  <Button size="sm" variant="outline" onClick={() => { navigate(outreachNavigation[1].href, { state: { prospectId: prospect.id } }); showToast(`${prospect.name} added to outreach`, 'success'); }}>Add to outreach</Button>
                  <ProspectCallButton prospect={prospect} />
                </div></td>
              </tr>
            ))}</tbody>
          </table>
          {results.length === 0 && <p className="sales-outreach-empty">No prospects match. Try another search or industry.</p>}
        </div>
      </section>
      <Modal open={selected !== null} onClose={() => setSelected(null)} title="Prospect research" size="md">
        {selected && (
          <div className="sales-outreach-prospect-drawer">
            <div className="sales-outreach-prospect-identity"><span className="sales-avatar">{selected.name.split(' ').map((part) => part[0]).join('')}</span><div><h3>{selected.name}</h3><p>{selected.role} · {selected.company}</p></div><span className="sales-outreach-score">{selected.totalScore}</span></div>
            <div className="sales-outreach-detail-grid"><span>Industry<strong>{selected.industry}</strong></span><span>Company size<strong>{selected.companySize}</strong></span><span>Product interest<strong>{selected.productInterest}</strong></span><span>Buying signal<strong>{selected.buyingSignal}</strong></span><span>Email<strong>{selected.email}</strong></span><span>Phone<strong>{selected.phone}</strong></span></div>
            <div className="sales-outreach-research-note"><strong>Research notes</strong><p>{selected.researchNotes}</p><p>Business need: {selected.businessNeed}. Buying timeline: {selected.buyingTimeline}.</p></div>
            <div className="sales-outreach-modal-actions"><Button variant="secondary" onClick={() => { navigate(outreachNavigation[1].href, { state: { prospectId: selected.id } }); showToast(`${selected.name} added to outreach`, 'success'); }}>Add to outreach</Button><ProspectCallButton prospect={selected} /></div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function createSuggestedMessage(prospect: OutreachProspect, tone: string) {
  const greeting = `Hi ${prospect.name.split(' ')[0]},`;
  const pain = prospect.businessNeed.toLowerCase();
  const sentence = `I noticed ${prospect.company} is focused on ${pain}.`;
  const value = `Our ${prospect.productInterest} helps teams address this with a clear, measurable workflow.`;
  const ask = 'Would a brief conversation next week be useful?';
  if (tone === 'Direct') return `${greeting}\n\n${sentence} ${value}\n\n${ask}\n\nBest,\nJordan`;
  if (tone === 'Insight-led') return `${greeting}\n\n${prospect.buyingSignal}. Teams working through ${pain} often benefit from a more connected approach.\n\n${value} I can share a few practical ideas tailored to ${prospect.company}.\n\n${ask}\n\nBest,\nJordan`;
  return `${greeting}\n\n${sentence}\n\n${value} I thought this might be relevant given your current priorities at ${prospect.company}.\n\n${ask}\n\nBest,\nJordan`;
}

export function SalesOutreachPersonalized() {
  const location = useLocation();
  const initialProspectId = (location.state as { prospectId?: string } | null)?.prospectId;
  const [prospectId, setProspectId] = useState(
    outreachProspects.find((item) => item.id === initialProspectId)?.id ?? outreachProspects[0].id,
  );
  const [tone, setTone] = useState('Warm');
  const [message, setMessage] = useState('');
  const [generated, setGenerated] = useState(false);
  const { showToast } = useToast();
  const prospect = prospectById(prospectId);
  const generate = () => {
    setMessage(createSuggestedMessage(prospect, tone));
    setGenerated(true);
    showToast('Personalized message generated', 'success');
  };

  return (
    <div className="page-content animate-fade-in sales-outreach-page">
      <WorkspaceHeader title="Personalized Outreach" subtitle="Create relevant messages grounded in prospect research and buying context." />
      <div className="sales-outreach-composer-layout">
        <section className="sales-outreach-panel sales-outreach-composer-settings">
          <div className="sales-outreach-panel__heading"><div><h2>Message context</h2><p>Choose the account and tune your angle.</p></div><Sparkles size={18} /></div>
          <Select label="Selected prospect" value={prospectId} onChange={(event) => { setProspectId(event.target.value); setGenerated(false); setMessage(''); }} options={outreachProspects.map((item) => ({ value: item.id, label: `${item.name} · ${item.company}` }))} />
          <div className="sales-outreach-context-card"><strong>{prospect.company}</strong><span>{prospect.role} · {prospect.industry}</span><span>{prospect.email}</span><StatusBadge status={prospect.status} /></div>
          <label className="sales-outreach-form-label">Product<select className="input-field select-field" defaultValue={prospect.productInterest} key={prospect.id}><option>{prospect.productInterest}</option><option>Revenue Intelligence</option><option>Customer Data Platform</option><option>Workflow Automation</option></select></label>
          <label className="sales-outreach-form-label">Product interest<input className="input-field" value={prospect.productInterest} readOnly /></label>
          <label className="sales-outreach-form-label">Pain point<textarea className="input-field textarea-field" defaultValue={prospect.businessNeed} key={`${prospect.id}-pain`} /></label>
          <Select label="Tone" value={tone} onChange={(event) => setTone(event.target.value)} options={['Warm', 'Direct', 'Insight-led'].map((value) => ({ value, label: value }))} />
          <div className="sales-outreach-personalization"><span><CheckCircle2 size={15} /> Company context</span><span><CheckCircle2 size={15} /> Buying signal</span><span><CheckCircle2 size={15} /> Role relevance</span></div>
          <Button icon={<Sparkles size={15} />} onClick={generate} fullWidth>{generated ? 'Regenerate message' : 'Generate message'}</Button>
        </section>
        <section className="sales-outreach-panel sales-outreach-message-preview">
          <div className="sales-outreach-panel__heading"><div><h2>Email preview</h2><p>Review and edit before saving or sending.</p></div><Badge variant="primary">Personalized</Badge></div>
          <div className="sales-outreach-email-meta"><span>To<strong>{prospect.name} &lt;{prospect.email}&gt;</strong></span><span>Subject<strong>A practical idea for {prospect.company}</strong></span></div>
          {message ? <Textarea aria-label="Suggested message" value={message} onChange={(event) => setMessage(event.target.value)} rows={14} /> : (
            <div className="sales-outreach-empty-preview"><Sparkles size={23} /><strong>Your message will appear here</strong><span>Generate a tailored draft using the prospect’s role, product interest, and buying signal.</span></div>
          )}
          <div className="sales-outreach-message-actions">
            <Button variant="secondary" icon={<Copy size={14} />} disabled={!message} onClick={() => { void navigator.clipboard?.writeText(message); showToast('Message copied', 'success'); }}>Copy draft</Button>
            <Button variant="outline" disabled={!message} onClick={() => showToast('Draft saved locally', 'success')}>Save draft</Button>
            <Button variant="outline" disabled={!message} onClick={() => showToast('Added to the Q4 Revenue Intelligence sequence', 'success')}>Add to sequence</Button>
            <Button icon={<Send size={14} />} disabled={!message} onClick={() => showToast(`Demo message prepared for ${prospect.name}`, 'success')}>Send</Button>
          </div>
          <p className="sales-outreach-demo-note">Demo workspace · messages are not sent to external recipients.</p>
        </section>
      </div>
    </div>
  );
}

export function SalesOutreachCampaigns() {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [selected, setSelected] = useState<OutreachCampaign | null>(null);
  const [dialerOpen, setDialerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const campaignSequence = useRef(0);
  const { showToast } = useToast();
  const [campaignName, setCampaignName] = useState('');
  const [objective, setObjective] = useState('');
  const [selectedProspectIds, setSelectedProspectIds] = useState<string[]>([]);
  const [product, setProduct] = useState('');
  const [campaignType, setCampaignType] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [followUp, setFollowUp] = useState(true);
  const [campaignStatus, setCampaignStatus] = useState<'Draft' | 'Scheduled'>('Draft');
  const [formError, setFormError] = useState('');
  const updateCampaign = (campaign: OutreachCampaign, status: OutreachCampaign['status']) => {
    setCampaigns((current) => current.map((item) => item.id === campaign.id ? { ...item, status } : item));
    showToast(`${campaign.name} ${status.toLowerCase()}`, 'success');
  };
  const createCampaign = () => {
    setFormError('');
    setCreateOpen(true);
  };
  const submitCampaign = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedProspectIds.length === 0) {
      setFormError('Select at least one prospect for this campaign.');
      return;
    }
    if (campaignStatus === 'Scheduled' && (!startDate || !startTime)) {
      setFormError('Choose a start date and time to schedule this campaign.');
      return;
    }
    campaignSequence.current += 1;
    const selectedProspects = outreachProspects.filter((prospect) => selectedProspectIds.includes(prospect.id));
    const campaign: OutreachCampaign = {
      id: `camp-new-${campaignSequence.current}`,
      name: campaignName.trim(),
      audience: selectedProspects.map((prospect) => prospect.name).join(', '),
      sent: 0,
      openRate: 0,
      replyRate: 0,
      positiveReplies: 0,
      meetings: 0,
      conversion: 0,
      status: campaignStatus,
      objective,
      product,
      campaignType,
      emailSubject: emailSubject.trim(),
      emailMessage: emailMessage.trim(),
      startDate: startDate || undefined,
      startTime: startTime || undefined,
      followUp,
      prospectIds: selectedProspectIds,
    };
    setCampaigns((current) => [campaign, ...current]);
    setCreateOpen(false);
    setCampaignName('');
    setObjective('');
    setSelectedProspectIds([]);
    setProduct('');
    setCampaignType('');
    setEmailSubject('');
    setEmailMessage('');
    setStartDate('');
    setStartTime('');
    setFollowUp(true);
    setCampaignStatus('Draft');
    showToast('Campaign created successfully', 'success');
  };

  return (
    <div className="page-content animate-fade-in sales-outreach-page">
      <WorkspaceHeader
        title="Email Campaigns"
        subtitle="Manage targeted programs and understand their contribution to pipeline."
        actions={
          <>
            <Button variant="outline" icon={<Phone size={15} />} onClick={() => setDialerOpen(true)}>
              Dial a Number
            </Button>
            <Button icon={<Plus size={15} />} onClick={createCampaign}>Create campaign</Button>
          </>
        }
      />
      <section className="sales-outreach-campaign-summary"><div><span>Emails delivered</span><strong>5,990</strong><small>Across active and completed campaigns</small></div><div><span>Average open rate</span><strong>47.1%</strong><small><ArrowUpRight size={13} /> 4.2% vs. previous quarter</small></div><div><span>Meetings generated</span><strong>168</strong><small>2.8% of delivered emails</small></div><div><span>Pipeline influenced</span><strong>$684K</strong><small>From campaign-attributed opportunities</small></div></section>
      <div className="sales-outreach-campaign-grid">{campaigns.map((campaign) => (
        <article className="sales-outreach-campaign-card" key={campaign.id}>
          <div className="sales-outreach-campaign-card__top"><span className="sales-outreach-campaign-icon"><Mail size={17} /></span><StatusBadge status={campaign.status} /><button type="button" aria-label={`More options for ${campaign.name}`} className="sales-outreach-icon-button" onClick={() => setSelected(campaign)}><MoreHorizontal size={17} /></button></div>
          <h2>{campaign.name}</h2><p className="sales-outreach-campaign-audience"><Users size={14} />{campaign.audience}</p>
          <div className="sales-outreach-campaign-metrics"><span>Emails sent<strong>{campaign.sent.toLocaleString()}</strong></span><span>Open rate<strong>{campaign.openRate}%</strong></span><span>Reply rate<strong>{campaign.replyRate}%</strong></span><span>Positive replies<strong>{campaign.positiveReplies}</strong></span><span>Meetings<strong>{campaign.meetings}</strong></span><span>Conversion<strong>{campaign.conversion}%</strong></span></div>
          <div className="sales-outreach-campaign-progress"><span style={{ width: `${Math.min(campaign.openRate, 100)}%` }} /></div>
          <div className="sales-outreach-campaign-actions"><Button size="sm" variant="ghost" onClick={() => setSelected(campaign)}>View campaign</Button>{campaign.status === 'Running' ? <Button size="sm" variant="outline" onClick={() => updateCampaign(campaign, 'Paused')}>Pause</Button> : campaign.status === 'Paused' ? <Button size="sm" onClick={() => updateCampaign(campaign, 'Running')}>Resume</Button> : campaign.status === 'Draft' ? <Button size="sm" onClick={() => updateCampaign(campaign, 'Scheduled')}>Schedule</Button> : null}</div>
        </article>
      ))}</div>
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create campaign" size="lg" portal>
        <form className="sales-outreach-campaign-form" onSubmit={submitCampaign}>
          <div className="sales-outreach-campaign-form__intro">
            <span className="sales-outreach-campaign-icon"><Mail size={17} /></span>
            <p>Set up a focused email campaign for the prospects you want to reach.</p>
          </div>
          <div className="sales-outreach-campaign-form__grid">
            <label className="sales-outreach-campaign-form__field sales-outreach-campaign-form__field--wide">
              <span>Campaign name <b>*</b></span>
              <input className="input-field" value={campaignName} onChange={(event) => setCampaignName(event.target.value)} placeholder="e.g. Q4 Product Discovery" required autoFocus />
            </label>
            <label className="sales-outreach-campaign-form__field">
              <span>Campaign objective <b>*</b></span>
              <select className="input-field select-field" value={objective} onChange={(event) => setObjective(event.target.value)} required>
                <option value="">Choose an objective</option>
                <option value="Book qualified meetings">Book qualified meetings</option>
                <option value="Generate product interest">Generate product interest</option>
                <option value="Nurture active opportunities">Nurture active opportunities</option>
                <option value="Re-engage prospects">Re-engage prospects</option>
              </select>
            </label>
            <label className="sales-outreach-campaign-form__field">
              <span>Product / service <b>*</b></span>
              <select className="input-field select-field" value={product} onChange={(event) => setProduct(event.target.value)} required>
                <option value="">Choose a product</option>
                <option>Revenue Intelligence</option>
                <option>Customer Data Platform</option>
                <option>Workflow Automation</option>
              </select>
            </label>
            <label className="sales-outreach-campaign-form__field">
              <span>Campaign type <b>*</b></span>
              <select className="input-field select-field" value={campaignType} onChange={(event) => setCampaignType(event.target.value)} required>
                <option value="">Choose a campaign type</option>
                <option>Product introduction</option>
                <option>Discovery outreach</option>
                <option>Webinar invitation</option>
                <option>Re-engagement</option>
              </select>
            </label>
            <label className="sales-outreach-campaign-form__field">
              <span>Campaign status</span>
              <select className="input-field select-field" value={campaignStatus} onChange={(event) => setCampaignStatus(event.target.value as 'Draft' | 'Scheduled')}>
                <option value="Draft">Draft</option>
                <option value="Scheduled">Scheduled</option>
              </select>
            </label>
            <fieldset className="sales-outreach-campaign-form__audience sales-outreach-campaign-form__field--wide">
              <legend>Target audience / select leads <b>*</b></legend>
              <div className="sales-outreach-campaign-form__prospects">
                {outreachProspects.map((prospect) => (
                  <label className="sales-outreach-campaign-form__prospect" key={prospect.id}>
                    <input
                      type="checkbox"
                      checked={selectedProspectIds.includes(prospect.id)}
                      onChange={(event) => {
                        setFormError('');
                        setSelectedProspectIds((current) => event.target.checked
                          ? [...current, prospect.id]
                          : current.filter((id) => id !== prospect.id));
                      }}
                    />
                    <span><strong>{prospect.name}</strong><small>{prospect.company} · {prospect.productInterest}</small></span>
                    <span className="sales-outreach-score">{prospect.totalScore}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="sales-outreach-campaign-form__field sales-outreach-campaign-form__field--wide">
              <span>Email subject <b>*</b></span>
              <input className="input-field" value={emailSubject} onChange={(event) => setEmailSubject(event.target.value)} placeholder="A practical idea for {{company}}" required />
            </label>
            <label className="sales-outreach-campaign-form__field sales-outreach-campaign-form__field--wide">
              <span>Email message / campaign content <b>*</b></span>
              <textarea className="input-field textarea-field" value={emailMessage} onChange={(event) => setEmailMessage(event.target.value)} placeholder="Write a relevant message for your selected prospects..." rows={5} required />
              <small>Personalize with account context and a clear next step.</small>
            </label>
            <label className="sales-outreach-campaign-form__field">
              <span>Start date{campaignStatus === 'Scheduled' && <b> *</b>}</span>
              <input className="input-field" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} required={campaignStatus === 'Scheduled'} />
            </label>
            <label className="sales-outreach-campaign-form__field">
              <span>Start time{campaignStatus === 'Scheduled' && <b> *</b>}</span>
              <input className="input-field" type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} required={campaignStatus === 'Scheduled'} />
            </label>
            <label className="sales-outreach-campaign-form__followup sales-outreach-campaign-form__field--wide">
              <input type="checkbox" checked={followUp} onChange={(event) => setFollowUp(event.target.checked)} />
              <span><strong>Include a follow-up</strong><small>Send one reminder if a prospect has not replied after 4 business days.</small></span>
            </label>
          </div>
          {formError && <p className="sales-outreach-campaign-form__error" role="alert">{formError}</p>}
          <div className="sales-outreach-campaign-form__actions">
            <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit" icon={<Plus size={14} />}>Create Campaign</Button>
          </div>
        </form>
      </Modal>
      <Modal open={selected !== null} onClose={() => setSelected(null)} title={selected?.name ?? 'Campaign details'} size="lg" portal>
        {selected && <div className="sales-outreach-campaign-detail"><div className="sales-outreach-campaign-detail__hero"><div><StatusBadge status={selected.status} /><h3>{selected.name}</h3><p>{selected.audience}</p></div><strong>{selected.sent.toLocaleString()}<small>emails sent</small></strong></div><div className="sales-outreach-campaign-detail__metrics">{[['Open rate', `${selected.openRate}%`], ['Reply rate', `${selected.replyRate}%`], ['Positive replies', String(selected.positiveReplies)], ['Meetings', String(selected.meetings)], ['Conversion', `${selected.conversion}%`]].map(([label, value]) => <span key={label}>{label}<strong>{value}</strong></span>)}</div><div className="sales-outreach-research-note"><strong>Performance insight</strong><p>Personalized messages centered on a clear product use case are generating the strongest engagement in this audience.</p></div></div>}
      </Modal>
      <DialerModal open={dialerOpen} onClose={() => setDialerOpen(false)} />
    </div>
  );
}

export function SalesOutreachFollowUps() {
  const [items, setItems] = useState(initialFollowUps);
  const [filter, setFilter] = useState<FollowUpItem['status']>('Today');
  const [selected, setSelected] = useState<OutreachProspect | null>(null);
  const { showToast } = useToast();
  const visible = items.filter((item) => item.status === filter);
  const changeStatus = (item: FollowUpItem, status: FollowUpItem['status']) => {
    setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, status } : entry));
    showToast(status === 'Completed' ? 'Follow-up completed' : 'Follow-up rescheduled', 'success');
  };

  return (
    <div className="page-content animate-fade-in sales-outreach-page">
      <WorkspaceHeader title="Follow-ups" subtitle="Prioritize next steps so every engaged account gets a timely response." actions={<Badge variant="warning" dot>{items.filter((item) => item.status === 'Overdue').length} overdue</Badge>} />
      <div className="sales-outreach-followup-layout">
        <aside className="sales-outreach-followup-sidebar"><div className="sales-outreach-panel__heading"><div><h2>Follow-up queue</h2><p>Stay consistent across active prospects</p></div><Clock3 size={17} /></div>{(['Today', 'Upcoming', 'Overdue', 'Completed'] as const).map((tab) => <button type="button" key={tab} className={`sales-outreach-followup-tab${filter === tab ? ' is-active' : ''}`} onClick={() => setFilter(tab)}><span>{tab}</span><strong>{items.filter((item) => item.status === tab).length}</strong></button>)}<div className="sales-outreach-followup-tip"><Sparkles size={16} /><strong>Priority tip</strong><p>Responding to high-intent signals within one business day can help keep buying conversations moving.</p></div></aside>
        <section className="sales-outreach-panel sales-outreach-followup-list"><div className="sales-outreach-panel__heading"><div><h2>{filter} follow-ups</h2><p>{visible.length} actions in this queue</p></div><Button size="sm" variant="secondary" icon={<Plus size={14} />} onClick={() => showToast('Select a prospect from Lead Research to add a follow-up', 'info')}>Add reminder</Button></div>
          {visible.length === 0 && <p className="sales-outreach-empty">No {filter.toLowerCase()} follow-ups. Choose another queue.</p>}
          {visible.map((item) => { const prospect = prospectById(item.prospectId); return (
            <article className={`sales-outreach-followup-card priority-${item.priority.toLowerCase()}`} key={item.id}>
              <span className="sales-outreach-followup-card__marker"><Clock3 size={16} /></span>
              <div className="sales-outreach-followup-card__content"><div className="sales-outreach-followup-card__top"><div><h3>{prospect.name}</h3><p>{prospect.company} · {prospect.role}</p></div><StatusBadge status={item.status} /></div><div className="sales-outreach-followup-meta"><span><small>Last contact</small><strong>{item.lastContact}</strong></span><span><small>Reason</small><strong>{item.reason}</strong></span><span><small>Next action</small><strong>{item.nextAction}</strong></span><span><small>Due</small><strong>{item.dueDate}</strong></span></div><div className="sales-outreach-row-actions"><Button size="sm" variant="ghost" onClick={() => setSelected(prospect)}>Open lead</Button><ProspectCallButton prospect={prospect} />{item.status !== 'Completed' && <><Button size="sm" variant="secondary" onClick={() => changeStatus(item, 'Completed')}>Complete</Button><Button size="sm" variant="outline" onClick={() => changeStatus(item, item.status === 'Upcoming' ? 'Today' : 'Upcoming')}>Reschedule</Button></>}</div></div>
            </article>
          ); })}
        </section>
      </div>
      <Modal open={selected !== null} onClose={() => setSelected(null)} title="Prospect details" size="md">{selected && <div className="sales-outreach-prospect-drawer"><div className="sales-outreach-prospect-identity"><span className="sales-avatar">{selected.name.split(' ').map((part) => part[0]).join('')}</span><div><h3>{selected.name}</h3><p>{selected.role} · {selected.company}</p></div><span className="sales-outreach-score">{selected.totalScore}</span></div><div className="sales-outreach-detail-grid"><span>Email<strong>{selected.email}</strong></span><span>Phone<strong>{selected.phone}</strong></span><span>Interest<strong>{selected.productInterest}</strong></span><span>Buying signal<strong>{selected.buyingSignal}</strong></span></div><ProspectCallButton prospect={selected} /></div>}</Modal>
    </div>
  );
}

export function SalesOutreachMeetingBooking() {
  const [meetings, setMeetings] = useState(initialMeetings);
  const [selectedDate, setSelectedDate] = useState('Oct 08, 2026');
  const [selectedProspectId, setSelectedProspectId] = useState(outreachProspects[0].id);
  const meetingSequence = useRef(0);
  const { showToast } = useToast();
  const filteredMeetings = meetings.filter((meeting) => meeting.date === selectedDate && meeting.status !== 'Cancelled');
  const addMeeting = (prospectId: string, time: string) => {
    const prospect = prospectById(prospectId);
    meetingSequence.current += 1;
    const meeting: OutreachMeeting = { id: `meet-new-${meetingSequence.current}`, prospectId, type: 'Product discovery', date: selectedDate, time, status: 'Confirmed' };
    setMeetings((current) => [...current, meeting]);
    showToast(`Meeting booked with ${prospect.name}`, 'success');
  };

  return (
    <div className="page-content animate-fade-in sales-outreach-page">
      <WorkspaceHeader title="Meeting Booking" subtitle="Coordinate discovery conversations and keep your calendar moving." actions={<Button icon={<CalendarDays size={15} />} onClick={() => showToast('Calendar is up to date', 'success')}>Sync calendar</Button>} />
      <div className="sales-outreach-calendar-layout">
        <section className="sales-outreach-panel sales-outreach-calendar">
          <div className="sales-outreach-panel__heading"><div><h2>October 2026</h2><p>Choose a date to review availability and meetings.</p></div><div className="sales-outreach-calendar__arrows"><Button size="sm" variant="ghost" aria-label="Previous week">‹</Button><Button size="sm" variant="ghost" aria-label="Next week">›</Button></div></div>
          <div className="sales-outreach-calendar__week">{['Mon 05', 'Tue 06', 'Wed 07', 'Thu 08', 'Fri 09', 'Sat 10', 'Sun 11'].map((day, index) => { const date = `Oct ${String(index + 5).padStart(2, '0')}, 2026`; const count = meetings.filter((meeting) => meeting.date === date && meeting.status !== 'Cancelled').length; return <button type="button" className={selectedDate === date ? 'is-selected' : ''} key={day} onClick={() => setSelectedDate(date)}><small>{day.split(' ')[0]}</small><strong>{day.split(' ')[1]}</strong>{count > 0 && <span>{count} meetings</span>}</button>; })}</div>
          <div className="sales-outreach-calendar__availability"><div className="sales-outreach-booking-controls"><div><h3>Available slots</h3><p>October {selectedDate.slice(4, 6)} · Eastern Time</p></div><Select aria-label="Select prospect to book" value={selectedProspectId} onChange={(event) => setSelectedProspectId(event.target.value)} options={outreachProspects.map((prospect) => ({ value: prospect.id, label: `${prospect.name} · ${prospect.company}` }))} /></div><div className="sales-outreach-slots">{['9:00 AM', '10:30 AM', '1:00 PM', '2:30 PM', '4:00 PM'].map((time) => <button type="button" key={time} aria-label={`Book meeting at ${time}`} onClick={() => addMeeting(selectedProspectId, time)}>Book {time}<Plus size={12} /></button>)}</div></div>
        </section>
        <aside className="sales-outreach-calendar-aside"><div className="sales-outreach-panel sales-outreach-requests"><div className="sales-outreach-panel__heading"><div><h2>Meeting requests</h2><p>Prospects ready to connect</p></div><Badge variant="warning">{meetings.filter((meeting) => meeting.status === 'Requested').length}</Badge></div>{meetings.filter((meeting) => meeting.status === 'Requested').map((meeting) => { const prospect = prospectById(meeting.prospectId); return <article className="sales-outreach-request" key={meeting.id}><strong>{prospect.name}</strong><span>{prospect.company} · {meeting.type}</span><div><Button size="sm" onClick={() => setMeetings((current) => current.map((item) => item.id === meeting.id ? { ...item, status: 'Confirmed' } : item))}>Confirm</Button><Button size="sm" variant="ghost" onClick={() => setMeetings((current) => current.map((item) => item.id === meeting.id ? { ...item, status: 'Cancelled' } : item))}>Decline</Button></div></article>; })}</div><div className="sales-outreach-panel sales-outreach-team-availability"><h2>Team availability</h2><p>Sales team · 4 calendars connected</p><div><span>Today</span><strong>8 open slots</strong></div><div><span>Tomorrow</span><strong>12 open slots</strong></div><div><span>Average response</span><strong>2.4 hours</strong></div></div></aside>
      </div>
      <section className="sales-outreach-panel sales-outreach-scheduled-meetings"><div className="sales-outreach-section-heading"><div><h2>Upcoming meetings</h2><p>Prospect conversations for {selectedDate}</p></div><Badge variant="info">{filteredMeetings.length} scheduled</Badge></div><MeetingsList meetings={filteredMeetings} />{filteredMeetings.map((meeting) => <div className="sales-outreach-meeting-actions" key={`${meeting.id}-actions`}><span>{prospectById(meeting.prospectId).name}</span><Button size="sm" variant="secondary" onClick={() => { const newDate = meeting.date === 'Oct 08, 2026' ? 'Oct 09, 2026' : 'Oct 08, 2026'; setMeetings((current) => current.map((item) => item.id === meeting.id ? { ...item, date: newDate } : item)); setSelectedDate(newDate); showToast(`Meeting moved to ${newDate}`, 'success'); }}>Reschedule</Button><Button size="sm" variant="ghost" onClick={() => { setMeetings((current) => current.map((item) => item.id === meeting.id ? { ...item, status: 'Cancelled' } : item)); showToast('Meeting cancelled', 'success'); }}>Cancel</Button></div>)}</section>
    </div>
  );
}

const activityFilters = ['All', 'Emails', 'Calls', 'Meetings', 'Follow-ups', 'Research'] as const;

export function SalesOutreachActivity() {
  const [filter, setFilter] = useState<(typeof activityFilters)[number]>('All');
  const filtered = outreachActivities.filter((activity) => filter === 'All' || activity.type === filter.replace(/s$/, '') || (filter === 'Emails' && activity.type === 'Email'));
  return (
    <div className="page-content animate-fade-in sales-outreach-page">
      <WorkspaceHeader title="Sales Outreach Activity" subtitle="A unified timeline of prospect engagement, outreach, and pipeline progress." />
      <div className="sales-outreach-activity-summary"><div><strong>126</strong><span>Activities this week</span></div><div><strong>38</strong><span>Prospects engaged</span></div><div><strong>14</strong><span>Positive responses</span></div><div><strong>9</strong><span>New opportunities</span></div></div>
      <section className="sales-outreach-panel sales-outreach-activity-panel">
        <div className="sales-outreach-panel__heading"><div><h2>Engagement timeline</h2><p>Recent activity across your sales pipeline</p></div><Select aria-label="Filter activities" value={filter} onChange={(event) => setFilter(event.target.value as (typeof activityFilters)[number])} options={activityFilters.map((value) => ({ value, label: value }))} /></div>
        <div className="sales-outreach-timeline">{filtered.map((activity) => { const prospect = prospectById(activity.prospectId); const Icon = activity.type === 'Email' ? Mail : activity.type === 'Call' ? Phone : activity.type === 'Meeting' ? CalendarDays : activity.type === 'Follow-up' ? Check : activity.type === 'Research' ? Search : Target; return <article className="sales-outreach-timeline-item" key={activity.id}><span className={`sales-outreach-timeline-icon type-${activity.type.toLowerCase().replace(/\s+/g, '-')}`}><Icon size={15} /></span><span className="sales-outreach-timeline-copy"><span className="sales-outreach-timeline-top"><strong>{activity.action}</strong><time>{activity.when}</time></span><p>{activity.detail}</p><small>{prospect.name} · {prospect.company}</small></span></article>; })}{filtered.length === 0 && <p className="sales-outreach-empty">No activity in this category yet.</p>}</div>
      </section>
      <div className="sales-outreach-activity-foot"><ArrowDownRight size={15} /> Activities are sample records for this local Sales Outreach workspace.</div>
    </div>
  );
}

export const SalesOutreachLanding = SalesOutreachDashboard;
