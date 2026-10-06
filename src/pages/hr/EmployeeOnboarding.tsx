import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  Laptop,
  Plus,
  Search,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { StatCard } from '../../components/ui/StatCard';
import { useToast } from '../../components/ui/Toast';
import './employee-onboarding.css';

type TaskStatus = 'Not Started' | 'In Progress' | 'Completed';
type DocumentStatus = 'Pending' | 'Submitted' | 'Verified' | 'Rejected';
type SessionStatus = 'Upcoming' | 'Completed' | 'Pending';
type Section = 'new-hires' | 'documents' | 'account-setup' | 'it-setup' | 'orientation' | 'activity';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  manager: string;
  joiningDate: string;
  color: string;
}

interface OnboardingDocument {
  id: string;
  employeeId: string;
  name: string;
  required: boolean;
  submittedDate: string;
  status: DocumentStatus;
}

interface SetupTask {
  id: string;
  employeeId: string;
  name: string;
  status: TaskStatus;
}

interface OrientationSession {
  id: string;
  title: string;
  date: string;
  time: string;
  trainer: string;
  participantIds: string[];
  status: SessionStatus;
}

interface ActivityEvent {
  id: string;
  employeeId: string;
  activity: string;
  type: string;
  date: string;
  by: string;
  status: string;
}

const sectionItems: { id: Section; label: string }[] = [
  { id: 'new-hires', label: 'New Hires' },
  { id: 'documents', label: 'Documents' },
  { id: 'account-setup', label: 'Account Setup' },
  { id: 'it-setup', label: 'IT Setup' },
  { id: 'orientation', label: 'Orientation' },
  { id: 'activity', label: 'Activity' },
];

const accountTasks = ['HR Account', 'Company Email', 'Payroll', 'Benefits', 'Employee Portal'];
const itTasks = ['Laptop', 'Email', 'VPN', 'GitHub', 'Software Access', 'Internal Tools', 'Security Access'];
const documentNames = [
  'ID Proof',
  'Address Proof',
  'PAN',
  'Bank Details',
  'Education Certificate',
  'Previous Employment Documents',
];
const employeesSeed: Employee[] = [
  { id: 'emp-101', name: 'Ava Patel', email: 'ava.patel@northstar.io', role: 'Product Designer', department: 'Product', manager: 'Jordan Lee', joiningDate: '2026-10-12', color: '#7c3aed' },
  { id: 'emp-102', name: 'Noah Williams', email: 'noah.williams@northstar.io', role: 'Software Engineer', department: 'Engineering', manager: 'Priya Sharma', joiningDate: '2026-10-07', color: '#2563eb' },
  { id: 'emp-103', name: 'Mia Chen', email: 'mia.chen@northstar.io', role: 'People Operations Lead', department: 'People', manager: 'Taylor Morgan', joiningDate: '2026-10-19', color: '#db2777' },
  { id: 'emp-104', name: 'Liam Johnson', email: 'liam.johnson@northstar.io', role: 'Account Executive', department: 'Sales', manager: 'Sam Rivera', joiningDate: '2026-10-05', color: '#059669' },
  { id: 'emp-105', name: 'Sofia Garcia', email: 'sofia.garcia@northstar.io', role: 'Data Analyst', department: 'Data', manager: 'Alex Kim', joiningDate: '2026-10-26', color: '#d97706' },
];

const documentSeed: OnboardingDocument[] = employeesSeed.flatMap((employee, employeeIndex) =>
  documentNames.map((name, docIndex) => {
    const status: DocumentStatus = employeeIndex === 0
      ? (docIndex < 3 ? 'Verified' : docIndex === 3 ? 'Submitted' : 'Pending')
      : employeeIndex === 1
        ? (docIndex < 2 ? 'Verified' : docIndex === 2 ? 'Rejected' : docIndex === 3 ? 'Submitted' : 'Pending')
        : employeeIndex === 2
          ? (docIndex === 0 ? 'Submitted' : 'Pending')
          : employeeIndex === 3
              ? (docIndex < 5 ? 'Verified' : 'Submitted')
            : 'Pending';
    return {
      id: `${employee.id}-doc-${docIndex}`,
      employeeId: employee.id,
      name,
      required: docIndex !== 5,
      submittedDate: ['Verified', 'Submitted', 'Rejected'].includes(status)
        ? `2026-10-${String(1 + employeeIndex * 2 + docIndex).padStart(2, '0')}`
        : '',
      status,
    };
  }),
);

function buildTasks(names: string[], employeeIndex: number, prefix: string): SetupTask[] {
  return names.map((name, taskIndex) => ({
    id: `${employeesSeed[employeeIndex].id}-${prefix}-${taskIndex}`,
    employeeId: employeesSeed[employeeIndex].id,
    name,
    status: taskIndex < (employeeIndex === 0 ? 2 : employeeIndex === 1 ? 1 : employeeIndex === 3 ? names.length : 0)
      ? 'Completed'
      : taskIndex === (employeeIndex === 0 ? 2 : employeeIndex === 1 ? 1 : -1)
        ? 'In Progress'
        : 'Not Started',
  }));
}

const taskSeed = (names: string[], prefix: string) =>
  employeesSeed.flatMap((_, index) => buildTasks(names, index, prefix));

const initialSessions: OrientationSession[] = [
  { id: 'session-1', title: 'Company Introduction', date: '2026-10-07', time: '09:30', trainer: 'Taylor Morgan', participantIds: ['emp-102', 'emp-104'], status: 'Upcoming' },
  { id: 'session-2', title: 'HR Policy Orientation', date: '2026-10-08', time: '11:00', trainer: 'Casey Brooks', participantIds: ['emp-101', 'emp-102', 'emp-103'], status: 'Upcoming' },
  { id: 'session-3', title: 'Security Training', date: '2026-10-09', time: '14:00', trainer: 'Morgan Reed', participantIds: ['emp-101', 'emp-102', 'emp-104'], status: 'Pending' },
  { id: 'session-4', title: 'Product Training', date: '2026-10-02', time: '10:00', trainer: 'Jordan Lee', participantIds: ['emp-104'], status: 'Completed' },
  { id: 'session-5', title: 'Team Introduction', date: '2026-10-12', time: '13:30', trainer: 'Sam Rivera', participantIds: ['emp-101', 'emp-105'], status: 'Pending' },
];

const initialActivity: ActivityEvent[] = [
  { id: 'act-1', employeeId: 'emp-101', activity: 'Employee added', type: 'Employee', date: '2026-10-01T09:18:00', by: 'Taylor Morgan', status: 'Completed' },
  { id: 'act-2', employeeId: 'emp-101', activity: 'Document uploaded · ID Proof', type: 'Document', date: '2026-10-02T10:42:00', by: 'Ava Patel', status: 'Submitted' },
  { id: 'act-3', employeeId: 'emp-101', activity: 'Document verified · ID Proof', type: 'Document', date: '2026-10-02T13:05:00', by: 'Casey Brooks', status: 'Verified' },
  { id: 'act-4', employeeId: 'emp-102', activity: 'Account created · HR Account', type: 'Account', date: '2026-10-03T11:20:00', by: 'Casey Brooks', status: 'Completed' },
  { id: 'act-5', employeeId: 'emp-102', activity: 'Laptop assigned', type: 'IT Setup', date: '2026-10-03T15:12:00', by: 'Morgan Reed', status: 'Completed' },
  { id: 'act-6', employeeId: 'emp-103', activity: 'IT access granted · VPN', type: 'IT Setup', date: '2026-10-04T09:45:00', by: 'Morgan Reed', status: 'Completed' },
  { id: 'act-7', employeeId: 'emp-104', activity: 'Orientation scheduled · Product Training', type: 'Orientation', date: '2026-10-01T16:10:00', by: 'Taylor Morgan', status: 'Scheduled' },
  { id: 'act-8', employeeId: 'emp-104', activity: 'Orientation completed · Product Training', type: 'Orientation', date: '2026-10-02T11:04:00', by: 'Jordan Lee', status: 'Completed' },
  { id: 'act-9', employeeId: 'emp-104', activity: 'Onboarding completed', type: 'Onboarding', date: '2026-10-04T16:30:00', by: 'Casey Brooks', status: 'Completed' },
];

const dateLabel = (value: string) => value
  ? new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  : '—';

const timeLabel = (value: string) => new Date(value).toLocaleString('en-US', {
  month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
});

const slugToSection = (value: string): Section =>
  sectionItems.find((section) => section.id === value)?.id ?? 'new-hires';

export default function EmployeeOnboarding() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [employees, setEmployees] = useState(employeesSeed);
  const [documents, setDocuments] = useState(documentSeed);
  const [accounts, setAccounts] = useState(() => taskSeed(accountTasks, 'account'));
  const [itItems, setItItems] = useState(() => taskSeed(itTasks, 'it'));
  const [sessions, setSessions] = useState(initialSessions);
  const [activities, setActivities] = useState(initialActivity);
  const [search, setSearch] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [activityFilter, setActivityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activityDate, setActivityDate] = useState('');
  const [hireModalOpen, setHireModalOpen] = useState(false);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [documentModal, setDocumentModal] = useState<OnboardingDocument | null>(null);
  const [hireDraft, setHireDraft] = useState({
    name: '', email: '', role: '', department: '', manager: '', joiningDate: '',
  });
  const [sessionDraft, setSessionDraft] = useState({
    title: 'Company Introduction', date: '', time: '', trainer: '', participantId: '',
  });
  const routeParts = location.pathname.split('/').filter(Boolean).slice(3);
  const section = slugToSection(routeParts[0] ?? '');
  const selectedEmployee = routeParts.length > 1
    ? employees.find((employee) => employee.id === routeParts[1])
    : undefined;

  const addActivity = (employeeId: string, activity: string, type: string, status: string, by = 'Casey Brooks') => {
    setActivities((current) => [{
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      employeeId,
      activity,
      type,
      date: new Date().toISOString(),
      by,
      status,
    }, ...current]);
  };

  const progressFor = (employeeId: string) => {
    const employeeDocs = documents.filter((document) => document.employeeId === employeeId && document.required);
    const employeeAccounts = accounts.filter((task) => task.employeeId === employeeId);
    const employeeIT = itItems.filter((task) => task.employeeId === employeeId);
    const employeeSessions = sessions.filter((session) => session.participantIds.includes(employeeId));
    const completed = employeeDocs.filter((document) => document.status === 'Verified').length
      + employeeAccounts.filter((task) => task.status === 'Completed').length
      + employeeIT.filter((task) => task.status === 'Completed').length
      + employeeSessions.filter((session) => session.status === 'Completed').length;
    const total = employeeDocs.length + employeeAccounts.length + employeeIT.length + employeeSessions.length;
    return total ? Math.round(completed / total * 100) : 0;
  };

  const statusFor = (employeeId: string): string => {
    const progress = progressFor(employeeId);
    const employee = employees.find((entry) => entry.id === employeeId);
    if (progress === 100) return 'Completed';
    if (employee?.joiningDate && employee.joiningDate < new Date().toISOString().slice(0, 10)) return 'Delayed';
    return progress === 0 ? 'Not Started' : 'In Progress';
  };

  const filteredEmployees = useMemo(() => employees.filter((employee) =>
    [employee.name, employee.email, employee.role, employee.department, employee.manager]
      .some((value) => value.toLowerCase().includes(search.toLowerCase()))
  ), [employees, search]);

  const updateTask = (taskId: string, collection: 'account' | 'it') => {
    const tasks = collection === 'account' ? accounts : itItems;
    const task = tasks.find((entry) => entry.id === taskId);
    if (!task) return;
    const nextStatus: TaskStatus = task.status === 'Completed' ? 'In Progress' : 'Completed';
    const updatedTasks = tasks.map((entry) => entry.id === taskId
      ? { ...entry, status: nextStatus }
      : entry);
    if (collection === 'account') setAccounts(updatedTasks);
    else setItItems(updatedTasks);
    addActivity(
      task.employeeId,
      `${collection === 'account' ? 'Account setup' : 'IT setup'} ${nextStatus === 'Completed' ? 'completed' : 'reopened'} · ${task.name}`,
      collection === 'account' ? 'Account' : 'IT Setup',
      nextStatus,
    );
  };

  const goToSection = (nextSection: Section) => navigate(`/solutions/hr/employee-onboarding/${nextSection}`);

  const submitHire = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const id = `emp-${Date.now()}`;
    const employee: Employee = {
      ...hireDraft,
      id,
      name: hireDraft.name.trim(),
      email: hireDraft.email.trim(),
      role: hireDraft.role.trim(),
      department: hireDraft.department.trim(),
      manager: hireDraft.manager.trim(),
      color: '#4f46e5',
    };
    setEmployees((current) => [employee, ...current]);
    setDocuments((current) => [...documentNames.map((name, index) => ({
      id: `${id}-doc-${index}`, employeeId: id, name, required: index !== 5, submittedDate: '', status: 'Pending' as DocumentStatus,
    })), ...current]);
    setAccounts((current) => [...accountTasks.map((name, index) => ({
      id: `${id}-account-${index}`, employeeId: id, name, status: 'Not Started' as TaskStatus,
    })), ...current]);
    setItItems((current) => [...itTasks.map((name, index) => ({
      id: `${id}-it-${index}`, employeeId: id, name, status: 'Not Started' as TaskStatus,
    })), ...current]);
    addActivity(id, 'Employee added', 'Employee', 'Completed');
    setHireDraft({ name: '', email: '', role: '', department: '', manager: '', joiningDate: '' });
    setHireModalOpen(false);
    showToast(`${employee.name} added to onboarding`);
  };

  const setDocumentStatus = (document: OnboardingDocument, status: DocumentStatus) => {
    setDocuments((current) => current.map((entry) => entry.id === document.id
      ? { ...entry, status, submittedDate: entry.submittedDate || new Date().toISOString().slice(0, 10) }
      : entry));
    addActivity(document.employeeId, `Document ${status.toLowerCase()} · ${document.name}`, 'Document', status);
    showToast(`${document.name} marked ${status.toLowerCase()}`);
  };

  const requestDocument = (document: OnboardingDocument) => {
    setDocuments((current) => current.map((entry) => entry.id === document.id
      ? { ...entry, status: 'Pending', submittedDate: '' }
      : entry));
    addActivity(document.employeeId, `Document requested · ${document.name}`, 'Document', 'Requested');
    showToast(`Request sent for ${document.name}`);
  };

  const scheduleSession = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const participantIds = sessionDraft.participantId ? [sessionDraft.participantId] : employees.map((employee) => employee.id);
    const session: OrientationSession = {
      id: `session-${Date.now()}`,
      title: sessionDraft.title,
      date: sessionDraft.date,
      time: sessionDraft.time,
      trainer: sessionDraft.trainer.trim(),
      participantIds,
      status: 'Upcoming',
    };
    setSessions((current) => [session, ...current]);
    participantIds.forEach((employeeId) => addActivity(employeeId, `Orientation scheduled · ${session.title}`, 'Orientation', 'Scheduled'));
    setSessionDraft({ title: 'Company Introduction', date: '', time: '', trainer: '', participantId: '' });
    setSessionModalOpen(false);
    showToast(`${session.title} scheduled`);
  };

  const updateSessionStatus = (session: OrientationSession) => {
    const nextStatus: SessionStatus = session.status === 'Completed' ? 'Pending' : 'Completed';
    setSessions((current) => current.map((entry) => entry.id === session.id ? { ...entry, status: nextStatus } : entry));
    session.participantIds.forEach((employeeId) =>
      addActivity(employeeId, `Orientation ${nextStatus.toLowerCase()} · ${session.title}`, 'Orientation', nextStatus)
    );
    showToast(`Session marked ${nextStatus.toLowerCase()}`);
  };

  const employeeOptions = [{ value: 'all', label: 'All employees' }, ...employees.map((employee) => ({ value: employee.id, label: employee.name }))];
  const visibleActivities = activities.filter((event) =>
    (employeeFilter === 'all' || event.employeeId === employeeFilter)
    && (activityFilter === 'all' || event.type === activityFilter)
    && (statusFilter === 'all' || event.status === statusFilter)
    && (!activityDate || event.date.slice(0, 10) === activityDate)
  );

  const headerTitle = sectionItems.find((item) => item.id === section)?.label ?? 'New Hires';
  const completedOnboarding = employees.filter((employee) => statusFor(employee.id) === 'Completed').length;
  const onboardingInProgress = employees.filter((employee) => statusFor(employee.id) === 'In Progress').length;
  const delayedCount = employees.filter((employee) => statusFor(employee.id) === 'Delayed').length;

  const renderNewHires = () => (
    <>
      <div className="onboarding-stats">
        <StatCard label="Total New Hires" value={employees.length} sub="Active onboarding plans" icon={<Users size={18} />} />
        <StatCard label="Not Started" value={employees.filter((employee) => statusFor(employee.id) === 'Not Started').length} sub="Ready for kickoff" icon={<Clock3 size={18} />} />
        <StatCard label="In Progress" value={onboardingInProgress} sub="Moving through onboarding" icon={<ArrowRight size={18} />} />
        <StatCard label="Completed" value={completedOnboarding} sub="All tasks finished" icon={<CheckCircle2 size={18} />} />
        <StatCard label="Delayed" value={delayedCount} sub="Past joining date" icon={<CalendarDays size={18} />} />
      </div>
      <div className="onboarding-panel">
        <div className="onboarding-panel__heading">
          <div><h2>New hire onboarding</h2><p>Track every new team member from offer acceptance to day one.</p></div>
          <div className="onboarding-toolbar">
            <div className="onboarding-search"><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search employees..." leftIcon={<Search size={15} />} /></div>
            <Button icon={<Plus size={16} />} onClick={() => setHireModalOpen(true)}>Start Onboarding</Button>
          </div>
        </div>
        <div className="onboarding-table-scroll">
          <table className="onboarding-table">
            <thead><tr><th>Employee</th><th>Job Role</th><th>Department</th><th>Manager</th><th>Joining Date</th><th>Progress</th><th>Status</th><th>View</th></tr></thead>
            <tbody>{filteredEmployees.map((employee) => (
              <tr key={employee.id} className="onboarding-clickable-row" onClick={() => navigate(`/solutions/hr/employee-onboarding/new-hires/${employee.id}`)}>
                <td><div className="onboarding-person"><Avatar name={employee.name} size="sm" color={employee.color} /><div><strong>{employee.name}</strong><span>{employee.email}</span></div></div></td>
                <td>{employee.role}</td><td>{employee.department}</td><td>{employee.manager}</td><td>{dateLabel(employee.joiningDate)}</td>
                <td><div className="onboarding-progress-cell"><ProgressBar value={progressFor(employee.id)} showPercentage /></div></td>
                <td><StatusBadge status={statusFor(employee.id)} /></td>
                <td><Button variant="ghost" size="sm" icon={<ArrowRight size={15} />} aria-label={`View ${employee.name}`} onClick={(event) => { event.stopPropagation(); navigate(`/solutions/hr/employee-onboarding/new-hires/${employee.id}`); }} /></td>
              </tr>
            ))}</tbody>
          </table>
          {filteredEmployees.length === 0 && <EmptyMessage title="No employees found" description="Try a different name, role, or department." />}
        </div>
        <div className="onboarding-table-footer">Showing {filteredEmployees.length} of {employees.length} new hires</div>
      </div>
    </>
  );

  const renderDocuments = () => {
    const counts = {
      required: documents.filter((document) => document.required).length,
      submitted: documents.filter((document) => document.status === 'Submitted').length,
      pending: documents.filter((document) => document.status === 'Pending').length,
      verified: documents.filter((document) => document.status === 'Verified').length,
      rejected: documents.filter((document) => document.status === 'Rejected').length,
    };
    const rows = documents.filter((document) => {
      const employee = employees.find((entry) => entry.id === document.employeeId);
      return [document.name, employee?.name ?? ''].some((value) => value.toLowerCase().includes(search.toLowerCase()));
    });
    return <>
      <div className="onboarding-stats onboarding-stats--five">
        <StatCard label="Required Documents" value={counts.required} sub="Across all employees" icon={<FileText size={18} />} />
        <StatCard label="Submitted" value={counts.submitted} sub="Awaiting review" />
        <StatCard label="Pending" value={counts.pending} sub="Still needed" />
        <StatCard label="Verified" value={counts.verified} sub="Approved by HR" />
        <StatCard label="Rejected" value={counts.rejected} sub="Needs replacement" />
      </div>
      <div className="onboarding-panel">
        <div className="onboarding-panel__heading"><div><h2>Employee documents</h2><p>Review submitted documents and follow up on outstanding requirements.</p></div><div className="onboarding-search"><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search documents..." leftIcon={<Search size={15} />} /></div></div>
        <div className="onboarding-table-scroll"><table className="onboarding-table onboarding-table--documents">
          <thead><tr><th>Employee</th><th>Document</th><th>Required / Optional</th><th>Submitted Date</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>{rows.map((document) => {
            const employee = employees.find((entry) => entry.id === document.employeeId);
            if (!employee) return null;
            return <tr key={document.id}>
              <td><div className="onboarding-person"><Avatar name={employee.name} size="sm" color={employee.color} /><strong>{employee.name}</strong></div></td>
              <td><span className="onboarding-document-name"><FileText size={15} />{document.name}</span></td>
              <td>{document.required ? 'Required' : 'Optional'}</td><td>{dateLabel(document.submittedDate)}</td><td><StatusBadge status={document.status} /></td>
              <td><div className="onboarding-row-actions">
                <Button variant="ghost" size="sm" onClick={() => setDocumentModal(document)}>View</Button>
                <Button variant="ghost" size="sm" disabled={document.status === 'Verified'} onClick={() => setDocumentStatus(document, 'Verified')}>Verify</Button>
                <Button variant="ghost" size="sm" disabled={document.status === 'Rejected'} onClick={() => setDocumentStatus(document, 'Rejected')}>Reject</Button>
                <Button variant="ghost" size="sm" onClick={() => requestDocument(document)}>Request</Button>
              </div></td>
            </tr>;
          })}</tbody>
        </table>{rows.length === 0 && <EmptyMessage title="No documents found" description="Try another employee or document name." />}</div>
        <div className="onboarding-table-footer">Showing {rows.length} document records</div>
      </div>
    </>;
  };

  const renderAccountSetup = () => {
    const doneCount = accounts.filter((task) => task.status === 'Completed').length;
    const setupProgress = accounts.length ? Math.round(doneCount / accounts.length * 100) : 0;
    return <>
      <div className="onboarding-setup-summary">
        <div><span className="onboarding-eyebrow">Overall setup progress</span><strong>{setupProgress}%</strong><ProgressBar value={setupProgress} /></div>
        <div className="onboarding-summary-meta"><span><b>{doneCount}</b> of {accounts.length} tasks complete</span><span>{employees.length} employee records</span></div>
      </div>
      <div className="onboarding-employee-cards">{employees.map((employee) => {
        const tasks = accounts.filter((task) => task.employeeId === employee.id);
        const done = tasks.filter((task) => task.status === 'Completed').length;
        return <section className="onboarding-panel onboarding-task-card" key={employee.id}>
          <div className="onboarding-task-card__header"><div className="onboarding-person"><Avatar name={employee.name} size="md" color={employee.color} /><div><strong>{employee.name}</strong><span>{employee.role} · {employee.department}</span></div></div><div className="onboarding-task-card__progress"><ProgressBar value={tasks.length ? done / tasks.length * 100 : 0} showPercentage /><span>{done}/{tasks.length} complete</span></div></div>
          <div className="onboarding-checklist">{tasks.map((task) => <TaskRow key={task.id} task={task} onComplete={() => updateTask(task.id, 'account')} />)}</div>
        </section>;
      })}</div>
    </>;
  };

  const renderItSetup = () => {
    const doneCount = itItems.filter((task) => task.status === 'Completed').length;
    const overallProgress = itItems.length ? Math.round(doneCount / itItems.length * 100) : 0;
    const taskAssignedTo = (taskName: string) => taskName === 'Laptop' ? 'Morgan Reed' : 'IT Support';
    return <>
      <div className="onboarding-setup-summary">
        <div><span className="onboarding-eyebrow">IT readiness</span><strong>{overallProgress}%</strong><ProgressBar value={overallProgress} /></div>
        <div className="onboarding-summary-meta"><span><b>{doneCount}</b> of {itItems.length} tasks complete</span><span>Devices and access for {employees.length} hires</span></div>
      </div>
      <div className="onboarding-panel">
        <div className="onboarding-panel__heading"><div><h2>IT provisioning</h2><p>Coordinate devices, accounts, and secure access before each employee’s first day.</p></div><div className="onboarding-legend"><span><i className="onboarding-dot onboarding-dot--device" />Device</span><span><i className="onboarding-dot onboarding-dot--access" />Access required</span></div></div>
        <div className="onboarding-table-scroll"><table className="onboarding-table">
          <thead><tr><th>Employee</th><th>Device</th><th>Access Required</th><th>Assigned To</th><th>Status</th><th>Due Date</th><th>Progress</th></tr></thead>
          <tbody>{employees.map((employee) => {
            const tasks = itItems.filter((task) => task.employeeId === employee.id);
            const laptop = tasks.find((task) => task.name === 'Laptop');
            const accessTasks = tasks.filter((task) => task.name !== 'Laptop');
            const complete = tasks.filter((task) => task.status === 'Completed').length;
            return <tr key={employee.id}>
              <td><div className="onboarding-person"><Avatar name={employee.name} size="sm" color={employee.color} /><strong>{employee.name}</strong></div></td>
              <td><div className="onboarding-device-cell"><Laptop size={15} />{laptop?.status === 'Completed' ? 'MacBook Pro 14″' : 'MacBook Pro 14″'}</div><TaskButton task={laptop} onClick={() => laptop && updateTask(laptop.id, 'it')} /></td>
              <td><div className="onboarding-access-list">{accessTasks.map((task) => <button type="button" key={task.id} onClick={() => updateTask(task.id, 'it')}><span>{task.name}</span><StatusBadge status={task.status} /></button>)}</div></td>
              <td>{taskAssignedTo(laptop?.name ?? '')}</td>
              <td><StatusBadge status={complete === tasks.length ? 'Completed' : complete ? 'In Progress' : 'Not Started'} /></td>
              <td>{dateLabel(employee.joiningDate)}</td><td><div className="onboarding-progress-cell"><ProgressBar value={tasks.length ? complete / tasks.length * 100 : 0} showPercentage /></div></td>
            </tr>;
          })}</tbody>
        </table></div>
      </div>
    </>;
  };

  const renderOrientation = () => {
    const upcoming = sessions.filter((session) => session.status === 'Upcoming').length;
    const completed = sessions.filter((session) => session.status === 'Completed').length;
    const pending = sessions.filter((session) => session.status === 'Pending').length;
    const orderedSessions = [...sessions].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
    return <>
      <div className="onboarding-stats">
        <StatCard label="Upcoming Sessions" value={upcoming} sub="Scheduled and ready" icon={<CalendarDays size={18} />} />
        <StatCard label="Completed Sessions" value={completed} sub="Successfully delivered" icon={<CheckCircle2 size={18} />} />
        <StatCard label="Pending Sessions" value={pending} sub="Needs scheduling" icon={<Clock3 size={18} />} />
      </div>
      <div className="onboarding-panel">
        <div className="onboarding-panel__heading"><div><h2>Orientation sessions</h2><p>Help every new hire meet their team and get set up for success.</p></div><Button icon={<Plus size={16} />} onClick={() => setSessionModalOpen(true)}>Schedule Session</Button></div>
        <div className="onboarding-table-scroll"><table className="onboarding-table">
          <thead><tr><th>Session</th><th>Date</th><th>Time</th><th>Trainer</th><th>Participants</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>{orderedSessions.map((session) => <tr key={session.id}>
            <td><strong>{session.title}</strong></td><td>{dateLabel(session.date)}</td><td>{session.time}</td><td>{session.trainer}</td>
            <td><div className="onboarding-participants">{session.participantIds.slice(0, 3).map((id) => {
              const employee = employees.find((entry) => entry.id === id);
              return employee ? <Avatar key={id} name={employee.name} size="sm" color={employee.color} /> : null;
            })}<span>{session.participantIds.length} participant{session.participantIds.length === 1 ? '' : 's'}</span></div></td>
            <td><StatusBadge status={session.status} /></td>
            <td><Button size="sm" variant={session.status === 'Completed' ? 'secondary' : 'outline'} onClick={() => updateSessionStatus(session)}>{session.status === 'Completed' ? 'Reopen' : 'Mark complete'}</Button></td>
          </tr>)}</tbody>
        </table>{orderedSessions.length === 0 && <EmptyMessage title="No orientation sessions" description="Schedule a session to get your new hires started." />}</div>
      </div>
    </>;
  };

  const renderActivity = () => <>
    <div className="onboarding-activity-summary"><div><span className="onboarding-eyebrow">Onboarding activity</span><strong>{activities.length} <small>events</small></strong></div><p>A live timeline of the tasks and milestones across your new hire program.</p></div>
    <div className="onboarding-panel">
      <div className="onboarding-panel__heading"><div><h2>Recent activity</h2><p>Review onboarding changes by employee, activity, status, or date.</p></div></div>
      <div className="onboarding-filters">
        <Select aria-label="Filter by employee" value={employeeFilter} onChange={(event) => setEmployeeFilter(event.target.value)} options={employeeOptions} />
        <Select aria-label="Filter by activity type" value={activityFilter} onChange={(event) => setActivityFilter(event.target.value)} options={[{ value: 'all', label: 'All activity types' }, ...['Employee', 'Document', 'Account', 'IT Setup', 'Orientation', 'Onboarding'].map((type) => ({ value: type, label: type }))]} />
        <Select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} options={[{ value: 'all', label: 'All statuses' }, ...['Completed', 'Submitted', 'Verified', 'Rejected', 'Requested', 'Scheduled', 'Pending'].map((status) => ({ value: status, label: status }))]} />
        <Input aria-label="Filter activity by date" type="date" value={activityDate} onChange={(event) => setActivityDate(event.target.value)} />
        {(employeeFilter !== 'all' || activityFilter !== 'all' || statusFilter !== 'all' || activityDate) && <Button variant="ghost" size="sm" icon={<X size={14} />} onClick={() => { setEmployeeFilter('all'); setActivityFilter('all'); setStatusFilter('all'); setActivityDate(''); }}>Clear filters</Button>}
      </div>
      <div className="onboarding-timeline">{visibleActivities.map((event) => {
        const employee = employees.find((entry) => entry.id === event.employeeId);
        return <div className="onboarding-timeline__item" key={event.id}>
          <div className={`onboarding-timeline__marker onboarding-timeline__marker--${event.type.toLowerCase().replace(/\s/g, '-')}`}><ActivityIcon type={event.type} /></div>
          <div className="onboarding-timeline__content"><div><strong>{event.activity}</strong><span>{employee?.name ?? 'Former employee'} · {event.by}</span></div><div className="onboarding-timeline__meta"><span>{timeLabel(event.date)}</span><StatusBadge status={event.status} /></div></div>
        </div>;
      })}{visibleActivities.length === 0 && <EmptyMessage title="No matching activity" description="Adjust or clear your filters to see more events." />}</div>
    </div>
  </>;

  const renderEmployeeDetails = (employee: Employee) => {
    const employeeDocs = documents.filter((document) => document.employeeId === employee.id);
    const employeeAccounts = accounts.filter((task) => task.employeeId === employee.id);
    const employeeIT = itItems.filter((task) => task.employeeId === employee.id);
    const employeeSessions = sessions.filter((session) => session.participantIds.includes(employee.id));
    const employeeActivities = activities.filter((event) => event.employeeId === employee.id);
    const percentage = progressFor(employee.id);
    return <div className="onboarding-detail">
      <Button variant="ghost" icon={<ArrowLeft size={15} />} onClick={() => goToSection('new-hires')}>Back to New Hires</Button>
      <div className="onboarding-detail__hero">
        <div className="onboarding-person"><Avatar name={employee.name} size="xl" color={employee.color} /><div><h2>{employee.name}</h2><p>{employee.role} · {employee.department}</p><span>{employee.email}</span></div></div>
        <div className="onboarding-detail__status"><StatusBadge status={statusFor(employee.id)} /><span>Joining {dateLabel(employee.joiningDate)}</span></div>
      </div>
      <div className="onboarding-detail__progress"><div><span>Overall onboarding progress</span><strong>{percentage}%</strong></div><ProgressBar value={percentage} size="md" /><div className="onboarding-detail__facts"><span><b>Manager</b>{employee.manager}</span><span><b>Department</b>{employee.department}</span><span><b>Job role</b>{employee.role}</span></div></div>
      <section className="onboarding-panel onboarding-detail__section"><div className="onboarding-panel__heading"><div><h3>Documents</h3><p>Required paperwork and verification.</p></div><Link to="/solutions/hr/employee-onboarding/documents">Manage documents <ArrowRight size={14} /></Link></div><div className="onboarding-detail__list">{employeeDocs.map((document) => <div key={document.id}><span><FileText size={15} />{document.name}</span><StatusBadge status={document.status} /><div className="onboarding-row-actions"><Button size="sm" variant="ghost" onClick={() => setDocumentModal(document)}>View</Button><Button size="sm" variant="ghost" disabled={document.status === 'Verified'} onClick={() => setDocumentStatus(document, 'Verified')}>Verify</Button></div></div>)}</div></section>
      <DetailTaskSection title="Account Setup" description="HR, payroll, and employee accounts." tasks={employeeAccounts} onComplete={(task) => updateTask(task.id, 'account')} link="/solutions/hr/employee-onboarding/account-setup" />
      <DetailTaskSection title="IT Setup" description="Equipment and secure system access." tasks={employeeIT} onComplete={(task) => updateTask(task.id, 'it')} link="/solutions/hr/employee-onboarding/it-setup" />
      <section className="onboarding-panel onboarding-detail__section"><div className="onboarding-panel__heading"><div><h3>Orientation</h3><p>Sessions this employee is invited to attend.</p></div><Link to="/solutions/hr/employee-onboarding/orientation">Manage sessions <ArrowRight size={14} /></Link></div><div className="onboarding-detail__list">{employeeSessions.length ? employeeSessions.map((session) => <div key={session.id}><span><CalendarDays size={15} />{session.title} · {dateLabel(session.date)}</span><StatusBadge status={session.status} /><Button size="sm" variant="ghost" onClick={() => updateSessionStatus(session)}>{session.status === 'Completed' ? 'Reopen' : 'Mark complete'}</Button></div>) : <span className="onboarding-muted">No sessions scheduled yet.</span>}</div></section>
      <section className="onboarding-panel onboarding-detail__section"><div className="onboarding-panel__heading"><div><h3>Activity</h3><p>Recent milestones for {employee.name}.</p></div><Link to="/solutions/hr/employee-onboarding/activity">View all activity <ArrowRight size={14} /></Link></div><div className="onboarding-detail__list">{employeeActivities.slice(0, 5).map((event) => <div key={event.id}><span><Clock3 size={15} />{event.activity}</span><span className="onboarding-muted">{timeLabel(event.date)}</span><StatusBadge status={event.status} /></div>)}</div></section>
    </div>;
  };

  return <div className="page-content onboarding-page">
    {selectedEmployee ? renderEmployeeDetails(selectedEmployee) : <>
      <div className="page-header onboarding-page__header"><div className="page-header__text"><div className="onboarding-breadcrumb">HR Solutions <span>/</span> Employee Onboarding</div><h1 className="page-header__title">{headerTitle}</h1><p className="page-header__subtitle">A coordinated onboarding experience from day zero to day one.</p></div>{section === 'new-hires' && <Button icon={<UserPlus size={16} />} onClick={() => setHireModalOpen(true)}>Start Onboarding</Button>}</div>
      <nav className="onboarding-section-nav" aria-label="Employee onboarding sections">{sectionItems.map((item) => <button type="button" key={item.id} className={section === item.id ? 'is-active' : ''} onClick={() => goToSection(item.id)}>{item.label}</button>)}</nav>
      <main className="onboarding-section-content" key={section}>
        {section === 'new-hires' && renderNewHires()}
        {section === 'documents' && renderDocuments()}
        {section === 'account-setup' && renderAccountSetup()}
        {section === 'it-setup' && renderItSetup()}
        {section === 'orientation' && renderOrientation()}
        {section === 'activity' && renderActivity()}
      </main>
    </>}

    <Modal open={hireModalOpen} onClose={() => setHireModalOpen(false)} title="Start employee onboarding" size="lg" footer={<><Button variant="secondary" onClick={() => setHireModalOpen(false)}>Cancel</Button><Button type="submit" form="onboarding-hire-form">Create onboarding</Button></>}>
      <form id="onboarding-hire-form" className="onboarding-form-grid" onSubmit={submitHire}>
        <Input label="Employee Name" placeholder="e.g. Riley Thompson" required value={hireDraft.name} onChange={(event) => setHireDraft({ ...hireDraft, name: event.target.value })} />
        <Input label="Email" type="email" placeholder="name@company.com" required value={hireDraft.email} onChange={(event) => setHireDraft({ ...hireDraft, email: event.target.value })} />
        <Input label="Job Role" placeholder="e.g. Product Manager" required value={hireDraft.role} onChange={(event) => setHireDraft({ ...hireDraft, role: event.target.value })} />
        <Input label="Department" placeholder="e.g. Product" required value={hireDraft.department} onChange={(event) => setHireDraft({ ...hireDraft, department: event.target.value })} />
        <Input label="Manager" placeholder="Manager name" required value={hireDraft.manager} onChange={(event) => setHireDraft({ ...hireDraft, manager: event.target.value })} />
        <Input label="Joining Date" type="date" required value={hireDraft.joiningDate} onChange={(event) => setHireDraft({ ...hireDraft, joiningDate: event.target.value })} />
      </form>
    </Modal>

    <Modal open={sessionModalOpen} onClose={() => setSessionModalOpen(false)} title="Schedule orientation session" size="md" footer={<><Button variant="secondary" onClick={() => setSessionModalOpen(false)}>Cancel</Button><Button type="submit" form="onboarding-session-form">Schedule session</Button></>}>
      <form id="onboarding-session-form" className="onboarding-form-grid" onSubmit={scheduleSession}>
        <Select label="Session" value={sessionDraft.title} onChange={(event) => setSessionDraft({ ...sessionDraft, title: event.target.value })} options={['Company Introduction', 'HR Policy Orientation', 'Security Training', 'Product Training', 'Team Introduction'].map((title) => ({ value: title, label: title }))} />
        <Select label="Participant" value={sessionDraft.participantId} onChange={(event) => setSessionDraft({ ...sessionDraft, participantId: event.target.value })} options={[{ value: '', label: 'All new hires' }, ...employees.map((employee) => ({ value: employee.id, label: employee.name }))]} />
        <Input label="Date" type="date" required value={sessionDraft.date} onChange={(event) => setSessionDraft({ ...sessionDraft, date: event.target.value })} />
        <Input label="Time" type="time" required value={sessionDraft.time} onChange={(event) => setSessionDraft({ ...sessionDraft, time: event.target.value })} />
        <Input label="Trainer" placeholder="Trainer name" required value={sessionDraft.trainer} onChange={(event) => setSessionDraft({ ...sessionDraft, trainer: event.target.value })} />
      </form>
    </Modal>

    <Modal open={!!documentModal} onClose={() => setDocumentModal(null)} title="Document details" size="md" footer={<><Button variant="secondary" onClick={() => { if (documentModal) requestDocument(documentModal); setDocumentModal(null); }}>Request document</Button><Button onClick={() => { if (documentModal) setDocumentStatus(documentModal, 'Verified'); setDocumentModal(null); }}>Verify document</Button></>}>
      {documentModal && <DocumentPreview document={documentModal} employee={employees.find((employee) => employee.id === documentModal.employeeId)} />}
    </Modal>
  </div>;
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const variant = ['completed', 'verified'].includes(normalized) ? 'success'
    : ['in progress', 'submitted', 'upcoming', 'scheduled'].includes(normalized) ? 'info'
      : ['delayed', 'pending', 'requested'].includes(normalized) ? 'warning'
        : ['rejected'].includes(normalized) ? 'error' : 'neutral';
  return <Badge variant={variant} dot>{status}</Badge>;
}

function TaskRow({ task, onComplete }: { task: SetupTask; onComplete: () => void }) {
  return <div className="onboarding-checklist__row"><span className={`onboarding-check onboarding-check--${task.status.toLowerCase().replace(' ', '-')}`}>{task.status === 'Completed' ? <Check size={12} /> : null}</span><div><strong>{task.name}</strong><StatusBadge status={task.status} /></div><Button size="sm" variant={task.status === 'Completed' ? 'secondary' : 'outline'} onClick={onComplete}>{task.status === 'Completed' ? 'Reopen' : 'Mark complete'}</Button></div>;
}

function TaskButton({ task, onClick }: { task?: SetupTask; onClick: () => void }) {
  if (!task) return null;
  return <Button variant="ghost" size="sm" onClick={onClick}>{task.status === 'Completed' ? 'Assigned' : 'Mark assigned'}</Button>;
}

function DetailTaskSection({ title, description, tasks, onComplete, link }: { title: string; description: string; tasks: SetupTask[]; onComplete: (task: SetupTask) => void; link: string }) {
  const done = tasks.filter((task) => task.status === 'Completed').length;
  return <section className="onboarding-panel onboarding-detail__section"><div className="onboarding-panel__heading"><div><h3>{title}</h3><p>{description}</p></div><Link to={link}>Manage setup <ArrowRight size={14} /></Link></div><div className="onboarding-detail__list">{tasks.map((task) => <div key={task.id}><span>{task.name}</span><StatusBadge status={task.status} /><Button size="sm" variant={task.status === 'Completed' ? 'secondary' : 'outline'} onClick={() => onComplete(task)}>{task.status === 'Completed' ? 'Reopen' : 'Mark complete'}</Button></div>)}</div><div className="onboarding-detail__section-progress"><ProgressBar value={tasks.length ? done / tasks.length * 100 : 0} showPercentage /></div></section>;
}

function DocumentPreview({ document, employee }: { document: OnboardingDocument; employee?: Employee }) {
  return <div className="onboarding-document-preview"><div className="onboarding-document-preview__icon"><FileText size={26} /></div><h3>{document.name}</h3><p>Document record for {employee?.name ?? 'employee'}.</p><div className="onboarding-document-preview__meta"><span>Requirement</span><strong>{document.required ? 'Required' : 'Optional'}</strong><span>Submitted</span><strong>{dateLabel(document.submittedDate)}</strong><span>Current status</span><StatusBadge status={document.status} /></div><div className="onboarding-document-preview__note">This demo workspace tracks document status only. No sensitive document files are stored.</div></div>;
}

function ActivityIcon({ type }: { type: string }) {
  if (type === 'Document') return <FileText size={15} />;
  if (type === 'IT Setup') return <Laptop size={15} />;
  if (type === 'Orientation') return <CalendarDays size={15} />;
  if (type === 'Employee') return <UserPlus size={15} />;
  if (type === 'Onboarding') return <CheckCircle2 size={15} />;
  return <CheckCircle2 size={15} />;
}

function EmptyMessage({ title, description }: { title: string; description: string }) {
  return <div className="onboarding-empty"><div><FileText size={20} /></div><strong>{title}</strong><span>{description}</span></div>;
}
