import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/ui/Layout';
import { ToastProvider } from './components/ui/Toast';
import { AppProvider } from './store/appStore';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';

// ——— Route guard: redirects to /login if not authenticated ———
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return null; // wait for session check
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
};

// Pages
import Home from './pages/Home';
import Hiring from './pages/Hiring';
import CreateHiring from './pages/CreateHiring';
import HiringWorkspace from './pages/HiringWorkspace';
import ScreeningProgress from './pages/ScreeningProgress';
import Candidates from './pages/Candidates';
import CandidateDetail from './pages/CandidateDetail';
import AIRecruiters from './pages/AIRecruiters';
import Interviews from './pages/Interviews';
import Activity from './pages/Activity';
import Settings from './pages/Settings';
import ScreeningReports from './pages/ScreeningReports';
import ScreeningReportHiring from './pages/ScreeningReportHiring';
import CandidateScreeningReport from './pages/CandidateScreeningReport';
import { SolutionDestination } from './pages/SolutionDestination';
import LeadManagementDashboard from './pages/sales/lead/management/LeadManagementDashboard';
import LeadResearch from './pages/sales/lead/management/LeadResearch';
import LeadEnrichment from './pages/sales/lead/management/LeadEnrichment';
import LeadQualification from './pages/sales/lead/management/LeadQualification';
import LeadScoring from './pages/sales/lead/management/LeadScoring';
import LeadAssignment from './pages/sales/lead/management/LeadAssignment';
import SalesActivity from './pages/sales/lead/management/Activity';
import Campaigns from './pages/sales/lead/management/Campaigns';
import LeadQualificationDashboard from './pages/sales/lead/qualification/LeadQualificationDashboard';
import QualificationResearch from './pages/sales/lead/qualification/LeadResearch';
import QualificationCriteria from './pages/sales/lead/qualification/QualificationCriteria';
import QualificationScoring from './pages/sales/lead/qualification/LeadScoring';
import IntentDetection from './pages/sales/lead/qualification/IntentDetection';
import QualificationResults from './pages/sales/lead/qualification/QualificationResults';
import QualificationActivity from './pages/sales/lead/qualification/Activity';
import {
  SalesOutreachActivity,
  SalesOutreachCampaigns,
  SalesOutreachDashboard,
  SalesOutreachFollowUps,
  SalesOutreachLeadResearch,
  SalesOutreachMeetingBooking,
  SalesOutreachPersonalized,
} from './pages/sales/outreach/SalesOutreach';
import MeetingSchedulingDashboard from './pages/sales/meeting/scheduling/MeetingSchedulingDashboard';
import MeetingRequests from './pages/sales/meeting/scheduling/MeetingRequests';
import Availability from './pages/sales/meeting/scheduling/Availability';
import Scheduling from './pages/sales/meeting/scheduling/Scheduling';
import Rescheduling from './pages/sales/meeting/scheduling/Rescheduling';
import MeetingReminders from './pages/sales/meeting/scheduling/Reminders';
import MeetingSchedulingActivity from './pages/sales/meeting/scheduling/Activity';
import OpportunityManagementDashboard from './pages/sales/opportunities/OpportunityManagementDashboard';
import OpportunityTracking from './pages/sales/opportunities/OpportunityTracking';
import DealQualification from './pages/sales/opportunities/DealQualification';
import PipelineManagement from './pages/sales/opportunities/PipelineManagement';
import DealUpdates from './pages/sales/opportunities/DealUpdates';
import OpportunityFollowUps from './pages/sales/opportunities/FollowUps';
import OpportunityActivity from './pages/sales/opportunities/Activity';
import SalesAnalyticsDashboard from './pages/sales/analytics/SalesDashboard';
import PipelineAnalytics from './pages/sales/analytics/PipelineAnalytics';
import ConversionAnalytics from './pages/sales/analytics/ConversionAnalytics';
import RevenueInsights from './pages/sales/analytics/RevenueInsights';
import Forecasting from './pages/sales/analytics/Forecasting';
import ActivityAnalytics from './pages/sales/analytics/Activity';

// Styles
import './styles/global.css';
import './styles/sales-qualification.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <ToastProvider>
            <Routes>
              {/* Public route */}
              <Route path="/login" element={<AuthPage />} />

              {/* All HR / product routes — require authentication */}
              <Route
                path="/*"
                element={<RequireAuth>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/solutions/hr/talent-acquisition" element={<Home />} />
                      <Route path="/hiring/create" element={<CreateHiring />} />
                      <Route path="/hiring/:id/screening" element={<ScreeningProgress />} />
                      <Route path="/hiring" element={<Hiring />} />
                      <Route path="/hiring/:id" element={<HiringWorkspace />} />
                      <Route path="/candidates" element={<Candidates />} />
                      <Route path="/candidates/:id" element={<CandidateDetail />} />
                      <Route path="/recruiters" element={<AIRecruiters />} />
                      <Route path="/interviews" element={<Interviews />} />
                      <Route path="/activity" element={<Activity />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/screening-reports" element={<ScreeningReports />} />
                      <Route path="/screening-reports/:hiringId" element={<ScreeningReportHiring />} />
                      <Route path="/screening-reports/:hiringId/candidate/:candidateId" element={<CandidateScreeningReport />} />
                      <Route path="/solutions/sales/lead-management" element={<LeadManagementDashboard />} />
                      <Route path="/sales/lead-management" element={<LeadManagementDashboard />} />
                      <Route path="/sales/lead-management/lead-research" element={<LeadResearch />} />
                      <Route path="/sales/lead-management/lead-enrichment" element={<LeadEnrichment />} />
                      <Route path="/sales/lead-management/lead-qualification" element={<LeadQualification />} />
                      <Route path="/sales/lead-management/lead-scoring" element={<LeadScoring />} />
                      <Route path="/sales/lead-management/lead-assignment" element={<LeadAssignment />} />
                      <Route path="/sales/lead-management/campaigns" element={<Campaigns />} />
                      <Route path="/sales/lead-management/activity" element={<SalesActivity />} />
                      <Route path="/coming-soon/lead-qualification" element={<LeadQualificationDashboard />} />
                      <Route path="/coming-soon/lead-qualification/lead-research" element={<QualificationResearch />} />
                      <Route path="/coming-soon/lead-qualification/qualification-criteria" element={<QualificationCriteria />} />
                      <Route path="/coming-soon/lead-qualification/lead-scoring" element={<QualificationScoring />} />
                      <Route path="/coming-soon/lead-qualification/intent-detection" element={<IntentDetection />} />
                      <Route path="/coming-soon/lead-qualification/qualification-results" element={<QualificationResults />} />
                      <Route path="/coming-soon/lead-qualification/activity" element={<QualificationActivity />} />
                      <Route path="/coming-soon/sales-outreach" element={<SalesOutreachDashboard />} />
                      <Route path="/coming-soon/sales-outreach/lead-research" element={<SalesOutreachLeadResearch />} />
                      <Route path="/coming-soon/sales-outreach/personalized-outreach" element={<SalesOutreachPersonalized />} />
                      <Route path="/coming-soon/sales-outreach/email-campaigns" element={<SalesOutreachCampaigns />} />
                      <Route path="/coming-soon/sales-outreach/follow-ups" element={<SalesOutreachFollowUps />} />
                      <Route path="/coming-soon/sales-outreach/meeting-booking" element={<SalesOutreachMeetingBooking />} />
                      <Route path="/coming-soon/sales-outreach/activity" element={<SalesOutreachActivity />} />
                      <Route path="/coming-soon/meeting-scheduling" element={<MeetingSchedulingDashboard />} />
                      <Route path="/coming-soon/meeting-scheduling/meeting-requests" element={<MeetingRequests />} />
                      <Route path="/coming-soon/meeting-scheduling/availability" element={<Availability />} />
                      <Route path="/coming-soon/meeting-scheduling/scheduling" element={<Scheduling />} />
                      <Route path="/coming-soon/meeting-scheduling/rescheduling" element={<Rescheduling />} />
                      <Route path="/coming-soon/meeting-scheduling/reminders" element={<MeetingReminders />} />
                      <Route path="/coming-soon/meeting-scheduling/activity" element={<MeetingSchedulingActivity />} />
                      <Route path="/coming-soon/opportunity-management" element={<OpportunityManagementDashboard />} />
                      <Route path="/coming-soon/opportunity-management/opportunity-tracking" element={<OpportunityTracking />} />
                      <Route path="/coming-soon/opportunity-management/deal-qualification" element={<DealQualification />} />
                      <Route path="/coming-soon/opportunity-management/pipeline-management" element={<PipelineManagement />} />
                      <Route path="/coming-soon/opportunity-management/deal-updates" element={<DealUpdates />} />
                      <Route path="/coming-soon/opportunity-management/follow-ups" element={<OpportunityFollowUps />} />
                      <Route path="/coming-soon/opportunity-management/activity" element={<OpportunityActivity />} />
                      <Route path="/coming-soon/sales-analytics/sales-dashboard" element={<SalesAnalyticsDashboard />} />
                      <Route path="/coming-soon/sales-analytics/pipeline-analytics" element={<PipelineAnalytics />} />
                      <Route path="/coming-soon/sales-analytics/conversion-analytics" element={<ConversionAnalytics />} />
                      <Route path="/coming-soon/sales-analytics/revenue-insights" element={<RevenueInsights />} />
                      <Route path="/coming-soon/sales-analytics/forecasting" element={<Forecasting />} />
                      <Route path="/coming-soon/sales-analytics/activity" element={<ActivityAnalytics />} />
                      <Route path="/solutions/:group/:solution" element={<SolutionDestination />} />
                      <Route path="/coming-soon/:context/:item" element={<SolutionDestination />} />
                    </Routes>
                  </Layout>
                </RequireAuth>}
              />
            </Routes>
          </ToastProvider>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
