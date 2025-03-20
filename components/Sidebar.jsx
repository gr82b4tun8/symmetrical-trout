// components/Sidebar.jsx
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Home,
  PieChart,
  TrendingUp,
  Settings,
  Users,
  DollarSign,
  HelpCircle,
  LogOut,
  Lock
} from 'lucide-react';

const AppSidebar = ({ isOpen, onClose, isCollapsed }) => {
  const router = useRouter();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: TrendingUp, label: 'Log', path: '/log' },
    { 
      icon: PieChart, 
      label: 'Live Trading', 
      path: '/trading',
      disabled: true,
      comingSoon: true
    },
    { icon: DollarSign, label: 'Market Insights', path: '/external-chart' },
    { icon: Users, label: 'Planning', path: '/planning' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const isActive = (path) => {
    return router.pathname === path ? 'bg-[rgba(51,102,255,0.1)] text-[#3366FF]' : 'text-gray-400 hover:text-white';
  };

  const handleDisabledClick = (e, item) => {
    if (item.disabled) {
      e.preventDefault();
    }
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full bg-[#111111] border-r border-[rgba(255,255,255,0.05)] z-20 transform transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          isCollapsed ? 'lg:w-16' : 'lg:w-64'
        } w-64`}
      >
        <div className="p-5 h-full">
          <div className={`${isCollapsed ? 'justify-center' : ''} mb-8 flex items-center`}>
            <Link href="/">
              <div className="flex items-center">
                {/* Method 1: Using regular img tag */}
                <div className="h-10 w-10 flex items-center justify-center">
                  <img 
                    src="/logo2.png" 
                    alt="Soothsayer Logo" 
                    className="h-10 w-10 rounded-full object-cover"
                  />
                </div>
                {!isCollapsed && <span className="ml-3 text-xl font-bold text-white">Soothsayer</span>}
              </div>
            </Link>
          </div>
          
          <nav>
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.label} className="relative group">
                  {item.comingSoon ? (
                    // Coming soon item (not a link)
                    <div 
                      className={`flex items-center ${isCollapsed ? 'justify-center' : ''} px-4 py-3 rounded-md transition-colors text-gray-500 cursor-default`}
                      title={isCollapsed ? `${item.label} - Coming Soon` : ''}
                    >
                      <div className="relative flex items-center justify-center">
                        <Lock className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
                      </div>
                      
                      {!isCollapsed && (
                        <>
                          <span>{item.label}</span>
                          <div className="ml-auto px-2 py-0.5 text-xs rounded-full bg-gray-700 text-white">
                            Soon
                          </div>
                        </>
                      )}
                      
                      {/* Coming soon tooltip - appears on hover */}
                      <div className={`absolute z-20 ${isCollapsed ? 'left-16' : 'top-0 left-0 right-0'} opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200`}>
                        <div className={`${isCollapsed ? 'w-48 -mt-3' : 'w-full mt-12'} bg-[#1E1E24] border border-[rgba(255,255,255,0.1)] rounded-md shadow-xl p-3`}>
                          <div className="flex items-center mb-2">
                            <div className="w-4 h-4 rounded-full bg-gray-700 flex items-center justify-center">
                              <Lock className="h-2 w-2 text-white" />
                            </div>
                            <span className="ml-2 text-sm font-medium text-white">Coming Soon</span>
                          </div>
                          <p className="text-xs text-gray-400">Live trading features will be available soon!</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Regular link item
                    <Link href={item.path}>
                      <div 
                        className={`flex items-center ${isCollapsed ? 'justify-center' : ''} px-4 py-3 rounded-md transition-colors ${isActive(item.path)}`}
                        title={isCollapsed ? item.label : ''}
                      >
                        <item.icon className="h-5 w-5" />
                        {!isCollapsed && (
                          <>
                            <span className="ml-3">{item.label}</span>
                            {item.label === 'Dashboard' && (
                              <div className="ml-auto px-2 py-0.5 text-xs rounded-full bg-[#3366FF] text-white">
                                New
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          
          <div className={`absolute bottom-8 ${isCollapsed ? 'left-0 right-0' : 'left-0 right-0 px-5'}`}>
            <div className={`border-t border-[rgba(255,255,255,0.05)] pt-4 space-y-2 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
              <Link href="/help">
                <div 
                  className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-4'} py-3 rounded-md text-gray-400 hover:text-white transition-colors`}
                  title={isCollapsed ? "Help Center" : ""}
                >
                  <HelpCircle className="h-5 w-5" />
                  {!isCollapsed && <span className="ml-3">Help Center</span>}
                </div>
              </Link>
              <Link href="/logout">
                <div 
                  className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-4'} py-3 rounded-md text-gray-400 hover:text-white transition-colors`}
                  title={isCollapsed ? "Log Out" : ""}
                >
                  <LogOut className="h-5 w-5" />
                  {!isCollapsed && <span className="ml-3">Log Out</span>}
                </div>
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;