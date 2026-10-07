export type ChatMessageData = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  summary?: string[];
  uiAction?: UIAction;
  activity?: {
    label: string;
    badge: string;
    steps: Array<{ label: string; status: string }>;
  };
};

export type UIActionType =
  | 'SHOW_CAMPAIGN_LIST'
  | 'SHOW_CAMPAIGN_DETAIL'
  | 'SHOW_CAMPAIGN_CREATE_FORM'
  | 'SHOW_CANDIDATE_LIST'
  | 'SHOW_CANDIDATE_UPLOAD'
  | 'SHOW_SCREENING_STATUS'
  | 'SHOW_BATCH_STATUS'
  | 'SHOW_CAMPAIGN_PICKER';

export interface UIAction {
  type: UIActionType;
  payload: Record<string, unknown>;
}

export type ChatSolution = {
  name: string;
  tools: string[];
  actions: string[];
};