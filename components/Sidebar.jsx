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
  LogOut
} from 'lucide-react';

const AppSidebar = ({ isOpen, onClose, isCollapsed }) => {
  const router = useRouter();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: TrendingUp, label: 'Log', path: '/log' },
    { icon: PieChart, label: 'Trading', path: '/trading' },
    { icon: DollarSign, label: 'Upload Chart', path: '/external-chart' },
    { icon: Users, label: 'Planning', path: '/planning' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const isActive = (path) => {
    return router.pathname === path ? 'bg-[rgba(51,102,255,0.1)] text-[#3366FF]' : 'text-gray-400 hover:text-white';
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
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-r from-[#3366FF] to-[#8A33FF]">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                {!isCollapsed && <span className="ml-3 text-xl font-bold text-white">TradeVision</span>}
              </div>
            </Link>
          </div>
          
          <nav>
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.label}>
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