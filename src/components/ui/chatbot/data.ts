import type { ChatMessageData, ChatSolution } from './types';

export const talentAcquisitionSolution: ChatSolution = {
  name: 'Talent Acquisition',
  tools: [
    'HR System',
    'Document Management',
    'Email & Calendar',
    'Identity Management',
    'People Analytics',
  ],
  actions: [
    'View pending leave requests',
    'Check joining formalities',
    'Verify documents',
    'Update employee profile',
    'Generate HR report',
  ],
};

export const talentAcquisitionDemoMessages: ChatMessageData[] = [
  {
    id: 'hr-user',
    role: 'user',
    content: 'Help me with my pending HR tasks',
  },
  {
    id: 'hr-assistant',
    role: 'assistant',
    content: 'I found several pending HR tasks. I can help you review, prioritize, and take action on them. Here’s a summary of what I found:',
    summary: [
      '3 pending leave requests',
      '2 pending joining formalities',
      '1 pending document verification',
      '1 pending profile update',
    ],
    activity: {
      label: 'AI is working...',
      badge: 'Demo activity',
      steps: [
        { label: 'Checking connected systems', status: 'Completed' },
        { label: 'Retrieving relevant information', status: 'Completed' },
        { label: 'Preparing recommended actions', status: 'Completed' },
      ],
    },
  },
];

export const demoRecentConversations: Array<{
  id: string;
  title: string;
  messages: ChatMessageData[];
}> = [
  {
    id: 'demo-candidate-screening',
    title: 'Candidate screening help',
    messages: talentAcquisitionDemoMessages,
  },
  {
    id: 'demo-hiring-pipeline',
    title: 'Hiring pipeline update',
    messages: [
      { id: 'pipeline-user', role: 'user', content: 'Give me a hiring pipeline update.' },
      {
        id: 'pipeline-assistant',
        role: 'assistant',
        content: 'Here is a demo overview of the hiring pipeline: review candidates awaiting screening, confirm upcoming interviews, and follow up on decisions that are ready. Prioritizing those next steps can help keep candidates moving.',
      },
    ],
  },
  {
    id: 'demo-interview-scheduling',
    title: 'Interview scheduling',
    messages: [
      { id: 'scheduling-user', role: 'user', content: 'Help me with interview scheduling.' },
      {
        id: 'scheduling-assistant',
        role: 'assistant',
        content: 'I can help organize interview scheduling. Start by confirming interviewer availability, matching each interview to the right stage, and sending candidates a clear choice of time slots. This is a sample response; no calendar action was taken.',
      },
    ],
  },
  {
    id: 'demo-resume-review',
    title: 'Resume review',
    messages: [
      { id: 'resume-user', role: 'user', content: 'How should I review these resumes?' },
      {
        id: 'resume-assistant',
        role: 'assistant',
        content: 'A consistent resume review starts with the role requirements. Compare each candidate’s relevant experience and skills against the same criteria, note evidence for each match, and flag any questions for a follow-up interview.',
      },
    ],
  },
  {
    id: 'demo-candidate-followup',
    title: 'Candidate follow-up',
    messages: [
      { id: 'followup-user', role: 'user', content: 'Help me follow up with a candidate.' },
      {
        id: 'followup-assistant',
        role: 'assistant',
        content: 'A helpful follow-up should thank the candidate, share a concise status update, and explain the next step and expected timing. Keep the tone warm and give them a clear way to ask questions.',
      },
    ],
  },
];

export function createDemoResponse(prompt: string): string {
  const normalizedPrompt = prompt.toLowerCase();

  if (/\b(hr|human resources|leave|onboarding|employee|payroll|benefits)\b/.test(normalizedPrompt)) {
    return 'I can help you review and prioritize your HR request. A useful next step is to identify any pending approvals, onboarding or document tasks, and employee updates, then handle the most time-sensitive items first. This is a demo response; no HR system was accessed.';
  }
  if (/\b(hiring|hire|candidate|recruit|applicant|resume|cv)\b/.test(normalizedPrompt)) {
    return 'I can help you move this hiring task forward. Review candidates against the role requirements, identify who needs screening or follow-up, and keep interview decisions and next steps clearly documented. This is a demo response; no candidate records were accessed.';
  }
  if (/\b(interview|schedule|calendar|meeting)\b/.test(normalizedPrompt)) {
    return 'I can help organize the next steps. Confirm the participants and their availability, offer a few suitable time slots, and share the interview details once a time is agreed. This is a demo response; no calendar changes were made.';
  }
  if (/\b(sales|lead|prospect|pipeline|campaign|customer|support|ticket)\b/.test(normalizedPrompt)) {
    return 'I can help you organize this workflow. Start by identifying the highest-priority records, noting the next action and owner for each, and following up on anything time-sensitive. This is a demo response; no connected tools or customer records were accessed.';
  }

  return `I can help with ${prompt.trim().replace(/[.!?]+$/, '')}. To get started, clarify the outcome you want, list the key details or constraints, and tackle the most important next step first. This is a demo response; no connected tools were accessed.`;
}