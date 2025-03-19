// pages/external-chart.js
import { useState, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Upload, ArrowLeft, BarChart2, AlertTriangle, Check, X, RefreshCw,
  ArrowUp, ArrowDown, Target, DollarSign, LogOut, HelpCircle
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
  
  // Parse the analysis to extract structured sections with concise recommendations
  const parseStructuredAnalysis = (analysis) => {
    if (!analysis) return {};
    
    const sections = {
      optionType: null,
      strikePrice: null,
      entryPrice: null,
      exitStrategy: null,
      rationale: null
    };
    
    // Extract each section using regex patterns
    const optionTypeMatch = analysis.match(/OPTION TYPE:([^\n]*(?:\n(?!STRIKE PRICE:|ENTRY PRICE:|EXIT STRATEGY:|RATIONALE:)[^\n]*)*)/i);
    if (optionTypeMatch) {
      // Extract just the option type (CALL or PUT)
      const optionText = optionTypeMatch[1].trim();
      if (optionText.toLowerCase().includes('call')) {
        sections.optionType = 'CALL';
      } else if (optionText.toLowerCase().includes('put')) {
        sections.optionType = 'PUT';
      } else {
        sections.optionType = optionText.split('.')[0].trim(); // Take just the first sentence
      }
    }
    
    const strikePriceMatch = analysis.match(/STRIKE PRICE:([^\n]*(?:\n(?!OPTION TYPE:|ENTRY PRICE:|EXIT STRATEGY:|RATIONALE:)[^\n]*)*)/i);
    if (strikePriceMatch) {
      // Extract just the strike price (likely a dollar amount)
      const strikeText = strikePriceMatch[1].trim();
      const priceMatch = strikeText.match(/\$\d+(\.\d+)?/);
      sections.strikePrice = priceMatch ? priceMatch[0] : strikeText.split('.')[0].trim();
    }
    
    const entryPriceMatch = analysis.match(/ENTRY PRICE:([^\n]*(?:\n(?!OPTION TYPE:|STRIKE PRICE:|EXIT STRATEGY:|RATIONALE:)[^\n]*)*)/i);
    if (entryPriceMatch) {
      // Extract just the entry price recommendation
      const entryText = entryPriceMatch[1].trim();
      const priceMatch = entryText.match(/\$\d+(\.\d+)?(\s*-\s*\$\d+(\.\d+)?)?/); // Handles price ranges too
      sections.entryPrice = priceMatch ? priceMatch[0] : entryText.split('.')[0].trim();
    }
    
    const exitStrategyMatch = analysis.match(/EXIT STRATEGY:([^\n]*(?:\n(?!OPTION TYPE:|STRIKE PRICE:|ENTRY PRICE:|RATIONALE:)[^\n]*)*)/i);
    if (exitStrategyMatch) {
      // For exit strategy, keep it concise but include profit target and stop loss
      const exitText = exitStrategyMatch[1].trim();
      // Try to extract just the precise targets
      const profitMatch = exitText.match(/profit target:?\s*\$\d+(\.\d+)?/i);
      const stopMatch = exitText.match(/stop loss:?\s*\$\d+(\.\d+)?/i);
      
      if (profitMatch && stopMatch) {
        sections.exitStrategy = `${profitMatch[0]}; ${stopMatch[0]}`;
      } else {
        // Just take the first sentence if we can't find specific targets
        sections.exitStrategy = exitText.split('.')[0].trim() + '.';
      }
    }
    
    const rationaleMatch = analysis.match(/RATIONALE:([^\n]*(?:\n(?!OPTION TYPE:|STRIKE PRICE:|ENTRY PRICE:|EXIT STRATEGY:)[^\n]*)*)/i);
    if (rationaleMatch) {
      // Keep rationale concise - just the first sentence
      const rationaleText = rationaleMatch[1].trim();
      const firstSentence = rationaleText.split('.')[0].trim() + '.';
      sections.rationale = firstSentence;
    }
    
    return sections;
  };
  
  // Determine if the option type is call or put
  const getOptionTypeDetails = (optionType) => {
    if (!optionType) return { isCall: false, isPut: false };
    
    const lowerCaseText = optionType.toLowerCase();
    const isCall = lowerCaseText.includes('call');
    const isPut = lowerCaseText.includes('put');
    
    return { isCall, isPut };
  };
  
  const parsedSections = parseStructuredAnalysis(analysisResult);
  const optionTypeDetails = getOptionTypeDetails(parsedSections.optionType);
  
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
          .section-card {
            border-left: 4px solid var(--blue-color);
            background: rgba(51, 102, 255, 0.05);
            margin-bottom: 16px;
          }
          .section-card.call {
            border-left-color: var(--green-color);
            background: rgba(0, 200, 83, 0.05);
          }
          .section-card.put {
            border-left-color: var(--red-color);
            background: rgba(255, 61, 113, 0.05);
          }
          .section-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(51, 102, 255, 0.1);
            flex-shrink: 0;
          }
          .section-icon.call {
            background: rgba(0, 200, 83, 0.1);
          }
          .section-icon.put {
            background: rgba(255, 61, 113, 0.1);
          }
          .section-title {
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.8rem;
            letter-spacing: 0.05em;
            color: rgba(255, 255, 255, 0.7);
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
            
            {/* Structured sections display */}
            <div className="card p-6">
              {/* Option Type Section */}
              {parsedSections.optionType && (
                <div className={`section-card p-4 rounded-md ${optionTypeDetails.isCall ? 'call' : optionTypeDetails.isPut ? 'put' : ''}`}>
                  <div className="flex items-start">
                    <div className={`section-icon mr-4 ${optionTypeDetails.isCall ? 'call' : optionTypeDetails.isPut ? 'put' : ''}`}>
                      {optionTypeDetails.isCall ? (
                        <ArrowUp className="h-5 w-5 text-[#00C853]" />
                      ) : optionTypeDetails.isPut ? (
                        <ArrowDown className="h-5 w-5 text-[#FF3D71]" />
                      ) : (
                        <BarChart2 className="h-5 w-5 text-[#3366FF]" />
                      )}
                    </div>
                    <div>
                      <div className="section-title mb-1">Option Type</div>
                      <div className="text-white">{parsedSections.optionType}</div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Strike Price Section */}
              {parsedSections.strikePrice && (
                <div className="section-card p-4 rounded-md">
                  <div className="flex items-start">
                    <div className="section-icon mr-4">
                      <Target className="h-5 w-5 text-[#3366FF]" />
                    </div>
                    <div>
                      <div className="section-title mb-1">Strike Price</div>
                      <div className="text-white">{parsedSections.strikePrice}</div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Entry Price Section */}
              {parsedSections.entryPrice && (
                <div className="section-card p-4 rounded-md">
                  <div className="flex items-start">
                    <div className="section-icon mr-4">
                      <DollarSign className="h-5 w-5 text-[#3366FF]" />
                    </div>
                    <div>
                      <div className="section-title mb-1">Entry Price</div>
                      <div className="text-white">{parsedSections.entryPrice}</div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Exit Strategy Section */}
              {parsedSections.exitStrategy && (
                <div className="section-card p-4 rounded-md">
                  <div className="flex items-start">
                    <div className="section-icon mr-4">
                      <LogOut className="h-5 w-5 text-[#3366FF]" />
                    </div>
                    <div>
                      <div className="section-title mb-1">Exit Strategy</div>
                      <div className="text-white">{parsedSections.exitStrategy}</div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Rationale Section */}
              {parsedSections.rationale && (
                <div className="section-card p-4 rounded-md">
                  <div className="flex items-start">
                    <div className="section-icon mr-4">
                      <HelpCircle className="h-5 w-5 text-[#3366FF]" />
                    </div>
                    <div>
                      <div className="section-title mb-1">Rationale</div>
                      <div className="text-white">{parsedSections.rationale}</div>
                    </div>
                  </div>
                </div>
              )}
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