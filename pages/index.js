// pages/index.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { BarChart2, TrendingUp, User, ChevronRight, LogIn } from 'lucide-react';
import dynamic from 'next/dynamic';
import GradientBackground from '../components/GradientBackground';

// Dynamically import the chart component with no SSR to avoid hydration issues
const AnimatedStockChart = dynamic(() => import('../components/AnimatedStockChart'), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="relative min-h-screen font-sans text-white bg-[#111111]">
      {/* Gradient Background with fixed positioning to ensure visibility */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <GradientBackground />
      </div>
      
      <Head>
        <title>SoothSayer - AI-Powered Trading Analysis</title>
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
          }
          .card {
            background: var(--card-bg);
            border-radius: 12px;
            backdrop-filter: blur(10px);
            border: 1px solid var(--border-color);
          }
          .btn-primary {
            background-color: var(--blue-color);
            transition: all 0.3s ease;
          }
          .btn-primary:hover {
            background-color: #4d7aff;
            transform: translateY(-2px);
            box-shadow: 0 10px 25px -5px rgba(51, 102, 255, 0.4);
          }
          .btn-outline {
            border: 1px solid var(--border-color);
            transition: all 0.3s ease;
          }
          .btn-outline:hover {
            border-color: white;
            background-color: rgba(255, 255, 255, 0.1);
          }
          .pulse-effect {
            animation: pulseEffect 2s infinite;
          }
          @keyframes pulseEffect {
            0% { box-shadow: 0 0 0 0 rgba(51, 102, 255, 0.7); }
            70% { box-shadow: 0 0 0 15px rgba(51, 102, 255, 0); }
            100% { box-shadow: 0 0 0 0 rgba(51, 102, 255, 0); }
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
          /* Add new animation for the pulse effect */
          @keyframes ping {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            75%, 100% {
              transform: scale(2);
              opacity: 0;
            }
          }
          .animate-ping {
            animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          }
        `}</style>
      </Head>
      
      {/* Content with higher z-index to appear above gradient */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 md:py-20">
        {/* Header/Nav */}
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center">
            <div className="h-10 w-10 flex items-center justify-center mr-3">
              <img src="/logo2.png" alt="SoothSayer Logo" className="h-10 w-10 rounded-full object-cover" />
            </div>
            <span className="text-xl font-bold text-white">SoothSayer</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/login" className="flex items-center text-white px-4 py-2 rounded-md text-sm btn-outline">
              <LogIn className="h-4 w-4 mr-2" />
              <span>Sign In</span>
            </Link>
            <Link href="/trading" className="bg-[rgba(255,255,255,0.05)] px-4 py-2 rounded-md text-sm hover:bg-[rgba(255,255,255,0.1)] transition-colors">
              <span>Go to Dashboard</span>
            </Link>
          </div>
        </header>
        
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              AI-Powered <span className="text-[#3366FF]">Trading Analysis</span> at Your Fingertips
            </h1>
            <p className="text-gray-300 text-lg mb-8">
              Gain an edge in the market with real-time AI insights. Analyze patterns, predict trends, and make data-driven decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/create-profile" className="btn-primary pulse-effect text-white rounded-md py-3 px-6 font-medium text-center flex items-center justify-center">
                <User className="h-5 w-5 mr-2" />
                <span>Create Your Profile</span>
                <ChevronRight className="h-5 w-5 ml-2" />
              </Link>
              <Link href="/login" className="bg-[rgba(255,255,255,0.05)] text-white rounded-md py-3 px-6 font-medium text-center hover:bg-[rgba(255,255,255,0.1)] transition-colors flex items-center justify-center">
                <LogIn className="h-5 w-5 mr-2" />
                <span>Sign In</span>
              </Link>
            </div>
          </div>
          
          <div className="card p-6 animate-float">
            <div className="bg-[rgba(0,0,0,0.2)] p-3 rounded-md mb-3">
              <div className="flex items-center mb-2">
                <BarChart2 className="h-4 w-4 text-[#3366FF] mr-2" />
                <span className="text-sm text-white font-medium">Live Market Trends</span>
              </div>
              
              <AnimatedStockChart />
              
              <div className="mt-3 flex justify-between items-center">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-[#00C853] mr-1" />
                  <span className="text-xs text-[#00C853]">+2.8%</span>
                </div>
                <span className="text-xs text-gray-400">Updated just now</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="mb-24">
          <h2 className="text-2xl font-bold mb-12 text-center">Why Choose SoothSayer</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "AI-Powered Analysis",
                description: "Our advanced algorithms analyze patterns and predict market movements in real-time."
              },
              {
                title: "Custom Alerts",
                description: "Set personalized alerts for price movements, trend changes, and market opportunities."
              },
              {
                title: "Portfolio Tracking",
                description: "Keep track of your investments and monitor progress toward your financial goals."
              }
            ].map((feature, index) => (
              <div key={index} className="card p-6 hover:border-[#3366FF] transition-colors">
                <div className="w-10 h-10 rounded-full bg-[rgba(51,102,255,0.1)] flex items-center justify-center mb-4">
                  <span className="text-[#3366FF] font-bold">{index + 1}</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="card p-8 text-center mb-16">
          <h2 className="text-2xl font-bold mb-4">Ready to start trading smarter?</h2>
          <p className="text-gray-300 mb-6 max-w-lg mx-auto">
            Create your profile now and gain access to our full suite of AI-powered trading tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create-profile" className="btn-primary text-white rounded-md py-3 px-8 font-medium inline-block">
              Get Started Now
            </Link>
            <Link href="/login" className="bg-[rgba(255,255,255,0.05)] text-white rounded-md py-3 px-8 font-medium inline-block hover:bg-[rgba(255,255,255,0.1)] transition-colors">
              Sign In to Your Account
            </Link>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="text-center text-gray-400 text-sm">
          <p>© 2025 SoothSayer. All rights reserved.</p>
        </footer>
      </div>
      
      {/* Global animations */}
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