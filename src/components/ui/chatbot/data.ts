import type { ChatSolution } from './types';

export const talentAcquisitionSolution: ChatSolution = {
  name: 'Talent Acquisition',
  tools: [
    'Hiring Campaigns',
    'Candidate Profiles',
    'Resume Screening',
  ],
  actions: [
    'Show my campaigns',
    'Show candidates',
    'Create campaign',
    'Upload candidates',
  ],
};
