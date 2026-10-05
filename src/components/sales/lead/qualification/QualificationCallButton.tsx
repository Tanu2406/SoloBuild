import React, { useEffect, useState } from 'react';
import { Phone, PhoneOff, X } from 'lucide-react';
import { Button } from '../../../ui/Button';

interface QualificationCallButtonProps {
  contactName: string;
  company: string;
  phone: string;
}

const formatDuration = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

export const QualificationCallButton: React.FC<QualificationCallButtonProps> = ({
  contactName,
  company,
  phone,
}) => {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'Dialing' | 'Connected' | 'Ended'>('Dialing');
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!open || status !== 'Dialing') return;
    const connectTimer = window.setTimeout(() => setStatus('Connected'), 1200);
    return () => window.clearTimeout(connectTimer);
  }, [open, status]);

  useEffect(() => {
    if (!open || status !== 'Connected') return;
    const timer = window.setInterval(() => setDuration((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [open, status]);

  const startCall = () => {
    setStatus('Dialing');
    setDuration(0);
    setOpen(true);
  };

  return (
    <>
      <Button size="sm" variant="outline" icon={<Phone size={13} />} onClick={startCall}>
        Call
      </Button>
      {open && (
        <div
          className="qualification-call-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <section className="qualification-call-modal" role="dialog" aria-modal="true" aria-labelledby="qualification-call-title">
            <button
              className="qualification-call-modal__close"
              type="button"
              aria-label="Close call dialog"
              onClick={() => setOpen(false)}
            >
              <X size={17} />
            </button>
            <span className={`qualification-call-modal__icon${status === 'Connected' ? ' is-connected' : ''}`}>
              <Phone size={21} />
            </span>
            <h2 id="qualification-call-title">{status === 'Ended' ? 'Call ended' : `Calling ${contactName}`}</h2>
            <p>{company}</p>
            <div className="qualification-call-modal__details">
              <span>Contact</span><strong>{contactName}</strong>
              <span>Phone number</span><strong>{phone}</strong>
              <span>Calling status</span><strong className={`sales-call-status--${status.toLowerCase()}`}>{status}</strong>
              <span>Call duration</span><strong className="sales-call-duration">{formatDuration(duration)}</strong>
            </div>
            {status === 'Ended'
              ? <Button variant="secondary" onClick={() => setOpen(false)}>Close</Button>
              : <Button variant="danger" icon={<PhoneOff size={15} />} onClick={() => setStatus('Ended')}>End Call</Button>}
            <small>Demo call · no phone connection is made</small>
          </section>
        </div>
      )}
    </>
  );
};
