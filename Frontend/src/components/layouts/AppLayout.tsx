
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Ticket, 
  TrendingUp, 
  Shield,
  Briefcase,
  Search, 
  Bell, 
  User,
  LogOut
} from "lucide-react";
import { Input } from "../../components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([
    { id: 1, message: "KYC verification completed", time: "2 hours ago", unread: true },
    { id: 2, message: "Document uploaded successfully", time: "1 day ago", unread: true },
    { id: 3, message: "Verification ticket approved", time: "3 days ago", unread: false }
  ]);
  
  const isActive = (path: string) => {
    return location.pathname === path ? "bg-blue-800" : "";
  };

  const handleLogout = () => {
    // In a real app, you would clear tokens, session data, etc.
    toast.success("Logged out successfully");
    navigate("/support"); // Redirect to support page or login page
  };

  const markNotificationAsRead = (notificationId: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, unread: false }
          : notification
      )
    );
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-campus-blue text-white" style={{ backgroundColor: "#1e40af" }}>
        <div className="p-4 font-bold text-xl">
          <Link to="/support" className="flex items-center">
          ROJGAR SETU
          </Link>
        </div>
        
        <div className="mt-6 px-4 text-sm text-gray-300 font-semibold">
          CAMPUS SERVICES
        </div>
        
        <nav className="mt-2">
          <Link 
            to="/support" 
            className={`flex items-center px-4 py-3 text-white hover:bg-blue-800 ${isActive("/support")}`}
          >
            <Ticket className="h-5 w-5 mr-3" />
            Support
          </Link>
          
          <Link 
            to="/placement-analysis" 
            className={`flex items-center px-4 py-3 text-white hover:bg-blue-800 ${isActive("/placement-analysis")}`}
          >
            <TrendingUp className="h-5 w-5 mr-3" />
            Placement Analysis
          </Link>

          <Link 
            to="/kyc-dashboard" 
            className={`flex items-center px-4 py-3 text-white hover:bg-blue-800 ${isActive("/kyc-dashboard")}`}
          >
            <Shield className="h-5 w-5 mr-3" />
            KYC Dashboard
          </Link>

          <Link 
            to="/sales" 
            className={`flex items-center px-4 py-3 text-white hover:bg-blue-800 ${isActive("/sales")}`}
          >
            <Briefcase className="h-5 w-5 mr-3" />
            Sales & Jobs
          </Link>
        </nav>
        
        <div className="absolute bottom-0 w-64 p-4 bg-campus-blue border-t border-blue-800">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-white text-campus-blue flex items-center justify-center mr-3"  style={{ color: "#1e40af" }}>
              <span className="font-semibold">AJ</span>
            </div>
            <div>
              <div className="text-sm font-semibold">Alex Johnson</div>
              <div className="text-xs text-gray-300">Student</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b p-4 flex items-center justify-between">
          <div className="w-1/3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search..." 
                className="pl-10 bg-gray-50 border-gray-200"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Notification Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-full hover:bg-gray-100 relative">
                  <Bell className="h-5 w-5 text-gray-500" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.map((notification) => (
                  <DropdownMenuItem 
                    key={notification.id} 
                    className="flex flex-col items-start p-3 cursor-pointer"
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-sm ${notification.unread ? 'font-semibold' : ''}`}>
                        {notification.message}
                      </span>
                      {notification.unread && (
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 mt-1">{notification.time}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <User className="h-5 w-5 text-gray-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Alex Johnson</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        {/* Content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
