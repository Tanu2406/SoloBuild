import { useState } from 'react';
import { Check, Clock3, Eye, Mail, Phone, Users, X } from 'lucide-react';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Modal } from '../../../../components/ui/Modal';
import { formatMeetingDate, prospectForMeeting } from './data';
import { useMeetingStore, updateRequest } from './store';
import { EmptyMeetings, MeetingCallAction, MeetingPage, MeetingStatusBadge, PanelHeading, ProspectIdentity } from './MeetingSchedulingComponents';

export default function MeetingRequests() {
  const { requests } = useMeetingStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = requests.find((request) => request.id === selectedId) ?? null;
  const selectedProspect = selected ? prospectForMeeting(selected.prospectId) : null;

  return (
    <MeetingPage title="Meeting Requests" subtitle="Review inbound meeting interest and respond with a clear next step."
      actions={<Badge variant="warning" dot>{requests.filter((request) => request.status === 'Requested').length} awaiting response</Badge>}>
      <section className="meeting-panel">
        <PanelHeading title="Prospect requests" detail="Requests from qualified sales prospects" icon={<Users size={16} />} />
        {requests.length ? <div className="meeting-request-table">
          <div className="meeting-table__head"><span>Prospect</span><span>Meeting request</span><span>Preferred time</span><span>Status</span><span>Actions</span></div>
          {requests.map((request) => {
            const prospect = prospectForMeeting(request.prospectId);
            const isPending = request.status === 'Requested';
            return <article className="meeting-table__row" key={request.id}>
              <ProspectIdentity prospect={prospect} subtitle={prospect.company} />
              <div className="meeting-table__cell"><strong>{request.type}</strong><small>{prospect.email}</small></div>
              <div className="meeting-table__cell"><strong>{formatMeetingDate(request.preferredDate)}</strong><small>{request.preferredTime}</small></div>
              <MeetingStatusBadge status={request.status} />
              <div className="meeting-inline-actions">
                <Button size="sm" variant="ghost" icon={<Eye size={14} />} aria-label={`View ${prospect.name} request`} onClick={() => setSelectedId(request.id)}>View</Button>
                {isPending && <>
                  <Button size="sm" icon={<Check size={13} />} aria-label={`Accept ${prospect.name} request`} onClick={() => updateRequest(request.id, 'Accepted')}>Accept</Button>
                  <Button size="sm" variant="ghost" icon={<Clock3 size={13} />} aria-label={`Suggest time to ${prospect.name}`} onClick={() => updateRequest(request.id, 'Time suggested')}>Suggest</Button>
                  <Button size="sm" variant="ghost" icon={<X size={13} />} aria-label={`Reject ${prospect.name} request`} onClick={() => updateRequest(request.id, 'Rejected')}>Reject</Button>
                </>}
              </div>
            </article>;
          })}
        </div> : <EmptyMeetings title="No meeting requests yet" detail="Inbound requests from your prospects will appear here." />}
      </section>

      <Modal open={!!selected && !!selectedProspect} onClose={() => setSelectedId(null)} title="Meeting request" size="md" portal>
        {selected && selectedProspect && <div className="meeting-request-detail">
          <ProspectIdentity prospect={selectedProspect} subtitle={`${selectedProspect.company} · ${selectedProspect.designation}`} />
          <MeetingStatusBadge status={selected.status} />
          <div className="meeting-detail-grid">
            <span><small>Requested meeting</small><strong>{selected.type}</strong></span>
            <span><small>Preferred date</small><strong>{formatMeetingDate(selected.preferredDate)}</strong></span>
            <span><small>Preferred time</small><strong>{selected.preferredTime}</strong></span>
            <span><small>Lead status</small><strong>{selectedProspect.status}</strong></span>
          </div>
          <p className="meeting-request-detail__message">“{selected.message}”</p>
          <div className="meeting-request-detail__contact"><span><Mail size={14} />{selectedProspect.email}</span><span><Phone size={14} />{selectedProspect.phone}</span></div>
          <div className="meeting-inline-actions">
            <MeetingCallAction prospect={selectedProspect} />
            {selected.status === 'Requested' && <Button icon={<Check size={14} />} onClick={() => updateRequest(selected.id, 'Accepted')}>Accept request</Button>}
          </div>
        </div>}
      </Modal>
    </MeetingPage>
  );
}
