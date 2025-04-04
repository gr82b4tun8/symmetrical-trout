// pages/log.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Script from 'next/script'; // Added Script import
import Link from 'next/link';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO } from 'date-fns';
import { Calendar, TrendingUp, ArrowLeft, ArrowRight, Menu, X, Plus, DollarSign, Activity, Search, Settings, BarChart2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';
import GradientBackground from '../components/GradientBackground';

export default function LogCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tradeData, setTradeData] = useState({});
  const [monthStats, setMonthStats] = useState({
    totalProfit: 0,
    winningDays: 0,
    losingDays: 0,
    totalTrades: 0,
    winPercentage: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [dayTrades, setDayTrades] = useState([]);
  const [viewingTrades, setViewingTrades] = useState(false);
  const [tradeForm, setTradeForm] = useState({
    symbol: '',
    time: '',
    entryPrice: '',
    exitPrice: '',
    contracts: '',
    shares: '',
    fees: '',
    notes: ''
  });
  const [tradeType, setTradeType] = useState('options');

  useEffect(() => {
    const fetchUserAndTrades = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (user) {
          setUserId(user.id);
          const { data: goalsData, error: goalsError } = await supabase
            .from('trading_goals')
            .select('starting_portfolio_size')
            .eq('user_id', user.id)
            .single();
          
          if (goalsError && goalsError.code !== 'PGRST116') throw goalsError;
          if (goalsData) setPortfolioValue(goalsData.starting_portfolio_size || 0);
          await fetchTrades(user.id);
        }
      } catch (error) {
        console.error('Error fetching user or trades:', error);
      }
    };
    fetchUserAndTrades();
  }, [currentDate]);

  const fetchTrades = async (userId) => {
    try {
      const startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) throw error;
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

  useEffect(() => {
    const stats = Object.entries(tradeData)
      .filter(([date]) => isSameMonth(parseISO(date), currentDate))
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

  const resetTradeForm = () => {
    setTradeForm({
      symbol: '',
      time: '',
      entryPrice: '',
      exitPrice: '',
      contracts: '',
      shares: '',
      fees: '',
      notes: ''
    });
    setTradeType('options');
  };

  const handleDateSelect = async (date) => {
    if (!date) return;
    setSelectedDate(date);
    try {
      const dateString = format(date, 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', userId)
        .eq('date', dateString)
        .order('time', { ascending: true });
      
      if (error) throw error;
      if (data && data.length > 0) {
        setDayTrades(data);
        setViewingTrades(true);
      } else {
        resetTradeForm();
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching day trades:', error);
    }
  };

  const handleAddTrade = () => {
    resetTradeForm();
    setViewingTrades(false);
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTradeForm({ ...tradeForm, [name]: value });
  };

  const calculateProfit = () => {
    const entryPrice = parseFloat(tradeForm.entryPrice) || 0;
    const exitPrice = parseFloat(tradeForm.exitPrice) || 0;
    const fees = parseFloat(tradeForm.fees) || 0;
    if (tradeType === 'options') {
      const contracts = parseInt(tradeForm.contracts) || 0;
      return ((exitPrice - entryPrice) * contracts * 100) - fees;
    } else {
      const shares = parseInt(tradeForm.shares) || 0;
      return ((exitPrice - entryPrice) * shares) - fees;
    }
  };

  const saveTrade = async (e) => {
    e.preventDefault();
    
    if (!userId) {
      alert('Please log in to save trades');
      return;
    }
    
    if (!tradeForm.entryPrice || !tradeForm.exitPrice) {
      alert('Please enter both entry and exit prices');
      return;
    }

    try {
      setLoading(true);
      const dateString = format(selectedDate || new Date(), 'yyyy-MM-dd');
      const symbol = (tradeForm.symbol || 'UNKNOWN').toUpperCase();
      const entryPrice = parseFloat(tradeForm.entryPrice) || 0;
      const exitPrice = parseFloat(tradeForm.exitPrice) || 0;
      const fees = parseFloat(tradeForm.fees) || 0;
      
      let quantity = 1;
      let profit;
      if (tradeType === 'options') {
        quantity = parseInt(tradeForm.contracts) || 1;
        profit = ((exitPrice - entryPrice) * quantity * 100) - fees;
      } else {
        quantity = parseInt(tradeForm.shares) || 1;
        profit = ((exitPrice - entryPrice) * quantity) - fees;
      }
      
      const trade = {
        user_id: userId,
        date: dateString,
        symbol: symbol,
        time: tradeForm.time || '12:00',
        entry_price: entryPrice,
        exit_price: exitPrice,
        fees: fees,
        profit: profit,
        notes: tradeForm.notes || ''
      };
      
      if (tradeType === 'options') {
        trade.contracts = quantity;
      } else {
        trade.shares = quantity;
      }
      
      const { error } = await supabase
        .from('trades')
        .insert([trade]);
      
      if (error) {
        alert(`Error saving trade: ${error.message}`);
        return;
      }
      
      const newPortfolioValue = portfolioValue + profit;
      const { error: updateError } = await supabase
        .from('trading_goals')
        .update({ starting_portfolio_size: newPortfolioValue })
        .eq('user_id', userId);
      
      if (updateError) throw updateError;
      
      setPortfolioValue(newPortfolioValue);
      await fetchTrades(userId);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving trade:', error);
      alert('Failed to save trade');
    } finally {
      setLoading(false);
    }
  };

  const getCalendarDays = () => {
    const firstDayOfMonth = startOfMonth(currentDate);
    const lastDayOfMonth = endOfMonth(currentDate);
    const firstDayOfWeekIndex = firstDayOfMonth.getDay();
    const daysInMonth = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });
    const placeholdersBefore = Array(firstDayOfWeekIndex).fill(null);
    return [...placeholdersBefore, ...daysInMonth];
  };

  const prevMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const currentMonth = format(currentDate, 'MMMM yyyy');
  const calendarDays = getCalendarDays();
  const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Layout>
      <GradientBackground />
      <Head>
        {/* Font links moved to _document.js */}
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
          .green-glow { animation: greenPulse 2s infinite; }
          .red-glow { animation: redPulse 2s infinite; }
          .btn-primary { background-color: var(--blue-color); transition: all 0.2s ease; }
          .btn-primary:hover { background-color: #4d7aff; transform: translateY(-1px); }
          .tab-active { background-color: #282834; color: white; }
          .tab { transition: all 0.2s ease; }
          .glow-line { height: 3px; background: linear-gradient(90deg, #3366FF 0%, #8A33FF 100%); border-radius: 3px; margin-top: 4px; }
          .profit-day { position: relative; overflow: hidden; }
          .profit-day::after { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 200, 83, 0.05); z-index: -1; }
          .loss-day { position: relative; overflow: hidden; }
          .loss-day::after { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255, 61, 113, 0.05); z-index: -1; }
          .calendar-day { transition: all 0.2s ease; cursor: pointer; }
          .calendar-day:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); }
          .modal-backdrop { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px); z-index: 100; display: flex; align-items: center; justify-content: center; }
          .modal-enter { animation: modalEnter 0.3s forwards; }
          @keyframes modalEnter { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
          .form-input { background-color: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; padding: 6px 10px; font-size: 12px; color: white; transition: all 0.2s ease; width: 100%; }
          .form-input:focus { outline: none; border-color: var(--blue-color); box-shadow: 0 0 0 2px rgba(51, 102, 255, 0.2); }
          .form-label { font-size: 11px; font-weight: 500; color: #999; margin-bottom: 4px; display: block; }
        `}</style>
        <title>Trading Log | SoothSayer</title>
      </Head>

      {/* AdSense script properly implemented with next/script */}
      <Script
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1549212779236114"
        strategy="afterInteractive"
      />

      <div className="max-w-5xl mx-auto">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <p className="text-gray-400 text-xs font-medium mb-1">Portfolio Value</p>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-white">${portfolioValue.toFixed(2)}</span>
            </div>
            <div className="flex items-center mt-4">
              <div className="w-8 h-8 rounded-full bg-[rgba(51,102,255,0.1)] flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-[#3366FF]" />
              </div>
              <p className="text-xs text-gray-400 ml-2">Current balance</p>
            </div>
          </div>

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
              <p className="text-xs text-gray-400 ml-2">{currentMonth}</p>
            </div>
          </div>

          <div className="card p-6">
            <p className="text-gray-400 text-xs font-medium mb-1">Win/Loss</p>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-white">{monthStats.winningDays}/{monthStats.losingDays}</span>
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

          <div className="card p-6 relative overflow-hidden">
            <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-[#00C853] opacity-10 animate-pulse"></div>
            <p className="text-gray-400 text-xs font-medium mb-1">Win Rate</p>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-[#00C853] green-glow">{monthStats.winPercentage}%</span>
            </div>
            <div className="flex items-center mt-4">
              <div className="w-8 h-8 rounded-full bg-[rgba(0,200,83,0.1)] flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-[#00C853]" />
              </div>
              <p className="text-xs text-gray-400 ml-2">Success rate</p>
            </div>
          </div>
        </div>

        <div className="card overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold text-white">{currentMonth}</h2>
                <div className="flex space-x-1">
                  <button onClick={prevMonth} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[rgba(255,255,255,0.05)]">
                    <ArrowLeft size={16} className="text-gray-400" />
                  </button>
                  <button onClick={nextMonth} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[rgba(255,255,255,0.05)]">
                    <ArrowRight size={16} className="text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-7 text-center mb-1">
              {dayOfWeek.map((day) => (
                <div key={day} className="text-xs font-medium text-gray-400 py-2">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="min-h-[80px] rounded-md"></div>;
                }
                const dateString = format(date, 'yyyy-MM-dd');
                const dayData = tradeData[dateString];
                const hasData = !!dayData;
                const isWinning = hasData && dayData.profit > 0;
                const isLosing = hasData && dayData.profit < 0;
                let dayClasses = "calendar-day p-2 rounded-md border border-[rgba(255,255,255,0.05)] min-h-[80px] flex flex-col relative";
                if (isToday(date)) dayClasses += " border-[#3366FF]";
                if (isWinning) dayClasses += " profit-day";
                else if (isLosing) dayClasses += " loss-day";

                return (
                  <div key={dateString} className={dayClasses} onClick={() => handleDateSelect(date)}>
                    <span className={`text-xs font-medium self-end ${isToday(date) ? 'bg-[#3366FF] text-white w-5 h-5 flex items-center justify-center rounded-full' : 'text-gray-400'}`}>
                      {format(date, 'd')}
                    </span>
                    {hasData && (
                      <div className="mt-auto">
                        <div className={`text-sm font-semibold ${isWinning ? 'text-[#00C853] green-glow' : 'text-[#FF3D71] red-glow'}`}>
                          {dayData.profit > 0 ? '+' : ''}{dayData.profit.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">{dayData.trades} trades</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

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

      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="card p-4 w-full max-w-sm mx-4 modal-enter" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white">
                {selectedDate ? `Add Trade - ${format(selectedDate, 'MM/dd/yyyy')}` : 'Add Trade'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[rgba(255,255,255,0.05)]">
                <X size={14} className="text-gray-400" />
              </button>
            </div>

            <div className="flex mb-3 bg-[rgba(255,255,255,0.05)] rounded-md p-1">
              <button
                type="button"
                className={`flex-1 py-1 text-center text-xs rounded-md transition-colors ${tradeType === 'stocks' ? 'bg-[#282834] text-white' : 'text-gray-400'}`}
                onClick={() => setTradeType('stocks')}
              >
                Stocks
              </button>
              <button
                type="button"
                className={`flex-1 py-1 text-center text-xs rounded-md transition-colors ${tradeType === 'options' ? 'bg-[#282834] text-white' : 'text-gray-400'}`}
                onClick={() => setTradeType('options')}
              >
                Options
              </button>
            </div>

            <form onSubmit={saveTrade}>
              <div className="space-y-2">
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
                    <label className="form-label" htmlFor="entryPrice">Entry Price</label>
                    <input
                      id="entryPrice"
                      name="entryPrice"
                      type="number"
                      step="0.01"
                      className="form-input"
                      placeholder="0.00"
                      value={tradeForm.entryPrice}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label" htmlFor="exitPrice">Exit Price</label>
                    <input
                      id="exitPrice"
                      name="exitPrice"
                      type="number"
                      step="0.01"
                      className="form-input"
                      placeholder="0.00"
                      value={tradeForm.exitPrice}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {tradeType === 'options' ? (
                    <div>
                      <label className="form-label" htmlFor="contracts">Contracts</label>
                      <input
                        id="contracts"
                        name="contracts"
                        type="number"
                        className="form-input"
                        placeholder="1"
                        value={tradeForm.contracts}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="form-label" htmlFor="shares">Shares</label>
                      <input
                        id="shares"
                        name="shares"
                        type="number"
                        className="form-input"
                        placeholder="100"
                        value={tradeForm.shares}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  )}
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
                <div>
                  <textarea
                    id="notes"
                    name="notes"
                    className="form-input min-h-[50px]"
                    placeholder="Add any trade notes here..."
                    value={tradeForm.notes || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Profit/Loss</span>
                    <span className={`text-sm font-bold ${calculateProfit() >= 0 ? 'text-[#00C853]' : 'text-[#FF3D71]'}`}>
                      {calculateProfit() >= 0 ? '+' : ''}${calculateProfit().toFixed(2)}
                    </span>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 bg-[#3366FF] text-white rounded-md font-medium hover:bg-[#4d7aff] transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading ? 'Saving...' : 'Save Trade'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingTrades && (
        <div className="modal-backdrop" onClick={() => setViewingTrades(false)}>
          <div className="card p-6 w-full max-w-xl mx-4 modal-enter" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">
                {selectedDate ? `Trades - ${format(selectedDate, 'MMMM d, yyyy')}` : 'Trades'}
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleAddTrade}
                  className="flex items-center bg-[#3366FF] px-3 py-1.5 rounded-md text-white text-xs"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Trade
                </button>
                <button
                  onClick={() => setViewingTrades(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[rgba(255,255,255,0.05)]"
                >
                  <X size={18} className="text-gray-400" />
                </button>
              </div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {dayTrades.map((trade, index) => (
                <div
                  key={trade.id}
                  className={`p-4 rounded-md bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.05)] ${index !== dayTrades.length - 1 ? 'mb-4' : ''}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{trade.symbol}</h4>
                      <div className="text-sm text-gray-400">{trade.time}</div>
                    </div>
                    <div className={`text-lg font-bold ${trade.profit >= 0 ? 'text-[#00C853]' : 'text-[#FF3D71]'}`}>
                      {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Entry Price</div>
                      <div className="text-sm text-white">${trade.entry_price.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Exit Price</div>
                      <div className="text-sm text-white">${trade.exit_price.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-gray-400 mb-1">{trade.contracts ? 'Contracts' : 'Shares'}</div>
                      <div className="text-sm text-white">{trade.contracts || trade.shares}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Fees</div>
                      <div className="text-sm text-white">${trade.fees.toFixed(2)}</div>
                    </div>
                  </div>
                  {trade.notes && (
                    <div className="mt-3">
                      <div className="text-xs text-gray-400 mb-1">Notes</div>
                      <div className="text-sm text-white p-2 rounded-md bg-[rgba(255,255,255,0.05)]">{trade.notes}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes greenPulse { 0% { text-shadow: 0 0 5px rgba(0, 200, 83, 0.5); } 50% { text-shadow: 0 0 10px rgba(0, 200, 83, 0.8), 0 0 15px rgba(0, 200, 83, 0.5); } 100% { text-shadow: 0 0 5px rgba(0, 200, 83, 0.5); } }
        @keyframes redPulse { 0% { text-shadow: 0 0 5px rgba(255, 61, 113, 0.5); } 50% { text-shadow: 0 0 10px rgba(255, 61, 113, 0.8), 0 0 15px rgba(255, 61, 113, 0.5); } 100% { text-shadow: 0 0 5px rgba(255, 61, 113, 0.5); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
        .animate-pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0% { transform: scale(0.95); opacity: 0.5; } 50% { transform: scale(1.05); opacity: 0.8; } 100% { transform: scale(0.95); opacity: 0.5; } }
      `}</style>
    </Layout>
  );
}