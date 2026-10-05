import React, { useEffect, useState } from 'react';
import { Phone, PhoneOff, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface SalesCallButtonProps {
  contactName: string;
}

const formatDuration = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

export const SalesCallButton: React.FC<SalesCallButtonProps> = ({ contactName }) => {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'Dialing' | 'Connected' | 'Ended'>('Dialing');
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!open || status !== 'Dialing') return;
    const connectTimeout = window.setTimeout(() => setStatus('Connected'), 1500);
    return () => window.clearTimeout(connectTimeout);
  }, [open, status]);

  useEffect(() => {
    if (!open || status !== 'Connected') return;
    const durationInterval = window.setInterval(() => setDuration((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(durationInterval);
  }, [open, status]);

  const startCall = () => {
    setDuration(0);
    setStatus('Dialing');
    setOpen(true);
  };

  return (
    <>
      <Button size="sm" variant="outline" icon={<Phone size={13} />} onClick={startCall}>
        Call
      </Button>
      {open && (
        <div className="sales-call-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}>
          <section className="sales-call-modal" role="dialog" aria-modal="true" aria-labelledby="sales-call-title">
            <button className="sales-call-close" type="button" aria-label="Close call dialog" onClick={() => setOpen(false)}><X size={17} /></button>
            <span className={`sales-call-avatar${status === 'Connected' ? ' is-connected' : ''}`}><Phone size={22} /></span>
            <h2 id="sales-call-title">{status === 'Ended' ? 'Call ended' : `Calling ${contactName}...`}</h2>
            <p className="sales-call-contact">{contactName}</p>
            <div className="sales-call-details">
              <span>Call status</span><strong className={`sales-call-status sales-call-status--${status.toLowerCase()}`}>{status}</strong>
              <span>Call duration</span><strong className="sales-call-duration">{formatDuration(duration)}</strong>
            </div>
            {status !== 'Ended' ? (
              <Button variant="danger" icon={<PhoneOff size={15} />} onClick={() => setStatus('Ended')}>End Call</Button>
            ) : (
              <Button variant="secondary" onClick={() => setOpen(false)}>Close</Button>
            )}
            <small>Demo call · no phone connection is made</small>
          </section>
        </div>
      )}
    </>
  );
};
