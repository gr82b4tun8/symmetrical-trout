// pages/help.js
import { useState } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import Link from 'next/link';
import { ArrowLeft, Mail, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import GradientBackground from '../components/GradientBackground';

export default function HelpCenter() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "How do I get started with SoothSayer?",
      answer: "After creating your account, complete your profile with your trading experience and goals. Then, navigate to the Dashboard to access our AI-powered trading insights and analysis tools."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we use industry-standard encryption and security practices to protect your data. We never share your personal information or trading data with third parties without your explicit consent."
    },
    {
      question: "How do the AI trading insights work?",
      answer: "Our algorithms analyze market patterns, historical data, and current trends to provide trading recommendations. These insights are meant to supplement your own research and trading strategy, not replace it."
    },
    {
      question: "Can I connect my brokerage account?",
      answer: "This feature is coming soon. When available, you'll be able to connect your brokerage account for real-time portfolio tracking and analysis."
    },
    {
      question: "What should I do if I encounter a bug?",
      answer: "Please report any bugs or issues directly to our development team at gr82b4tun8@gmail.com with details about what happened and steps to reproduce the issue."
    }
  ];

  return (
    <div className="relative min-h-screen font-sans text-white bg-[#111111]">
      {/* Gradient Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <GradientBackground />
      </div>
      
      <Head>
        <title>Help Center - SoothSayer</title>
        {/* Font links moved to _document.js */}
        <style>{`
          :root {
            --font-primary: 'Inter', sans-serif;
            --blue-color: #3366FF;
            --green-color: #00C853;
            --orange-color: #FF9500;
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
          .help-card {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid var(--border-color);
            transition: all 0.3s ease;
          }
          .help-card:hover {
            border-color: rgba(255, 255, 255, 0.2);
            transform: translateY(-3px);
          }
          .contact-card {
            background: radial-gradient(circle at 70% 70%, rgba(51, 102, 255, 0.05), rgba(0, 200, 83, 0.05));
            backdrop-filter: blur(5px);
          }
          .btn-primary {
            background-color: var(--blue-color);
            transition: all 0.3s ease;
          }
          .btn-primary:hover {
            background-color: #4d7aff;
            transform: translateY(-2px);
          }
          .faq-item {
            border-bottom: 1px solid var(--border-color);
            transition: all 0.3s ease;
          }
          .faq-item:hover {
            background-color: rgba(255, 255, 255, 0.02);
          }
        `}</style>
      </Head>     
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <Link href="/log" className="flex items-center text-white hover:text-gray-300 transition-colors">
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span>Back to Log</span>
          </Link>
          
          <div className="flex items-center">
            <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center mr-3">
              <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
            </div>
            <span className="text-xl font-bold text-white">SoothSayer</span>
          </div>
        </header>
        
        {/* Main Content */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Help Center</h1>
          <p className="text-gray-400 mb-8">Find answers to common questions and learn how to get the most out of SoothSayer.</p>
          
          {/* Contact Card */}
          <div className="card contact-card p-6 mb-10 border border-[rgba(51,102,255,0.2)]">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <MessageSquare className="h-5 w-5 text-[#3366FF] mr-2" />
              Contact Support
            </h2>
            <p className="text-gray-300 mb-4">
              Need personalized help? Reach out to our support team and we'll get back to you as soon as possible.
            </p>
            <div className="flex items-center bg-[rgba(0,0,0,0.2)] p-3 rounded-md">
              <Mail className="h-5 w-5 text-[#3366FF] mr-2" />
              <span className="text-sm font-medium">Dev Email:</span>
              <a 
                href="mailto:gr82b4tun8@gmail.com" 
                className="ml-2 text-[#3366FF] hover:underline"
              >
                gr82b4tun8@gmail.com
              </a>
            </div>
          </div>
          

          
          {/* FAQ Section */}
          <div className="card p-6 mb-10">
            <h2 className="text-xl font-semibold mb-6">Frequently Asked Questions</h2>
            
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`faq-item ${index === faqs.length - 1 ? 'border-b-0' : ''} py-4`}
              >
                <button 
                  className="w-full flex justify-between items-center text-left"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="font-medium">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                
                {openFaq === index && (
                  <div className="mt-2 text-gray-300 text-sm">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Quick Support Links */}
          <div className="text-center mb-8">
            <h3 className="text-lg font-medium mb-4">Still need help?</h3>
            <div className="flex flex-wrap justify-center gap-3">
              <a 
                href="mailto:gr82b4tun8@gmail.com"
                className="btn-primary rounded-md py-2 px-4 font-medium inline-flex items-center"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email Support
              </a>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="text-center text-gray-400 text-sm border-t border-[rgba(255,255,255,0.05)] pt-6 mt-10">
          <p>© 2025 SoothSayer. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}