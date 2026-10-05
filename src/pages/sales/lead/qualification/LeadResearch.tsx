import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, MapPin, Search, SlidersHorizontal, Sparkles, UserRound } from 'lucide-react';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { PageHeader } from '../../../../components/ui/Layout';
import { QualificationCallButton } from '../../../../components/sales/lead/qualification/QualificationCallButton';
import { qualificationLeads } from '../../../../components/sales/lead/qualification/QualificationData';

const base = '/coming-soon/lead-qualification';

const LeadResearch: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [intentFilter, setIntentFilter] = useState('All intent');
  const [researchedIds, setResearchedIds] = useState<string[]>([]);
  const leads = useMemo(() => qualificationLeads.filter((lead) => {
    const term = query.trim().toLowerCase();
    const matchesQuery = !term || `${lead.name} ${lead.company} ${lead.industry} ${lead.location}`.toLowerCase().includes(term);
    return matchesQuery && (intentFilter === 'All intent' || lead.intentLevel === intentFilter);
  }), [intentFilter, query]);

  return (
    <div className="page-content animate-fade-in qualification-page">
      <PageHeader title="Lead Research" subtitle="Discover the people, accounts, and buying signals worth a closer look." />
      <section className="qualification-research-toolbar">
        <div className="qualification-research-toolbar__search"><Input value={query} onChange={(event) => setQuery(event.target.value)} leftIcon={<Search size={15} />} placeholder="Search people, companies, or markets" /></div>
        <label className="qualification-filter"><SlidersHorizontal size={15} /><select aria-label="Filter by intent" value={intentFilter} onChange={(event) => setIntentFilter(event.target.value)}><option>All intent</option><option>High</option><option>Medium</option><option>Low</option></select></label>
        <span className="qualification-result-count">{leads.length} researched leads</span>
      </section>

      <div className="qualification-research-layout">
        <section className="qualification-research-results" aria-label="Lead research results">
          {leads.map((lead) => {
            const researched = researchedIds.includes(lead.id) || lead.researchStatus === 'Researched';
            return (
              <article className="qualification-research-card" key={lead.id}>
                <div className="qualification-research-card__top">
                  <span className="sales-avatar">{lead.name.split(' ').map((part) => part[0]).join('')}</span>
                  <div className="qualification-research-card__identity"><h2>{lead.name}</h2><p>{lead.company}</p></div>
                  <Badge variant={lead.intentLevel === 'High' ? 'success' : lead.intentLevel === 'Medium' ? 'warning' : 'neutral'} dot>{lead.intentLevel} intent</Badge>
                  <Badge variant={researched ? 'success' : 'info'}>{researched ? 'Researched' : lead.researchStatus}</Badge>
                </div>
                <div className="qualification-research-card__details">
                  <span><Building2 size={14} />{lead.industry} · {lead.companySize} employees</span>
                  <span><MapPin size={14} />{lead.location}</span>
                  <span><UserRound size={14} />{lead.salesRep}</span>
                </div>
                <div className="qualification-research-card__signal">
                  <Sparkles size={15} /><span><strong>Research signal</strong>{lead.intent}</span><b>{lead.confidence}%</b>
                </div>
                <div className="qualification-research-card__footer">
                  <span>Source: <strong>{lead.source}</strong><small>{lead.recentActivity}</small></span>
                  <div>
                    <QualificationCallButton contactName={lead.name} company={lead.company} phone={lead.phone} />
                    <Button size="sm" variant={researched ? 'secondary' : 'outline'} onClick={() => setResearchedIds((ids) => ids.includes(lead.id) ? ids : [...ids, lead.id])}>{researched ? 'Researched' : 'Mark researched'}</Button>
                    <Button size="sm" variant="ghost" onClick={() => navigate(`${base}/qualification-criteria`)}>Review <ArrowRight size={13} /></Button>
                  </div>
                </div>
              </article>
            );
          })}
          {leads.length === 0 && <div className="sales-empty-state">No leads match your search. Try changing the search or intent filter.</div>}
        </section>

        <aside className="qualification-research-aside">
          <div className="qualification-section-heading"><div><h2>Research snapshot</h2><p>This qualification cycle</p></div><Sparkles size={17} /></div>
          <div className="qualification-research-aside__total"><strong>248</strong><span>profiles reviewed this week</span></div>
          <div className="qualification-research-source"><span>High-intent signals</span><strong>86</strong></div>
          <div className="qualification-research-source"><span>Partner referrals</span><strong>74</strong></div>
          <div className="qualification-research-source"><span>Web & content</span><strong>53</strong></div>
          <div className="qualification-research-source"><span>Events & webinars</span><strong>35</strong></div>
          <div className="qualification-research-insight"><Sparkles size={15} /><span>Healthcare and retail accounts are showing the strongest recent buying intent.</span></div>
        </aside>
      </div>
    </div>
  );
};

export default LeadResearch;
