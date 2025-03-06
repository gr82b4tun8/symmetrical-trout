// WebGLBackground.jsx
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Simplified plane with custom shader
function GradientPlane() {
  const meshRef = useRef();
  const [time, setTime] = useState(0);
  
  // Simple animation loop
  useFrame(({ clock }) => {
    setTime(clock.getElapsedTime() * 0.2);
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.1) * 0.1;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}
    >
      <planeGeometry args={[10, 10, 16, 16]} />
      <meshBasicMaterial>
        <gradientTexture
          attach="map"
          stops={[0, 1]}
          colors={['#008000', '#710C04']}
        />
      </meshBasicMaterial>
    </mesh>
  );
}

// Simple error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("WebGL rendering failed:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any fallback UI
      return null;
    }

    return this.props.children; 
  }
}

// The main component with proper error handling
export default function WebGLBackground() {
  const [renderError, setRenderError] = useState(false);

  useEffect(() => {
    // Set a timeout to detect renderer failure
    const timeout = setTimeout(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        console.log('Canvas rendering issue detected');
        setRenderError(true);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  if (renderError) {
    return null;
  }

  return (
    <ErrorBoundary>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
      }}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          gl={{ 
            antialias: true,
            alpha: true,
            powerPreference: 'default',
            failIfMajorPerformanceCaveat: false
          }}
          style={{ background: 'black' }}
          onError={(e) => {
            console.error("Canvas error:", e);
            setRenderError(true);
          }}
        >
          <ambientLight intensity={1} />
          <GradientPlane />
        </Canvas>
      </div>
    </ErrorBoundary>
  );
}