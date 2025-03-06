// pages/my-profile.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, User, DollarSign, PieChart, Briefcase, Calendar, Edit, LogOut, AlertCircle } from 'lucide-react';
import GradientBackground from '../components/GradientBackground';
import ProtectedRoute from '../components/ProtectedRoute';
import { supabase } from '../lib/supabaseClient';

function MyProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Calculate user stats based on profile data
  const userStats = [
    {
      label: 'Experience',
      value: profile?.trading_experience ? experienceLabels[profile.trading_experience] : 'Not specified',
      icon: <Calendar className="h-5 w-5 text-[#3366FF]" />
    },
    {
      label: 'Portfolio Size',
      value: profile?.portfolio_size ? portfolioLabels[profile.portfolio_size] : 'Not specified',
      icon: <Briefcase className="h-5 w-5 text-[#00C853]" />
    }
  ];

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
        `}</style>
      </Head>
      
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <Link href="/trading" className="flex items-center">
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
              <div className="card p-8 mb-8">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 mb-8">
                  <div className="w-24 h-24 bg-gradient-to-tr from-[#3366FF] to-[#00C853] rounded-full flex items-center justify-center text-3xl font-bold">
                    {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user?.email.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <h1 className="text-2xl font-bold mb-1">{profile?.full_name || 'Trader'}</h1>
                    <p className="text-gray-400 mb-4">{user?.email}</p>
                    
                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                      <button className="btn-primary rounded-md py-2 px-4 text-sm flex items-center">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </button>
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
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {userStats.map((stat, index) => (
                    <div key={index} className="stat-card p-4">
                      <div className="flex items-start">
                        <div className="rounded-lg p-2 bg-[rgba(255,255,255,0.05)] mr-3">
                          {stat.icon}
                        </div>
                        <div>
                          <h3 className="text-sm text-gray-400 mb-1">{stat.label}</h3>
                          <p className="text-lg font-medium">{stat.value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
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
              
              {/* Recommended Actions */}
              <div className="card p-6">
                <h2 className="text-lg font-medium mb-4">Recommended Next Steps</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[rgba(51,102,255,0.05)] border border-[rgba(51,102,255,0.2)] rounded-md p-4">
                    <h3 className="font-medium mb-2 flex items-center">
                      <PieChart className="h-4 w-4 text-[#3366FF] mr-2" />
                      Set Trading Goals
                    </h3>
                    <p className="text-sm text-gray-300 mb-3">Define your trading objectives and risk tolerance to get personalized recommendations.</p>
                    <Link href="/trading-goals" className="text-sm text-[#3366FF] font-medium">
                      Get Started &rarr;
                    </Link>
                  </div>
                  <div className="bg-[rgba(0,200,83,0.05)] border border-[rgba(0,200,83,0.2)] rounded-md p-4">
                    <h3 className="font-medium mb-2 flex items-center">
                      <DollarSign className="h-4 w-4 text-[#00C853] mr-2" />
                      Connect Trading Account
                    </h3>
                    <p className="text-sm text-gray-300 mb-3">Link your brokerage account to enable real-time analytics and insights.</p>
                    <Link href="/connect-account" className="text-sm text-[#00C853] font-medium">
                      Connect Now &rarr;
                    </Link>
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