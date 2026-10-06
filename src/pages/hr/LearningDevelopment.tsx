import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Eye,
  GraduationCap,
  Plus,
  Search,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { StatCard } from '../../components/ui/StatCard';
import { useToast } from '../../components/ui/Toast';
import './learning-development.css';

type Section = 'learning-plans' | 'skill-gaps' | 'courses' | 'training' | 'evaluations' | 'activity';
type WorkStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Overdue';
type CourseStatus = 'Active' | 'Draft' | 'Completed';
type Level = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  manager: string;
  color: string;
}

interface Course {
  id: string;
  name: string;
  description: string;
  category: string;
  instructor: string;
  duration: string;
  difficulty: Level;
  skills: string[];
  enrolledIds: string[];
  completedIds: string[];
  status: CourseStatus;
}

interface LearningPlan {
  id: string;
  name: string;
  employeeIds: string[];
  department: string;
  skills: string[];
  startDate: string;
  dueDate: string;
  courseIds: string[];
}

interface Training {
  id: string;
  name: string;
  trainer: string;
  date: string;
  time: string;
  location: string;
  participantIds: string[];
  status: WorkStatus;
}

interface SkillGap {
  id: string;
  employeeId: string;
  skill: string;
  currentLevel: Level;
  requiredLevel: Level;
  recommendedCourseId: string;
  improved: boolean;
}

interface Evaluation {
  id: string;
  employeeId: string;
  courseId: string;
  title: string;
  score?: number;
  trainer: string;
  date: string;
  status: 'Pending' | 'Completed';
  objectives: string[];
  criteria: { question: string; score: number }[];
  trainerFeedback: string;
  employeeFeedback: string;
}

interface ActivityEvent {
  id: string;
  employeeId: string;
  activity: string;
  type: string;
  courseName: string;
  date: string;
  by: string;
  status: string;
}

const sections: { id: Section; label: string }[] = [
  { id: 'learning-plans', label: 'Learning Plans' },
  { id: 'skill-gaps', label: 'Skill Gaps' },
  { id: 'courses', label: 'Courses' },
  { id: 'training', label: 'Training' },
  { id: 'evaluations', label: 'Evaluations' },
  { id: 'activity', label: 'Activity' },
];

const employeesSeed: Employee[] = [
  { id: 'ld-101', name: 'Ava Patel', email: 'ava.patel@northstar.io', role: 'Product Designer', department: 'Product', manager: 'Jordan Lee', color: '#7c3aed' },
  { id: 'ld-102', name: 'Noah Williams', email: 'noah.williams@northstar.io', role: 'Software Engineer', department: 'Engineering', manager: 'Priya Sharma', color: '#2563eb' },
  { id: 'ld-103', name: 'Mia Chen', email: 'mia.chen@northstar.io', role: 'People Operations Lead', department: 'People', manager: 'Taylor Morgan', color: '#db2777' },
  { id: 'ld-104', name: 'Liam Johnson', email: 'liam.johnson@northstar.io', role: 'Account Executive', department: 'Sales', manager: 'Sam Rivera', color: '#059669' },
  { id: 'ld-105', name: 'Sofia Garcia', email: 'sofia.garcia@northstar.io', role: 'Data Analyst', department: 'Data', manager: 'Alex Kim', color: '#d97706' },
];

const initialCourses: Course[] = [
  { id: 'course-1', name: 'Product Discovery Foundations', description: 'Research techniques and frameworks for discovering customer needs.', category: 'Product', instructor: 'Jordan Lee', duration: '4 hours', difficulty: 'Intermediate', skills: ['User Research', 'Product Strategy'], enrolledIds: ['ld-101', 'ld-103'], completedIds: ['ld-103'], status: 'Active' },
  { id: 'course-2', name: 'Modern TypeScript & React', description: 'Build maintainable frontends with practical TypeScript patterns.', category: 'Engineering', instructor: 'Priya Sharma', duration: '8 hours', difficulty: 'Advanced', skills: ['TypeScript', 'React'], enrolledIds: ['ld-102', 'ld-105'], completedIds: [], status: 'Active' },
  { id: 'course-3', name: 'Consultative Selling', description: 'Create value-led conversations and strong customer relationships.', category: 'Sales', instructor: 'Sam Rivera', duration: '3 hours', difficulty: 'Beginner', skills: ['Discovery', 'Negotiation'], enrolledIds: ['ld-104'], completedIds: ['ld-104'], status: 'Active' },
  { id: 'course-4', name: 'People Analytics Essentials', description: 'Use workforce data to support practical people decisions.', category: 'People', instructor: 'Taylor Morgan', duration: '5 hours', difficulty: 'Intermediate', skills: ['People Analytics', 'Data Storytelling'], enrolledIds: ['ld-103', 'ld-105'], completedIds: ['ld-105'], status: 'Active' },
  { id: 'course-5', name: 'Accessible Interface Design', description: 'Apply inclusive design and accessibility standards in product work.', category: 'Design', instructor: 'Avery Brooks', duration: '6 hours', difficulty: 'Advanced', skills: ['Accessibility', 'Figma'], enrolledIds: ['ld-101'], completedIds: [], status: 'Active' },
  { id: 'course-6', name: 'Data Storytelling with SQL', description: 'Turn trusted data into clear, decision-ready narratives.', category: 'Data', instructor: 'Alex Kim', duration: '6 hours', difficulty: 'Intermediate', skills: ['SQL', 'Data Storytelling'], enrolledIds: ['ld-105'], completedIds: [], status: 'Draft' },
];

const initialPlans: LearningPlan[] = [
  { id: 'plan-1', name: 'Product Design Growth Path', employeeIds: ['ld-101'], department: 'Product', skills: ['Accessibility', 'User Research'], startDate: '2026-09-15', dueDate: '2026-11-15', courseIds: ['course-1', 'course-5'] },
  { id: 'plan-2', name: 'Frontend Engineering Excellence', employeeIds: ['ld-102'], department: 'Engineering', skills: ['TypeScript', 'React'], startDate: '2026-09-01', dueDate: '2026-10-30', courseIds: ['course-2'] },
  { id: 'plan-3', name: 'People Analytics Development', employeeIds: ['ld-103', 'ld-105'], department: 'People', skills: ['People Analytics', 'Data Storytelling'], startDate: '2026-08-10', dueDate: '2026-09-30', courseIds: ['course-4'] },
  { id: 'plan-4', name: 'Strategic Customer Conversations', employeeIds: ['ld-104'], department: 'Sales', skills: ['Discovery', 'Negotiation'], startDate: '2026-09-20', dueDate: '2026-11-20', courseIds: ['course-3'] },
];

const initialTrainings: Training[] = [
  { id: 'training-1', name: 'Design Critique Workshop', trainer: 'Avery Brooks', date: '2026-10-09', time: '10:00', location: 'Studio 2 · In person', participantIds: ['ld-101', 'ld-103'], status: 'In Progress' },
  { id: 'training-2', name: 'Secure Coding Essentials', trainer: 'Priya Sharma', date: '2026-10-12', time: '13:30', location: 'Online · Zoom', participantIds: ['ld-102', 'ld-105'], status: 'Not Started' },
  { id: 'training-3', name: 'Customer Discovery Role-play', trainer: 'Sam Rivera', date: '2026-10-15', time: '11:00', location: 'Sales Hub · In person', participantIds: ['ld-104'], status: 'Not Started' },
  { id: 'training-4', name: 'Inclusive Hiring Practices', trainer: 'Taylor Morgan', date: '2026-09-24', time: '14:00', location: 'Online · Zoom', participantIds: ['ld-103'], status: 'Completed' },
];

const initialGaps: SkillGap[] = [
  { id: 'gap-1', employeeId: 'ld-101', skill: 'Accessibility', currentLevel: 'Beginner', requiredLevel: 'Advanced', recommendedCourseId: 'course-5', improved: false },
  { id: 'gap-2', employeeId: 'ld-101', skill: 'User Research', currentLevel: 'Intermediate', requiredLevel: 'Advanced', recommendedCourseId: 'course-1', improved: false },
  { id: 'gap-3', employeeId: 'ld-102', skill: 'TypeScript', currentLevel: 'Intermediate', requiredLevel: 'Expert', recommendedCourseId: 'course-2', improved: false },
  { id: 'gap-4', employeeId: 'ld-102', skill: 'System Design', currentLevel: 'Beginner', requiredLevel: 'Advanced', recommendedCourseId: 'course-2', improved: false },
  { id: 'gap-5', employeeId: 'ld-104', skill: 'Negotiation', currentLevel: 'Intermediate', requiredLevel: 'Advanced', recommendedCourseId: 'course-3', improved: true },
  { id: 'gap-6', employeeId: 'ld-105', skill: 'Data Storytelling', currentLevel: 'Intermediate', requiredLevel: 'Advanced', recommendedCourseId: 'course-4', improved: true },
  { id: 'gap-7', employeeId: 'ld-103', skill: 'People Analytics', currentLevel: 'Beginner', requiredLevel: 'Advanced', recommendedCourseId: 'course-4', improved: false },
];

const initialEvaluations: Evaluation[] = [
  { id: 'eval-1', employeeId: 'ld-101', courseId: 'course-1', title: 'Product Discovery Check-in', score: 88, trainer: 'Jordan Lee', date: '2026-10-01', status: 'Completed', objectives: ['Plan user interviews', 'Synthesize research into opportunities'], criteria: [{ question: 'Research plan quality', score: 4 }, { question: 'Insight synthesis', score: 5 }, { question: 'Stakeholder communication', score: 4 }], trainerFeedback: 'Strong synthesis and a thoughtful plan. Continue building confidence in communicating trade-offs.', employeeFeedback: 'The practical interview exercises were immediately useful.' },
  { id: 'eval-2', employeeId: 'ld-102', courseId: 'course-2', title: 'TypeScript Skills Review', trainer: 'Priya Sharma', date: '2026-10-08', status: 'Pending', objectives: ['Apply safe type narrowing', 'Design reusable component props'], criteria: [{ question: 'Type modeling', score: 0 }, { question: 'Component design', score: 0 }], trainerFeedback: '', employeeFeedback: '' },
  { id: 'eval-3', employeeId: 'ld-104', courseId: 'course-3', title: 'Consultative Selling Assessment', trainer: 'Sam Rivera', date: '2026-09-29', score: 76, status: 'Completed', objectives: ['Lead a discovery conversation', 'Respond to customer objections'], criteria: [{ question: 'Discovery questions', score: 4 }, { question: 'Objection handling', score: 4 }, { question: 'Next-step alignment', score: 3 }], trainerFeedback: 'Good rapport and clear next steps. Practice uncovering budget and decision criteria earlier.', employeeFeedback: 'Role-play helped me try a new approach in a safe setting.' },
  { id: 'eval-4', employeeId: 'ld-105', courseId: 'course-4', title: 'Analytics Application Review', trainer: 'Alex Kim', date: '2026-10-10', status: 'Pending', objectives: ['Choose appropriate people metrics', 'Present an evidence-based recommendation'], criteria: [{ question: 'Metric selection', score: 0 }, { question: 'Data narrative', score: 0 }], trainerFeedback: '', employeeFeedback: '' },
];

const initialActivity: ActivityEvent[] = [
  { id: 'activity-1', employeeId: 'ld-101', activity: 'Learning plan created', type: 'Learning Plan', courseName: 'Product Design Growth Path', date: '2026-09-15T09:15:00', by: 'Taylor Morgan', status: 'Completed' },
  { id: 'activity-2', employeeId: 'ld-101', activity: 'Employee enrolled', type: 'Enrollment', courseName: 'Product Discovery Foundations', date: '2026-09-16T10:30:00', by: 'Jordan Lee', status: 'Completed' },
  { id: 'activity-3', employeeId: 'ld-103', activity: 'Course completed', type: 'Course', courseName: 'Product Discovery Foundations', date: '2026-09-27T15:20:00', by: 'Mia Chen', status: 'Completed' },
  { id: 'activity-4', employeeId: 'ld-102', activity: 'Course assigned', type: 'Enrollment', courseName: 'Modern TypeScript & React', date: '2026-09-18T11:45:00', by: 'Priya Sharma', status: 'Completed' },
  { id: 'activity-5', employeeId: 'ld-104', activity: 'Training scheduled', type: 'Training', courseName: 'Customer Discovery Role-play', date: '2026-10-02T13:00:00', by: 'Sam Rivera', status: 'Scheduled' },
  { id: 'activity-6', employeeId: 'ld-104', activity: 'Evaluation submitted', type: 'Evaluation', courseName: 'Consultative Selling', date: '2026-09-29T16:45:00', by: 'Sam Rivera', status: 'Completed' },
  { id: 'activity-7', employeeId: 'ld-105', activity: 'Skill improved', type: 'Skill', courseName: 'Data Storytelling', date: '2026-09-30T12:10:00', by: 'Alex Kim', status: 'Completed' },
  { id: 'activity-8', employeeId: 'ld-103', activity: 'Training completed', type: 'Training', courseName: 'Inclusive Hiring Practices', date: '2026-09-24T15:30:00', by: 'Taylor Morgan', status: 'Completed' },
];

const levels: Level[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const levelIndex = (level: Level) => levels.indexOf(level);
const dateLabel = (value: string) => value
  ? new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  : '—';
const timeLabel = (value: string) => new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
const sectionFromPath = (value: string): Section => sections.some((item) => item.id === value)
  ? value as Section
  : 'learning-plans';

export default function LearningDevelopment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [employees] = useState(employeesSeed);
  const [plans, setPlans] = useState(initialPlans);
  const [courses, setCourses] = useState(initialCourses);
  const [trainings, setTrainings] = useState(initialTrainings);
  const [gaps, setGaps] = useState(initialGaps);
  const [evaluations, setEvaluations] = useState(initialEvaluations);
  const [activities, setActivities] = useState(initialActivity);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('all');
  const [gapLevelFilter, setGapLevelFilter] = useState('all');
  const [activityFilter, setActivityFilter] = useState('all');
  const [activityEmployeeFilter, setActivityEmployeeFilter] = useState('all');
  const [activityDepartmentFilter, setActivityDepartmentFilter] = useState('all');
  const [activityDate, setActivityDate] = useState('');
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [trainingModalOpen, setTrainingModalOpen] = useState(false);
  const [trainingAction, setTrainingAction] = useState<Training | null>(null);
  const [participantsTraining, setParticipantsTraining] = useState<Training | null>(null);
  const [evaluationDetail, setEvaluationDetail] = useState<Evaluation | null>(null);
  const [courseDetail, setCourseDetail] = useState<Course | null>(null);
  const [planDraft, setPlanDraft] = useState({ name: '', employeeId: '', department: '', skills: '', startDate: '', dueDate: '', courseIds: [] as string[] });
  const [courseDraft, setCourseDraft] = useState({ name: '', description: '', category: '', instructor: '', duration: '', difficulty: 'Beginner' as Level, skills: '' });
  const [trainingDraft, setTrainingDraft] = useState({ name: '', trainer: '', date: '', time: '', location: '', participantIds: [] as string[], status: 'Not Started' as WorkStatus });
  const [evaluationForm, setEvaluationForm] = useState({ score: '', trainerFeedback: '', employeeFeedback: '' });
  const [profileReturnSection, setProfileReturnSection] = useState<Section>('learning-plans');

  const routeParts = location.pathname.split('/').filter(Boolean).slice(3);
  const section = sectionFromPath(routeParts[0] ?? '');
  const profileEmployee = routeParts[1] === 'employee' ? employees.find((employee) => employee.id === routeParts[2]) : undefined;

  const employeeById = (id: string) => employees.find((employee) => employee.id === id);
  const courseById = (id: string) => courses.find((course) => course.id === id);
  const employeeProgress = (employeeId: string) => {
    const assignedCourseIds = new Set([
      ...plans.filter((plan) => plan.employeeIds.includes(employeeId)).flatMap((plan) => plan.courseIds),
      ...courses.filter((course) => course.enrolledIds.includes(employeeId)).map((course) => course.id),
    ]);
    const assignedTrainings = trainings.filter((training) => training.participantIds.includes(employeeId));
    const completedCourses = courses.filter((course) => assignedCourseIds.has(course.id) && course.completedIds.includes(employeeId)).length;
    const completedTrainings = assignedTrainings.filter((training) => training.status === 'Completed').length;
    const total = assignedCourseIds.size + assignedTrainings.length;
    return total ? Math.round((completedCourses + completedTrainings) / total * 100) : 0;
  };

  const addActivity = (employeeId: string, activity: string, type: string, courseName: string, status: string, by = 'Taylor Morgan') => {
    setActivities((current) => [{
      id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      employeeId,
      activity,
      type,
      courseName,
      date: new Date().toISOString(),
      by,
      status,
    }, ...current]);
  };

  const openProfile = (employeeId: string) => {
    setProfileReturnSection(section);
    navigate(`/solutions/hr/learning-development/${section}/employee/${employeeId}`);
  };

  const returnToSection = () => {
    const returnSection = profileReturnSection === 'learning-plans' && section !== 'learning-plans'
      ? section
      : profileReturnSection;
    navigate(`/solutions/hr/learning-development/${returnSection}`);
  };
  const goToSection = (next: Section) => navigate(`/solutions/hr/learning-development/${next}`);

  const planProgress = (plan: LearningPlan) => {
    const expected = plan.courseIds.length * plan.employeeIds.length;
    if (!expected) return 0;
    const completed = plan.courseIds.reduce((total, courseId) => {
      const course = courseById(courseId);
      return total + (course ? plan.employeeIds.filter((id) => course.completedIds.includes(id)).length : 0);
    }, 0);
    return Math.round(completed / expected * 100);
  };

  const planStatus = (plan: LearningPlan): WorkStatus => {
    const progress = planProgress(plan);
    if (progress === 100) return 'Completed';
    if (plan.dueDate < new Date().toISOString().slice(0, 10)) return 'Overdue';
    return progress > 0 ? 'In Progress' : 'Not Started';
  };

  const filteredPlans = plans.filter((plan) => {
    const employeeName = plan.employeeIds.map((id) => employeeById(id)?.name ?? '').join(' ');
    return `${plan.name} ${plan.department} ${plan.skills.join(' ')} ${employeeName}`.toLowerCase().includes(search.toLowerCase());
  });

  const filteredGaps = gaps.filter((gap) => {
    const employee = employeeById(gap.employeeId);
    const gapSize = levelIndex(gap.requiredLevel) - levelIndex(gap.currentLevel);
    return (!departmentFilter || departmentFilter === 'all' || employee?.department === departmentFilter)
      && (!roleFilter || roleFilter === 'all' || employee?.role === roleFilter)
      && (!skillFilter || skillFilter === 'all' || gap.skill === skillFilter)
      && (!gapLevelFilter || gapLevelFilter === 'all' || (gapLevelFilter === 'critical' ? gapSize >= 2 : gapSize < 2));
  });

  const filteredActivities = activities.filter((event) => {
    const employee = employeeById(event.employeeId);
    return (activityFilter === 'all' || event.type === activityFilter)
      && (activityEmployeeFilter === 'all' || event.employeeId === activityEmployeeFilter)
      && (activityDepartmentFilter === 'all' || employee?.department === activityDepartmentFilter)
      && (!activityDate || event.date.slice(0, 10) === activityDate);
  });

  const toggleCourseCompletion = (courseId: string, employeeId: string) => {
    const course = courseById(courseId);
    if (!course) return;
    const isCompleted = course.completedIds.includes(employeeId);
    setCourses((current) => current.map((item) => item.id !== courseId ? item : {
      ...item,
      enrolledIds: item.enrolledIds.includes(employeeId) ? item.enrolledIds : [...item.enrolledIds, employeeId],
      completedIds: isCompleted ? item.completedIds.filter((id) => id !== employeeId) : [...item.completedIds, employeeId],
    }));
    const employee = employeeById(employeeId);
    const action = isCompleted ? 'reopened' : 'completed';
    addActivity(employeeId, `Course ${action}`, 'Course', course.name, isCompleted ? 'In Progress' : 'Completed', employee?.name ?? 'Learning team');
    if (!isCompleted) {
      setGaps((current) => current.map((gap) => gap.employeeId === employeeId && gap.recommendedCourseId === courseId
        ? { ...gap, improved: true }
        : gap));
      showToast(`${course.name} marked complete`);
    } else {
      showToast(`${course.name} reopened`, 'info');
    }
  };

  const updateTrainingStatus = (training: Training, status: WorkStatus) => {
    setTrainings((current) => current.map((entry) => entry.id === training.id ? { ...entry, status } : entry));
    training.participantIds.forEach((employeeId) => addActivity(
      employeeId,
      `Training ${status === 'Completed' ? 'completed' : status === 'Not Started' ? 'reopened' : 'updated'}`,
      'Training',
      training.name,
      status,
      training.trainer,
    ));
    showToast(`${training.name} marked ${status.toLowerCase()}`);
  };

  const submitPlan = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const selected = planDraft.employeeId === 'team'
      ? employees.filter((employee) => employee.department === planDraft.department).map((employee) => employee.id)
      : [planDraft.employeeId];
    const courseIds = planDraft.courseIds;
    const plan: LearningPlan = {
      id: `plan-${Date.now()}`,
      name: planDraft.name.trim(),
      employeeIds: selected,
      department: planDraft.department,
      skills: planDraft.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
      startDate: planDraft.startDate,
      dueDate: planDraft.dueDate,
      courseIds,
    };
    setPlans((current) => [plan, ...current]);
    setCourses((current) => current.map((course) => courseIds.includes(course.id)
      ? { ...course, enrolledIds: [...new Set([...course.enrolledIds, ...selected])] }
      : course));
    selected.forEach((employeeId) => {
      addActivity(employeeId, 'Learning plan created', 'Learning Plan', plan.name, 'Completed');
      courseIds.forEach((courseId) => {
        const course = courseById(courseId);
        if (course) addActivity(employeeId, 'Course assigned', 'Enrollment', course.name, 'Completed');
      });
    });
    setPlanDraft({ name: '', employeeId: '', department: '', skills: '', startDate: '', dueDate: '', courseIds: [] });
    setPlanModalOpen(false);
    showToast('Learning plan created');
  };

  const submitCourse = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const course: Course = {
      id: `course-${Date.now()}`,
      name: courseDraft.name.trim(),
      description: courseDraft.description.trim(),
      category: courseDraft.category.trim(),
      instructor: courseDraft.instructor.trim(),
      duration: courseDraft.duration.trim(),
      difficulty: courseDraft.difficulty,
      skills: courseDraft.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
      enrolledIds: [],
      completedIds: [],
      status: 'Active',
    };
    setCourses((current) => [course, ...current]);
    setCourseDraft({ name: '', description: '', category: '', instructor: '', duration: '', difficulty: 'Beginner', skills: '' });
    setCourseModalOpen(false);
    showToast('Course created');
  };

  const openTrainingForm = (training?: Training) => {
    setTrainingAction(training ?? null);
    setTrainingDraft(training ? {
      name: training.name,
      trainer: training.trainer,
      date: training.date,
      time: training.time,
      location: training.location,
      participantIds: training.participantIds,
      status: training.status,
    } : { name: '', trainer: '', date: '', time: '', location: '', participantIds: [], status: 'Not Started' });
    setTrainingModalOpen(true);
  };

  const submitTraining = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (trainingAction) {
      const updated = { ...trainingAction, ...trainingDraft };
      setTrainings((current) => current.map((item) => item.id === updated.id ? updated : item));
      showToast('Training session updated');
    } else {
      const training: Training = { id: `training-${Date.now()}`, ...trainingDraft };
      setTrainings((current) => [training, ...current]);
      training.participantIds.forEach((employeeId) => addActivity(employeeId, 'Training scheduled', 'Training', training.name, 'Scheduled', training.trainer));
      showToast('Training session scheduled');
    }
    setTrainingModalOpen(false);
    setTrainingAction(null);
  };

  const submitEvaluation = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!evaluationDetail) return;
    const score = Number(evaluationForm.score);
    const updated: Evaluation = {
      ...evaluationDetail,
      score,
      status: 'Completed',
      criteria: evaluationDetail.criteria.map((criterion) => ({
        ...criterion,
        score: Math.max(1, Math.min(5, Math.round(score / 20))),
      })),
      trainerFeedback: evaluationForm.trainerFeedback.trim(),
      employeeFeedback: evaluationForm.employeeFeedback.trim(),
      date: new Date().toISOString().slice(0, 10),
    };
    setEvaluations((current) => current.map((item) => item.id === updated.id ? updated : item));
    const employee = employeeById(updated.employeeId);
    addActivity(updated.employeeId, 'Evaluation submitted', 'Evaluation', courseById(updated.courseId)?.name ?? updated.title, 'Completed', employee?.name ?? 'Learning team');
    if (score >= 85) setGaps((current) => current.map((gap) => gap.employeeId === updated.employeeId && gap.recommendedCourseId === updated.courseId ? { ...gap, improved: true } : gap));
    setEvaluationDetail(null);
    showToast('Evaluation submitted');
  };

  const getPlanFormEmployeeChange = (value: string) => {
    setPlanDraft((draft) => ({
      ...draft,
      employeeId: value,
      department: value === 'team' ? draft.department : employeeById(value)?.department ?? draft.department,
    }));
  };

  const renderLearningPlans = () => {
    const activePlans = plans.filter((plan) => ['Not Started', 'In Progress'].includes(planStatus(plan))).length;
    const enrolled = new Set(plans.flatMap((plan) => plan.employeeIds)).size;
    const completed = plans.filter((plan) => planStatus(plan) === 'Completed').length;
    const overdue = plans.filter((plan) => planStatus(plan) === 'Overdue').length;
    return <>
      <div className="ld-stats">
        <StatCard label="Active Learning Plans" value={activePlans} sub="In progress or ready to start" icon={<BookOpen size={18} />} />
        <StatCard label="Employees Enrolled" value={enrolled} sub="Across current plans" icon={<Users size={18} />} />
        <StatCard label="Completed Plans" value={completed} sub="Learning goals achieved" icon={<CheckCircle2 size={18} />} />
        <StatCard label="Overdue Plans" value={overdue} sub="Review due dates" icon={<Clock3 size={18} />} />
      </div>
      <Panel title="Employee learning plans" description="Build focused development paths and track progress toward role skills.">
        <div className="ld-panel-toolbar"><div className="ld-search"><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search plans or employees..." leftIcon={<Search size={15} />} /></div><span>{filteredPlans.length} plans</span></div>
        <div className="ld-table-wrap"><table className="ld-table ld-table--plans">
          <thead><tr><th>Employee</th><th>Learning Plan</th><th>Department</th><th>Skills</th><th>Start Date</th><th>Due Date</th><th>Progress</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>{filteredPlans.flatMap((plan) => plan.employeeIds.map((employeeId) => {
            const employee = employeeById(employeeId);
            if (!employee) return null;
            const progress = planProgress(plan);
            return <tr key={`${plan.id}-${employeeId}`}>
              <td><EmployeeLink employee={employee} onClick={() => openProfile(employee.id)} /></td>
              <td><strong>{plan.name}</strong></td><td>{plan.department}</td><td><SkillTags skills={plan.skills} /></td>
              <td>{dateLabel(plan.startDate)}</td><td>{dateLabel(plan.dueDate)}</td>
              <td><div className="ld-progress-cell"><ProgressBar value={progress} showPercentage /></div></td><td><StatusBadge status={planStatus(plan)} /></td>
              <td><Button variant="ghost" size="sm" onClick={() => openProfile(employeeId)}>View profile</Button></td>
            </tr>;
          }))}</tbody>
        </table>{filteredPlans.length === 0 && <EmptyState title="No learning plans found" text="Create a learning plan or try a different search." />}</div>
        <TableFooter>{filteredPlans.reduce((total, plan) => total + plan.employeeIds.length, 0)} employee-plan records</TableFooter>
      </Panel>
    </>;
  };

  const renderSkillGaps = () => {
    const critical = gaps.filter((gap) => levelIndex(gap.requiredLevel) - levelIndex(gap.currentLevel) >= 2).length;
    const improved = gaps.filter((gap) => gap.improved).length;
    const departments = [...new Set(employees.map((employee) => employee.department))];
    const roles = [...new Set(employees.map((employee) => employee.role))];
    const skills = [...new Set(gaps.map((gap) => gap.skill))];
    return <>
      <div className="ld-stats">
        <StatCard label="Skills Identified" value={gaps.length} sub="Across role profiles" icon={<Sparkles size={18} />} />
        <StatCard label="Critical Skill Gaps" value={critical} sub="Two or more levels below target" />
        <StatCard label="Employees Requiring Training" value={new Set(gaps.filter((gap) => !gap.improved).map((gap) => gap.employeeId)).size} sub="Personalized development needed" />
        <StatCard label="Skills Improved" value={improved} sub="Progress validated by managers" icon={<CheckCircle2 size={18} />} />
      </div>
      <Panel title="Skill gap analysis" description="Compare current capability with role expectations and recommend targeted learning.">
        <div className="ld-filters">
          <Select aria-label="Filter by department" value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)} options={[{ value: 'all', label: 'All departments' }, ...departments.map((value) => ({ value, label: value }))]} />
          <Select aria-label="Filter by role" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} options={[{ value: 'all', label: 'All roles' }, ...roles.map((value) => ({ value, label: value }))]} />
          <Select aria-label="Filter by skill" value={skillFilter} onChange={(event) => setSkillFilter(event.target.value)} options={[{ value: 'all', label: 'All skills' }, ...skills.map((value) => ({ value, label: value }))]} />
          <Select aria-label="Filter by gap level" value={gapLevelFilter} onChange={(event) => setGapLevelFilter(event.target.value)} options={[{ value: 'all', label: 'All gap levels' }, { value: 'critical', label: 'Critical gaps' }, { value: 'standard', label: 'Standard gaps' }]} />
          <Button variant="ghost" size="sm" onClick={() => { setDepartmentFilter('all'); setRoleFilter('all'); setSkillFilter('all'); setGapLevelFilter('all'); }}>Clear filters</Button>
        </div>
        <div className="ld-table-wrap"><table className="ld-table ld-table--gaps">
          <thead><tr><th>Employee</th><th>Role</th><th>Skill</th><th>Current Level</th><th>Required Level</th><th>Gap</th><th>Recommended Course</th><th>Status</th></tr></thead>
          <tbody>{filteredGaps.map((gap) => {
            const employee = employeeById(gap.employeeId);
            const course = courseById(gap.recommendedCourseId);
            const size = levelIndex(gap.requiredLevel) - levelIndex(gap.currentLevel);
            if (!employee) return null;
            return <tr key={gap.id}>
              <td><EmployeeLink employee={employee} onClick={() => openProfile(employee.id)} /></td><td>{employee.role}</td><td><strong>{gap.skill}</strong></td>
              <td><LevelBadge level={gap.currentLevel} /></td><td><LevelBadge level={gap.requiredLevel} /></td>
              <td><Badge variant={size >= 2 ? 'error' : 'warning'}>{Math.round(size / (levels.length - 1) * 100)}% gap</Badge></td>
              <td>{course ? <button type="button" className="ld-text-link" onClick={() => goToSection('courses')}>{course.name}</button> : '—'}</td>
              <td><StatusBadge status={gap.improved ? 'Improved' : 'Training needed'} /></td>
            </tr>;
          })}</tbody>
        </table>{filteredGaps.length === 0 && <EmptyState title="No matching skill gaps" text="Adjust the filters to explore other skill gaps." />}</div>
        <TableFooter>Showing {filteredGaps.length} skill gaps</TableFooter>
      </Panel>
    </>;
  };

  const renderCourses = () => {
    const active = courses.filter((course) => course.status === 'Active');
    const enrolledCount = new Set(courses.flatMap((course) => course.enrolledIds)).size;
    const completedCount = courses.reduce((total, course) => total + course.completedIds.length, 0);
    const visibleCourses = courses.filter((course) => `${course.name} ${course.category} ${course.instructor} ${course.skills.join(' ')}`.toLowerCase().includes(search.toLowerCase()));
    return <>
      <div className="ld-stats">
        <StatCard label="Total Courses" value={courses.length} sub="In the learning catalog" icon={<BookOpen size={18} />} />
        <StatCard label="Active Courses" value={active.length} sub="Available for enrollment" />
        <StatCard label="Employees Enrolled" value={enrolledCount} sub="Unique learners" icon={<Users size={18} />} />
        <StatCard label="Course Completions" value={completedCount} sub="Completed enrollments" icon={<CheckCircle2 size={18} />} />
      </div>
      <Panel title="Course library" description="Curated learning content for every team and career stage." action={<Button icon={<Plus size={16} />} onClick={() => setCourseModalOpen(true)}>Create Course</Button>}>
        <div className="ld-panel-toolbar"><div className="ld-search"><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search courses..." leftIcon={<Search size={15} />} /></div><span>{visibleCourses.length} courses</span></div>
        <div className="ld-course-grid">{visibleCourses.map((course) => {
          const completionRate = course.enrolledIds.length ? Math.round(course.completedIds.length / course.enrolledIds.length * 100) : 0;
          return <CourseCard key={course.id} course={course} employees={employees} completionRate={completionRate} onComplete={toggleCourseCompletion} onProfile={openProfile} onView={setCourseDetail} />;
        })}</div>
        {visibleCourses.length === 0 && <EmptyState title="No courses found" text="Try a different course or instructor search." />}
      </Panel>
    </>;
  };

  const renderTraining = () => {
    const upcoming = trainings.filter((training) => training.status === 'Not Started').length;
    const ongoing = trainings.filter((training) => training.status === 'In Progress').length;
    const completed = trainings.filter((training) => training.status === 'Completed').length;
    const participants = new Set(trainings.flatMap((training) => training.participantIds)).size;
    return <>
      <div className="ld-stats">
        <StatCard label="Upcoming Training" value={upcoming} sub="Scheduled sessions" icon={<CalendarDays size={18} />} />
        <StatCard label="Ongoing Training" value={ongoing} sub="Currently in progress" />
        <StatCard label="Completed Training" value={completed} sub="Sessions delivered" icon={<CheckCircle2 size={18} />} />
        <StatCard label="Participants" value={participants} sub="Unique learners" icon={<Users size={18} />} />
      </div>
      <Panel title="Training calendar" description="Coordinate instructor-led sessions and keep each cohort moving." action={<Button icon={<Plus size={16} />} onClick={() => openTrainingForm()}>Schedule Training</Button>}>
        <div className="ld-table-wrap"><table className="ld-table ld-table--training">
          <thead><tr><th>Training</th><th>Trainer</th><th>Date</th><th>Time</th><th>Location / Online</th><th>Participants</th><th>Attendance</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{trainings.map((training) => <tr key={training.id}>
            <td><strong>{training.name}</strong></td><td>{training.trainer}</td><td>{dateLabel(training.date)}</td><td>{training.time}</td><td>{training.location}</td>
            <td><button type="button" className="ld-text-link" onClick={() => setParticipantsTraining(training)}>{training.participantIds.length} participants</button></td>
            <td>{training.status === 'Completed' ? training.participantIds.length : training.status === 'In Progress' ? Math.floor(training.participantIds.length / 2) : 0}/{training.participantIds.length} attended</td>
            <td><StatusBadge status={training.status} /></td>
            <td><div className="ld-row-actions"><Button variant="ghost" size="sm" aria-label={`Edit ${training.name}`} onClick={() => openTrainingForm(training)}>Edit</Button><Button variant="ghost" size="sm" onClick={() => setParticipantsTraining(training)}>View</Button><Button variant="ghost" size="sm" disabled={training.status === 'Completed'} onClick={() => updateTrainingStatus(training, training.status === 'Not Started' ? 'In Progress' : 'Completed')}>{training.status === 'Not Started' ? 'Start' : training.status === 'Completed' ? 'Done' : 'Complete'}</Button><Button variant="ghost" size="sm" aria-label={`Cancel ${training.name}`} disabled={training.status === 'Completed'} onClick={() => { training.participantIds.forEach((employeeId) => addActivity(employeeId, 'Training cancelled', 'Training', training.name, 'Cancelled', training.trainer)); setTrainings((current) => current.filter((item) => item.id !== training.id)); showToast('Training session cancelled', 'info'); }}>Cancel</Button></div></td>
          </tr>)}</tbody>
        </table>{trainings.length === 0 && <EmptyState title="No training scheduled" text="Schedule a training session to get started." />}</div>
        <TableFooter>{trainings.length} training sessions</TableFooter>
      </Panel>
    </>;
  };

  const openEvaluation = (evaluation: Evaluation) => {
    setEvaluationDetail(evaluation);
    setEvaluationForm({
      score: evaluation.score?.toString() ?? '',
      trainerFeedback: evaluation.trainerFeedback,
      employeeFeedback: evaluation.employeeFeedback,
    });
  };

  const renderEvaluations = () => {
    const completed = evaluations.filter((evaluation) => evaluation.status === 'Completed');
    const average = completed.length ? Math.round(completed.reduce((total, evaluation) => total + (evaluation.score ?? 0), 0) / completed.length) : 0;
    return <>
      <div className="ld-stats">
        <StatCard label="Evaluations Pending" value={evaluations.filter((evaluation) => evaluation.status === 'Pending').length} sub="Awaiting review" icon={<Clock3 size={18} />} />
        <StatCard label="Completed" value={completed.length} sub="Reviews submitted" icon={<CheckCircle2 size={18} />} />
        <StatCard label="Average Score" value={`${average}%`} sub="Across completed evaluations" />
        <StatCard label="Employees Improved" value={new Set(gaps.filter((gap) => gap.improved).map((gap) => gap.employeeId)).size} sub="Skill gains validated" icon={<Sparkles size={18} />} />
      </div>
      <Panel title="Learning evaluations" description="Capture learning outcomes and feedback after courses and training.">
        <div className="ld-table-wrap"><table className="ld-table ld-table--evaluations">
          <thead><tr><th>Employee</th><th>Course / Training</th><th>Evaluation</th><th>Score</th><th>Feedback</th><th>Trainer</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>{evaluations.map((evaluation) => {
            const employee = employeeById(evaluation.employeeId);
            const course = courseById(evaluation.courseId);
            if (!employee) return null;
            return <tr key={evaluation.id}>
              <td><EmployeeLink employee={employee} onClick={() => openProfile(employee.id)} /></td><td>{course?.name ?? 'Training'}</td><td><strong>{evaluation.title}</strong></td>
              <td>{evaluation.score === undefined ? '—' : `${evaluation.score}%`}</td><td className="ld-evaluation-feedback">{evaluation.trainerFeedback || 'Awaiting evaluation feedback'}</td><td>{evaluation.trainer}</td><td>{dateLabel(evaluation.date)}</td><td><StatusBadge status={evaluation.status} /></td>
              <td><Button size="sm" variant={evaluation.status === 'Pending' ? 'outline' : 'ghost'} onClick={() => openEvaluation(evaluation)}>{evaluation.status === 'Pending' ? 'Evaluate' : 'View results'}</Button></td>
            </tr>;
          })}</tbody>
        </table>{evaluations.length === 0 && <EmptyState title="No evaluations yet" text="Evaluations will appear here as employees complete learning." />}</div>
        <TableFooter>{evaluations.length} evaluations</TableFooter>
      </Panel>
    </>;
  };

  const renderActivity = () => <>
    <div className="ld-activity-summary"><div><span className="ld-eyebrow">Learning activity</span><strong>{activities.length} <small>events</small></strong></div><p>See the milestones, enrollments, training, and skill improvements across your teams.</p></div>
    <Panel title="Recent activity" description="Filter learning events by employee, activity, department, and date.">
      <div className="ld-filters ld-filters--activity">
        <Select aria-label="Filter activity by employee" value={activityEmployeeFilter} onChange={(event) => setActivityEmployeeFilter(event.target.value)} options={[{ value: 'all', label: 'All employees' }, ...employees.map((employee) => ({ value: employee.id, label: employee.name }))]} />
        <Select aria-label="Filter activity type" value={activityFilter} onChange={(event) => setActivityFilter(event.target.value)} options={[{ value: 'all', label: 'All activity types' }, ...['Learning Plan', 'Enrollment', 'Course', 'Training', 'Evaluation', 'Skill'].map((value) => ({ value, label: value }))]} />
        <Select aria-label="Filter activity department" value={activityDepartmentFilter} onChange={(event) => setActivityDepartmentFilter(event.target.value)} options={[{ value: 'all', label: 'All departments' }, ...[...new Set(employees.map((employee) => employee.department))].map((value) => ({ value, label: value }))]} />
        <Input aria-label="Filter activity date" type="date" value={activityDate} onChange={(event) => setActivityDate(event.target.value)} />
        {(activityEmployeeFilter !== 'all' || activityFilter !== 'all' || activityDepartmentFilter !== 'all' || activityDate) && <Button variant="ghost" size="sm" icon={<X size={14} />} onClick={() => { setActivityEmployeeFilter('all'); setActivityFilter('all'); setActivityDepartmentFilter('all'); setActivityDate(''); }}>Clear filters</Button>}
      </div>
      <div className="ld-timeline">{filteredActivities.map((event) => {
        const employee = employeeById(event.employeeId);
        return <div className="ld-timeline__item" key={event.id}>
          <div className={`ld-timeline__marker ld-timeline__marker--${event.type.toLowerCase().replace(/\s/g, '-')}`}><ActivityIcon type={event.type} /></div>
          <div className="ld-timeline__content">
            <button type="button" className="ld-timeline__employee" onClick={() => openProfile(event.employeeId)}>{employee?.name ?? 'Former employee'} · {employee?.department}</button>
            <div className="ld-timeline__main"><strong>{event.activity}</strong><span>{event.courseName}</span></div>
            <div className="ld-timeline__meta"><span>{timeLabel(event.date)} · {event.by}</span><StatusBadge status={event.status} /></div>
          </div>
        </div>;
      })}{filteredActivities.length === 0 && <EmptyState title="No matching activity" text="Change the filters to view other learning events." />}</div>
    </Panel>
  </>;

  const renderProfile = (employee: Employee) => {
    const employeePlans = plans.filter((plan) => plan.employeeIds.includes(employee.id));
    const employeeCourses = courses.filter((course) => course.enrolledIds.includes(employee.id));
    const completedCourses = employeeCourses.filter((course) => course.completedIds.includes(employee.id));
    const employeeGaps = gaps.filter((gap) => gap.employeeId === employee.id);
    const employeeTraining = trainings.filter((training) => training.participantIds.includes(employee.id) && training.status !== 'Completed');
    const employeeEvaluations = evaluations.filter((evaluation) => evaluation.employeeId === employee.id);
    const employeeActivity = activities.filter((event) => event.employeeId === employee.id).slice(0, 5);
    const progress = employeeProgress(employee.id);
    return <div className="ld-profile">
      <Button variant="ghost" icon={<ArrowLeft size={15} />} onClick={returnToSection}>Back to {sections.find((item) => item.id === profileReturnSection)?.label ?? 'Learning'}</Button>
      <div className="ld-profile__hero">
        <div className="ld-employee"><Avatar name={employee.name} size="xl" color={employee.color} /><div><h2>{employee.name}</h2><p>{employee.role} · {employee.department}</p><span>{employee.email} · Manager: {employee.manager}</span></div></div>
        <div className="ld-profile__progress"><strong>{progress}%</strong><span>Overall learning progress</span><ProgressBar value={progress} /></div>
      </div>
      <div className="ld-profile__facts"><span><b>Department</b>{employee.department}</span><span><b>Role</b>{employee.role}</span><span><b>Learning plans</b>{employeePlans.length}</span><span><b>Course completions</b>{completedCourses.length}/{employeeCourses.length}</span></div>
      <div className="ld-profile__grid">
        <Panel title="Current skills" description="Capabilities and role readiness.">
          <div className="ld-profile__list">{employeeGaps.map((gap) => <div key={gap.id}><span><strong>{gap.skill}</strong><small>Target: {gap.requiredLevel}</small></span><LevelBadge level={gap.currentLevel} /><StatusBadge status={gap.improved ? 'Improved' : 'Gap identified'} /></div>)}
            {employeeGaps.length === 0 && <EmptyState title="No assessed gaps" text="Skill assessment data will show here." />}</div>
        </Panel>
        <Panel title="Assigned courses" description={`${completedCourses.length} completed · ${employeeCourses.length - completedCourses.length} in progress`}>
          <div className="ld-profile__list">{employeeCourses.map((course) => <div key={course.id}><span><strong>{course.name}</strong><small>{course.duration} · {course.instructor}</small></span><StatusBadge status={course.completedIds.includes(employee.id) ? 'Completed' : 'In Progress'} /><Button size="sm" variant={course.completedIds.includes(employee.id) ? 'secondary' : 'outline'} onClick={() => toggleCourseCompletion(course.id, employee.id)}>{course.completedIds.includes(employee.id) ? 'Reopen' : 'Mark complete'}</Button></div>)}
            {employeeCourses.length === 0 && <EmptyState title="No courses assigned" text="Courses assigned to this employee will show here." />}</div>
        </Panel>
        <Panel title="Upcoming training" description="Instructor-led sessions and workshops.">
          <div className="ld-profile__list">{employeeTraining.map((training) => <div key={training.id}><span><strong>{training.name}</strong><small>{dateLabel(training.date)} · {training.time} · {training.location}</small></span><StatusBadge status={training.status} />{training.status !== 'Completed' && <Button size="sm" variant="outline" onClick={() => updateTrainingStatus(training, 'Completed')}>Complete</Button>}</div>)}
            {employeeTraining.length === 0 && <EmptyState title="No training sessions" text="Upcoming training invitations will show here." />}</div>
        </Panel>
        <Panel title="Evaluation results" description="Feedback from learning milestones.">
          <div className="ld-profile__list">{employeeEvaluations.map((evaluation) => <div key={evaluation.id}><span><strong>{evaluation.title}</strong><small>{dateLabel(evaluation.date)} · {evaluation.trainer}</small></span>{evaluation.score !== undefined && <strong>{evaluation.score}%</strong>}<Button size="sm" variant="ghost" onClick={() => openEvaluation(evaluation)}>{evaluation.status === 'Pending' ? 'Evaluate' : 'View'}</Button></div>)}
            {employeeEvaluations.length === 0 && <EmptyState title="No evaluation results" text="Evaluation outcomes will show here." />}</div>
        </Panel>
      </div>
      <Panel title="Learning activity" description="Recent progress and milestones.">
        <div className="ld-profile__list">{employeeActivity.map((event) => <div key={event.id}><span><strong>{event.activity}</strong><small>{event.courseName} · {timeLabel(event.date)} · {event.by}</small></span><StatusBadge status={event.status} /></div>)}
          {employeeActivity.length === 0 && <EmptyState title="No activity yet" text="Learning updates for this employee will appear here." />}</div>
      </Panel>
    </div>;
  };

  const title = sections.find((item) => item.id === section)?.label ?? 'Learning Plans';

  return <div className="page-content ld-page">
    {profileEmployee ? renderProfile(profileEmployee) : <>
      <div className="page-header ld-page__header">
        <div className="page-header__text"><div className="ld-breadcrumb">HR Solutions <span>/</span> Learning &amp; Development</div><h1 className="page-header__title">{title}</h1><p className="page-header__subtitle">Build skills, support career growth, and make learning measurable.</p></div>
        {section === 'learning-plans' && <Button icon={<Plus size={16} />} onClick={() => setPlanModalOpen(true)}>Create Learning Plan</Button>}
        {section === 'courses' && <Button icon={<Plus size={16} />} onClick={() => setCourseModalOpen(true)}>Create Course</Button>}
        {section === 'training' && <Button icon={<Plus size={16} />} onClick={() => openTrainingForm()}>Schedule Training</Button>}
      </div>
      <nav className="ld-section-nav" aria-label="Learning and development sections">{sections.map((item) => <NavLink key={item.id} to={item.id === 'learning-plans' ? '/solutions/hr/learning-development' : `/solutions/hr/learning-development/${item.id}`} end={item.id === 'learning-plans'} className={({ isActive }) => isActive ? 'is-active' : ''}>{item.label}</NavLink>)}</nav>
      <main className="ld-section-content" key={section}>
        {section === 'learning-plans' && renderLearningPlans()}
        {section === 'skill-gaps' && renderSkillGaps()}
        {section === 'courses' && renderCourses()}
        {section === 'training' && renderTraining()}
        {section === 'evaluations' && renderEvaluations()}
        {section === 'activity' && renderActivity()}
      </main>
    </>}

    <Modal open={planModalOpen} onClose={() => setPlanModalOpen(false)} title="Create learning plan" size="lg" footer={<><Button variant="secondary" onClick={() => setPlanModalOpen(false)}>Cancel</Button><Button type="submit" form="ld-plan-form">Create plan</Button></>}>
      <form id="ld-plan-form" className="ld-form-grid" onSubmit={submitPlan}>
        <Input label="Plan Name" placeholder="e.g. Emerging Manager Growth Path" required value={planDraft.name} onChange={(event) => setPlanDraft({ ...planDraft, name: event.target.value })} />
        <Select label="Employee / Team" required value={planDraft.employeeId} onChange={(event) => getPlanFormEmployeeChange(event.target.value)} options={[{ value: '', label: 'Select an employee or team' }, ...employees.map((employee) => ({ value: employee.id, label: employee.name })), { value: 'team', label: 'Entire department team' }]} />
        <Select label="Department" required value={planDraft.department} onChange={(event) => setPlanDraft({ ...planDraft, department: event.target.value })} options={[{ value: '', label: 'Select department' }, ...[...new Set(employees.map((employee) => employee.department))].map((department) => ({ value: department, label: department }))]} />
        <Input label="Skills" placeholder="e.g. Coaching, Feedback (comma separated)" required value={planDraft.skills} onChange={(event) => setPlanDraft({ ...planDraft, skills: event.target.value })} />
        <Input label="Start Date" type="date" required value={planDraft.startDate} onChange={(event) => setPlanDraft({ ...planDraft, startDate: event.target.value })} />
        <Input label="Due Date" type="date" required min={planDraft.startDate} value={planDraft.dueDate} onChange={(event) => setPlanDraft({ ...planDraft, dueDate: event.target.value })} />
        <Select className="ld-form-grid__wide" label="Courses" multiple value={planDraft.courseIds} onChange={(event) => setPlanDraft({ ...planDraft, courseIds: Array.from(event.target.selectedOptions, (option) => option.value) })} hint="Select one or more courses to assign to this learning plan." options={courses.filter((course) => course.status === 'Active').map((course) => ({ value: course.id, label: course.name }))} />
      </form>
    </Modal>

    <Modal open={!!courseDetail} onClose={() => setCourseDetail(null)} title="Course details" size="md" footer={<Button onClick={() => setCourseDetail(null)}>Close</Button>}>
      {courseDetail && <div className="ld-course-detail">
        <span className="ld-course-card__category">{courseDetail.category}</span>
        <h3>{courseDetail.name}</h3>
        <p>{courseDetail.description}</p>
        <div className="ld-course-detail__meta"><span><b>Instructor / Provider</b>{courseDetail.instructor}</span><span><b>Duration</b>{courseDetail.duration}</span><span><b>Difficulty</b>{courseDetail.difficulty}</span><span><b>Enrolled employees</b>{courseDetail.enrolledIds.map((id) => employeeById(id)?.name).filter(Boolean).join(', ') || 'No enrollments yet'}</span></div>
        <div><b>Skills covered</b><SkillTags skills={courseDetail.skills} /></div>
      </div>}
    </Modal>

    <Modal open={courseModalOpen} onClose={() => setCourseModalOpen(false)} title="Create course" size="lg" footer={<><Button variant="secondary" onClick={() => setCourseModalOpen(false)}>Cancel</Button><Button type="submit" form="ld-course-form">Create course</Button></>}>
      <form id="ld-course-form" className="ld-form-grid" onSubmit={submitCourse}>
        <Input className="ld-form-grid__wide" label="Course Name" placeholder="e.g. Effective Stakeholder Communication" required value={courseDraft.name} onChange={(event) => setCourseDraft({ ...courseDraft, name: event.target.value })} />
        <Textarea className="ld-form-grid__wide" label="Description" placeholder="What will employees learn?" required value={courseDraft.description} onChange={(event) => setCourseDraft({ ...courseDraft, description: event.target.value })} />
        <Input label="Category" placeholder="e.g. Leadership" required value={courseDraft.category} onChange={(event) => setCourseDraft({ ...courseDraft, category: event.target.value })} />
        <Input label="Instructor" placeholder="Instructor name" required value={courseDraft.instructor} onChange={(event) => setCourseDraft({ ...courseDraft, instructor: event.target.value })} />
        <Input label="Duration" placeholder="e.g. 2 hours" required value={courseDraft.duration} onChange={(event) => setCourseDraft({ ...courseDraft, duration: event.target.value })} />
        <Select label="Difficulty" value={courseDraft.difficulty} onChange={(event) => setCourseDraft({ ...courseDraft, difficulty: event.target.value as Level })} options={levels.map((level) => ({ value: level, label: level }))} />
        <Input className="ld-form-grid__wide" label="Skills Covered" placeholder="e.g. Communication, Facilitation" required value={courseDraft.skills} onChange={(event) => setCourseDraft({ ...courseDraft, skills: event.target.value })} />
      </form>
    </Modal>

    <Modal open={trainingModalOpen} onClose={() => setTrainingModalOpen(false)} title={trainingAction ? 'Edit training session' : 'Schedule training'} size="lg" footer={<><Button variant="secondary" onClick={() => setTrainingModalOpen(false)}>Cancel</Button><Button type="submit" form="ld-training-form">{trainingAction ? 'Save changes' : 'Schedule session'}</Button></>}>
      <form id="ld-training-form" className="ld-form-grid" onSubmit={submitTraining}>
        <Input className="ld-form-grid__wide" label="Training" placeholder="Session title" required value={trainingDraft.name} onChange={(event) => setTrainingDraft({ ...trainingDraft, name: event.target.value })} />
        <Input label="Trainer" placeholder="Trainer name" required value={trainingDraft.trainer} onChange={(event) => setTrainingDraft({ ...trainingDraft, trainer: event.target.value })} />
        <Input label="Location / Online" placeholder="e.g. Online · Zoom" required value={trainingDraft.location} onChange={(event) => setTrainingDraft({ ...trainingDraft, location: event.target.value })} />
        <Input label="Date" type="date" required value={trainingDraft.date} onChange={(event) => setTrainingDraft({ ...trainingDraft, date: event.target.value })} />
        <Input label="Time" type="time" required value={trainingDraft.time} onChange={(event) => setTrainingDraft({ ...trainingDraft, time: event.target.value })} />
        <Select className="ld-form-grid__wide" label="Participants" multiple value={trainingDraft.participantIds} onChange={(event) => setTrainingDraft({ ...trainingDraft, participantIds: Array.from(event.target.selectedOptions, (option) => option.value) })} options={employees.map((employee) => ({ value: employee.id, label: employee.name }))} />
      </form>
    </Modal>

    <Modal open={!!participantsTraining} onClose={() => setParticipantsTraining(null)} title="Training participants" size="md">
      {participantsTraining && <div className="ld-modal-participants"><h3>{participantsTraining.name}</h3><p>{dateLabel(participantsTraining.date)} · {participantsTraining.time} · {participantsTraining.trainer}</p>{participantsTraining.participantIds.map((employeeId) => {
        const employee = employeeById(employeeId);
        return employee ? <div className="ld-modal-participants__row" key={employeeId}><EmployeeLink employee={employee} onClick={() => { setParticipantsTraining(null); openProfile(employeeId); }} /><button type="button" aria-label={`Open ${employee.name} learning profile`} onClick={() => { setParticipantsTraining(null); openProfile(employeeId); }}><ArrowRight size={15} /></button></div> : null;
      })}</div>}
    </Modal>

    <Modal open={!!evaluationDetail} onClose={() => setEvaluationDetail(null)} title={evaluationDetail?.status === 'Pending' ? 'Complete learning evaluation' : 'Evaluation results'} size="lg" footer={<>{evaluationDetail?.status === 'Pending' && <><Button variant="secondary" onClick={() => setEvaluationDetail(null)}>Cancel</Button><Button type="submit" form="ld-evaluation-form">Submit evaluation</Button></>}</>}>
      {evaluationDetail && <form id="ld-evaluation-form" className="ld-evaluation-detail" onSubmit={submitEvaluation}>
        <div className="ld-evaluation-detail__heading"><div><h3>{evaluationDetail.title}</h3><p>{employeeById(evaluationDetail.employeeId)?.name} · {courseById(evaluationDetail.courseId)?.name}</p></div><StatusBadge status={evaluationDetail.status} /></div>
        <div className="ld-evaluation-detail__columns"><section><h4>Learning objectives</h4><ul>{evaluationDetail.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ul></section><section><h4>Questions / criteria</h4>{evaluationDetail.criteria.map((criterion) => <div className="ld-evaluation-criterion" key={criterion.question}><span>{criterion.question}</span><strong>{criterion.score ? `${criterion.score}/5` : 'Pending'}</strong></div>)}</section></div>
        {evaluationDetail.status === 'Pending' ? <div className="ld-form-grid"><Input label="Score (0–100)" type="number" min="0" max="100" required value={evaluationForm.score} onChange={(event) => setEvaluationForm({ ...evaluationForm, score: event.target.value })} /><div className="ld-form-grid__spacer" /><Textarea className="ld-form-grid__wide" label="Trainer Feedback" required value={evaluationForm.trainerFeedback} onChange={(event) => setEvaluationForm({ ...evaluationForm, trainerFeedback: event.target.value })} /><Textarea className="ld-form-grid__wide" label="Employee Feedback" required value={evaluationForm.employeeFeedback} onChange={(event) => setEvaluationForm({ ...evaluationForm, employeeFeedback: event.target.value })} /></div> : <div className="ld-evaluation-detail__feedback"><div><b>Score</b><strong>{evaluationDetail.score}%</strong></div><div><b>Trainer feedback</b><p>{evaluationDetail.trainerFeedback}</p></div><div><b>Employee feedback</b><p>{evaluationDetail.employeeFeedback}</p></div></div>}
      </form>}
    </Modal>
  </div>;
}

function Panel({ title, description, action, children }: { title: string; description?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <section className="ld-panel"><div className="ld-panel__heading"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</div>{children}</section>;
}

function TableFooter({ children }: { children: React.ReactNode }) {
  return <div className="ld-table-footer">{children}</div>;
}

function EmployeeLink({ employee, onClick }: { employee: Employee; onClick: () => void }) {
  return <button type="button" className="ld-employee-link" onClick={(event) => { event.stopPropagation(); onClick(); }}><Avatar name={employee.name} size="sm" color={employee.color} /><span><strong>{employee.name}</strong><small>{employee.email}</small></span></button>;
}

function SkillTags({ skills }: { skills: string[] }) {
  return <div className="ld-skill-tags">{skills.slice(0, 2).map((skill) => <span key={skill}>{skill}</span>)}{skills.length > 2 && <span>+{skills.length - 2}</span>}</div>;
}

function StatusBadge({ status }: { status: string }) {
  const value = status.toLowerCase();
  const variant = ['completed', 'improved'].includes(value) ? 'success'
    : ['in progress', 'active', 'scheduled'].includes(value) ? 'info'
      : ['overdue', 'not started', 'pending', 'training needed'].includes(value) ? 'warning'
        : ['cancelled', 'critical'].includes(value) ? 'error' : 'neutral';
  return <Badge variant={variant} dot>{status}</Badge>;
}

function LevelBadge({ level }: { level: Level }) {
  return <Badge variant={level === 'Expert' ? 'primary' : level === 'Advanced' ? 'info' : level === 'Intermediate' ? 'warning' : 'neutral'}>{level}</Badge>;
}

function CourseCard({ course, employees, completionRate, onComplete, onProfile, onView }: { course: Course; employees: Employee[]; completionRate: number; onComplete: (courseId: string, employeeId: string) => void; onProfile: (employeeId: string) => void; onView: (course: Course) => void }) {
  const completedEmployees = employees.filter((employee) => course.completedIds.includes(employee.id));
  const enrolledEmployees = employees.filter((employee) => course.enrolledIds.includes(employee.id));
  const [selectedEmployee, setSelectedEmployee] = useState(course.enrolledIds[0] ?? '');
  return <article className="ld-course-card">
    <div className="ld-course-card__top"><div className="ld-course-card__icon"><BookOpen size={19} /></div><StatusBadge status={course.status} /><button type="button" className="ld-icon-button" aria-label={`View ${course.name}`} onClick={() => onView(course)}><Eye size={16} /></button></div>
    <div className="ld-course-card__body"><span className="ld-course-card__category">{course.category}</span><h3>{course.name}</h3><p>{course.description}</p><SkillTags skills={course.skills} /></div>
    <div className="ld-course-card__meta"><span><b>Instructor</b>{course.instructor}</span><span><b>Duration</b>{course.duration}</span><span><b>Difficulty</b>{course.difficulty}</span><span><b>Enrolled</b>{course.enrolledIds.length}</span></div>
    <div className="ld-course-card__completion"><ProgressBar value={completionRate} showPercentage label="Completion rate" /></div>
    <div className="ld-course-card__actions">
      <Select aria-label={`Choose learner for ${course.name}`} value={selectedEmployee} onChange={(event) => setSelectedEmployee(event.target.value)} options={enrolledEmployees.length ? enrolledEmployees.map((employee) => ({ value: employee.id, label: employee.name })) : employees.map((employee) => ({ value: employee.id, label: employee.name }))} />
      <Button size="sm" variant={selectedEmployee && course.completedIds.includes(selectedEmployee) ? 'secondary' : 'outline'} disabled={course.status !== 'Active' || !selectedEmployee} onClick={() => selectedEmployee && onComplete(course.id, selectedEmployee)}>{selectedEmployee && course.completedIds.includes(selectedEmployee) ? 'Reopen' : enrolledEmployees.some((employee) => employee.id === selectedEmployee) ? 'Mark complete' : 'Enroll & complete'}</Button>
    </div>
    <button type="button" className="ld-course-card__view" onClick={() => onView(course)}>View course <ArrowRight size={14} /></button>
    {completedEmployees.length > 0 && <button type="button" className="ld-course-card__completed-link" onClick={() => onProfile(completedEmployees[0].id)}><Check size={13} />{completedEmployees.length} learner{completedEmployees.length === 1 ? '' : 's'} completed</button>}
  </article>;
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="ld-empty"><div><BookOpen size={20} /></div><strong>{title}</strong><span>{text}</span></div>;
}

function ActivityIcon({ type }: { type: string }) {
  if (type === 'Training') return <CalendarDays size={15} />;
  if (type === 'Skill') return <Sparkles size={15} />;
  if (type === 'Evaluation') return <CheckCircle2 size={15} />;
  if (type === 'Learning Plan') return <BookOpen size={15} />;
  return <GraduationCap size={15} />;
}
