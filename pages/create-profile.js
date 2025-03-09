// pages/create-profile.js
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, Check } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import GradientBackground from '../components/GradientBackground';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// For debugging purposes
console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key exists:", !!supabaseKey);

export default function CreateProfile() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agree: false
  });
  
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Basic validation
    if (!formData.fullName.trim()) {
      return setFormError('Full name is required');
    }
    
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      return setFormError('Valid email is required');
    }
    
    if (!formData.password || formData.password.length < 8) {
      return setFormError('Password must be at least 8 characters');
    }
    
    if (formData.password !== formData.confirmPassword) {
      return setFormError('Passwords do not match');
    }
    
    if (!formData.agree) {
      return setFormError('You must agree to the terms');
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Starting signup process...");
      console.log("Form data:", { 
        email: formData.email, 
        passwordLength: formData.password?.length,
        fullName: formData.fullName 
      });
      
      // Create user with Supabase auth - using the client library
      const authResponse = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          }
        }
      });
      
      console.log("Auth response:", JSON.stringify({
        data: authResponse.data ? {
          user: authResponse.data.user ? { id: authResponse.data.user.id } : null,
          session: authResponse.data.session ? "Session exists" : null
        } : null,
        error: authResponse.error ? {
          message: authResponse.error.message,
          status: authResponse.error.status
        } : null
      }));
      
      if (authResponse.error) {
        throw new Error(`Auth error: ${authResponse.error.message}`);
      }
      
      if (!authResponse.data || !authResponse.data.user) {
        throw new Error('User creation succeeded but no user data returned');
      }
      
      // Get the user ID from the response
      const userId = authResponse.data.user.id;
      console.log("User created with ID:", userId);
      
      // SKIP PROFILE CREATION FOR NOW TO TEST AUTH ONLY
      console.log("Skipping profile creation for debugging");
      
      /* 
      // Create profile entry
      const profileResponse = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            username: formData.email.split('@')[0],
            full_name: formData.fullName
          }
        ]);
      
      console.log("Profile creation response:", profileResponse);
      if (profileResponse.error) {
        console.error('Profile creation error:', profileResponse.error);
        // Continue anyway since the user is created
      }
      */
      
      setFormSuccess(true);
      
    } catch (error) {
      console.error('Registration error:', error);
      setFormError(`Error: ${error.message || 'An unknown error occurred'}`);
      // Log more details about the error
      if (error.cause) console.error('Error cause:', error.cause);
      if (error.stack) console.error('Error stack:', error.stack);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="relative min-h-screen font-sans text-white bg-[#111111]">
      <GradientBackground />
      
      <Head>
        <title>Create Account - ScalpGPT</title>
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
          <div className="bg-[rgba(26,26,31,0.8)] border border-[rgba(255,255,255,0.1)] rounded-lg p-8 mb-8">
            {formSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-[rgba(0,200,83,0.1)] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="h-8 w-8 text-[#00C853]" />
                </div>
                <h2 className="text-2xl font-bold mb-3">Account Created!</h2>
                <p className="text-gray-300 mb-6">
                  Your account has been created successfully. You can now sign in with your credentials.
                </p>
                <button 
                  onClick={() => router.push('/login')}
                  className="bg-[#3366FF] text-white rounded-md py-3 px-8 font-medium"
                >
                  Go to Login
                </button>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold mb-2">Create Your Account</h1>
                <p className="text-gray-400 mb-6">
                  Sign up to get started with ScalpGPT.
                </p>
                
                {formError && (
                  <div className="bg-[rgba(255,61,113,0.1)] border border-[rgba(255,61,113,0.3)] rounded-md p-4 mb-6">
                    <p className="text-[#FF3D71] text-sm">{formError}</p>
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white rounded-md p-3 w-full"
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white rounded-md p-3 w-full"
                        placeholder="you@example.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Password</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white rounded-md p-3 w-full"
                        placeholder="Create a secure password"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Confirm Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white rounded-md p-3 w-full"
                        placeholder="Confirm your password"
                      />
                    </div>
                  </div>
                  
                  {/* Terms Agreement */}
                  <div className="mb-6">
                    <div className="flex items-start">
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
                  </div>
                  
                  {/* Submit Button */}
                  <div className="flex justify-center">
                    <button 
                      type="submit" 
                      className="bg-[#3366FF] text-white rounded-md py-3 px-8 font-medium w-full flex items-center justify-center"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Creating Account..." : "Create Account"}
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