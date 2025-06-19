import React, { useEffect } from 'react';
import { 
  User, 
  Briefcase, 
  Calendar, 
  MessageSquare, 
  FileText,  
  X,
  Sparkles,
  LogOut,
  Bot
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Sidebar = ({ 
  isOpen, 
  onClose, 
  user = { initials: '', name: '', role: '' },
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Prevent background scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const onLogout = async () => {
    try {
      await fetch(`${apiUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignore logout errors
    }
    localStorage.removeItem('studentId');
    navigate("/");
  };

  const navigationItems = [
    { icon: FileText, label: 'Dashboard', path: '/dashboard' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Briefcase, label: 'Jobs/Internships', path: '/jobs' },
    { icon: FileText, label: 'Applications', path: '/applications' },
    { icon: Calendar, label: 'Interview Schedule', path: '/interviews' },
    { icon: MessageSquare, label: 'Feedback', path: '/feedback' },
    { icon: Sparkles, label: 'AI Portfolio', path: '/portfolio' },
    { icon: Bot, label: 'Support Chat', path: '/chat' },
  ];

  // Fallbacks for user info, omit initials if not present
  const initials = user?.initials
    ? user.initials
    : user?.name
      ? user.name[0]
      : '';

  const name = user?.name || '';
  const role = user?.role || '';

  return (
    <>
      {/* Backdrop for mobile only */}
      <div
        className={`
          fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300
          ${isOpen ? 'block lg:hidden opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-64 bg-blue-700 text-white z-50 shadow-lg flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
        aria-label="Sidebar"
      >
        {/* Top Section - Header */}
        <div className="flex-shrink-0">
          <div className="px-8 pt-6 pb-4 border-b border-blue-500 flex items-center justify-between">
            <div className="w-full font-bold text-lg tracking-wide whitespace-nowrap overflow-hidden text-ellipsis leading-tight max-w-38">
              Rojgaar Setu
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-blue-200 hover:text-white ml-2 flex-shrink-0"
              aria-label="Close Sidebar"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex flex-col gap-1.5 mb-4 flex-1">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
            const IconComponent = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => {
                  navigate(item.path);
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
                className={`
                  flex items-center gap-3.5 py-3 px-8 text-base mb-0.5 cursor-pointer text-left w-full
                  transition-all duration-200 max-w-55 whitespace-nowrap overflow-hidden text-ellipsis
                  border-l-4 rounded-r-lg
                  ${isActive 
                    ? 'text-white font-bold border-l-white bg-blue-800' 
                    : 'text-blue-200 font-semibold border-l-transparent bg-transparent hover:bg-blue-800'
                  }
                `}
              >
                <IconComponent className="w-5 h-5 flex-shrink-0" />
                <span className="overflow-hidden text-ellipsis whitespace-nowrap max-w-40">{item.label}</span>
              </button>
            );
          })}
        </nav>
        
        {/* Logout button */}
        <div className="flex-shrink-0 border-t border-blue-500">
          <button
            onClick={onLogout}
            className="w-full bg-blue-800 text-white flex items-center gap-3.5 py-3 px-8 text-base font-semibold hover:bg-blue-900 transition-all duration-200"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;