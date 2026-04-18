import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface LightPillarProps {
  topColor?: string;
  bottomColor?: string;
  intensity?: number;
  rotationSpeed?: number;
  glowAmount?: number;
  pillarWidth?: number;
  pillarHeight?: number;
  noiseIntensity?: number;
  pillarRotation?: number;
  className?: string;
  mixBlendMode?: React.CSSProperties['mixBlendMode'];
  quality?: 'low' | 'medium' | 'high';
}

const LightPillar: React.FC<LightPillarProps> = ({
  topColor = '#bc00ff',
  bottomColor = '#44004d',
  intensity = 0.9,
  rotationSpeed = 0.3,
  glowAmount = 0.002,
  pillarWidth = 3.0,
  pillarHeight = 0.4,
  noiseIntensity = 0.5,
  pillarRotation = 124,
  className = '',
  mixBlendMode = 'screen',
  quality = 'high'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webGLSupported, setWebGLSupported] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    const getQualitySettings = () => {
      switch (quality) {
        case 'low': return { iterations: 20, precision: 'lowp' as any };
        case 'medium': return { iterations: 40, precision: 'mediump' as any };
        default: return { iterations: 80, precision: 'highp' as any };
      }
    };

    const settings = getQualitySettings();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ 
        alpha: true, 
        antialias: quality !== 'low',
        precision: settings.precision,
        stencil: false,
        depth: false
      });
    } catch (error) {
      console.error('Failed to create WebGL renderer:', error);
      setWebGLSupported(false);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uTopColor: { value: new THREE.Color(topColor) },
        uBottomColor: { value: new THREE.Color(bottomColor) },
        uIntensity: { value: intensity },
        uGlowAmount: { value: glowAmount },
        uNoiseIntensity: { value: noiseIntensity },
        uRotation: { value: (pillarRotation * Math.PI) / 180 },
        uWidth: { value: pillarWidth },
        uHeight: { value: pillarHeight },
        uIterations: { value: settings.iterations }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uTopColor;
        uniform vec3 uBottomColor;
        uniform float uIntensity;
        uniform float uGlowAmount;
        uniform float uNoiseIntensity;
        uniform float uRotation;
        uniform float uWidth;
        uniform float uHeight;
        uniform float uIterations;
        varying vec2 vUv;

        void main() {
          vec2 uv = vUv - 0.5;
          float cosR = cos(uRotation);
          float sinR = sin(uRotation);
          vec2 rotUv = vec2(uv.x * cosR - uv.y * sinR, uv.x * sinR + uv.y * cosR) + 0.5;

          float finalAlpha = 0.0;
          float stepSize = 1.0 / uIterations;

          for(float i = 0.0; i < 1.0; i += 0.0125) {
            if(i >= 1.0) break;
            float dist = abs(rotUv.x - 0.5 + (sin(uTime + i) * 0.001));
            float beam = smoothstep(uWidth * 0.1, 0.0, dist);
            finalAlpha += beam * stepSize;
          }

          float verticalFade = smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.8, vUv.y);
          vec3 color = mix(uBottomColor, uTopColor, vUv.y);
          float noise = fract(sin(dot(vUv + uTime * 0.05, vec2(12.9898, 78.233))) * 43758.5453);
          
          float alpha = finalAlpha * uIntensity * uHeight * 8.0 * verticalFade;
          alpha += noise * uNoiseIntensity * 0.02 * verticalFade;

          gl_FragColor = vec4(color, alpha * (1.0 - uGlowAmount));
        }
      `
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let animationFrameId: number;
    const animate = (time: number) => {
      material.uniforms.uTime.value = time * 0.001 * rotationSpeed;
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate(0);

    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [topColor, bottomColor, intensity, glowAmount, noiseIntensity, pillarRotation, pillarWidth, pillarHeight, quality, rotationSpeed]);

  if (!webGLSupported) {
    return <div className="hidden">WebGL Not Supported</div>;
  }

  return (
    <div ref={containerRef} className={`w-full h-full absolute inset-0 ${className}`} style={{ mixBlendMode }} />
  );
};

export default LightPillar;
