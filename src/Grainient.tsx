import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';

interface GrainientProps {
  color1?: string;
  color2?: string;
  color3?: string;
  timeSpeed?: number;
  colorBalance?: number;
  warpStrength?: number;
  warpFrequency?: number;
  warpSpeed?: number;
  warpAmplitude?: number;
  blendAngle?: number;
  blendSoftness?: number;
  rotationAmount?: number;
  noiseScale?: number;
  grainAmount?: number;
  grainScale?: number;
  grainAnimated?: boolean;
  contrast?: number;
  gamma?: number;
  saturation?: number;
  centerX?: number;
  centerY?: number;
  zoom?: number;
  className?: string;
}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform float uTime;
  uniform float uColorBalance;
  uniform float uWarpStrength;
  uniform float uWarpFrequency;
  uniform float uWarpSpeed;
  uniform float uWarpAmplitude;
  uniform float uBlendAngle;
  uniform float uBlendSoftness;
  uniform float uRotationAmount;
  uniform float uNoiseScale;
  uniform float uGrainAmount;
  uniform float uGrainScale;
  uniform bool uAnimateGrain;
  uniform float uContrast;
  uniform float uGamma;
  uniform float uSaturation;
  uniform vec2 uCenter;
  uniform float uZoom;
  varying vec2 vUv;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = (vUv - 0.5) / uZoom + 0.5 + uCenter;
    float t = uTime * uWarpSpeed;
    
    float noise = snoise(uv * uWarpFrequency + t);
    vec2 warp = vec2(snoise(uv + noise * uWarpStrength), snoise(uv + noise * uWarpStrength + 10.0));
    vec2 warpedUv = uv + warp * uWarpAmplitude;
    
    float angle = uBlendAngle + snoise(warpedUv * uNoiseScale) * uRotationAmount;
    float rad = angle * 3.14159 / 180.0;
    vec2 dir = vec2(cos(rad), sin(rad));
    float mixVal = dot(warpedUv - 0.5, dir) + 0.5;
    mixVal = smoothstep(0.5 - uBlendSoftness, 0.5 + uBlendSoftness, mixVal + uColorBalance);
    
    vec3 color = mix(uColor1, mix(uColor2, uColor3, mixVal), mixVal);
    
    float grainTime = uAnimateGrain ? uTime : 0.0;
    float grain = fract(sin(dot(vUv + grainTime, vec2(12.9898, 78.233))) * 43758.5453);
    color += (grain - 0.5) * uGrainAmount;
    
    color = pow(color, vec3(uGamma));
    color = mix(vec3(dot(color, vec3(0.299, 0.587, 0.114))), color, uSaturation);
    color = (color - 0.5) * uContrast + 0.5;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

const GrainientScene: React.FC<GrainientProps> = (props) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();

  const uniforms = useMemo(() => ({
    uColor1: { value: new THREE.Color(props.color1 || '#612F74') },
    uColor2: { value: new THREE.Color(props.color2 || '#662c9e') },
    uColor3: { value: new THREE.Color(props.color3 || '#8c2cac') },
    uTime: { value: 0 },
    uColorBalance: { value: props.colorBalance ?? 0 },
    uWarpStrength: { value: props.warpStrength ?? 1.9 },
    uWarpFrequency: { value: props.warpFrequency ?? 0.8 },
    uWarpSpeed: { value: props.warpSpeed ?? 1.0 },
    uWarpAmplitude: { value: props.warpAmplitude ?? 0.1 },
    uBlendAngle: { value: props.blendAngle ?? 40 },
    uBlendSoftness: { value: props.blendSoftness ?? 0.5 },
    uRotationAmount: { value: props.rotationAmount ?? 560 },
    uNoiseScale: { value: props.noiseScale ?? 0.9 },
    uGrainAmount: { value: props.grainAmount ?? 0.05 },
    uGrainScale: { value: props.grainScale ?? 0.2 },
    uAnimateGrain: { value: props.grainAnimated ?? true },
    uContrast: { value: props.contrast ?? 1.15 },
    uGamma: { value: props.gamma ?? 1.0 },
    uSaturation: { value: props.saturation ?? 1.0 },
    uCenter: { value: new THREE.Vector2(props.centerX ?? 0, props.centerY ?? 0) },
    uZoom: { value: props.zoom ?? 0.65 }
  }), [props]);

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.getElapsedTime() * (props.timeSpeed ?? 1.0);
    }
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};

const Grainient: React.FC<GrainientProps> = (props) => {
  return (
    <div className={`w-full h-full min-h-[300px] ${props.className || ''}`}>
      <Canvas camera={{ position: [0, 0, 1] }} dpr={[1, 2]}>
        <GrainientScene {...props} />
      </Canvas>
    </div>
  );
};

export default Grainient;
