import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/ui/Layout';
import { ToastProvider } from './components/ui/Toast';
import { AppProvider } from './store/appStore';

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

// Styles
import './styles/global.css';
import './styles/sales-qualification.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <ToastProvider>
          <Routes>
            <Route
              path="/*"
              element={
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
                    <Route path="/solutions/:group/:solution" element={<SolutionDestination />} />
                    <Route path="/coming-soon/:context/:item" element={<SolutionDestination />} />
                  </Routes>
                </Layout>
              }
            />
          </Routes>
        </ToastProvider>
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;
