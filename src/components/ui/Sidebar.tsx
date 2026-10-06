import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  Bot,
  Briefcase,
  CalendarDays,
  ChevronDown,
  FileSearch,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  Settings,
  User,
  Users,
  X,
} from 'lucide-react';
import { useHirings, useCandidates, useInterviews } from '../../store/appStore';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

interface RecentChatSummary {
  id: string;
  title: string;
  updatedAt: number;
  isDemo?: boolean;
}

interface SidebarProps {
  onNewChat: () => void;
  onNavigate: () => void;
  onSelectChat: (chatId: string) => void;
  recentChats: RecentChatSummary[];
  selectedChatId: string | null;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Home', icon: <Home size={16} strokeWidth={1.8} /> },
  { path: '/hiring', label: 'Hiring', icon: <Briefcase size={16} strokeWidth={1.8} /> },
  { path: '/candidates', label: 'Candidates', icon: <Users size={16} strokeWidth={1.8} /> },
  { path: '/screening-reports', label: 'Screening Reports', icon: <FileSearch size={16} strokeWidth={1.8} /> },
  { path: '/recruiters', label: 'AI Recruiters', icon: <Bot size={16} strokeWidth={1.8} /> },
  { path: '/interviews', label: 'Interviews', icon: <CalendarDays size={16} strokeWidth={1.8} /> },
  { path: '/activity', label: 'Activity', icon: <Activity size={16} strokeWidth={1.8} /> },
];

const solutionGroups = [
  {
    id: 'hr',
    name: 'HR Solutions',
    items: [
      { id: 'talent-acquisition', name: 'Talent Acquisition' },
      { id: 'employee-onboarding', name: 'Employee Onboarding' },
      { id: 'learning-development', name: 'Learning & Development' },
      { id: 'performance-reviews', name: 'Performance & Reviews' },
      { id: 'payroll-benefits', name: 'Payroll & Benefits' },
      { id: 'employee-support', name: 'Employee Support' },
      { id: 'offboarding', name: 'Offboarding' },
    ],
  },
  {
    id: 'sales',
    name: 'Sales',
    items: [
      { id: 'lead-management', name: 'Lead Management' },
      { id: 'lead-qualification', name: 'Lead Qualification' },
      { id: 'sales-outreach', name: 'Sales Outreach' },
      { id: 'meeting-scheduling', name: 'Meeting & Scheduling' },
      { id: 'opportunity-management', name: 'Opportunity Management' },
      { id: 'sales-analytics', name: 'Sales Analytics' },
    ],
  },
  {
    id: 'support',
    name: 'Customer Support',
    items: [
      { id: 'support-workflow', name: 'Ticket Management' },
      { id: 'agent-assist', name: 'Agent Assist' },
      { id: 'knowledge-resolution', name: 'Knowledge & Resolution' },
      { id: 'escalation', name: 'Escalation' },
      { id: 'customer-communication', name: 'Customer Communication' },
      { id: 'support-analytics', name: 'Support Analytics' },
    ],
  },
  {
    id: 'it',
    name: 'IT Solutions',
    items: [
      { id: 'it-support', name: 'IT Support' },
      { id: 'service-operations', name: 'Service Operations' },
      { id: 'email-automation', name: 'Email Automation' },
    ],
  },
] as const;

const solutionSubmenus: Record<string, { routePrefix: string; items: { id: string; name: string }[] }> = {
  'employee-onboarding': {
    routePrefix: '/solutions/hr/employee-onboarding',
    items: [
      { id: 'new-hires', name: 'New Hires' },
      { id: 'documents', name: 'Documents' },
      { id: 'account-setup', name: 'Account Setup' },
      { id: 'it-setup', name: 'IT Setup' },
      { id: 'orientation', name: 'Orientation' },
      { id: 'activity', name: 'Activity' },
    ],
  },
  'learning-development': {
    routePrefix: '/solutions/hr/learning-development',
    items: [
      { id: 'learning-plans', name: 'Learning Plans' },
      { id: 'skill-gaps', name: 'Skill Gaps' },
      { id: 'courses', name: 'Courses' },
      { id: 'training', name: 'Training' },
      { id: 'evaluations', name: 'Evaluations' },
      { id: 'activity', name: 'Activity' },
    ],
  },
  'performance-reviews': {
    routePrefix: '/solutions/hr/performance-reviews',
    items: [
      { id: 'performance-reviews', name: 'Performance Reviews' },
      { id: 'goals', name: 'Goals' },
      { id: 'feedback', name: 'Feedback' },
      { id: 'sentiment', name: 'Sentiment' },
      { id: 'development-plans', name: 'Development Plans' },
      { id: 'activity', name: 'Activity' },
    ],
  },
  'payroll-benefits': {
    routePrefix: '/solutions/hr/payroll-benefits',
    items: [
      { id: 'payroll', name: 'Payroll' },
      { id: 'salary-tax', name: 'Salary & Tax' },
      { id: 'benefits', name: 'Benefits' },
      { id: 'payslips', name: 'Payslips' },
      { id: 'leave-attendance', name: 'Leave & Attendance' },
      { id: 'activity', name: 'Activity' },
    ],
  },
  'employee-support': {
    routePrefix: '/solutions/hr/employee-support',
    items: [
      { id: 'hr-queries', name: 'HR Queries' },
      { id: 'policies-faqs', name: 'Policies & FAQs' },
      { id: 'leave', name: 'Leave' },
      { id: 'attendance', name: 'Attendance' },
      { id: 'payroll-support', name: 'Payroll Support' },
      { id: 'activity', name: 'Activity' },
    ],
  },
  offboarding: {
    routePrefix: '/solutions/hr/offboarding',
    items: [
      { id: 'exit-requests', name: 'Exit Requests' },
      { id: 'knowledge-transfer', name: 'Knowledge Transfer' },
      { id: 'access-revocation', name: 'Access Revocation' },
      { id: 'asset-return', name: 'Asset Return' },
      { id: 'exit-interviews', name: 'Exit Interviews' },
      { id: 'activity', name: 'Activity' },
    ],
  },
  'lead-management': {
    routePrefix: '/sales/lead-management',
    items: [
      { id: 'lead-research', name: 'Lead Research' },
      { id: 'lead-enrichment', name: 'Lead Enrichment' },
      { id: 'lead-qualification', name: 'Lead Qualification' },
      { id: 'lead-scoring', name: 'Lead Scoring' },
      { id: 'lead-assignment', name: 'Lead Assignment' },
      { id: 'campaigns', name: 'Campaigns' },
      { id: 'activity', name: 'Activity' },
    ],
  },
  'lead-qualification': {
    routePrefix: '/coming-soon/lead-qualification',
    items: [
      { id: 'lead-research', name: 'Lead Research' },
      { id: 'qualification-criteria', name: 'Qualification Criteria' },
      { id: 'lead-scoring', name: 'Lead Scoring' },
      { id: 'intent-detection', name: 'Intent Detection' },
      { id: 'qualification-results', name: 'Qualification Results' },
      { id: 'activity', name: 'Activity' },
    ],
  },
  'sales-outreach': {
    routePrefix: '/coming-soon/sales-outreach',
    items: [
      { id: 'lead-research', name: 'Lead Research' },
      { id: 'personalized-outreach', name: 'Personalized Outreach' },
      { id: 'email-campaigns', name: 'Email Campaigns' },
      { id: 'follow-ups', name: 'Follow-ups' },
      { id: 'meeting-booking', name: 'Meeting Booking' },
      { id: 'activity', name: 'Activity' },
    ],
  },
  'meeting-scheduling': {
    routePrefix: '/coming-soon/meeting-scheduling',
    items: [
      { id: 'meeting-requests', name: 'Meeting Requests' },
      { id: 'availability', name: 'Availability' },
      { id: 'scheduling', name: 'Scheduling' },
      { id: 'rescheduling', name: 'Rescheduling' },
      { id: 'reminders', name: 'Reminders' },
      { id: 'activity', name: 'Activity' },
    ],
  },
  'opportunity-management': {
    routePrefix: '/coming-soon/opportunity-management',
    items: [
      { id: 'opportunity-tracking', name: 'Opportunity Tracking' },
      { id: 'deal-qualification', name: 'Deal Qualification' },
      { id: 'pipeline-management', name: 'Pipeline Management' },
      { id: 'deal-updates', name: 'Deal Updates' },
      { id: 'follow-ups', name: 'Follow-ups' },
      { id: 'activity', name: 'Activity' },
    ],
  },
  'sales-analytics': {
    routePrefix: '/coming-soon/sales-analytics',
    items: [
      { id: 'sales-dashboard', name: 'Sales Dashboard' },
      { id: 'pipeline-analytics', name: 'Pipeline Analytics' },
      { id: 'conversion-analytics', name: 'Conversion Analytics' },
      { id: 'revenue-insights', name: 'Revenue Insights' },
      { id: 'forecasting', name: 'Forecasting' },
      { id: 'activity', name: 'Activity' },
    ],
  },
  'support-workflow': {
    routePrefix: '/coming-soon/ticket-management',
    items: [
      { id: 'ticket-creation', name: 'Ticket Creation' },
      { id: 'ticket-classification', name: 'Ticket Classification' },
      { id: 'priority-routing', name: 'Priority & Routing' },
      { id: 'ticket-assignment', name: 'Ticket Assignment' },
      { id: 'sla-management', name: 'SLA Management' },
      { id: 'resolution-tracking', name: 'Resolution Tracking' },
      { id: 'activity', name: 'Activity' },
    ],
  },
  'agent-assist': {
    routePrefix: '/coming-soon/agent-assist',
    items: [
      { id: 'ticket-context', name: 'Ticket Context' },
      { id: 'suggested-responses', name: 'Suggested Responses' },
      { id: 'customer-information', name: 'Customer Information' },
      { id: 'next-best-action', name: 'Next Best Action' },
      { id: 'agent-guidance', name: 'Agent Guidance' },
      { id: 'activity', name: 'Activity' },
    ],
  },
  'knowledge-resolution': {
    routePrefix: '/coming-soon/knowledge-resolution',
    items: [
      { id: 'knowledge-search', name: 'Knowledge Search' },
      { id: 'answer-generation', name: 'Answer Generation' },
      { id: 'resolution-suggestions', name: 'Resolution Suggestions' },
      { id: 'article-recommendations', name: 'Article Recommendations' },
      { id: 'case-resolution', name: 'Case Resolution' },
      { id: 'activity', name: 'Activity' },
    ],
  },
  escalation: {
    routePrefix: '/coming-soon/escalation',
    items: [
      { id: 'escalation-detection', name: 'Escalation Detection' },
      { id: 'priority-management', name: 'Priority Management' },
      { id: 'human-handoff', name: 'Human Handoff' },
      { id: 'case-routing', name: 'Case Routing' },
      { id: 'escalation-tracking', name: 'Escalation Tracking' },
      { id: 'activity', name: 'Activity' },
    ],
  },
  'customer-communication': {
    routePrefix: '/coming-soon/customer-communication',
    items: [
      { id: 'email-responses', name: 'Email Responses' },
      { id: 'chat-responses', name: 'Chat Responses' },
      { id: 'customer-updates', name: 'Customer Updates' },
      { id: 'notifications', name: 'Notifications' },
      { id: 'follow-ups', name: 'Follow-ups' },
      { id: 'activity', name: 'Activity' },
    ],
  },
  'support-analytics': {
    routePrefix: '/coming-soon/support-analytics',
    items: [
      { id: 'support-dashboard', name: 'Support Dashboard' },
      { id: 'ticket-analytics', name: 'Ticket Analytics' },
      { id: 'resolution-analytics', name: 'Resolution Analytics' },
      { id: 'response-time', name: 'Response Time' },
      { id: 'customer-insights', name: 'Customer Insights' },
      { id: 'activity', name: 'Activity' },
    ],
  },
  'it-support': {
    routePrefix: '/coming-soon/it-support',
    items: [
      { id: 'it-requests', name: 'IT Requests' },
      { id: 'incident-management', name: 'Incident Management' },
      { id: 'troubleshooting', name: 'Troubleshooting' },
      { id: 'device-support', name: 'Device Support' },
      { id: 'access-requests', name: 'Access Requests' },
      { id: 'activity', name: 'Activity' },
    ],
  },
  'service-operations': {
    routePrefix: '/coming-soon/service-operations',
    items: [
      { id: 'service-requests', name: 'Service Requests' },
      { id: 'incident-tracking', name: 'Incident Tracking' },
      { id: 'workflow-automation', name: 'Workflow Automation' },
      { id: 'approvals', name: 'Approvals' },
      { id: 'service-monitoring', name: 'Service Monitoring' },
      { id: 'activity', name: 'Activity' },
    ],
  },
  'email-automation': {
    routePrefix: '/coming-soon/email-automation',
    items: [
      { id: 'email-classification', name: 'Email Classification' },
      { id: 'email-drafting', name: 'Email Drafting' },
      { id: 'email-routing', name: 'Email Routing' },
      { id: 'response-automation', name: 'Response Automation' },
      { id: 'follow-ups', name: 'Follow-ups' },
      { id: 'activity', name: 'Activity' },
    ],
  },
};

const demoRecentChats: RecentChatSummary[] = [
  { id: 'demo-candidate-screening', title: 'Candidate screening help', updatedAt: 3, isDemo: true },
  { id: 'demo-hiring-pipeline', title: 'Hiring pipeline update', updatedAt: 2, isDemo: true },
  { id: 'demo-interview-scheduling', title: 'Interview scheduling', updatedAt: 1, isDemo: true },
  { id: 'demo-resume-review', title: 'Resume review', updatedAt: 0, isDemo: true },
  { id: 'demo-candidate-followup', title: 'Candidate follow-up', updatedAt: -1, isDemo: true },
];

function relativeTime(timestamp: number, isDemo = false) {
  if (isDemo) return 'Sample';
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60_000));
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onNewChat,
  onNavigate,
  onSelectChat,
  recentChats,
  selectedChatId,
}) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [recentExpanded, setRecentExpanded] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedContextId, setSelectedContextId] = useState<string | null>(null);
  const [contextResetPath, setContextResetPath] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    hr: false,
    sales: false,
    support: false,
    it: false,
  });
  const profileRef = useRef<HTMLDivElement>(null);
  const hirings = useHirings();
  const candidates = useCandidates();
  const interviews = useInterviews();

  const isCalling = hirings.some((hiring) => hiring.status === 'calling');
  const upcomingInterviewCount = interviews.filter((interview) => interview.status === 'upcoming').length;
  const screeningNeedsReview = candidates.filter((candidate) =>
    candidate.callAssessmentComplete &&
    ['interested', 'connected', 'shortlisted'].includes(candidate.status) &&
    !['interview_scheduled', 'interview_completed', 'hired'].includes(candidate.status)
  ).length;
  const recentChatIds = new Set(recentChats.map((chat) => chat.id));
  const chats = [...recentChats, ...demoRecentChats.filter((chat) => !recentChatIds.has(chat.id))];
  const visibleChats = recentExpanded ? chats : chats.slice(0, 3);
  const routeContextId = pathname.startsWith('/hiring') ||
    ['/candidates', '/screening-reports', '/recruiters', '/interviews', '/activity'].some((path) => pathname.startsWith(path))
    ? 'talent-acquisition'
    : pathname === '/' || pathname.startsWith('/solutions/hr/talent-acquisition')
      ? 'talent-acquisition'
    : pathname === '/coming-soon/sales-outreach' || pathname.startsWith('/coming-soon/sales-outreach/')
      ? 'sales-outreach'
    : pathname === '/solutions/sales/lead-management'
      ? 'lead-management'
    : pathname === '/sales/lead-management' || pathname.startsWith('/sales/lead-management/')
      ? 'lead-management'
    : Object.entries(solutionSubmenus).find(([, submenu]) =>
        pathname === submenu.routePrefix || pathname.startsWith(`${submenu.routePrefix}/`)
      )?.[0] ?? null;
  const contextualSelection = selectedContextId ?? (contextResetPath === pathname ? null : routeContextId);
  const contextualGroup = solutionGroups.find((group) =>
    group.items.some((item) => item.id === contextualSelection)
  );
  const selectedSubmenu = contextualSelection
    ? solutionSubmenus[contextualSelection]
    : undefined;

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const navigateFromSidebar = (path: string) => {
    onNavigate();
    setMobileOpen(false);
    navigate(path);
  };

  return (
    <>
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      {mobileOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`sidebar${mobileOpen ? ' sidebar--open' : ''}`}>
        <div className="sidebar__header">
          <button
            type="button"
            className="sidebar__logo-link"
            onClick={() => navigateFromSidebar('/')}
            aria-label="Go to SoloBuild home"
          >
            <img src="/solobuild-logo.png" alt="SoloBuild" />
          </button>
          <button
            className="sidebar-mobile-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar__nav" aria-label="Main navigation">
          <button
            type="button"
            className="sidebar__new-chat"
            onClick={() => {
              onNewChat();
              setMobileOpen(false);
            }}
          >
            <Plus size={16} strokeWidth={2} />
            <span>New Chat</span>
          </button>

          <section className="sidebar__recent" aria-label="Recent chats">
            <button
              className="sidebar__section-heading sidebar__recent-heading"
              type="button"
              onClick={() => setRecentExpanded((expanded) => !expanded)}
              aria-expanded={recentExpanded}
              aria-label={recentExpanded ? 'Show the three most recent chats' : 'Show all recent chats'}
            >
              <span>Recent Chats</span>
              <span className="sidebar__heading-rule" />
              <ChevronDown size={13} className={recentExpanded ? 'sidebar__chevron sidebar__chevron--open' : 'sidebar__chevron'} />
            </button>
            <div className="sidebar__recent-list">
              {visibleChats.map((chat) => (
                <button
                  key={chat.id}
                  type="button"
                  className={`sidebar__recent-chat${selectedChatId === chat.id ? ' sidebar__recent-chat--active' : ''}${chat.isDemo ? ' sidebar__recent-chat--demo' : ''}`}
                  title={chat.title}
                  onClick={() => {
                    onSelectChat(chat.id);
                    setMobileOpen(false);
                  }}
                >
                  <span className="sidebar__recent-title">{chat.title}</span>
                  <span className="sidebar__recent-meta">
                    <MessageSquare size={12} />
                    <span>{chat.isDemo ? 'Talent Acquisition' : 'Chat'}</span>
                    <span>{relativeTime(chat.updatedAt, chat.isDemo)}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="sidebar__solutions" aria-label="Solutions">
            <p className="sidebar__section-heading">
              <span>Solutions</span>
              <span className="sidebar__heading-rule" aria-hidden="true" />
            </p>
            {contextualSelection && contextualGroup ? (
              <div className="sidebar__context-view">
                <button
                  type="button"
                  className="sidebar__solutions-back"
                  onClick={() => {
                    setSelectedContextId(null);
                    setContextResetPath(pathname);
                  }}
                >
                  <span aria-hidden="true">←</span>
                  <span>All Solutions</span>
                </button>
                {contextualSelection === 'lead-management' || contextualSelection === 'lead-qualification' ? (
                  <NavLink
                    to={contextualSelection === 'lead-management'
                      ? '/solutions/sales/lead-management'
                      : '/coming-soon/lead-qualification'}
                    className={({ isActive }) =>
                      `sidebar__context-label sidebar__context-label-link${isActive ? ' sidebar__context-label-link--active' : ''}`
                    }
                    onClick={() => {
                      onNavigate();
                      setMobileOpen(false);
                    }}
                  >
                    {contextualSelection === 'lead-management' ? 'Sales / Lead Management' : 'Sales / Lead Qualification'}
                  </NavLink>
                ) : contextualSelection === 'talent-acquisition' ? (
                  <NavLink
                    to="/solutions/hr/talent-acquisition"
                    className={({ isActive }) =>
                      `sidebar__context-label sidebar__context-label-link${isActive ? ' sidebar__context-label-link--active' : ''}`
                    }
                    onClick={() => {
                      onNavigate();
                      setMobileOpen(false);
                    }}
                  >
                    HR Solutions / Talent Acquisition
                  </NavLink>
                ) : contextualSelection === 'sales-outreach' ? (
                  <NavLink
                    to="/coming-soon/sales-outreach"
                    className={({ isActive }) =>
                      `sidebar__context-label sidebar__context-label-link${isActive ? ' sidebar__context-label-link--active' : ''}`
                    }
                    onClick={() => {
                      onNavigate();
                      setMobileOpen(false);
                    }}
                  >
                    Sales / Sales Outreach
                  </NavLink>
                ) : contextualSelection === 'meeting-scheduling' ? (
                  <NavLink
                    to="/coming-soon/meeting-scheduling"
                    className={({ isActive }) =>
                      `sidebar__context-label sidebar__context-label-link${isActive ? ' sidebar__context-label-link--active' : ''}`
                    }
                    onClick={() => {
                      onNavigate();
                      setMobileOpen(false);
                    }}
                  >
                    Sales / Meeting &amp; Scheduling
                  </NavLink>
                ) : contextualSelection === 'opportunity-management' ? (
                  <NavLink
                    to="/coming-soon/opportunity-management"
                    className={({ isActive }) =>
                      `sidebar__context-label sidebar__context-label-link${isActive ? ' sidebar__context-label-link--active' : ''}`
                    }
                    onClick={() => {
                      onNavigate();
                      setMobileOpen(false);
                    }}
                  >
                    Sales / Opportunity Management
                  </NavLink>
                ) : contextualSelection === 'sales-analytics' ? (
                  <NavLink
                    to="/coming-soon/sales-analytics/sales-dashboard"
                    className={({ isActive }) =>
                      `sidebar__context-label sidebar__context-label-link${isActive ? ' sidebar__context-label-link--active' : ''}`
                    }
                    onClick={() => {
                      onNavigate();
                      setMobileOpen(false);
                    }}
                  >
                    Sales / Sales Analytics
                  </NavLink>
                ) : (
                  <p className="sidebar__context-label">
                    {`${contextualGroup.name} / ${contextualGroup.items.find((item) => item.id === contextualSelection)?.name}`}
                  </p>
                )}
                {contextualSelection === 'talent-acquisition' ? (
                  <div className="sidebar__context-links">
                    {navItems.filter((item) => item.path !== '/').map((item) => {
                      const showCallingBadge = item.path === '/hiring' && isCalling;
                      const showInterviewCount = item.path === '/interviews' && upcomingInterviewCount > 0;
                      const showScreeningReview = item.path === '/screening-reports' && screeningNeedsReview > 0;
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          className={({ isActive }) =>
                            `sidebar__context-link ${isActive ? 'sidebar__context-link--active' : ''}`
                          }
                          onClick={() => {
                            onNavigate();
                            setMobileOpen(false);
                          }}
                        >
                          <span>{item.label}</span>
                          {showCallingBadge && <span className="sidebar__indicator" title="AI Screening active" />}
                          {showInterviewCount && <span className="sidebar__count">{upcomingInterviewCount}</span>}
                          {showScreeningReview && <span className="sidebar__count sidebar__count--warning">{screeningNeedsReview}</span>}
                        </NavLink>
                      );
                    })}
                  </div>
                ) : (
                  <div className="sidebar__context-links">
                    {selectedSubmenu?.items.map((item) => {
                      const href = item.id === 'campaigns' && contextualSelection === 'lead-management'
                        ? `${selectedSubmenu.routePrefix}/campaigns`
                        : contextualSelection === 'learning-development'
                        ? item.id === 'learning-plans'
                          ? selectedSubmenu.routePrefix
                          : `${selectedSubmenu.routePrefix}/${item.id}`
                        : contextualGroup.id === 'hr' && contextualSelection !== 'employee-onboarding'
                        ? selectedSubmenu.routePrefix
                        : `${selectedSubmenu.routePrefix}/${item.id}`;
                      return (
                        <NavLink
                          key={item.id}
                          className={({ isActive }) =>
                            `sidebar__context-link ${isActive ? 'sidebar__context-link--active' : ''}`
                          }
                          end={contextualSelection === 'learning-development' && item.id === 'learning-plans' && !pathname.includes('/employee/')}
                          to={href}
                          onClick={() => {
                            onNavigate();
                            setMobileOpen(false);
                          }}
                        >
                          <span>{item.name}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="sidebar__solution-groups">
                {solutionGroups.map((group) => {
                  const expanded = expandedGroups[group.id];
                  return (
                    <div className="sidebar__solution-group" key={group.id}>
                      <button
                        type="button"
                        className="sidebar__solution-group-heading"
                        aria-expanded={expanded}
                        onClick={() =>
                          setExpandedGroups((current) => ({
                            ...current,
                            [group.id]: !current[group.id],
                          }))
                        }
                      >
                        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                          <path d="m5 7 5 6 5-6" />
                        </svg>
                        <span>{group.name}</span>
                      </button>
                      {expanded && (
                        <div className="sidebar__solution-items">
                          {group.items.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              className="sidebar__solution-item"
                              onClick={() => {
                                setSelectedContextId(item.id);
                                setContextResetPath(null);
                                if (group.id === 'sales' && item.id === 'lead-management') {
                                  navigateFromSidebar('/solutions/sales/lead-management');
                                } else if (group.id === 'sales' && item.id === 'lead-qualification') {
                                  navigateFromSidebar('/coming-soon/lead-qualification');
                                } else if (group.id === 'hr' && item.id === 'talent-acquisition') {
                                  navigateFromSidebar('/solutions/hr/talent-acquisition');
                                } else if (group.id === 'sales' && item.id === 'sales-outreach') {
                                  navigateFromSidebar('/coming-soon/sales-outreach');
                                } else if (group.id === 'sales' && item.id === 'meeting-scheduling') {
                                  navigateFromSidebar('/coming-soon/meeting-scheduling');
                                } else if (group.id === 'sales' && item.id === 'opportunity-management') {
                                  navigateFromSidebar('/coming-soon/opportunity-management');
                                } else if (group.id === 'sales' && item.id === 'sales-analytics') {
                                  navigateFromSidebar('/coming-soon/sales-analytics/sales-dashboard');
                                }
                              }}
                            >
                              {item.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

        </nav>

        <div className="sidebar__bottom">
          <NavLink
            to="/settings"
            className={({ isActive }) => `sidebar__item ${isActive ? 'sidebar__item--active' : ''}`}
            onClick={() => {
              onNavigate();
              setMobileOpen(false);
            }}
          >
            <span className="sidebar__item-icon"><Settings size={16} strokeWidth={1.8} /></span>
            <span className="sidebar__item-label">Settings</span>
          </NavLink>

          <div className="sidebar__profile-wrap" ref={profileRef}>
            <button
              className="sidebar__workspace"
              type="button"
              aria-expanded={profileOpen}
              aria-label="TalentCorp profile menu"
              onClick={() => setProfileOpen((open) => !open)}
            >
              <span className="sidebar__workspace-avatar">TC</span>
              <span className="sidebar__workspace-info">
                <span className="sidebar__workspace-name">TalentCorp</span>
                <span className="sidebar__workspace-email">admin@talentcorp.com</span>
              </span>
              <ChevronDown size={13} className={profileOpen ? 'sidebar__profile-chevron sidebar__profile-chevron--open' : 'sidebar__profile-chevron'} />
            </button>
            {profileOpen && (
              <div className="sidebar__profile-menu">
                <button type="button" onClick={() => { setProfileOpen(false); navigateFromSidebar('/settings'); }}>
                  <Settings size={14} /> Account Settings
                </button>
                <button type="button" onClick={() => { setProfileOpen(false); navigateFromSidebar('/settings'); }}>
                  <User size={14} /> Profile
                </button>
                <div className="sidebar__profile-divider" />
                <button type="button" className="sidebar__profile-signout" onClick={() => setProfileOpen(false)}>
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
