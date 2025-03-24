import { useState, useEffect } from 'react';
import { RefreshCw, Camera, Settings, DollarSign, Target, User } from 'lucide-react';
import Head from 'next/head';
import Script from 'next/script';  // Added script import for consistency
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

// Import our CSS gradient background
import GradientBackground from '../components/GradientBackground';
import Layout from '../components/Layout';

export default function Home() {
  // User's portfolio data from Supabase
  const [tradingGoals, setTradingGoals] = useState(null);
  const [portfolioGoal, setPortfolioGoal] = useState(0);
  const [startingPortfolio, setStartingPortfolio] = useState(0);
  const [loadingUserData, setLoadingUserData] = useState(true);
  
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

  // Format currency
  const formatCurrency = (value) => {
    // Ensure we have a valid numeric value
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) return '$0';
    
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(numericValue);
  };

  // Function to calculate current portfolio value
  const getCurrentPortfolioValue = () => {
    // Ensure we have valid numbers
    const startingValue = Number(startingPortfolio) || 0;
    // Since we removed the chart/stock data, we're just using the starting value
    // In a real app, you would fetch the current portfolio value from an API
    return startingValue; 
  };

  // Content for the Layout component
  const content = (
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
        
        {/* Portfolio Goal Card */}
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
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
        
        {/* Market Analysis Card */}
        <div className="card p-6">
          <p className="text-gray-400 text-sm mb-1">Market Analysis</p>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-white">Advanced Charts</span>
          </div>
          
          <div className="flex items-center mt-8">
            <div className="w-8 h-8 rounded-full bg-[rgba(255,199,0,0.1)] flex items-center justify-center">
              <Camera className="h-4 w-4 text-[#FFC700]" />
            </div>
            <p className="text-xs text-gray-400 ml-2">
              View detailed market analysis
            </p>
            <Link href="/external-chart" className="ml-auto">
              <button className="text-sm bg-[#3366FF] hover:bg-[#4d7aff] text-white px-3 py-1.5 rounded-md transition-colors">
                Open Charts
              </button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Recent Activity Section */}
      <div className="card overflow-hidden mb-8">
        <div className="bg-[rgba(51,102,255,0.05)] border-b border-[rgba(51,102,255,0.2)] py-4 px-6">
          <h3 className="text-base font-semibold text-white flex items-center">
            <span className="h-2 w-2 bg-[#3366FF] rounded-full mr-2 animate-pulse"></span>
            Recent Activity
          </h3>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-[rgba(0,200,83,0.1)] flex items-center justify-center mr-3 mt-1">
                <RefreshCw className="h-4 w-4 text-[#00C853]" />
              </div>
              <div>
                <h4 className="text-white text-sm font-medium">Portfolio Updated</h4>
                <p className="text-gray-400 text-xs mt-1">Your portfolio was updated with the latest market data</p>
                <p className="text-gray-500 text-xs mt-2">5 minutes ago</p>
              </div>
            </div>
            
            <div className="border-t border-[rgba(255,255,255,0.05)] my-4"></div>
            
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-[rgba(51,102,255,0.1)] flex items-center justify-center mr-3 mt-1">
                <Settings className="h-4 w-4 text-[#3366FF]" />
              </div>
              <div>
                <h4 className="text-white text-sm font-medium">Goals Adjusted</h4>
                <p className="text-gray-400 text-xs mt-1">You updated your portfolio goal to {formatCurrency(portfolioGoal)}</p>
                <p className="text-gray-500 text-xs mt-2">Yesterday</p>
              </div>
            </div>
            
            <div className="border-t border-[rgba(255,255,255,0.05)] my-4"></div>
            
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-[rgba(255,61,113,0.1)] flex items-center justify-center mr-3 mt-1">
                <DollarSign className="h-4 w-4 text-[#FF3D71]" />
              </div>
              <div>
                <h4 className="text-white text-sm font-medium">Investment Added</h4>
                <p className="text-gray-400 text-xs mt-1">You added {formatCurrency(startingPortfolio)} to your portfolio</p>
                <p className="text-gray-500 text-xs mt-2">2 days ago</p>
              </div>
            </div>
          </div>
          
          {/* View All Activity button removed as requested */}
        </div>
      </div>
      
      {/* Quick Actions Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/external-chart">
          <div className="card p-5 hover:border-[#3366FF] transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-[rgba(51,102,255,0.1)] flex items-center justify-center mb-4">
              <Camera className="h-5 w-5 text-[#3366FF]" />
            </div>
            <h3 className="text-white text-base font-medium mb-2">View Charts</h3>
            <p className="text-gray-400 text-xs">Access detailed market charts and analysis tools</p>
          </div>
        </Link>
        
        <Link href="/my-profile">
          <div className="card p-5 hover:border-[#00C853] transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-[rgba(0,200,83,0.1)] flex items-center justify-center mb-4">
              <Target className="h-5 w-5 text-[#00C853]" />
            </div>
            <h3 className="text-white text-base font-medium mb-2">Update Goals</h3>
            <p className="text-gray-400 text-xs">Set and track your financial targets</p>
          </div>
        </Link>
        
        <Link href="/settings">
          <div className="card p-5 hover:border-[#FFC700] transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-[rgba(255,199,0,0.1)] flex items-center justify-center mb-4">
              <Settings className="h-5 w-5 text-[#FFC700]" />
            </div>
            <h3 className="text-white text-base font-medium mb-2">Settings</h3>
            <p className="text-gray-400 text-xs">Customize your dashboard experience</p>
          </div>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <Head>
        {/* Font links moved to _document.js */}
      </Head>
      
      {/* AdSense Script if needed */}
      <Script
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1549212779236114"
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />
      
      {/* Use the Layout component */}
      <Layout>
        {/* Add GradientBackground inside the Layout */}
        <GradientBackground />
        
        {content}
      </Layout>

      {/* Separated styles to another component */}
      <GlobalStyles />
    </>
  );
}

// The following components (GlobalStyles and CustomGradientStyles) remain unchanged from your original code
function GlobalStyles() {
  return (
    <style jsx global>{`
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
        0% { text-shadow: 0 0 0 rgba(0, 200, 83, 0); }
        50% { text-shadow: 0 0 10px rgba(0, 200, 83, 0.5); }
        100% { text-shadow: 0 0 0 rgba(0, 200, 83, 0); }
      }
      
      @keyframes redPulse {
        0% { text-shadow: 0 0 0 rgba(255, 61, 113, 0); }
        50% { text-shadow: 0 0 10px rgba(255, 61, 113, 0.5); }
        100% { text-shadow: 0 0 0 rgba(255, 61, 113, 0); }
      }
      
      .animate-fadeIn {
        animation: fadeIn 0.5s ease-in-out;
      }
      
      .animate-fadeInUp {
        animation: fadeInUp 0.5s ease-in-out;
      }
      
      .animate-spin {
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      .animate-bounce {
        animation: bounce 1s infinite;
      }
      
      @keyframes bounce {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-5px);
        }
      }
      
      .animate-pulse {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
      
      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }
    `}</style>
  );
}