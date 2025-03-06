// pages/login.js
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, Mail, Lock, AlertCircle } from 'lucide-react';
import GradientBackground from '../components/GradientBackground';
import { supabase } from '../lib/supabaseClient';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
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
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
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
        // Handle both newer and older versions of Supabase
        let authResponse;
        
        // Try the newer method first
        try {
          authResponse = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });
        } catch (methodError) {
          // If the newer method fails, try the older method
          console.log("Trying older sign-in method");
          authResponse = await supabase.auth.signIn({
            email: formData.email,
            password: formData.password,
          });
        }
        
        const { error } = authResponse;
        
        if (error) throw error;
        
        // Redirect to profile page on successful login
        console.log("Login successful, redirecting...");
        window.location.href = '/my-profile';
        
      } catch (error) {
        console.error('Login error:', error);
        setServerError('Invalid email or password. Please try again.');
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
        <title>Sign In - ScalpGPT</title>
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
        <div className="max-w-md mx-auto">
          <div className="card p-8 mb-8">
            <h1 className="text-2xl font-bold mb-2">Sign In</h1>
            <p className="text-gray-400 mb-6">
              Welcome back! Enter your credentials to access your account.
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
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`input-field w-full pl-10 ${formErrors.email ? 'border-[#FF3D71]' : ''}`}
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
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`input-field w-full pl-10 ${formErrors.password ? 'border-[#FF3D71]' : ''}`}
                      placeholder="Enter your password"
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
                
                <div className="flex justify-end">
                  <Link href="/forgot-password" className="text-sm text-[#3366FF]">
                    Forgot password?
                  </Link>
                </div>
              </div>
              
              {/* Submit Button */}
              <button 
                type="submit" 
                className="btn-primary text-white rounded-md py-3 px-8 font-medium w-full flex items-center justify-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner mr-2"></div>
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>
          
          {/* Create an account */}
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account? <Link href="/create-profile" className="text-[#3366FF]">Create Profile</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}