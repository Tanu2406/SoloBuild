import React, { useState } from 'react';
import { Megaphone, Plus, TrendingUp, Users, X } from 'lucide-react';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { PageHeader } from '../../../../components/ui/Layout';

interface Campaign {
  id: string;
  name: string;
  channel: string;
  status: 'Active' | 'Scheduled' | 'Paused';
  leads: number;
  contacted: number;
  qualified: number;
  conversion: number;
  startDate: string;
  spend: string;
}

const seedCampaigns: Campaign[] = [
  { id: 'c1', name: 'Healthcare Growth Q4', channel: 'LinkedIn + Email', status: 'Active', leads: 342, contacted: 298, qualified: 86, conversion: 25.1, startDate: 'Sep 02, 2026', spend: '$8,450' },
  { id: 'c2', name: 'SaaS Decision Makers', channel: 'Outbound email', status: 'Active', leads: 286, contacted: 241, qualified: 59, conversion: 20.6, startDate: 'Sep 10, 2026', spend: '$5,280' },
  { id: 'c3', name: 'Revenue Leaders Webinar', channel: 'Webinar', status: 'Scheduled', leads: 124, contacted: 0, qualified: 31, conversion: 25.0, startDate: 'Oct 15, 2026', spend: '$2,100' },
  { id: 'c4', name: 'Retail Expansion', channel: 'Partner referral', status: 'Paused', leads: 198, contacted: 176, qualified: 34, conversion: 17.2, startDate: 'Aug 18, 2026', spend: '$3,760' },
];

const Campaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState(seedCampaigns);
  const [creating, setCreating] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [channel, setChannel] = useState('Outbound email');

  const createCampaign = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = campaignName.trim();
    if (!name) return;
    setCampaigns((items) => [{
      id: `c-${Date.now()}`,
      name,
      channel,
      status: 'Scheduled',
      leads: 0,
      contacted: 0,
      qualified: 0,
      conversion: 0,
      startDate: 'Oct 06, 2026',
      spend: '$0',
    }, ...items]);
    setCampaignName('');
    setCreating(false);
  };

  return (
    <div className="page-content animate-fade-in">
      <PageHeader
        title="Campaigns"
        subtitle="Plan demand generation and monitor campaign-sourced pipeline."
        actions={<Button icon={<Plus size={15} />} onClick={() => setCreating((open) => !open)}>Create Campaign</Button>}
      />
      {creating && (
        <form className="sales-campaign-create" onSubmit={createCampaign}>
          <label>
            Campaign name
            <input autoFocus value={campaignName} onChange={(event) => setCampaignName(event.target.value)} placeholder="e.g. Enterprise expansion Q4" required />
          </label>
          <label>
            Channel
            <select value={channel} onChange={(event) => setChannel(event.target.value)}>
              <option>Outbound email</option><option>LinkedIn + Email</option><option>Webinar</option><option>Partner referral</option>
            </select>
          </label>
          <Button type="submit" size="sm">Create</Button>
          <Button type="button" variant="ghost" size="sm" icon={<X size={14} />} onClick={() => setCreating(false)}>Cancel</Button>
        </form>
      )}
      <div className="sales-campaign-summary">
        <div><span>Campaigns running</span><strong>{campaigns.filter((item) => item.status === 'Active').length}</strong></div>
        <div><span>Total leads</span><strong>{campaigns.reduce((sum, item) => sum + item.leads, 0).toLocaleString()}</strong></div>
        <div><span>Contacted leads</span><strong>{campaigns.reduce((sum, item) => sum + item.contacted, 0).toLocaleString()}</strong></div>
        <div><span>Qualified leads</span><strong>{campaigns.reduce((sum, item) => sum + item.qualified, 0).toLocaleString()}</strong></div>
        <div><span>Avg. conversion</span><strong>22.4%</strong></div>
        <div><span>Pipeline influenced</span><strong>$428k</strong></div>
      </div>
      <div className="sales-campaign-grid">
        {campaigns.map((campaign) => (
          <article className="sales-campaign-card" key={campaign.id}>
            <div className="sales-campaign-card__top">
              <span className="sales-icon-tile"><Megaphone size={18} /></span>
              <Badge variant={campaign.status === 'Active' ? 'success' : campaign.status === 'Scheduled' ? 'info' : 'warning'} dot>{campaign.status}</Badge>
            </div>
            <h2>{campaign.name}</h2>
            <p className="sales-campaign-card__channel">{campaign.channel}</p>
            <div className="sales-campaign-card__metrics">
              <div><Users size={14} /><span>Total leads</span><strong>{campaign.leads}</strong></div>
              <div><TrendingUp size={14} /><span>Contacted</span><strong>{campaign.contacted}</strong></div>
              <div><TrendingUp size={14} /><span>Qualified</span><strong>{campaign.qualified}</strong></div>
              <div><TrendingUp size={14} /><span>Conversion</span><strong>{campaign.conversion}%</strong></div>
            </div>
            <div className="sales-campaign-card__footer">
              <span>Starts {campaign.startDate} · {campaign.spend} spend</span>
              <button type="button" onClick={() => setCampaigns((items) => items.map((item) => item.id === campaign.id ? { ...item, status: item.status === 'Active' ? 'Paused' : 'Active' } : item))}>
                {campaign.status === 'Active' ? 'Pause' : 'Activate'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Campaigns;
