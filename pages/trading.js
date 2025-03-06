import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Search, RefreshCw, Calendar, TrendingUp, Camera, BarChart2, Menu, X, Settings, DollarSign, Activity, Target, User } from 'lucide-react';
import Head from 'next/head';
import html2canvas from 'html2canvas';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

// Dynamically import Chart component
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

// Import our CSS gradient background (no webpack config needed)
import GradientBackground from '../components/GradientBackground';

export default function Home() {
  const [stockData, setStockData] = useState([]);
  const [symbol, setSymbol] = useState('AAPL');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  
  // State variables for ChatGPT analysis
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [showThinking, setShowThinking] = useState(false);
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Time filter state
  const [timeFilter, setTimeFilter] = useState('day');
  
  // User's portfolio data from Supabase
  const [tradingGoals, setTradingGoals] = useState(null);
  const [portfolioGoal, setPortfolioGoal] = useState(0);
  const [startingPortfolio, setStartingPortfolio] = useState(0);
  const [loadingUserData, setLoadingUserData] = useState(true);
  
  // Ref for the chart container to capture screenshot
  const chartRef = useRef(null);

  // Fetch user profile and trading goals data
  useEffect(() => {
    async function fetchUserData() {
      try {
        setLoadingUserData(true);
        
        // Get authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        
        // Fetch trading goals data
        const { data: goalsData, error: goalsError } = await supabase
          .from('trading_goals')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (goalsError && goalsError.code !== 'PGRST116') {
          console.error('Error fetching goals:', goalsError);
        }

        if (goalsData) {
          setTradingGoals(goalsData);
          setPortfolioGoal(goalsData.portfolio_goal || 1000); // Fallback to 1000 if not set
          setStartingPortfolio(goalsData.starting_portfolio_size || 0);
        }
        
      } catch (err) {
        console.error('Error loading user data:', err);
      } finally {
        setLoadingUserData(false);
      }
    }
    
    fetchUserData();
  }, []);

  const isWithinTradingHours = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const timeInMinutes = hours * 60 + minutes;
    const marketOpen = 9 * 60 + 30;  // 9:30 AM
    const marketClose = 16 * 60;     // 4:00 PM
    return timeInMinutes >= marketOpen && timeInMinutes <= marketClose;
  };

  const fetchStockData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/stockData?symbol=${symbol}&date=${selectedDate}`);
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }

      if (data['Time Series (5min)']) {
        const formattedData = Object.entries(data['Time Series (5min)'])
          .filter(([timestamp]) => {
            const date = new Date(timestamp);
            const dateStr = date.toISOString().split('T')[0];
            return dateStr === selectedDate && isWithinTradingHours(date);
          })
          .map(([timestamp, values]) => ({
            x: new Date(timestamp).getTime(),
            y: [
              parseFloat(values['1. open']),
              parseFloat(values['2. high']),
              parseFloat(values['3. low']),
              parseFloat(values['4. close'])
            ]
          }))
          .reverse();

        if (formattedData.length > 0) {
          const latestData = formattedData[formattedData.length - 1];
          const firstData = formattedData[0];
          const changePct = ((latestData.y[3] - firstData.y[0]) / firstData.y[0] * 100).toFixed(2);
          
          setStats({
            currentPrice: latestData.y[3].toFixed(2),
            change: (latestData.y[3] - firstData.y[0]).toFixed(2),
            changePct: changePct
          });
          
          setStockData(formattedData);
        } else {
          setError(`No trading data available for ${selectedDate}`);
        }
      } else {
        setError('No data available for this symbol');
      }
    } catch (err) {
      setError('Failed to fetch stock data');
    } finally {
      setLoading(false);
    }
  };

  // Function to calculate progress percentage based on current portfolio value
  const calculateProgress = () => {
    if (!stats || !stats.currentPrice || !portfolioGoal) return 0;
    
    // Calculate current portfolio value based on starting portfolio + current stock price
    const currentPortfolioValue = startingPortfolio + parseFloat(stats.currentPrice);
    
    // Calculate progress towards goal
    const progress = (currentPortfolioValue / portfolioGoal) * 100;
    return Math.min(progress, 100); // Cap at 100%
  };

  // Format currency
  const formatCurrency = (value) => {
    if (!value && value !== 0) return '$0.00';
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Function to calculate current portfolio value
  const getCurrentPortfolioValue = () => {
    if (!stats || !stats.currentPrice) return startingPortfolio;
    return startingPortfolio + parseFloat(stats.currentPrice);
  };

  // Function to capture screenshot and send to ChatGPT
  const captureAndAnalyze = async () => {
    if (!chartRef.current || stockData.length === 0) return;
    
    try {
      setAnalyzing(true);
      setAnalysis(null);
      setShowThinking(true);
      
      // Capture the chart as an image
      const canvas = await html2canvas(chartRef.current, {
        scale: 2, // Higher scale for better quality
        backgroundColor: '#111111',
        logging: false,
        useCORS: true
      });
      
      // Convert to base64 image with reduced quality to ensure manageable file size
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      // Send to our API endpoint
      const response = await fetch('/api/analyzeChart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData,
          symbol: symbol,
          date: selectedDate
        }),
      });
      
      const result = await response.json();
      
      if (result.error) {
        setError(result.error);
      } else {
        // Small delay to show the thinking animation
        setTimeout(() => {
          setAnalysis(result.analysis);
          setShowThinking(false);
        }, 1000);
      }
    } catch (err) {
      setError('Failed to analyze chart: ' + err.message);
      setShowThinking(false);
    } finally {
      if (!analysis) {
        setTimeout(() => {
          setAnalyzing(false);
        }, 1000);
      } else {
        setAnalyzing(false);
      }
    }
  };

  useEffect(() => {
    fetchStockData();
  }, [selectedDate]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarOpen && window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen]);

  const chartOptions = {
    chart: {
      type: 'candlestick',
      height: 350,
      background: '#111111',
      foreColor: '#999999',
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        },
        autoSelected: 'zoom'
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    title: {
      text: `${symbol} - ${new Date(selectedDate).toLocaleDateString()}`,
      align: 'left',
      style: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#ffffff'
      }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        formatter: function(value, timestamp, opts) {
          const date = new Date(timestamp);
          const hours = date.getHours();
          const minutes = date.getMinutes();
          const period = hours >= 12 ? 'PM' : 'AM';
          const formattedHours = hours % 12 || 12;
          return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
        },
        style: {
          colors: '#999999',
          fontSize: '12px'
        }
      },
      axisBorder: {
        color: '#222222'
      },
      axisTicks: {
        color: '#222222'
      },
      tickAmount: 8,
      min: new Date(selectedDate + 'T09:30:00').getTime(),
      max: new Date(selectedDate + 'T16:00:00').getTime(),
      range: undefined
    },
    yaxis: {
      tooltip: {
        enabled: true
      },
      labels: {
        style: {
          colors: '#999999',
          fontSize: '12px'
        },
        formatter: (value) => value.toFixed(2)
      },
      floating: false
    },
    grid: {
      borderColor: '#222222',
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: true,
          color: '#222222'
        }
      },
      yaxis: {
        lines: {
          show: true,
          color: '#222222'
        }
      }
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: '#00C853',
          downward: '#FF3D71'
        },
        wick: {
          useFillColor: true
        }
      }
    },
    tooltip: {
      theme: 'dark',
      x: {
        format: 'h:mm TT'
      },
      y: {
        formatter: (value) => `${value.toFixed(2)}`
      }
    },
    responsive: [{
      breakpoint: 1000,
      options: {
        chart: {
          width: '100%'
        }
      }
    }]
  };

  return (
    <div className="relative min-h-screen font-sans text-white bg-[#111111]">
      {/* CSS Gradient Background - No Three.js needed */}
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
          
          .progress-bar {
            height: 8px;
            border-radius: 4px;
            background: linear-gradient(90deg, #3366FF 0%, #8A33FF 100%);
            transition: width 0.5s ease;
          }
          
          .progress-track {
            height: 8px;
            width: 100%;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
          }
          
          .portfolio-bubble {
            background: radial-gradient(circle at 70% 70%, rgba(51, 102, 255, 0.15), rgba(0, 200, 83, 0.15));
            border-radius: 999px;
            backdrop-filter: blur(5px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          
          .portfolio-bubble:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
            border-color: rgba(255, 255, 255, 0.2);
          }
        `}</style>
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
              <div className="sidebar-item sidebar-item-active px-4 py-3 rounded-md flex items-center">
                <BarChart2 className="h-5 w-5 text-[#3366FF] mr-3" />
                <span className="text-white font-medium">Analyze</span>
              </div>
              
              <Link href="/log" className="block">
                <div className="sidebar-item px-4 py-3 rounded-md flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-400">Payouts</span>
                </div>
              </Link>
              
              <Link href="/my-profile" className="block">
                <div className="sidebar-item px-4 py-3 rounded-md flex items-center">
                  <Target className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-400">Goals</span>
                </div>
              </Link>
            </div>
          </div>
          
          <div className="mt-auto p-6">
            <button className="w-full bg-[#3366FF] text-white rounded-md py-3 flex items-center justify-center">
              <span className="mr-2">New Analysis</span>
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
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            </div>
            
            <div className="flex items-center mt-4 sm:mt-0">
              <Link href="/my-profile">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3366FF] to-[#00C853] flex items-center justify-center cursor-pointer">
                  <User className="h-4 w-4 text-white" />
                </div>
              </Link>
            </div>
          </div>
          
          {/* Portfolio Stats in Bubbles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="portfolio-bubble p-6 flex items-center">
              <div className="rounded-full p-3 bg-[rgba(51,102,255,0.15)] mr-4">
                <DollarSign className="h-6 w-6 text-[#3366FF]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm text-gray-300 mb-1">Portfolio Worth</h3>
                  {stats && (
                    <span 
                      className={`text-sm font-medium ${parseFloat(stats.changePct) >= 0 ? 'text-[#00C853] green-glow' : 'text-[#FF3D71] red-glow'}`}
                    >
                      {parseFloat(stats.changePct) >= 0 ? '+' : ''}{stats.changePct}%
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-white">
                  {loadingUserData ? (
                    <span className="animate-pulse">Loading...</span>
                  ) : (
                    formatCurrency(getCurrentPortfolioValue())
                  )}
                </p>
              </div>
            </div>
            
            <div className="portfolio-bubble p-6 flex items-center">
              <div className="rounded-full p-3 bg-[rgba(0,200,83,0.15)] mr-4">
                <Target className="h-6 w-6 text-[#00C853]" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm text-gray-300 mb-1">Portfolio Goal</h3>
                <div className="flex flex-col">
                  <p className="text-2xl font-bold text-white">
                    {loadingUserData ? (
                      <span className="animate-pulse">Loading...</span>
                    ) : (
                      formatCurrency(portfolioGoal)
                    )}
                  </p>
                  
                  <div className="progress-track mt-2">
                    <div 
                      className="progress-bar" 
                      style={{ width: `${calculateProgress()}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-400">Progress</p>
                    <p className="text-xs text-white font-medium">{calculateProgress().toFixed(0)}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Portfolio Starting Value Card */}
            <div className="card p-6">
              <p className="text-gray-400 text-sm mb-1">Starting Portfolio</p>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-white">
                  {loadingUserData ? (
                    <span className="animate-pulse">Loading...</span>
                  ) : (
                    formatCurrency(startingPortfolio)
                  )}
                </span>
              </div>
              
              <div className="flex items-center mt-8">
                <div className="w-8 h-8 rounded-full bg-[rgba(51,102,255,0.1)] flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-[#3366FF]" />
                </div>
                <p className="text-xs text-gray-400 ml-2">
                  Initial investment
                </p>
                <Link href="/my-profile" className="ml-auto">
                  <button className="text-sm bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] px-3 py-1.5 rounded-md transition-colors">
                    Edit
                  </button>
                </Link>
              </div>
            </div>
            
            {/* Current Stock Card */}
            <div className="card p-6">
              <p className="text-gray-400 text-sm mb-1">Current Stock</p>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-white">${stats ? stats.currentPrice : '0.00'}</span>
                {stats && (
                  <span 
                    className={`ml-2 text-sm font-medium ${parseFloat(stats.changePct) >= 0 ? 'text-[#00C853] green-glow' : 'text-[#FF3D71] red-glow'}`}
                  >
                    {parseFloat(stats.changePct) >= 0 ? '+' : ''}{stats.changePct}%
                  </span>
                )}
              </div>
              
              <div className="flex items-center mt-8">
                <div className="w-8 h-8 rounded-full bg-[rgba(255,61,113,0.1)] flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-[#FF3D71]" />
                </div>
                <p className="text-xs text-gray-400 ml-2">
                  Last updated just now
                </p>
                <button 
                  onClick={fetchStockData}
                  disabled={loading}
                  className="ml-auto text-sm bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] px-3 py-1.5 rounded-md transition-colors"
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
            </div>
            
            {/* Symbol Info Card */}
            <div className="card p-6">
              <p className="text-gray-400 text-sm mb-1">Symbol Info</p>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-white">{symbol}</span>
                <span className="ml-2 text-sm text-gray-400">NYSE</span>
              </div>
              
              <div className="flex items-center mt-8">
                <div className="w-8 h-8 rounded-full bg-[rgba(255,199,0,0.1)] flex items-center justify-center">
                  <Settings className="h-4 w-4 text-[#FFC700]" />
                </div>
                <p className="text-xs text-gray-400 ml-2">
                  Update your symbol settings
                </p>
                <div className="relative ml-auto">
                  <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    placeholder="Enter symbol"
                    className="pl-10 pr-3 py-2 text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#3366FF] w-32"
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="card p-5 flex items-center">
              <div className="w-10 h-10 rounded-full bg-[rgba(255,61,113,0.1)] flex items-center justify-center mr-4">
                <Calendar className="h-5 w-5 text-[#FF3D71]" />
              </div>
              <div className="flex-1">
                <p className="text-gray-400 text-xs">Trading date</p>
                <div className="flex items-center justify-between">
                  <div className="relative mt-1">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="pl-3 pr-3 py-1 text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#3366FF]"
                    />
                  </div>
                  <button className="text-sm text-[#3366FF]">View All</button>
                </div>
              </div>
            </div>
            
            <div className="card p-5 flex items-center">
              <div className="w-10 h-10 rounded-full bg-[rgba(51,102,255,0.1)] flex items-center justify-center mr-4">
                <Camera className="h-5 w-5 text-[#3366FF]" />
              </div>
              <div className="flex-1">
                <p className="text-gray-400 text-xs">Market Analysis</p>
                <div className="flex items-center justify-between">
                  <p className="text-white text-sm mt-1">Generate AI insights</p>
                  <button 
                    onClick={captureAndAnalyze}
                    disabled={analyzing || stockData.length === 0}
                    className="text-sm text-white bg-[#3366FF] px-3 py-1 rounded-md hover:bg-[#4d7aff] transition-colors disabled:opacity-50 disabled:bg-[#3366FF]"
                  >
                    {analyzing ? 'Analyzing...' : 'Analyze'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Chart Section */}
          <div className="card overflow-hidden mb-8">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Market Activity</h2>
                <div className="flex space-x-2 bg-[rgba(255,255,255,0.05)] rounded-md p-1">
                  <button 
                    className={`text-xs px-3 py-1.5 rounded-md ${timeFilter === 'day' ? 'tab-active' : 'tab text-gray-400'}`}
                    onClick={() => setTimeFilter('day')}
                  >
                    Day
                  </button>
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
              </div>
              
              {error && (
                <div className="bg-[rgba(255,61,113,0.1)] border-l-2 border-[#FF3D71] p-3 mb-4 rounded-md">
                  <p className="text-[#FF3D71] text-sm">{error}</p>
                </div>
              )}
              
              {stockData.length > 0 ? (
                <div ref={chartRef}>
                  <Chart
                    options={chartOptions}
                    series={[{ data: stockData }]}
                    type="candlestick"
                    height={350}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-80 bg-[rgba(0,0,0,0.2)] rounded-md">
                  <div className="text-center">
                    <p className="text-gray-400 mb-4">No data available</p>
                    <button 
                      onClick={fetchStockData}
                      className="px-4 py-2 bg-[#3366FF] text-white rounded-md text-sm"
                    >
                      Load Data
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Thinking Animation */}
          {showThinking && (
            <div className="card p-6 mb-8 animate-fadeIn">
              <div className="flex flex-col items-center">
                <div className="relative w-16 h-16 mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-[rgba(51,102,255,0.1)] border-t-[#3366FF] animate-spin"></div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Analyzing Market Patterns</h3>
                
                <div className="flex justify-center space-x-2 mt-2">
                  <span className="h-2 w-2 bg-[#3366FF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="h-2 w-2 bg-[#3366FF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="h-2 w-2 bg-[#3366FF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                
                <p className="text-sm text-gray-400 mt-4 max-w-md text-center">
                  Identifying support/resistance levels, trend patterns, and volatility indicators...
                </p>
              </div>
            </div>
          )}
          
          {/* Analysis Results */}
          {analysis && (
            <div className="card overflow-hidden mb-8 animate-fadeInUp">
              <div className="bg-[rgba(51,102,255,0.05)] border-b border-[rgba(51,102,255,0.2)] py-4 px-6">
                <h3 className="text-base font-semibold text-white flex items-center">
                  <span className="h-2 w-2 bg-[#3366FF] rounded-full mr-2 animate-pulse"></span>
                  AI Market Analysis
                </h3>
              </div>
              
              <div className="p-6">
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                  {analysis}
                </p>
              </div>
            </div>
          )}
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
      `}</style>
    </div>
  );
}