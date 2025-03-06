// BackgroundShader.jsx
import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Water plane vertex shader
const waterVertexShader = `
  uniform float uTime;
  uniform float uFrequency;
  uniform float uAmplitude;
  uniform float uSpeed;
  uniform float uDensity;

  varying vec2 vUv;
  varying float vElevation;

  void main() {
    vUv = uv;
    
    // Create sine wave displacement
    float elevation = 
      sin(position.x * uFrequency + uTime * uSpeed) * 
      sin(position.z * uFrequency * uDensity + uTime * uSpeed) * 
      uAmplitude;
      
    vElevation = elevation;
    
    vec3 newPosition = position;
    newPosition.y += elevation;

    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    
    gl_Position = projectedPosition;
  }
`;

// Water plane fragment shader
const waterFragmentShader = `
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform float uTime;
  uniform float uStrength;

  varying vec2 vUv;
  varying float vElevation;

  void main() {
    float mixStrength = (vElevation + uStrength) * 0.5;
    
    // Create gradient between colors based on elevation
    vec3 color = mix(
      mix(uColor1, uColor2, vUv.y),
      uColor3,
      mixStrength
    );
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

// Camera adjustment to ensure proper view of the plane
function CameraSetup() {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(0, 1, 5);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  
  return null;
}

function WaterPlane() {
  const meshRef = useRef();
  const materialRef = useRef();

  // Convert hex colors to THREE.Color objects
  const color1 = new THREE.Color('#5606FF');
  const color2 = new THREE.Color('#FE8989');
  const color3 = new THREE.Color('#000000');

  // Animation loop
  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <mesh 
      ref={meshRef} 
      position={[0, 0, 0]}
      rotation={[Math.PI / 4, 0, Math.PI / 6]}
      scale={[3, 3, 3]}
    >
      <planeGeometry args={[5, 5, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={waterVertexShader}
        fragmentShader={waterFragmentShader}
        side={THREE.DoubleSide}
        transparent={true}
        uniforms={{
          uTime: { value: 0 },
          uFrequency: { value: 5.5 },
          uAmplitude: { value: 0.2 },
          uSpeed: { value: 0.4 },
          uDensity: { value: 1.1 },
          uStrength: { value: 2.4 },
          uColor1: { value: color1 },
          uColor2: { value: color2 },
          uColor3: { value: color3 }
        }}
      />
    </mesh>
  );
}

export default function BackgroundShader() {
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none', // Allows clicks to pass through
        overflow: 'hidden',
      }}
    >
      <Canvas 
        gl={{ 
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true
        }}
        dpr={[1, 2]} // Responsive pixel ratio
        style={{ background: 'linear-gradient(to bottom, #000000, #121212)' }}
      >
        <CameraSetup />
        <ambientLight intensity={1.5} />
        <fog attach="fog" args={['#000000', 1, 10]} />
        <WaterPlane />
      </Canvas>
    </div>
  );
}