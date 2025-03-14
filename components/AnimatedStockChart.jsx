// components/AnimatedStockChart.jsx
import { useState, useEffect, useCallback, useRef } from 'react';

const AnimatedStockChart = () => {
  const [chartData, setChartData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const animationRef = useRef(null);
  const dataPointsCount = 20;
  const updateInterval = 1000; // 1 second between data updates
  
  // Generate initial data - keeping original logic
  const generateInitialData = useCallback(() => {
    const dataPoints = dataPointsCount;
    const result = [];
    let lastValue = 100;
    
    for (let i = 0; i < dataPoints; i++) {
      // Create an upward trend with some volatility - keeping original logic
      const change = (Math.random() * 5) - 1.5;
      lastValue = lastValue + change;
      result.push({ x: i, y: lastValue });
    }
    
    return result;
  }, []);
  
  // Update chart data with animation - keeping original pattern
  const updateChartData = useCallback(() => {
    setChartData(prevData => {
      if (prevData.length === 0) return generateInitialData();
      
      const newData = [...prevData];
      
      // Shift all values left - keeping original logic
      for (let i = 0; i < newData.length - 1; i++) {
        newData[i].y = newData[i + 1].y;
      }
      
      // Add new value at the end with movement up and down - keeping original logic
      const lastValue = newData[newData.length - 1].y;
      // Same random movement as original - up to 4 points up or 3 points down
      const change = (Math.random() * 7) - 3;
      newData[newData.length - 1].y = lastValue + change;
      
      return newData;
    });
    
    // Schedule next update with original timing patterns but slightly slower
    setTimeout(updateChartData, updateInterval);
  }, [generateInitialData]);
  
  // Smooth transition effect between data updates
  useEffect(() => {
    if (chartData.length === 0) return;
    
    // Start from current display data if it exists, otherwise start from chart data
    const startData = displayData.length > 0 ? [...displayData] : [...chartData];
    
    // Create animation frames for smooth transition
    const totalFrames = 30; // More frames = smoother animation
    let currentFrame = 0;
    
    const animateTransition = () => {
      if (currentFrame < totalFrames) {
        // Calculate interpolated values for this frame
        const progress = currentFrame / totalFrames;
        // Ease in-out function for smoother movement
        const easedProgress = progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        const interpolatedData = startData.map((point, index) => ({
          x: point.x,
          y: point.y + (chartData[index].y - point.y) * easedProgress
        }));
        
        setDisplayData(interpolatedData);
        currentFrame++;
        animationRef.current = requestAnimationFrame(animateTransition);
      }
    };
    
    animationRef.current = requestAnimationFrame(animateTransition);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [chartData]);
  
  // Set up and clean up animation
  useEffect(() => {
    // Initialize with data
    const initialData = generateInitialData();
    setChartData(initialData);
    setDisplayData(initialData);
    
    // Start animation loop - slightly slower than original
    const timeoutId = setTimeout(updateChartData, updateInterval);
    
    // Clean up animation on unmount
    return () => {
      clearTimeout(timeoutId);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [generateInitialData, updateChartData]);
  
  // Draw the SVG chart path using the interpolated displayData
  const getPath = () => {
    if (displayData.length === 0) return '';
    
    const height = 200;
    const width = 600;
    const maxValue = Math.max(...displayData.map(d => d.y)) + 5; // Add padding
    const minValue = Math.min(...displayData.map(d => d.y)) - 5; // Add padding
    const range = maxValue - minValue;
    
    const scaleY = (value) => height - ((value - minValue) / range) * height;
    const scaleX = (index) => (index / (displayData.length - 1)) * width;
    
    let path = `M${scaleX(0)},${scaleY(displayData[0].y)}`;
    
    for (let i = 1; i < displayData.length; i++) {
      path += ` L${scaleX(i)},${scaleY(displayData[i].y)}`;
    }
    
    return path;
  };
  
  // Get area path (for gradient fill under line)
  const getAreaPath = () => {
    if (displayData.length === 0) return '';
    
    const path = getPath();
    const height = 200;
    const width = 600;
    
    return `${path} L${width},${height} L0,${height} Z`;
  };
  
  // Calculate last point position for the pulsing dot
  const getLastPointPosition = () => {
    if (displayData.length === 0) return { x: 0, y: 0 };
    
    const height = 200;
    const width = 600;
    const maxValue = Math.max(...displayData.map(d => d.y)) + 5;
    const minValue = Math.min(...displayData.map(d => d.y)) - 5;
    const range = maxValue - minValue;
    
    const scaleY = (value) => height - ((value - minValue) / range) * height;
    const lastPoint = displayData[displayData.length - 1];
    
    return {
      x: width,
      y: scaleY(lastPoint.y)
    };
  };

  const lastPoint = getLastPointPosition();

  return (
    <div className="w-full h-64 md:h-80 relative overflow-hidden">
      <svg width="100%" height="100%" viewBox="0 0 600 200" preserveAspectRatio="none">
        {/* Grid lines for better visualization */}
        <g className="grid-lines">
          {[0, 50, 100, 150, 200].map((y) => (
            <line 
              key={`grid-${y}`} 
              x1="0" 
              y1={y} 
              x2="600" 
              y2={y} 
              stroke="rgba(255,255,255,0.1)" 
              strokeWidth="1" 
            />
          ))}
        </g>
        
        {/* Gradient area under the line */}
        <defs>
          <linearGradient id="gradientArea" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#008000" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FF0000" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Area under the line */}
        <path
          d={getAreaPath()}
          fill="url(#gradientArea)"
          stroke="none"
        />
        
        {/* Line chart */}
        <path
          d={getPath()}
          fill="none"
          stroke="#3366FF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Animated pulse dot at the end of the line */}
        {displayData.length > 0 && (
          <>
            <circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r="6"
              fill="rgba(51, 102, 255, 0.3)"
              className="animate-ping"
            />
            <circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r="4"
              fill="#3366FF"
            />
          </>
        )}
      </svg>
    </div>
  );
};

export default AnimatedStockChart;