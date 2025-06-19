import React from 'react';
import { Menu } from 'lucide-react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Import all page components
import Sidebar from './components/Student/Sidebar';
import Dashboard from './components/Student/Dashboard';
import Profile from './components/Student/Profile';
import Jobs from './components/Student/Jobs';
import Applications from './components/Student/Applications';
import Interviews from './components/Student/Interviews';
import FeedbackCenter from './components/Student/Feedback';
import AIPortfolioSection from './components/Student/AIProfilePortfolio';
import Chatbot from './components/Student/chatbot';
import { AuthPage } from './components/Student/AuthPage';
import Support from "./pages/Support";
import PlacementAnalysis from "./pages/PlacementAnalysis";
import EKysDashboard from "./pages/EKysDashboard";
import Sales from "./pages/Sales";
import NotFound from "./pages/NotFound";
import Signup from "../src/(auth)/signup"; 
import SignIn from "../src/(auth)/signin"; 

import DashboardCompany from './company_components/CompanyDashboard';
import CollegeDashboard from './college_components/CollegeDashboard';
import PostJobForm from './company_components/PostJobForm';
import ScheduledInterviews from './company_components/ScheduledInterviews';
import StudentProfile from './company_components/StudentProfile';
import ViewApplications from './company_components/ViewApplications';
import Analytics from './company_components/Analytics';
import CollegeProfile from './college_components/CollegeProfile';
import ViewJobs from './college_components/ViewJobs';
import ScheduledApplications from './college_components/ScheduledApplications';
import Login from './Login';
import CollegeLogin from './college_components/CollegeLogin';
import StudentLogin from './student_components/StudentLogin';
import CompanyLogin from './company_components/CompanyLogin';
import SalesLogin from './sales_components/SalesLogin';
import AddStudents from './college_components/AddStudents';
import ManageEmployees from './company_components/ManageEmployees';

import CollegeSupport from './college_components/Support';
import CollegePlacementAnalysis from './college_components/PlacementAnalysis';
import CompanySupport from './company_components/Support';
import CompanyPlacementAnalysis from './company_components/PlacementAnalysis';


// Landing page component
import Index_Website from "./pages/Index_Website";
import Contact from "./pages/Contact";

// Layout for authenticated pages
const AppLayout = ({ user, onLogout, sidebarOpen, toggleSidebar }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={toggleSidebar}
        user={user}
        onLogout={onLogout}
        sectionLabel="CAMPUS SERVICES"
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top Header for Mobile */}
        <div className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="text-gray-600 hover:text-gray-900"
            >
              <Menu size={24} />
            </button>
            <h1 className="ml-4 text-lg font-semibold">Rojgar Setu</h1>
          </div>
          <div className="flex items-center space-x-2">
            {user && (
              <span className="text-sm text-gray-600">
                {user.name || user.email}
              </span>
            )}
            <button
              onClick={onLogout}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Page Content rendered by <Outlet /> */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Route for protected pages
// const ProtectedRoute = ({ isAuthenticated, children }) => {
//   // if (loading) {
//   //   return <div>Loading...</div>;
//   // }
//   if (!isAuthenticated) {
//     return <Navigate to="/website" replace />;
//   }
//   return children;
// };


// Route for auth pages (login/signup) when not authenticated
// const AuthRoute = ({ isAuthenticated, children }) => {
//   if (isAuthenticated) {
//     return <Navigate to="/" replace />;
//   }
//   return children;
// };

const App = () => {
  //  const [sidebarOpen, setSidebarOpen] = useState(false);
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  // const [user, setUser] = useState(null);
  // const [loading, setLoading] = useState(true);

  // Check authentication status on app load (cookie/session-based)
  // useEffect(() => {
  //   const checkAuthStatus = async () => {
  //     try {
  //       // Make a request to a backend route that requires authentication
  //       const res = await fetch('https://campusadmin.onrender.com/api/dashboard', {
  //         credentials: 'include',
  //       });
  //       if (res.ok) {
  //         // Authenticated, optionally extract user info from response
  //         const data = await res.json();
  //         // setIsAuthenticated(true);
  //         setUser(data.student || {});
  //       } else {
  //         // setIsAuthenticated(false);
  //         setUser(null);
  //       }
  //     } catch {
  //       // setIsAuthenticated(false);
  //       setUser(null);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   checkAuthStatus();
  // }, []);

  // const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  // Handle successful login/signup
  // const handleAuthSuccess = (userData) => {
  //   if (userData?.studentId) localStorage.setItem('studentId', userData.studentId);
  //   setIsAuthenticated(true);
  //   setUser(userData.user || userData);
  // };

  // Handle logout
  // const handleLogout = async () => {
  //   try {
  //     await fetch('https://campusadmin.onrender.com/api/auth/logout', {
  //       method: 'POST',
  //       credentials: 'include',
  //     });
  //   } catch {
  //     // Ignore logout errors
  //   }
  //   localStorage.removeItem('studentId');
  //   setIsAuthenticated(false);
  //   setUser(null);
  // };

  // Show loading spinner while checking auth status
  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen bg-gray-100">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
  //         <p className="mt-4 text-gray-600">Loading...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // Only ONE Router in main.jsx/index.jsx! Not here.

  return (
    <Routes>
      {/* Auth page (handles both login & signup) */}
       {/* <Route
        path="/website"
        element={
          <AuthRoute isAuthenticated={isAuthenticated}>
            <AuthPage onAuthSuccess={handleAuthSuccess} />
          </AuthRoute>
        }
      /> */}

      {/* Protected routes */}
      <Route
        // path="/"
        // element={
        //   <ProtectedRoute isAuthenticated={isAuthenticated}>
        //     <AppLayout
        //       user={user}
        //       onLogout={handleLogout}
        //       sidebarOpen={sidebarOpen}
        //       toggleSidebar={toggleSidebar}
        //     />
        //   </ProtectedRoute>
        // }
      >
        {/* <Route index element={<Dashboard user={user} />} /> */}
        <Route path="/*" element={<Index_Website />} />
        <Route path="/login_panel" element={<Login />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="applications" element={<Applications />} />
        <Route path="interviews" element={<Interviews />} />
        <Route path="feedback" element={<FeedbackCenter />} />
        <Route path="portfolio" element={<AIPortfolioSection />} />
        <Route path="chat" element={<Chatbot />} />

        {/* Sales and Support pages */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/support" element={<Support />} />
        <Route path="/placement-analysis" element={<PlacementAnalysis />} />
        <Route path="/kyc-dashboard" element={<EKysDashboard />} />
        <Route path="/sales" element={<Sales />} />

        {/* College and Compay */}
        <Route path="/student-login" element={<AuthPage />} /> {/* Updated to use AuthPage */}
        <Route path="/college-login" element={<CollegeLogin />} />
        <Route path="/company-login" element={<CompanyLogin />} />
        <Route path="/sales-login" element={<SalesLogin />} />

        {/* Company Dashboard Routes */}
        <Route path="/company/:companyId/dashboard" element={<DashboardCompany />} />
        <Route path="/company/:companyId/post-job" element={<PostJobForm />} />
        <Route path="/company/:companyId/scheduled-interviews" element={<ScheduledInterviews />} />
        <Route path="/company/:companyId/applications" element={<ViewApplications />} />
        <Route path="/company/:companyId/support" element={<CompanySupport />} />
        <Route path="/company/:companyId/placement-analysis" element={<CompanyPlacementAnalysis />} />
        <Route path="/company/:companyId/employees" element={<ManageEmployees />} />

        {/* College Dashboard Routes */}
        <Route path="/college/:collegeId/dashboard" element={<CollegeDashboard />} />
        <Route path="/college/:collegeId/view-jobs" element={<ViewJobs />} />
        <Route path="/college/:collegeId/scheduled-applications" element={<ScheduledApplications />} />
        <Route path="/college/:collegeId/add-students" element={<AddStudents />} />
        <Route path="/college/:collegeId/analytics" element={<Analytics />} />
        <Route path="/college/:collegeId/support" element={<CollegeSupport />} />
        <Route path="/college/:collegeId/placement-analysis" element={<CollegePlacementAnalysis />} />

        {/* Profile Routes */}
        <Route path="/student/:studentId" element={<StudentProfile />} />
        <Route path="/college/:collegeId/student/:studentId" element={<CollegeProfile />} />


        {/* Landing website */}
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* Catch all: redirect to dashboard or auth */}
      {/* <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/auth"} replace />} /> */}
    </Routes>
  );
};

export default App;
