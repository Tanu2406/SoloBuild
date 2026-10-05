import React, { useMemo, useState } from 'react';
import { Building2, MapPin, Search, SlidersHorizontal, UserRound, Users } from 'lucide-react';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { PageHeader } from '../../../../components/ui/Layout';
import { useToast } from '../../../../components/ui/Toast';
import { salesLeads } from '../../../../components/sales/SalesData';
import { SalesCallButton } from '../../../../components/sales/SalesCallButton';

const LeadResearch: React.FC = () => {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('All industries');
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const industries = ['All industries', ...new Set(salesLeads.map((lead) => lead.industry))];
  const results = useMemo(() => salesLeads.filter((lead) => {
    const term = search.toLowerCase().trim();
    return (!term || `${lead.name} ${lead.company} ${lead.industry} ${lead.location}`.toLowerCase().includes(term)) &&
      (industry === 'All industries' || lead.industry === industry);
  }), [industry, search]);

  return (
    <div className="page-content animate-fade-in">
      <PageHeader title="Lead Research" subtitle="Discover target accounts and decision-makers across your market." />
      <section className="sales-research-toolbar">
        <div className="sales-research-search">
          <Input value={search} onChange={(event) => setSearch(event.target.value)} leftIcon={<Search size={15} />} placeholder="Search companies, people, industries…" />
        </div>
        <label className="sales-filter-select"><SlidersHorizontal size={15} />
          <select aria-label="Filter by industry" value={industry} onChange={(event) => setIndustry(event.target.value)}>
            {industries.map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
        <span className="sales-results-count">{results.length} prospects</span>
      </section>
      <section className="sales-research-layout">
        <div className="sales-research-results">
          {results.map((lead) => (
            <article className="sales-research-card" key={lead.id}>
              <div className="sales-research-card__identity">
                <span className="sales-avatar">{lead.name.split(' ').map((part) => part[0]).join('')}</span>
                <div><h2>{lead.name}</h2><p>{lead.company}</p></div>
                <Badge variant={lead.category === 'Hot' ? 'error' : lead.category === 'Warm' ? 'warning' : 'neutral'} dot>{lead.category} lead</Badge>
              </div>
              <div className="sales-research-card__details">
                <span><Building2 size={14} />{lead.industry} · {lead.companySize} employees</span>
                <span><MapPin size={14} />{lead.location}</span>
                <span><UserRound size={14} />{lead.contact}</span>
              </div>
              <div className="sales-research-card__footer">
                <span>Discovered via <strong>{lead.source}</strong></span>
                <div className="sales-research-actions">
                  <SalesCallButton contactName={lead.name} />
                  <Button size="sm" variant={savedIds.includes(lead.id) ? 'secondary' : 'outline'} onClick={() => {
                    setSavedIds((ids) => ids.includes(lead.id) ? ids : [...ids, lead.id]);
                    showToast(`${lead.name} saved to research`, 'success');
                  }}>{savedIds.includes(lead.id) ? 'Added to list' : 'Save prospect'}</Button>
                </div>
              </div>
            </article>
          ))}
          {results.length === 0 && <div className="sales-empty-state">No prospects match those filters. Try a broader search.</div>}
        </div>
        <aside className="sales-research-aside">
          <div className="sales-panel__header"><div><h2>Discovery overview</h2><p>Current research batch</p></div><Users size={17} /></div>
          <div className="sales-research-total"><strong>248</strong><span>prospects identified this week</span></div>
          <div className="sales-research-source"><span>Website intent</span><strong>96</strong></div>
          <div className="sales-research-source"><span>Partner referrals</span><strong>74</strong></div>
          <div className="sales-research-source"><span>Social signals</span><strong>51</strong></div>
          <div className="sales-research-source"><span>Events & webinars</span><strong>27</strong></div>
        </aside>
      </section>
    </div>
  );
};

export default LeadResearch;
