import React, { useState } from 'react';
import { CalendarDays, Phone, UserRound } from 'lucide-react';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { DialerModal } from '../../../../components/product/DialerModal';
import { PageHeader } from '../../../../components/ui/Layout';
import type { SalesLead } from '../../../../components/sales/SalesData';
import type { MeetingStatus, ReminderStatus } from './data';
import './meeting-scheduling.css';

export const dashboardTitle = 'Meeting & Scheduling';
export const dashboardSubtitle = 'Coordinate sales meetings, manage availability, and keep every prospect conversation on schedule.';

export function MeetingPage({ title, subtitle, actions, children }: {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="page-content animate-fade-in meeting-scheduling-page">
      <PageHeader title={title} subtitle={subtitle} actions={actions} />
      {children}
    </main>
  );
}

export function MeetingStatusBadge({ status }: { status: MeetingStatus | ReminderStatus | string }) {
  const variant = status === 'Completed' || status === 'Sent' || status === 'Accepted'
    ? 'success'
    : status === 'Cancelled' || status === 'Rejected'
      ? 'neutral'
      : status === 'Requested' || status === 'Pending'
        ? 'warning'
        : 'info';
  return <Badge variant={variant} dot>{status}</Badge>;
}

export function ProspectIdentity({ prospect, subtitle }: { prospect: SalesLead; subtitle?: string }) {
  return (
    <span className="meeting-prospect">
      <span className="meeting-prospect__avatar"><UserRound size={15} /></span>
      <span><strong>{prospect.name}</strong><small>{subtitle ?? prospect.company}</small></span>
    </span>
  );
}

export function PanelHeading({ title, detail, icon }: { title: string; detail?: string; icon?: React.ReactNode }) {
  return (
    <div className="meeting-panel__heading">
      <div className="meeting-panel__heading-icon">{icon ?? <CalendarDays size={16} />}</div>
      <div><h2>{title}</h2>{detail && <p>{detail}</p>}</div>
    </div>
  );
}

export function MeetingCallAction({ prospect, size = 'sm' }: { prospect: SalesLead; size?: 'sm' | 'md' }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size={size} variant="outline" icon={<Phone size={14} />} onClick={() => setOpen(true)}>Call</Button>
      <DialerModal
        open={open}
        onClose={() => setOpen(false)}
        initialPhone={prospect.phone}
        initialCandidateName={prospect.name}
        contactType="lead"
        contactContext={{
          company: prospect.company,
          email: prospect.email,
          designation: prospect.designation,
          status: prospect.status,
          score: prospect.totalScore,
          interest: prospect.businessNeed,
        }}
      />
    </>
  );
}

export function EmptyMeetings({ title, detail }: { title: string; detail: string }) {
  return <div className="meeting-empty"><CalendarDays size={22} /><strong>{title}</strong><span>{detail}</span></div>;
}

export function MetricCard({ label, value, note, accent }: { label: string; value: string | number; note: string; accent?: string }) {
  return (
    <article className="meeting-metric" style={accent ? { '--meeting-accent': accent } as React.CSSProperties : undefined}>
      <span>{label}</span><strong>{value}</strong><small>{note}</small>
    </article>
  );
}
