// pages/create-profile.js
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, User, DollarSign, Key, Mail, Check, AlertCircle, Lock } from 'lucide-react';
import GradientBackground from '../components/GradientBackground';
import { supabase } from '../lib/supabaseClient';

export default function CreateProfile() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    tradingExperience: '',
    portfolioSize: '',
    agree: false
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [serverError, setServerError] = useState(null);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.tradingExperience) {
      errors.tradingExperience = 'Please select your experience level';
    }
    
    if (!formData.portfolioSize) {
      errors.portfolioSize = 'Please select your portfolio size';
    }
    
    if (!formData.agree) {
      errors.agree = 'You must agree to the terms';
    }
    
    return errors;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    setFormErrors(errors);
    setServerError(null);
    
    if (Object.keys(errors).length === 0) {
      setIsSubmitting(true);
      
      try {
        // 1. Create the user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
            },
          }
        });
        
        if (authError) throw authError;
        
        // 2. Insert the additional profile data into the profiles table
        // Note: The trigger we set up will create a basic profile, but we need to update it with trading info
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: formData.fullName,
            trading_experience: formData.tradingExperience,
            portfolio_size: formData.portfolioSize,
          })
          .eq('id', authData.user.id);
        
        if (profileError) throw profileError;
        
        // Just set success state - we'll use the button for navigation
        setFormSuccess(true);
        
      } catch (error) {
        console.error('Registration error:', error);
        setServerError(error.message || 'An error occurred while creating your profile. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  return (
    <div className="relative min-h-screen font-sans text-white bg-[#111111]">
      {/* Gradient Background */}
      <GradientBackground />
      
      <Head>
        <title>Create Profile - ScalpGPT</title>
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
          .input-field {
            background-color: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border-color);
            color: white;
            border-radius: 8px;
            padding: 10px 12px;
            transition: all 0.2s;
          }
          .input-field:focus {
            outline: none;
            border-color: var(--blue-color);
            box-shadow: 0 0 0 2px rgba(51, 102, 255, 0.2);
          }
          .btn-primary {
            background-color: var(--blue-color);
            transition: all 0.3s ease;
          }
          .btn-primary:hover:not(:disabled) {
            background-color: #4d7aff;
            transform: translateY(-2px);
          }
          .btn-primary:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }
          .error-shake {
            animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
          }
          @keyframes shake {
            10%, 90% { transform: translate3d(-1px, 0, 0); }
            20%, 80% { transform: translate3d(2px, 0, 0); }
            30%, 50%, 70% { transform: translate3d(-3px, 0, 0); }
            40%, 60% { transform: translate3d(3px, 0, 0); }
          }
          .spinner {
            border: 2px solid rgba(255, 255, 255, 0.1);
            border-top-color: white;
            border-radius: 50%;
            width: 18px;
            height: 18px;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .success-animation {
            animation: scaleIn 0.3s ease-out;
          }
          @keyframes scaleIn {
            from { transform: scale(0); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </Head>
      
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <Link href="/" className="flex items-center">
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span>Back to Home</span>
          </Link>
          
          <div className="flex items-center">
            <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center mr-3">
              <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
            </div>
            <span className="text-xl font-bold text-white">ScalpGPT</span>
          </div>
        </header>
        
        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          <div className="card p-8 mb-8">
            {formSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-[rgba(0,200,83,0.1)] rounded-full flex items-center justify-center mx-auto mb-6 success-animation">
                  <Check className="h-8 w-8 text-[#00C853]" />
                </div>
                <h2 className="text-2xl font-bold mb-3">Profile Created!</h2>
                <p className="text-gray-300 mb-6">
                  Your profile has been created successfully.
                </p>
                <button 
                  onClick={() => window.location.href = '/my-profile'}
                  className="btn-primary text-white rounded-md py-3 px-8 font-medium"
                >
                  Go to My Profile
                </button>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold mb-2">Create Your Trading Profile</h1>
                <p className="text-gray-400 mb-6">
                  Set up your profile to get personalized trading insights and analysis.
                </p>
                
                {serverError && (
                  <div className="bg-[rgba(255,61,113,0.1)] border border-[rgba(255,61,113,0.3)] rounded-md p-4 mb-6">
                    <p className="text-[#FF3D71] text-sm flex items-start">
                      <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                      {serverError}
                    </p>
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Personal Information */}
                    <div>
                      <h3 className="text-lg font-medium mb-4 flex items-center">
                        <User className="h-5 w-5 text-[#3366FF] mr-2" />
                        Personal Information
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">Full Name</label>
                          <div className="relative">
                            <input
                              type="text"
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleChange}
                              className={`input-field w-full ${formErrors.fullName ? 'border-[#FF3D71]' : ''}`}
                              placeholder="Enter your full name"
                            />
                            {formErrors.fullName && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <AlertCircle className="h-5 w-5 text-[#FF3D71]" />
                              </div>
                            )}
                          </div>
                          {formErrors.fullName && (
                            <p className="text-[#FF3D71] text-xs mt-1">{formErrors.fullName}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">Email Address</label>
                          <div className="relative">
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              className={`input-field w-full ${formErrors.email ? 'border-[#FF3D71]' : ''}`}
                              placeholder="you@example.com"
                            />
                            {formErrors.email && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <AlertCircle className="h-5 w-5 text-[#FF3D71]" />
                              </div>
                            )}
                          </div>
                          {formErrors.email && (
                            <p className="text-[#FF3D71] text-xs mt-1">{formErrors.email}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">Password</label>
                          <div className="relative">
                            <input
                              type="password"
                              name="password"
                              value={formData.password}
                              onChange={handleChange}
                              className={`input-field w-full ${formErrors.password ? 'border-[#FF3D71]' : ''}`}
                              placeholder="Create a secure password"
                            />
                            {formErrors.password && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <AlertCircle className="h-5 w-5 text-[#FF3D71]" />
                              </div>
                            )}
                          </div>
                          {formErrors.password && (
                            <p className="text-[#FF3D71] text-xs mt-1">{formErrors.password}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">Confirm Password</label>
                          <div className="relative">
                            <input
                              type="password"
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              className={`input-field w-full ${formErrors.confirmPassword ? 'border-[#FF3D71]' : ''}`}
                              placeholder="Confirm your password"
                            />
                            {formErrors.confirmPassword && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <AlertCircle className="h-5 w-5 text-[#FF3D71]" />
                              </div>
                            )}
                          </div>
                          {formErrors.confirmPassword && (
                            <p className="text-[#FF3D71] text-xs mt-1">{formErrors.confirmPassword}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Trading Preferences */}
                    <div>
                      <h3 className="text-lg font-medium mb-4 flex items-center">
                        <DollarSign className="h-5 w-5 text-[#3366FF] mr-2" />
                        Trading Preferences
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">Trading Experience</label>
                          <select
                            name="tradingExperience"
                            value={formData.tradingExperience}
                            onChange={handleChange}
                            className={`input-field w-full ${formErrors.tradingExperience ? 'border-[#FF3D71]' : ''}`}
                          >
                            <option value="">Select your experience level</option>
                            <option value="beginner">Beginner (0-1 years)</option>
                            <option value="intermediate">Intermediate (1-3 years)</option>
                            <option value="advanced">Advanced (3-5 years)</option>
                            <option value="expert">Expert (5+ years)</option>
                          </select>
                          {formErrors.tradingExperience && (
                            <p className="text-[#FF3D71] text-xs mt-1">{formErrors.tradingExperience}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">Portfolio Size</label>
                          <select
                            name="portfolioSize"
                            value={formData.portfolioSize}
                            onChange={handleChange}
                            className={`input-field w-full ${formErrors.portfolioSize ? 'border-[#FF3D71]' : ''}`}
                          >
                            <option value="">Select your portfolio size</option>
                            <option value="small">$0 - $10,000</option>
                            <option value="medium">$10,000 - $50,000</option>
                            <option value="large">$50,000 - $250,000</option>
                            <option value="xlarge">$250,000+</option>
                          </select>
                          {formErrors.portfolioSize && (
                            <p className="text-[#FF3D71] text-xs mt-1">{formErrors.portfolioSize}</p>
                          )}
                        </div>
                        
                        <div className="bg-[rgba(51,102,255,0.05)] p-4 rounded-md border border-[rgba(51,102,255,0.2)]">
                          <h4 className="text-sm font-medium mb-2 flex items-center">
                            <Lock className="h-4 w-4 text-[#3366FF] mr-2" />
                            Security Reminder
                          </h4>
                          <p className="text-xs text-gray-300">
                            ScalpGPT uses industry-standard encryption to protect your data. We never share your personal information with third parties.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Terms Agreement */}
                  <div className="mb-6">
                    <div className={`flex items-start ${formErrors.agree ? 'error-shake' : ''}`}>
                      <input
                        type="checkbox"
                        id="agree"
                        name="agree"
                        checked={formData.agree}
                        onChange={handleChange}
                        className="mt-1"
                      />
                      <label htmlFor="agree" className="ml-2 text-sm text-gray-300">
                        I agree to the <a href="#" className="text-[#3366FF]">Terms of Service</a> and <a href="#" className="text-[#3366FF]">Privacy Policy</a>
                      </label>
                    </div>
                    {formErrors.agree && (
                      <p className="text-[#FF3D71] text-xs mt-1">{formErrors.agree}</p>
                    )}
                  </div>
                  
                  {/* Submit Button */}
                  <div className="flex justify-center">
                    <button 
                      type="submit" 
                      className="btn-primary text-white rounded-md py-3 px-8 font-medium w-full md:w-auto flex items-center justify-center"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="spinner mr-2"></div>
                          Creating Profile...
                        </>
                      ) : (
                        <>
                          Create Profile
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
          
          {/* Already have an account */}
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Already have an account? <Link href="/login" className="text-[#3366FF]">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}