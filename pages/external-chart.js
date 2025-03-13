// pages/external-chart.js
import { useState, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Upload, ArrowLeft, BarChart2, AlertTriangle, Check, X, RefreshCw
} from 'lucide-react';
import GradientBackground from '../components/GradientBackground';
// Import the Layout component
import Layout from '../components/Layout';

export default function ExternalChartAnalysis() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [symbol, setSymbol] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const fileInputRef = useRef(null);
  
  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.includes('image')) {
        setError('Please select an image file');
        return;
      }
      
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
      setAnalysisResult(null); // Reset previous results
    }
  };
  
  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      if (!file.type.includes('image')) {
        setError('Please select an image file');
        return;
      }
      
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
      setAnalysisResult(null); // Reset previous results
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  
  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };
  
  // Submit image for analysis
  const analyzeChart = async () => {
    if (!selectedImage) {
      setError('Please select an image to analyze');
      return;
    }
    
    if (!symbol.trim()) {
      setError('Please enter a symbol');
      return;
    }
    
    try {
      setIsAnalyzing(true);
      setError(null);
      
      // Convert image to base64
      const base64Image = await fileToBase64(selectedImage);
      
      // Use your existing API route
      const response = await fetch('/api/analyzeChart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
          symbol: symbol.toUpperCase(),
          date: date
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze chart');
      }
      
      const data = await response.json();
      
      // Simply use the analysis text
      setAnalysisResult(data.analysis);
      
    } catch (err) {
      console.error('Error analyzing chart:', err);
      setError('Failed to analyze chart: ' + (err.message || 'Unknown error'));
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Clear the current image and results
  const clearImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setError(null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Parse the analysis to extract key information
  const parseAnalysis = (analysis) => {
    if (!analysis) return {};
    
    // Extract direction (long/short)
    const direction = analysis.match(/\b(long|short)\b/i)?.[0] || '';
    
    // Extract strike prices
    const strikePrices = analysis.match(/\$\d+(\.\d+)?/g) || [];
    
    // Extract percentage/probability mentions
    const percentages = analysis.match(/\d+(\.\d+)?%/g) || [];
    
    return {
      direction,
      strikePrices,
      percentages
    };
  };
  
  const parsedData = parseAnalysis(analysisResult);
  
  return (
    <Layout>
      {/* Gradient Background */}
      <GradientBackground />
      
      <Head>
        <title>External Chart Analysis - ScalpGPT</title>
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
          .glow-green {
            box-shadow: 0 0 15px rgba(0, 200, 83, 0.5);
          }
          .glow-red {
            box-shadow: 0 0 15px rgba(255, 61, 113, 0.5);
          }
          .glow-blue {
            box-shadow: 0 0 15px rgba(51, 102, 255, 0.5);
          }
          .thinking-blob {
            width: 100px;
            height: 100px;
            background: radial-gradient(circle at 50% 50%, rgba(51, 102, 255, 0.9), rgba(51, 102, 255, 0.1));
            border-radius: 50%;
            filter: blur(8px);
            animation: pulse 2s infinite alternate, move 8s infinite alternate;
          }
          @keyframes pulse {
            0% {
              transform: scale(0.8);
              opacity: 0.5;
            }
            100% {
              transform: scale(1.1);
              opacity: 0.8;
            }
          }
          @keyframes move {
            0% {
              transform: translate(-20px, -15px) scale(0.8);
            }
            33% {
              transform: translate(20px, 5px) scale(1);
            }
            66% {
              transform: translate(-10px, 15px) scale(0.9);
            }
            100% {
              transform: translate(15px, -10px) scale(1.1);
            }
          }
          .drop-zone {
            border: 2px dashed rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            transition: all 0.3s ease;
          }
          .drop-zone:hover {
            border-color: var(--blue-color);
            background-color: rgba(51, 102, 255, 0.05);
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
          .analysis-card {
            transition: all 0.3s ease;
            overflow: hidden;
          }
          .analysis-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
          .tag {
            background: rgba(51, 102, 255, 0.1);
            border: 1px solid rgba(51, 102, 255, 0.3);
            border-radius: 999px;
            padding: 2px 10px;
            font-size: 0.875rem;
            transition: all 0.3s ease;
          }
          .tag:hover {
            background: rgba(51, 102, 255, 0.2);
          }
          .form-input {
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            padding: 8px 12px;
            color: white;
            transition: all 0.3s ease;
          }
          .form-input:focus {
            border-color: var(--blue-color);
            outline: none;
          }
        `}</style>
      </Head>
      
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/trading" className="text-gray-400 mb-1 flex items-center hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Back to Dashboard</span>
            </Link>
            <h1 className="text-2xl font-bold text-white mt-2">External Chart Analysis</h1>
            <p className="text-gray-400 mt-1">Upload your own chart images for AI-powered trading insights</p>
          </div>
        </div>
        
        {/* Upload Area */}
        <div className="card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Stock Symbol</label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="form-input w-full"
                placeholder="e.g. AAPL"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Chart Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input w-full"
              />
            </div>
          </div>
          
          <div 
            className="drop-zone p-8 flex flex-col items-center justify-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            
            {!previewUrl ? (
              <>
                <div className="w-16 h-16 rounded-full bg-[rgba(51,102,255,0.1)] flex items-center justify-center mb-4">
                  <Upload className="h-8 w-8 text-[#3366FF]" />
                </div>
                <h2 className="text-lg font-medium mb-2">Drag & Drop or Click to Upload</h2>
                <p className="text-gray-400 text-sm text-center max-w-md">
                  Upload external chart images to analyze patterns and get trading recommendations
                </p>
              </>
            ) : (
              <div className="w-full">
                <div className="flex justify-end mb-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearImage();
                    }}
                    className="p-2 rounded-full hover:bg-[rgba(255,255,255,0.1)]"
                  >
                    <X className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
                <div className="relative rounded-lg overflow-hidden max-h-80 flex justify-center">
                  <img 
                    src={previewUrl} 
                    alt="Chart preview" 
                    className="object-contain max-h-80"
                  />
                </div>
              </div>
            )}
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-[rgba(255,61,113,0.1)] border border-[rgba(255,61,113,0.3)] rounded-md flex items-start">
              <AlertTriangle className="h-5 w-5 text-[#FF3D71] mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#FF3D71]">{error}</p>
            </div>
          )}
          
          <div className="mt-6 flex items-center justify-center">
            <button
              onClick={analyzeChart}
              disabled={!selectedImage || isAnalyzing || !symbol.trim()}
              className={`btn-primary rounded-md py-3 px-6 text-white flex items-center ${!selectedImage || isAnalyzing || !symbol.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <BarChart2 className="h-5 w-5 mr-2" />
                  Analyze Chart
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Analysis Results */}
        {isAnalyzing && (
          <div className="card p-8 flex flex-col items-center justify-center mb-8">
            <div className="thinking-blob mb-6"></div>
            <h3 className="text-lg font-medium mb-2">AI is analyzing your chart...</h3>
            <p className="text-gray-400 text-sm max-w-md text-center">
              Our AI is identifying patterns, support/resistance levels, and generating trading recommendations
            </p>
          </div>
        )}
        
        {analysisResult && !isAnalyzing && (
          <div className="space-y-6 mb-8 animate-fadeInUp">
            <h2 className="text-xl font-semibold">Analysis Results</h2>
            
            {/* Direction and Strike Prices */}
            <div className="card p-6 analysis-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">AI Trading Recommendation</h3>
                {parsedData.direction && (
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    parsedData.direction.toLowerCase() === 'long' 
                      ? 'bg-[rgba(0,200,83,0.1)] text-[#00C853]' 
                      : 'bg-[rgba(255,61,113,0.1)] text-[#FF3D71]'
                  }`}>
                    {parsedData.direction.toUpperCase()}
                  </div>
                )}
              </div>
              
              {parsedData.strikePrices.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm text-gray-400 mb-2">Key Price Targets</h4>
                  <div className="flex flex-wrap gap-2">
                    {parsedData.strikePrices.map((price, index) => (
                      <div key={index} className="tag">
                        {price}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {parsedData.percentages.length > 0 && (
                <div>
                  <h4 className="text-sm text-gray-400 mb-2">Probability/Targets</h4>
                  <div className="flex flex-wrap gap-2">
                    {parsedData.percentages.map((percentage, index) => (
                      <div key={index} className="tag">
                        {percentage}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Full Analysis */}
            <div className="card p-6 analysis-card">
              <h3 className="text-lg font-medium mb-4">Detailed Analysis</h3>
              <div className="prose prose-invert max-w-none">
                {analysisResult.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="text-gray-300 mb-4 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button 
                onClick={() => window.print()}
                className="btn-primary rounded-md py-3 px-6 text-white flex items-center"
              >
                <Check className="h-5 w-5 mr-2" />
                Save Analysis
              </button>
              <button 
                onClick={clearImage}
                className="btn-outline rounded-md py-3 px-6 text-white flex items-center"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                New Analysis
              </button>
            </div>
          </div>
        )}
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