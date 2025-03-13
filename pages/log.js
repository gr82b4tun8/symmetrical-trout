// pages/log.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO } from 'date-fns';
import { 
  Calendar, TrendingUp, ArrowLeft, ArrowRight, Menu, X, Plus, 
  DollarSign, Activity, Search, Settings, BarChart2 
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

// Import the Layout component
import Layout from '../components/Layout';
// Import GradientBackground component
import GradientBackground from '../components/GradientBackground';

export default function LogCalendar() {
  // Function to update portfolio value in database
  const updatePortfolioValue = async (newValue) => {
    try {
      const { error } = await supabase
        .from('trading_goals')
        .update({ starting_portfolio_size: newValue })
        .eq('user_id', userId);
      
      if (error) throw error;
      setPortfolioValue(newValue);
    } catch (error) {
      console.error('Error updating portfolio value:', error);
    }
  };
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tradeData, setTradeData] = useState({});
  const [monthStats, setMonthStats] = useState({
    totalProfit: 0,
    winningDays: 0,
    losingDays: 0,
    totalTrades: 0,
    winPercentage: 0,
  });
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [portfolioValue, setPortfolioValue] = useState(0);

  // Trade form state
  const [tradeForm, setTradeForm] = useState({
    symbol: '',
    time: '',
    entryPrice: '',
    exitPrice: '',
    contracts: '',
    fees: ''
  });
  
  const [timeFilter, setTimeFilter] = useState('month');

  // Fetch user and trade data
  useEffect(() => {
    const fetchUserAndTrades = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        if (user) {
          setUserId(user.id);
          
          // Fetch user's trading goals to get portfolio value
          const { data: goalsData, error: goalsError } = await supabase
            .from('trading_goals')
            .select('starting_portfolio_size')
            .eq('user_id', user.id)
            .single();
          
          if (goalsError && goalsError.code !== 'PGRST116') {
            // PGRST116 is "no rows returned" error, which we handle
            throw goalsError;
          }
          
          if (goalsData) {
            setPortfolioValue(goalsData.starting_portfolio_size || 0);
          }
          
          // Fetch trades for the current month
          await fetchTrades(user.id);
        }
      } catch (error) {
        console.error('Error fetching user or trades:', error);
      }
    };

    fetchUserAndTrades();
  }, [currentDate]);

  // Fetch trades for the current month
  const fetchTrades = async (userId) => {
    try {
      const startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');

      // Fetch trades from Supabase
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) throw error;

      // Transform data for the calendar
      const tradesData = {};
      data.forEach(trade => {
        if (!tradesData[trade.date]) {
          tradesData[trade.date] = { profit: 0, trades: 0 };
        }
        tradesData[trade.date].profit += parseFloat(trade.profit);
        tradesData[trade.date].trades += 1;
      });

      setTradeData(tradesData);
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  };

  // Update month statistics when trade data changes
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

  // Handle date selection in calendar
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
    setTradeForm({
      symbol: '',
      time: '',
      entryPrice: '',
      exitPrice: '',
      contracts: '',
      fees: ''
    });
  };

  // Handle trade form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTradeForm({
      ...tradeForm,
      [name]: value
    });
  };

  // Calculate profit - UPDATED FOR OPTIONS CONTRACTS (multiply by 100)
  const calculateProfit = () => {
    const entryPrice = parseFloat(tradeForm.entryPrice) || 0;
    const exitPrice = parseFloat(tradeForm.exitPrice) || 0;
    const contracts = parseInt(tradeForm.contracts) || 0;
    const fees = parseFloat(tradeForm.fees) || 0;
    
    // Calculate profit: (exit - entry) * contracts * 100 - fees
    // Multiplying by 100 since 1 options contract represents 100 shares
    return ((exitPrice - entryPrice) * contracts * 100) - fees;
  };

  // Save trade to Supabase
  const saveTrade = async (e) => {
    e.preventDefault();
    if (!userId || !selectedDate) return;

    try {
      setLoading(true);
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const profit = calculateProfit();

      // Insert trade to Supabase
      const { data, error } = await supabase
        .from('trades')
        .insert([
          {
            user_id: userId,
            date: dateString,
            symbol: tradeForm.symbol.toUpperCase(),
            time: tradeForm.time,
            entry_price: parseFloat(tradeForm.entryPrice),
            exit_price: parseFloat(tradeForm.exitPrice),
            contracts: parseInt(tradeForm.contracts),
            fees: parseFloat(tradeForm.fees),
            profit: profit
          }
        ]);

      if (error) throw error;

      // Update portfolio value
      const newPortfolioValue = portfolioValue + profit;
      
      // Update portfolio value in trading_goals table
      const { error: updateError } = await supabase
        .from('trading_goals')
        .update({ starting_portfolio_size: newPortfolioValue })
        .eq('user_id', userId);
      
      if (updateError) throw updateError;
      
      setPortfolioValue(newPortfolioValue);

      // Refresh trades data
      await fetchTrades(userId);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving trade:', error);
    } finally {
      setLoading(false);
    }
  };

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
    <Layout>
      {/* Add Gradient Background */}
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
            color: white;
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
            cursor: pointer;
          }
          
          .calendar-day:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }
          
          /* Modal backdrop */
          .modal-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(4px);
            z-index: 100;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          /* Modal animations */
          .modal-enter {
            animation: modalEnter 0.3s forwards;
          }
          
          @keyframes modalEnter {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          /* Form input styles */
          .form-input {
            background-color: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            padding: 10px 14px;
            font-size: 14px;
            color: white;
            transition: all 0.2s ease;
            width: 100%;
          }
          
          .form-input:focus {
            outline: none;
            border-color: var(--blue-color);
            box-shadow: 0 0 0 2px rgba(51, 102, 255, 0.2);
          }
          
          .form-label {
            font-size: 12px;
            font-weight: 500;
            color: #999;
            margin-bottom: 6px;
            display: block;
          }
        `}</style>
        <title>Trading Log | ScalpGPT</title>
      </Head>
      
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-gray-400 mb-1">Hi there, welcome back!</p>
            <h1 className="text-2xl font-bold text-white">Trading Log</h1>
          </div>
          
          <div className="flex items-center mt-4 sm:mt-0">
            <Link href="/my-profile">
              <div className="w-8 h-8 rounded-full bg-white p-1.5 flex items-center justify-center">
                <Settings className="h-4 w-4 text-[#111111]" />
              </div>
            </Link>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Portfolio Value Card */}
          <div className="card p-6">
            <p className="text-gray-400 text-xs font-medium mb-1">Portfolio Value</p>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-white">
                ${portfolioValue.toFixed(2)}
              </span>
            </div>
            
            <div className="flex items-center mt-4">
              <div className="w-8 h-8 rounded-full bg-[rgba(51,102,255,0.1)] flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-[#3366FF]" />
              </div>
              <p className="text-xs text-gray-400 ml-2">
                Current balance
              </p>
            </div>
          </div>
          
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
              {(monthStats.winningDays > 0 || monthStats.losingDays > 0) && (
                <>
                  <div className="h-1.5 rounded-full bg-[#00C853]" style={{ width: `${monthStats.winningDays / (monthStats.winningDays + monthStats.losingDays) * 100}%` }}></div>
                  <div className="h-1.5 rounded-full bg-[#FF3D71]" style={{ width: `${monthStats.losingDays / (monthStats.winningDays + monthStats.losingDays) * 100}%` }}></div>
                </>
              )}
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
                
                <button 
                  onClick={() => {
                    setSelectedDate(new Date());
                    setIsModalOpen(true);
                  }}
                  className="flex items-center bg-[#3366FF] px-3 py-1.5 rounded-md text-white text-xs"
                >
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
                    onClick={() => handleDateSelect(date)}
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
      
      {/* Trade Entry Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div 
            className="card p-6 w-full max-w-md mx-4 modal-enter"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">
                {selectedDate ? `Add Trade - ${format(selectedDate, 'MMMM d, yyyy')}` : 'Add Trade'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[rgba(255,255,255,0.05)]"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>
            
            <form onSubmit={saveTrade}>
              <div className="space-y-4">
                <div>
                  <label className="form-label" htmlFor="symbol">Symbol</label>
                  <input
                    id="symbol"
                    name="symbol"
                    type="text"
                    className="form-input"
                    placeholder="AAPL"
                    value={tradeForm.symbol}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label" htmlFor="time">Time</label>
                  <input
                    id="time"
                    name="time"
                    type="time"
                    className="form-input"
                    value={tradeForm.time}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label" htmlFor="fees">Fees</label>
                    <input
                      id="fees"
                      name="fees"
                      type="number"
                      step="0.01"
                      className="form-input"
                      placeholder="0.00"
                      value={tradeForm.fees}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-400">Profit/Loss</span>
                    <span className={`text-lg font-bold ${calculateProfit() >= 0 ? 'text-[#00C853]' : 'text-[#FF3D71]'}`}>
                      {calculateProfit() >= 0 ? '+' : ''}${calculateProfit().toFixed(2)}
                    </span>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#3366FF] text-white rounded-md font-medium hover:bg-[#4d7aff] transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Trade'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      
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
    </Layout>
  )}