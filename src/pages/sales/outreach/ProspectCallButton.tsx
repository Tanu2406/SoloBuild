import { useState } from 'react';
import { Phone } from 'lucide-react';
import { DialerModal } from '../../../components/product/DialerModal';
import { Button } from '../../../components/ui/Button';
import type { OutreachProspect } from './data';

export function ProspectCallButton({
  prospect,
  size = 'sm',
}: {
  prospect: OutreachProspect;
  size?: 'sm' | 'md';
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size={size}
        variant="outline"
        icon={<Phone size={14} />}
        onClick={() => setOpen(true)}
        disabled={!prospect.phone}
      >
        Call
      </Button>
      <DialerModal
        open={open}
        onClose={() => setOpen(false)}
        initialPhone={prospect.phone}
        initialCandidateName={prospect.name}
        initialPurpose="general"
        contactType="lead"
        contactContext={{
          company: prospect.company,
          email: prospect.email,
          designation: prospect.role,
          status: prospect.status,
          score: prospect.totalScore,
          interest: prospect.productInterest,
        }}
      />
    </>
  );
}
