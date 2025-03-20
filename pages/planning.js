// pages/planning.js
import { useState } from 'react';
import Head from 'next/head';
import { Settings, Calendar, ArrowRight } from 'lucide-react';

// Import the Layout component
import Layout from '../components/Layout';
// Import GradientBackground component
import GradientBackground from '../components/GradientBackground';

export default function Planning() {
  const [startingAmount, setStartingAmount] = useState('1000');
  const [returnPercentage, setReturnPercentage] = useState('2.5');
  const [goalAmount, setGoalAmount] = useState('10000');
  const [daysNeeded, setDaysNeeded] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculated, setCalculated] = useState(false);

  const calculateDays = async () => {
    if (!startingAmount || !returnPercentage || !goalAmount) return;
    
    setIsCalculating(true);
    
    try {
      // Here we'd normally call an API endpoint that interfaces with ChatGPT
      // For demo purposes, we'll use a simple calculation instead
      const response = await fetch('/api/calculateDays', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startingAmount: parseFloat(startingAmount),
          returnPercentage: parseFloat(returnPercentage),
          goalAmount: parseFloat(goalAmount),
          prompt: `How many days would it take to go from ${startingAmount} to ${goalAmount} at a rate of return of ${returnPercentage}% per day. Do not output anything other than a number of days. no equations.`
        }),
      });
      
      const data = await response.json();
      setDaysNeeded(data.days);
      setCalculated(true);
    } catch (error) {
      console.error('Error calculating days:', error);
      // Fallback calculation if API fails
      const start = parseFloat(startingAmount);
      const goal = parseFloat(goalAmount);
      const rate = parseFloat(returnPercentage) / 100;
      
      // Calculate days using compound interest formula
      // FV = PV * (1 + r)^n, solve for n
      // n = log(FV/PV) / log(1 + r)
      const days = Math.ceil(Math.log(goal / start) / Math.log(1 + rate));
      
      setDaysNeeded(days);
      setCalculated(true);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <Layout>
      {/* Add Gradient Background */}
      <GradientBackground />
      
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        {/* Google AdSense Script */}
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1549212779236114"
          crossOrigin="anonymous"
        />
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
          
          .input-field {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 0.75rem 1rem;
            color: white;
            width: 100%;
            transition: all 0.2s ease;
          }
          
          .input-field:focus {
            outline: none;
            border-color: var(--blue-color);
            box-shadow: 0 0 0 1px var(--blue-color);
          }
          
          .input-label {
            font-size: 0.875rem;
            font-weight: 500;
            color: rgba(255, 255, 255, 0.7);
            margin-bottom: 0.5rem;
            display: block;
          }
          
          @keyframes shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
          
          .shimmer {
            background: linear-gradient(90deg, 
              rgba(255, 255, 255, 0.03) 25%, 
              rgba(255, 255, 255, 0.08) 50%, 
              rgba(255, 255, 255, 0.03) 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }
        `}</style>
        <title>Planning | ScalpGPT</title>
      </Head>
      
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-gray-400 mb-1">Plan your trading future</p>
            <h1 className="text-2xl font-bold text-white">Growth Planning</h1>
          </div>
          
          <div className="flex items-center mt-4 sm:mt-0">
            <div className="w-8 h-8 rounded-full bg-white p-1.5 flex items-center justify-center">
              <Settings className="h-4 w-4 text-[#111111]" />
            </div>
          </div>
        </div>
        
        {/* Planning Input Card */}
        <div className="card p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Growth Calculator</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="input-label">Starting Amount ($)</label>
              <input 
                type="number" 
                value={startingAmount}
                onChange={(e) => setStartingAmount(e.target.value)}
                className="input-field"
                placeholder="1000"
              />
            </div>
            
            <div>
              <label className="input-label">Daily Return (%)</label>
              <input 
                type="number" 
                value={returnPercentage}
                onChange={(e) => setReturnPercentage(e.target.value)}
                className="input-field"
                placeholder="2.5"
                step="0.1"
              />
            </div>
            
            <div>
              <label className="input-label">Goal Amount ($)</label>
              <input 
                type="number" 
                value={goalAmount}
                onChange={(e) => setGoalAmount(e.target.value)}
                className="input-field"
                placeholder="10000"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button 
              onClick={calculateDays}
              disabled={isCalculating || !startingAmount || !returnPercentage || !goalAmount}
              className="flex items-center bg-[#3366FF] px-4 py-2 rounded-md text-white disabled:opacity-50"
            >
              {isCalculating ? 'Calculating...' : 'Calculate'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>
        
        {/* Results Card */}
        {calculated && (
          <div className="card p-6 mb-8 animate-fadeInUp">
            <h2 className="text-lg font-semibold text-white mb-4">Your Growth Plan</h2>
            
            <div className="bg-[rgba(51,102,255,0.05)] border border-[rgba(51,102,255,0.2)] rounded-lg p-4 mb-4">
              <p className="text-lg text-white leading-relaxed">
                Today I started with <span className="font-bold text-[#3366FF]">${startingAmount}</span>, my return was <span className="font-bold text-[#00C853]">{returnPercentage}%</span>. 
                I need <span className="font-bold text-[#3366FF]">{daysNeeded}</span> more days like today to meet my goal of <span className="font-bold text-[#00C853]">${goalAmount}</span>.
              </p>
            </div>
            
            <div className="bg-[rgba(0,0,0,0.2)] rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Daily Profit</p>
                  <p className="text-base font-medium text-white">${(parseFloat(startingAmount) * parseFloat(returnPercentage) / 100).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Days to Goal</p>
                  <p className="text-base font-medium text-white">{daysNeeded}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Time Frame</p>
                  <p className="text-base font-medium text-white">
                    {daysNeeded < 30 ? `${daysNeeded} trading days` : 
                     daysNeeded < 365 ? `${Math.ceil(daysNeeded / 30)} months` : 
                     `${(daysNeeded / 365).toFixed(1)} years`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Goal Reached By</p>
                  <p className="text-base font-medium text-white">
                    {(() => {
                      const date = new Date();
                      date.setDate(date.getDate() + daysNeeded);
                      return date.toLocaleDateString();
                    })()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Disclaimer */}
        <div className="bg-[rgba(255,61,113,0.05)] border-l-2 border-[#FF3D71] p-4 rounded-md">
          <p className="text-sm text-gray-300">
            <span className="font-medium text-[#FF3D71]">Disclaimer:</span> This calculator provides estimates only. Past performance is not indicative of future results. Trading involves risk and compound rates of return are difficult to sustain over long periods of time.
          </p>
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
    </Layout>
  );
}