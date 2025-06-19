import React, { useState, useEffect, useRef } from "react";
import Sidebar from './Sidebar';
import {
  UserCircle, FileText, Star, Bell, TrendingUp, Calendar, MessageSquare, Clock,
  Target, Award, Users, Eye, CheckCircle, AlertCircle, XCircle, PauseCircle,
  Send, ChevronRight, ShieldAlert, LayoutDashboard, Menu
} from "lucide-react";

// Safe fetch helper
async function safeFetch(url, options) {
  const mergedOptions = { credentials: 'include', ...(options || {}) };
  const res = await fetch(url, mergedOptions);
  const contentType = res.headers.get("content-type");
  if (!res.ok) {
    if (contentType && contentType.includes("application/json")) {
      const j = await res.json();
      throw new Error(j.error || j.message || "API error");
    } else {
      const text = await res.text();
      throw new Error(
        text.startsWith("<!doctype") || text.startsWith("<!DOCTYPE")
          ? "API error: Received HTML instead of JSON. (Check API URL, backend server and proxy/config.)"
          : `API error: ${res.status} ${text}`
      );
    }
  }
  return contentType && contentType.includes("application/json") ? res.json() : res.text();
}

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

const ModernCard = ({ children, className = "", gradient = false, hover = true }) => (
  <div className={`
    ${gradient 
      ? 'bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30' 
      : 'bg-white/80 backdrop-blur-sm'
    }
    border border-white/20 rounded-2xl shadow-lg 
    ${hover ? 'hover:shadow-xl hover:scale-[1.02] transition-all duration-300' : ''}
    ${className}
  `}>
    {children}
  </div>
);

const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue", trend }) => (
  <ModernCard className="p-6 relative overflow-hidden">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl bg-${color}-100`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
          <TrendingUp className="w-4 h-4" />
          +{trend}%
        </div>
      )}
    </div>
    <div className="space-y-1">
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      <p className="text-sm font-medium text-gray-700">{title}</p>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </div>
    <div className={`absolute -bottom-2 -right-2 w-16 h-16 rounded-full bg-${color}-100/20`} />
  </ModernCard>
);

const ApplicationStatusIcon = ({ status }) => {
  const statusConfig = {
    Applied: { icon: Send, color: "blue" },
    "Under Review": { icon: Eye, color: "yellow" },
    Interview: { icon: Users, color: "purple" },
    Offered: { icon: CheckCircle, color: "green" },
    Rejected: { icon: XCircle, color: "red" },
    Withdrawn: { icon: PauseCircle, color: "gray" }
  };
  const config = statusConfig[status] || statusConfig.Applied;
  const Icon = config.icon;
  return <Icon className={`w-4 h-4 text-${config.color}-500`} />;
};

const NotificationPanel = ({ notifications, onClose }) => {
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-14 z-50 w-96 max-w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
    >
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <span className="font-bold text-lg text-gray-900 flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-500" />
          Notifications
        </span>
        <button
          onClick={onClose}
          className="rounded-full hover:bg-gray-100 p-1 transition"
          aria-label="Close"
        >
          <XCircle className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto p-2">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            All caught up!
          </div>
        ) : (
          notifications.map((n, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 hover:bg-blue-50/80 rounded-lg border-b last:border-b-0 border-gray-100"
            >
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">
                  {n.text}
                </p>
                <p className="text-xs text-gray-500 mt-1">{n.date}</p>
                {n.type === "alert" && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs">
                    Internship/Job Alert
                  </span>
                )}
                {n.type === "system" && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs">
                    System Update
                  </span>
                )}
                {n.type === "reminder" && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs">
                    Profile Reminder
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const Dashboard = () => {
  // Sidebar open state for mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState({});
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [opportunities, setOpportunities] = useState({ total: 0, saved: 0 });
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [error, setError] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  const navigate = (path) => {
    window.location.href = path; 
  };

  useEffect(() => {
    setLoading(true);
    setError("");
    safeFetch("/api/dashboard", { credentials: "include" })
      .then((data) => {
        setStudent(data.student || {});
        setProfileCompletion(data.profileCompletion || 0);
        setOpportunities(data.opportunitiesOverview || { total: 0, saved: 0 });
        setApplications(data.applicationsOverview || []);
        setNotifications(
          (data.notificationsList || []).map((n) => {
            if (n.text && /internship|job/i.test(n.text)) return { ...n, type: "alert" };
            if (n.text && /system|update/i.test(n.text)) return { ...n, type: "system" };
            if (n.text && /complete|profile|remind/i.test(n.text)) return { ...n, type: "reminder" };
            return n;
          })
        );
        setFeedbacks(data.recentFeedback || []);
        setInterviews(data.interviewSchedule || []);
      })
      .catch((err) => setError(err.message || "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  const colorMap = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    red: "bg-red-50 text-red-700 border-red-200",
    gray: "bg-gray-50 text-gray-700 border-gray-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // if (error) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
  //       <ModernCard className="p-8 text-center max-w-md">
  //         <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
  //         <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
  //         <p className="text-red-600 mb-4">{error}</p>
  //         <button 
  //           onClick={() => window.location.reload()}
  //           className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
  //         >
  //           Try Again
  //         </button>
  //       </ModernCard>
  //     </div>
  //   );
  // }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar for desktop and mobile */}
      <Sidebar
        user={{
        initials: student?.name?.[0]?.toUpperCase() || '',
        name: student?.name || 'Student',
        role: student?.role || 'Student'
      }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sectionLabel="CAMPUS SERVICES"
      />
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden p-4 bg-white shadow flex items-center">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <span className="ml-4 font-bold">Rojgar Setu</span>
        </div>
        {/* Header ---------------------- */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700" />
          <div 
            className="absolute inset-0 opacity-20" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          />

          <div className="relative px-6 py-12 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold mb-2 text-white">
                    Hey {student?.name || 'there'}! 👋
                  </h1>
                  <p className="text-xl text-blue-100 mb-1">Ready to land your dream job?</p>
                
                </div>
                {/* Notification Bell and Verification Badge/Button */}
                <div className="flex flex-col sm:flex-row gap-4 items-center relative">
                  <button
                    className="relative flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/20 transition-colors border border-white/20"
                    onClick={() => setShowNotifications((n) => !n)}
                    aria-label="Open notifications"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="hidden sm:inline">Notifications</span>
                    {notifications.length > 0 && (
                      <span className="absolute top-1 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                    )}
                  </button>
                  {/* Verification status */}
                  {student.verified ? (
                    <span className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-xl font-semibold border border-green-200">
                      <CheckCircle className="w-5 h-5" />
                      Verified
                    </span>
                  ) : (
                    <button
                      onClick={() => navigate('/profile?tab=verification')}
                      className="flex items-center gap-2 px-6 py-3 bg-yellow-100 text-yellow-700 rounded-xl font-semibold border border-yellow-200 hover:bg-yellow-200 transition-colors"
                    >
                      <ShieldAlert className="w-5 h-5" />
                      Complete Verification
                    </button>
                  )}
                  {showNotifications && (
                    <NotificationPanel
                      notifications={notifications}
                      onClose={() => setShowNotifications(false)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        

        <div className="px-6 lg:px-8 -mt-8 relative z-10">
          <div className="mx-auto max-w-7xl space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                icon={Target}
                title="Profile Strength"
                value={`${profileCompletion}%`}
                subtitle="Complete to get more opportunities"
                color="blue"
              />
              <StatCard
                icon={Eye}
                title="Opportunities"
                value={opportunities.total}
                subtitle="Total Opportunities for you"
                color="green"
              />
              <StatCard
                icon={Award}
                title="Applications"
                value={applications.reduce((sum, app) => sum + app.count, 0)}
                subtitle="Total Applications"
                color="purple"
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Profile Completion & Applications */}
              <div className="lg:col-span-2 space-y-6">
                {/* Profile Completion */}
                {profileCompletion < 100 && (
                  <ModernCard className="p-6" gradient>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">Complete Your Profile</h3>
                        <p className="text-gray-600">Stand out to employers with a complete profile</p>
                      </div>
                      <div className="relative w-16 h-16">
                        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                          <circle className="text-gray-200" cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="3" />
                          <circle
                            className="text-blue-500 transition-all duration-700"
                            cx="18" cy="18" r="14" fill="none"
                            stroke="currentColor" strokeWidth="3"
                            strokeDasharray={`${profileCompletion * 0.88}, 100`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center font-bold text-blue-600">
                          {profileCompletion}%
                        </span>
                      </div>
                    </div>
                    <div className="flex">
                      <button
                        onClick={() => navigate('/profile')}
                        className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow"
                      >
                        <UserCircle className="w-5 h-5" />
                        Complete Profile
                      </button>
                    </div>
                  </ModernCard>
                )}

                {/* Application Status */}
                <ModernCard className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">Application Pipeline</h3>
                      <p className="text-gray-600">Track your job applications</p>
                    </div>
                    <button
                      onClick={() => navigate('/applications')}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View All Applications
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  {applications.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h4 className="font-semibold text-gray-600 mb-2">No applications yet</h4>
                      <p className="text-gray-500 mb-4">Start applying to track your progress here</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {applications.map((app) => (
                        <div
                          key={app.status}
                          className={`p-4 rounded-xl border-2 ${colorMap[app.color] || colorMap.gray} hover:scale-105 transition-transform cursor-pointer`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <ApplicationStatusIcon status={app.status} />
                            <span className="text-2xl font-bold">{app.count}</span>
                          </div>
                          <p className="text-sm font-medium">{app.status}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </ModernCard>
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-6 flex flex-col">
                {/* Upcoming Interviews */}
                <ModernCard className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Upcoming Interviews</h3>
                      <p className="text-sm text-gray-600">Don't miss these!</p>
                    </div>
                  </div>
                  {(!interviews || interviews.length === 0) ? (
                    <div className="text-center py-8">
                      <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No interviews scheduled</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {interviews.slice(0, 3).map((intv) => (
                        <div key={intv.id || intv._id} className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                          <p className="font-semibold text-blue-900">{intv.company}</p>
                          <p className="text-sm text-gray-600 mb-2">{intv.title}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {intv.date} • {intv.time}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ModernCard>

                {/* Recent Feedback (in sidebar, below interviews) */}
                <ModernCard className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Recent Feedback</h3>
                      <p className="text-gray-600">What employers are saying</p>
                    </div>
                  </div>
                  {feedbacks.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No feedback yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {feedbacks.slice(0, 3).map((fb, i) => (
                        <div key={i} className="p-4 bg-green-50/50 rounded-xl border border-green-100">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-gray-900">{fb.company}</p>
                              <p className="text-sm text-gray-600">{fb.title}</p>
                            </div>
                            <StarRating rating={fb.rating} />
                          </div>
                          <p className="text-sm text-gray-700">{fb.comment || fb.feedback}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </ModernCard>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;