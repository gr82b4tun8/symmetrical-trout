// pages/my-profile.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, User, DollarSign, LogOut, AlertCircle, Target } from 'lucide-react';
import GradientBackground from '../components/GradientBackground';
import ProtectedRoute from '../components/ProtectedRoute';
import { supabase } from '../lib/supabaseClient';

function MyProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [tradingGoals, setTradingGoals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [goalFormData, setGoalFormData] = useState({
    starting_portfolio_size: '',
    portfolio_goal: ''
  });

  // Experience level label mapping
  const experienceLabels = {
    beginner: 'Beginner (0-1 years)',
    intermediate: 'Intermediate (1-3 years)',
    advanced: 'Advanced (3-5 years)',
    expert: 'Expert (5+ years)'
  };

  // Portfolio size label mapping
  const portfolioLabels = {
    small: '$0 - $10,000',
    medium: '$10,000 - $50,000',
    large: '$50,000 - $250,000',
    xlarge: '$250,000+'
  };

  useEffect(() => {
    async function loadUserProfile() {
      try {
        setLoading(true);
        
        // Get authenticated user (we're already in ProtectedRoute so we know there's a user)
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        
        setUser(user);
        
        // Fetch user profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }
        
        setProfile(profileData);

        // Fetch trading goals data
        const { data: goalsData, error: goalsError } = await supabase
          .from('trading_goals')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (goalsError && goalsError.code !== 'PGRST116') {
          throw goalsError;
        }

        setTradingGoals(goalsData);
        
        // Initialize form data if goals exist
        if (goalsData) {
          setGoalFormData({
            starting_portfolio_size: goalsData.starting_portfolio_size || '',
            portfolio_goal: goalsData.portfolio_goal || ''
          });
        }
        
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    loadUserProfile();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleGoalsFormChange = (e) => {
    const { name, value } = e.target;
    setGoalFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveGoals = async () => {
    try {
      const userId = user.id;
      const numericStartSize = parseFloat(goalFormData.starting_portfolio_size);
      const numericGoal = parseFloat(goalFormData.portfolio_goal);
      
      // Validate input
      if (isNaN(numericStartSize) || isNaN(numericGoal)) {
        return alert('Please enter valid numbers for portfolio values');
      }
      
      if (tradingGoals?.id) {
        // Update existing record
        const { error } = await supabase
          .from('trading_goals')
          .update({
            starting_portfolio_size: numericStartSize,
            portfolio_goal: numericGoal,
          })
          .eq('id', tradingGoals.id);
          
        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('trading_goals')
          .insert({
            user_id: userId,
            starting_portfolio_size: numericStartSize,
            portfolio_goal: numericGoal,
          });
          
        if (error) throw error;
      }
      
      // Refresh data
      const { data, error } = await supabase
        .from('trading_goals')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (error) throw error;
      
      setTradingGoals(data);
      setIsEditingGoals(false);
    } catch (err) {
      console.error('Error saving goals:', err);
      alert('Failed to save goals. Please try again.');
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    if (!value && value !== 0) return 'Not set';
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="relative min-h-screen font-sans text-white bg-[#111111]">
      {/* Gradient Background */}
      <GradientBackground />
      
      <Head>
        <title>My Profile - ScalpGPT</title>
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
          .stat-card {
            background: rgba(255, 255, 255, 0.03);
            border-radius: 8px;
            border: 1px solid var(--border-color);
            transition: all 0.3s ease;
          }
          .stat-card:hover {
            border-color: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
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
          .btn-primary {
            background-color: var(--blue-color);
            transition: all 0.3s ease;
          }
          .btn-primary:hover {
            background-color: #4d7aff;
            transform: translateY(-1px);
          }
          .btn-outline {
            border: 1px solid var(--border-color);
            transition: all 0.3s ease;
          }
          .btn-outline:hover {
            border-color: white;
            background-color: rgba(255, 255, 255, 0.05);
          }
          .btn-danger {
            background-color: rgba(255, 61, 113, 0.1);
            color: var(--red-color);
            border: 1px solid rgba(255, 61, 113, 0.3);
            transition: all 0.3s ease;
          }
          .btn-danger:hover {
            background-color: rgba(255, 61, 113, 0.2);
          }
          .shimmer {
            background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          .input-field {
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            padding: 8px 12px;
            color: white;
            transition: all 0.3s ease;
          }
          .input-field:focus {
            border-color: var(--blue-color);
            outline: none;
          }
        `}</style>
      </Head>
      
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <Link href="/external-chart" className="flex items-center">
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span>Back to Trading</span>
          </Link>
          
          <div className="flex items-center">
            <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center mr-3">
              <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
            </div>
            <span className="text-xl font-bold text-white">ScalpGPT</span>
          </div>
        </header>
        
        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {loading ? (
            // Loading state
            <div className="card p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-20 h-20 rounded-full shimmer"></div>
                <div className="flex-1">
                  <div className="h-7 w-48 rounded shimmer mb-2"></div>
                  <div className="h-5 w-32 rounded shimmer"></div>
                </div>
              </div>
              <div className="h-0.5 w-full bg-[rgba(255,255,255,0.05)] my-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="h-24 rounded-lg shimmer"></div>
                <div className="h-24 rounded-lg shimmer"></div>
              </div>
              <div className="h-0.5 w-full bg-[rgba(255,255,255,0.05)] my-6"></div>
              <div className="space-y-4">
                <div className="h-6 w-32 rounded shimmer"></div>
                <div className="h-5 w-64 rounded shimmer"></div>
                <div className="h-5 w-56 rounded shimmer"></div>
              </div>
            </div>
          ) : error ? (
            // Error state
            <div className="card p-8">
              <div className="flex flex-col items-center justify-center py-8">
                <AlertCircle className="h-12 w-12 text-[#FF3D71] mb-4" />
                <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
                <p className="text-gray-400 mb-6 text-center">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="btn-primary rounded-md py-2 px-6 text-white"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            // Profile data loaded
            <>
              {/* Trading Goals Bubbles Section */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Portfolio Journey</h2>
                  {!isEditingGoals ? (
                    <button 
                      onClick={() => setIsEditingGoals(true)}
                      className="btn-outline rounded-md py-1 px-3 text-sm"
                    >
                      {tradingGoals ? 'Update Goals' : 'Set Goals'}
                    </button>
                  ) : (
                    <div className="space-x-2">
                      <button 
                        onClick={() => setIsEditingGoals(false)}
                        className="btn-outline rounded-md py-1 px-3 text-sm"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={saveGoals}
                        className="btn-primary rounded-md py-1 px-3 text-sm"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>

                {isEditingGoals ? (
                  // Edit mode
                  <div className="card p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Starting Portfolio Size ($)</label>
                        <input
                          type="number"
                          name="starting_portfolio_size"
                          value={goalFormData.starting_portfolio_size}
                          onChange={handleGoalsFormChange}
                          className="input-field w-full"
                          placeholder="e.g. 5000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Portfolio Goal ($)</label>
                        <input
                          type="number"
                          name="portfolio_goal"
                          value={goalFormData.portfolio_goal}
                          onChange={handleGoalsFormChange}
                          className="input-field w-full"
                          placeholder="e.g. 25000"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  // Display mode
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="portfolio-bubble p-6 flex items-center">
                      <div className="rounded-full p-3 bg-[rgba(51,102,255,0.15)] mr-4">
                        <DollarSign className="h-6 w-6 text-[#3366FF]" />
                      </div>
                      <div>
                        <h3 className="text-sm text-gray-300 mb-1">Starting Portfolio</h3>
                        <p className="text-2xl font-bold text-white">
                          {formatCurrency(tradingGoals?.starting_portfolio_size)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="portfolio-bubble p-6 flex items-center">
                      <div className="rounded-full p-3 bg-[rgba(0,200,83,0.15)] mr-4">
                        <Target className="h-6 w-6 text-[#00C853]" />
                      </div>
                      <div>
                        <h3 className="text-sm text-gray-300 mb-1">Portfolio Goal</h3>
                        <p className="text-2xl font-bold text-white">
                          {formatCurrency(tradingGoals?.portfolio_goal)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="card p-8 mb-8">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 mb-8">
                  <div className="w-24 h-24 bg-gradient-to-tr from-[#3366FF] to-[#00C853] rounded-full flex items-center justify-center text-3xl font-bold">
                    {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user?.email.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <h1 className="text-2xl font-bold mb-1">{profile?.full_name || 'Trader'}</h1>
                    <p className="text-gray-400 mb-4">{user?.email}</p>
                    
                    <div className="flex flex-wrap justify-center md:justify-start">
                      <button 
                        onClick={handleSignOut}
                        className="btn-danger rounded-md py-2 px-4 text-sm flex items-center"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="h-px w-full bg-[rgba(255,255,255,0.1)] my-6"></div>
                
                {/* Account Info */}
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <User className="h-5 w-5 text-[#3366FF] mr-2" />
                    Account Information
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm text-gray-400 mb-1">Member Since</h3>
                      <p>{new Date(user?.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm text-gray-400 mb-1">Last Updated</h3>
                      <p>{profile?.updated_at 
                        ? new Date(profile.updated_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) 
                        : 'Not available'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProtectedMyProfile() {
  return (
    <ProtectedRoute>
      <MyProfile />
    </ProtectedRoute>
  );
}