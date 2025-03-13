// components/Layout.jsx
import AppSidebar from './Sidebar';
import { Menu, X, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <AppSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        isCollapsed={sidebarCollapsed}
      />
      
      {/* Sidebar collapse toggle button (visible only on desktop) */}
      <div className="hidden lg:flex fixed left-0 ml-5 z-30" style={{ 
        top: '50%', 
        transform: 'translateY(-50%)',
        left: sidebarCollapsed ? '3.5rem' : '15rem'
      }}>
        <button 
          onClick={toggleSidebar}
          className="bg-[#1A1A1F] border border-[rgba(255,255,255,0.1)] rounded-full p-1 text-gray-400 hover:text-white transition-colors shadow-lg"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {/* Mobile Header */}
        <div className="lg:hidden py-4 px-6 border-b border-[rgba(255,255,255,0.05)] flex items-center z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="ml-4 flex items-center">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-r from-[#3366FF] to-[#8A33FF]">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <span className="ml-2 text-lg font-semibold text-white">TradeVision</span>
          </div>
        </div>
        
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto py-8 px-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;