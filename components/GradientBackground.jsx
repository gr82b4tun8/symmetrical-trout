// GradientBackground.jsx
import React from 'react';

const GradientBackground = () => {
  return (
    <>
      <div className="gradient-background">
        <div className="gradient-overlay"></div>
        <div className="noise-overlay"></div>
      </div>
      
      <style jsx>{`
        .gradient-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          background: linear-gradient(135deg,rgb(0, 0, 0) 0%,rgb(0, 0, 0) 100%);
          opacity: 0.8;
        }
        
        .gradient-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            radial-gradient(circle at 20% 30%, rgb(104, 142, 82) 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, rgb(167, 37, 37) 0%, transparent 40%);
          animation: gradientAnimation 5s ease infinite;
        }
        
        .noise-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.05;
          mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
        
        @keyframes gradientAnimation {
          0% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-2%, -2%) scale(1.05);
          }
          100% {
            transform: translate(0, 0) scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default GradientBackground;