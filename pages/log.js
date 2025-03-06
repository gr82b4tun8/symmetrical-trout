// pages/log.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO } from 'date-fns';
import { Calendar, TrendingUp, ArrowLeft, ArrowRight, Menu, X, Plus, DollarSign, Activity, Search, Settings, BarChart2 } from 'lucide-react';

// Import our CSS gradient background
import GradientBackground from '../components/GradientBackground';

// Sample trade data (replace with API call or database fetch)
const sampleTradeData = {
  '2025-03-01': { profit: -45.12, trades: 12 },
  '2025-03-02': { profit: 78.94, trades: 15 },
  '2025-03-03': { profit: -21.30, trades: 8 },
  '2025-03-04': { profit: 112.50, trades: 10 },
  '2025-03-05': { profit: 67.25, trades: 9 },
  '2025-03-10': { profit: -33.80, trades: 14 },
  '2025-03-12': { profit: 210.45, trades: 18 },
  '2025-03-15': { profit: 95.20, trades: 7 },
  '2025-03-18': { profit: -56.30, trades: 11 },
  '2025-03-22': { profit: 187.65, trades: 20 },
  '2025-03-25': { profit: -73.40, trades: 15 },
  '2025-03-27': { profit: 142.18, trades: 13 },
};

export default function LogCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tradeData, setTradeData] = useState(sampleTradeData);
  const [monthStats, setMonthStats] = useState({
    totalProfit: 0,
    winningDays: 0,
    losingDays: 0,
    totalTrades: 0,
    winPercentage: 0,
  });
  
  const [timeFilter, setTimeFilter] = useState('month');

  useEffect(() => {
    // Calculate month statistics
    const stats = Object.entries(tradeData)
      .filter(([date]) => {
        const dateObj = parseISO(date);
        return isSameMonth(dateObj, currentDate);
      })
      .reduce((acc, [date, data]) => {
        const winningDays = acc.winningDays + (data.profit > 0 ? 1 : 0);
        const losingDays = acc.losingDays + (data.profit < 0 ? 1 : 0);
        const totalDays = winningDays + losingDays;
        const winPercentage = totalDays > 0 ? (winningDays / totalDays * 100).toFixed(1) : 0;
        
        return {
          totalProfit: acc.totalProfit + data.profit,
          winningDays,
          losingDays,
          totalTrades: acc.totalTrades + data.trades,
          winPercentage,
        };
      }, { totalProfit: 0, winningDays: 0, losingDays: 0, totalTrades: 0, winPercentage: 0 });

    setMonthStats(stats);
  }, [currentDate, tradeData]);

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  };

  const prevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const currentMonth = format(currentDate, 'MMMM yyyy');
  const daysInMonth = getDaysInMonth();
  const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="relative min-h-screen font-sans text-white bg-[#111111]">
      {/* CSS Gradient Background */}
      <GradientBackground />
      
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          :root {
            --font-primary: 'Inter', sans-serif;
            --green-color: #00C853;
            --red-color: #FF3D71;
            --blue-color: #3366FF;
            --card-bg: rgba(26, 26, 31, 0.8);
            --border-color: rgba(255, 255, 255, 0.1);
          }
          body {
            font-family: var(--font-primary);
            background-color: #111111;
          }
          .card {
            background: var(--card-bg);
            border-radius: 12px;
            backdrop-filter: blur(10px);
            border: 1px solid var(--border-color);
          }
          .green-glow {
            animation: greenPulse 2s infinite;
          }
          .red-glow {
            animation: redPulse 2s infinite;
          }
          .btn-primary {
            background-color: var(--blue-color);
            transition: all 0.2s ease;
          }
          .btn-primary:hover {
            background-color: #4d7aff;
            transform: translateY(-1px);
          }
          
          .tab-active {
            background-color: #282834;
            color: white;
          }
          
          .tab {
            transition: all 0.2s ease;
          }
          
          .glow-line {
            height: 3px;
            background: linear-gradient(90deg, #3366FF 0%, #8A33FF 100%);
            border-radius: 3px;
            margin-top: 4px;
          }
          
          .sidebar-item {
            transition: all 0.2s ease;
          }
          
          .sidebar-item:hover {
            background-color: rgba(255, 255, 255, 0.05);
          }
          
          .sidebar-item-active {
            background-color: rgba(51, 102, 255, 0.1);
            border-left: 3px solid var(--blue-color);
          }
          
          .profit-day {
            position: relative;
            overflow: hidden;
          }
          
          .profit-day::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 200, 83, 0.05);
            z-index: -1;
          }
          
          .loss-day {
            position: relative;
            overflow: hidden;
          }
          
          .loss-day::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 61, 113, 0.05);
            z-index: -1;
          }
          
          /* Subtle hover effect on calendar days */
          .calendar-day {
            transition: all 0.2s ease;
          }
          
          .calendar-day:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }
        `}</style>
        <title>Trading Log | ScalpGPT</title>
      </Head>
      
      {/* Mobile sidebar toggle */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed z-50 bottom-4 right-4 bg-[#3366FF] text-white p-3 rounded-full shadow-lg"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full z-40 w-64 bg-[#111111]/90 backdrop-blur-xl border-r border-[rgba(255,255,255,0.1)] transform transition-all duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6">
            <div className="flex items-center mb-8">
              <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
              </div>
              <span className="ml-3 text-xl font-bold text-white">
                ScalpGPT
              </span>
            </div>
            
            <div className="space-y-1">
              <Link href="/trading">
                <div className="sidebar-item px-4 py-3 rounded-md flex items-center">
                  <BarChart2 className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-400">Analyze</span>
                </div>
              </Link>
              
              <div className="sidebar-item sidebar-item-active px-4 py-3 rounded-md flex items-center">
                <DollarSign className="h-5 w-5 text-[#3366FF] mr-3" />
                <span className="text-white font-medium">Payouts</span>
              </div>
              
              <Link href="/planning">
                <div className="sidebar-item px-4 py-3 rounded-md flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-400">Planning</span>
                </div>
              </Link>
            </div>
          </div>
          
          <div className="mt-auto p-6">
            <button className="w-full bg-[#3366FF] text-white rounded-md py-3 flex items-center justify-center">
              <span className="mr-2">New Trade</span>
              <span className="text-lg">+</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="md:ml-64 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-gray-400 mb-1">Hi there, welcome back!</p>
              <h1 className="text-2xl font-bold text-white">Trading Log</h1>
            </div>
            
            <div className="flex items-center mt-4 sm:mt-0">
              <div className="w-8 h-8 rounded-full bg-white p-1.5 flex items-center justify-center">
                <Settings className="h-4 w-4 text-[#111111]" />
              </div>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Profit Card */}
            <div className="card p-6">
              <p className="text-gray-400 text-xs font-medium mb-1">Month P/L</p>
              <div className="flex items-baseline">
                <span className={`text-2xl font-bold ${monthStats.totalProfit >= 0 ? 'text-[#00C853] green-glow' : 'text-[#FF3D71] red-glow'}`}>
                  ${monthStats.totalProfit.toFixed(2)}
                </span>
              </div>
              
              <div className="flex items-center mt-4">
                <div className={`w-8 h-8 rounded-full ${monthStats.totalProfit >= 0 ? 'bg-[rgba(0,200,83,0.1)]' : 'bg-[rgba(255,61,113,0.1)]'} flex items-center justify-center`}>
                  <DollarSign className={`h-4 w-4 ${monthStats.totalProfit >= 0 ? 'text-[#00C853]' : 'text-[#FF3D71]'}`} />
                </div>
                <p className="text-xs text-gray-400 ml-2">
                  {currentMonth}
                </p>
              </div>
            </div>
            
            {/* Total Trades Card */}
            <div className="card p-6">
              <p className="text-gray-400 text-xs font-medium mb-1">Total Trades</p>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-white">
                  {monthStats.totalTrades}
                </span>
              </div>
              
              <div className="flex items-center mt-4">
                <div className="w-8 h-8 rounded-full bg-[rgba(51,102,255,0.1)] flex items-center justify-center">
                  <Activity className="h-4 w-4 text-[#3366FF]" />
                </div>
                <p className="text-xs text-gray-400 ml-2">
                  This month
                </p>
              </div>
            </div>
            
            {/* Win/Loss Card */}
            <div className="card p-6">
              <p className="text-gray-400 text-xs font-medium mb-1">Win/Loss</p>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-white">
                  {monthStats.winningDays}/{monthStats.losingDays}
                </span>
                <span className="ml-2 text-xs text-gray-400">days</span>
              </div>
              
              <div className="mt-4 flex space-x-1">
                <div className="h-1.5 rounded-full bg-[#00C853]" style={{ width: `${monthStats.winningDays / (monthStats.winningDays + monthStats.losingDays) * 100}%` }}></div>
                <div className="h-1.5 rounded-full bg-[#FF3D71]" style={{ width: `${monthStats.losingDays / (monthStats.winningDays + monthStats.losingDays) * 100}%` }}></div>
              </div>
            </div>
            
            {/* Win Rate Card */}
            <div className="card p-6 relative overflow-hidden">
              <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-[#00C853] opacity-10 animate-pulse"></div>
              
              <p className="text-gray-400 text-xs font-medium mb-1">Win Rate</p>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-[#00C853] green-glow">
                  {monthStats.winPercentage}%
                </span>
              </div>
              
              <div className="flex items-center mt-4">
                <div className="w-8 h-8 rounded-full bg-[rgba(0,200,83,0.1)] flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-[#00C853]" />
                </div>
                <p className="text-xs text-gray-400 ml-2">
                  Success rate
                </p>
              </div>
            </div>
          </div>
          
          {/* Calendar Section */}
          <div className="card overflow-hidden mb-8">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-semibold text-white">{currentMonth}</h2>
                  <div className="flex space-x-1">
                    <button 
                      onClick={prevMonth}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[rgba(255,255,255,0.05)]"
                    >
                      <ArrowLeft size={16} className="text-gray-400" />
                    </button>
                    <button 
                      onClick={nextMonth}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[rgba(255,255,255,0.05)]"
                    >
                      <ArrowRight size={16} className="text-gray-400" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 sm:mt-0 flex space-x-2">
                  <div className="flex space-x-2 bg-[rgba(255,255,255,0.05)] rounded-md p-1">
                    <button 
                      className={`text-xs px-3 py-1.5 rounded-md ${timeFilter === 'week' ? 'tab-active' : 'tab text-gray-400'}`}
                      onClick={() => setTimeFilter('week')}
                    >
                      Week
                    </button>
                    <button 
                      className={`text-xs px-3 py-1.5 rounded-md ${timeFilter === 'month' ? 'tab-active' : 'tab text-gray-400'}`}
                      onClick={() => setTimeFilter('month')}
                    >
                      Month
                    </button>
                    <button 
                      className={`text-xs px-3 py-1.5 rounded-md ${timeFilter === 'year' ? 'tab-active' : 'tab text-gray-400'}`}
                      onClick={() => setTimeFilter('year')}
                    >
                      Year
                    </button>
                  </div>
                  
                  <button className="flex items-center bg-[#3366FF] px-3 py-1.5 rounded-md text-white text-xs">
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add Trade
                  </button>
                </div>
              </div>
              
              {/* Days of week header */}
              <div className="grid grid-cols-7 text-center mb-1">
                {dayOfWeek.map((day) => (
                  <div key={day} className="text-xs font-medium text-gray-400 py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-2">
                {daysInMonth.map((date) => {
                  const dateString = format(date, 'yyyy-MM-dd');
                  const dayData = tradeData[dateString];
                  const hasData = !!dayData;
                  const isWinning = hasData && dayData.profit > 0;
                  const isLosing = hasData && dayData.profit < 0;
                  
                  let dayClasses = "calendar-day p-2 rounded-md border border-[rgba(255,255,255,0.05)] min-h-[80px] flex flex-col relative";
                  
                  if (isToday(date)) {
                    dayClasses += " border-[#3366FF]";
                  }
                  
                  if (isWinning) {
                    dayClasses += " profit-day";
                  } else if (isLosing) {
                    dayClasses += " loss-day";
                  }
                  
                  return (
                    <div 
                      key={dateString}
                      className={dayClasses}
                    >
                      <span className={`text-xs font-medium self-end ${isToday(date) ? 'bg-[#3366FF] text-white w-5 h-5 flex items-center justify-center rounded-full' : 'text-gray-400'}`}>
                        {format(date, 'd')}
                      </span>
                      
                      {hasData && (
                        <div className="mt-auto">
                          <div className={`text-sm font-semibold ${isWinning ? 'text-[#00C853] green-glow' : 'text-[#FF3D71] red-glow'}`}>
                            {dayData.profit > 0 ? '+' : ''}{dayData.profit.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {dayData.trades} trades
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Legend Section */}
          <div className="card p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#00C853] mr-2"></div>
                <span className="text-xs text-gray-400">Profit day</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#FF3D71] mr-2"></div>
                <span className="text-xs text-gray-400">Loss day</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full border border-[#3366FF] mr-2"></div>
                <span className="text-xs text-gray-400">Today</span>
              </div>
              
              <div className="ml-auto">
                <button className="text-xs text-[#3366FF]">View Detailed Report</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add global styles for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes greenPulse {
          0% { text-shadow: 0 0 5px rgba(0, 200, 83, 0.5); }
          50% { text-shadow: 0 0 10px rgba(0, 200, 83, 0.8), 0 0 15px rgba(0, 200, 83, 0.5); }
          100% { text-shadow: 0 0 5px rgba(0, 200, 83, 0.5); }
        }
        
        @keyframes redPulse {
          0% { text-shadow: 0 0 5px rgba(255, 61, 113, 0.5); }
          50% { text-shadow: 0 0 10px rgba(255, 61, 113, 0.8), 0 0 15px rgba(255, 61, 113, 0.5); }
          100% { text-shadow: 0 0 5px rgba(255, 61, 113, 0.5); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .animate-pulse {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(0.95);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
          100% {
            transform: scale(0.95);
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}