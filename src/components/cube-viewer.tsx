
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useCubeStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, FastForward } from 'lucide-react';
import { Progress } from './ui/progress';

const colors = {
  U: 0xffffff, // White
  D: 0xffd500, // Yellow
  F: 0x009b48, // Green
  B: 0x0045ad, // Blue
  R: 0xb71234, // Red
  L: 0xff5800, // Orange
  border: 0x1a1a1a,
  inside: 0x333333,
};

const stickerMaterials = {
    U: new THREE.MeshStandardMaterial({ color: colors.U, roughness: 0.2, metalness: 0.1 }),
    D: new THREE.MeshStandardMaterial({ color: colors.D, roughness: 0.2, metalness: 0.1 }),
    F: new THREE.MeshStandardMaterial({ color: colors.F, roughness: 0.2, metalness: 0.1 }),
    B: new THREE.MeshStandardMaterial({ color: colors.B, roughness: 0.2, metalness: 0.1 }),
    R: new THREE.MeshStandardMaterial({ color: colors.R, roughness: 0.2, metalness: 0.1 }),
    L: new THREE.MeshStandardMaterial({ color: colors.L, roughness: 0.2, metalness: 0.1 }),
};

const PI_2 = Math.PI / 2;

export function CubeViewer() {
  const mountRef = useRef<HTMLDivElement>(null);
  const { solution, setStatus } = useCubeStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);

  // This effect will run once to set up the Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(4, 4, 4);
    camera.lookAt(0,0,0);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);
    
    // Cube creation (placeholder)
    const geometry = new THREE.BoxGeometry(2.5, 2.5, 2.5);
    const material = new THREE.MeshStandardMaterial({
        vertexColors: false,
        roughness: 0.2,
        metalness: 0.1,
    });
    
    const materials = [
        stickerMaterials.R, // right
        stickerMaterials.L, // left
        stickerMaterials.U, // top
        stickerMaterials.D, // bottom
        stickerMaterials.F, // front
        stickerMaterials.B, // back
    ];
    
    const cube = new THREE.Mesh(geometry, materials);
    scene.add(cube);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.005;
      cube.rotation.y += 0.005;
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handlePlayPause = () => setIsPlaying(!isPlaying);

  const handleNext = useCallback(() => {
    setCurrentMoveIndex(i => Math.min(i + 1, solution.length));
  }, [solution.length]);
  
  const handlePrev = () => setCurrentMoveIndex(i => Math.max(i - 1, 0));
  const handleReset = () => {
    setCurrentMoveIndex(0);
    setIsPlaying(false);
  };
  const handleFinish = () => {
    setCurrentMoveIndex(solution.length);
    setIsPlaying(false);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentMoveIndex < solution.length) {
      interval = setInterval(() => {
        handleNext();
      }, 500);
    }
    if (currentMoveIndex === solution.length) {
      setIsPlaying(false);
      setStatus('solved');
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentMoveIndex, solution.length, setStatus, handleNext]);


  return (
    <div className="flex-1 flex flex-col min-h-0 gap-4">
      <Card className="flex-1 relative overflow-hidden bg-card/70">
        <div ref={mountRef} className="w-full h-full" />
        <div className="absolute top-2 right-2 text-xs font-mono text-muted-foreground bg-black/10 px-2 py-1 rounded">
          3D view will be implemented here
        </div>
      </Card>
      {solution.length > 0 && (
        <Card className="p-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={handleReset} disabled={isPlaying}>
                        <RotateCcw className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handlePrev} disabled={isPlaying || currentMoveIndex === 0}>
                        <SkipBack className="w-5 h-5" />
                    </Button>
                </div>
                
                <Button variant="default" size="lg" className="px-8" onClick={handlePlayPause}>
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </Button>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={handleNext} disabled={isPlaying || currentMoveIndex === solution.length}>
                        <SkipForward className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleFinish} disabled={isPlaying}>
                        <FastForward className="w-5 h-5" />
                    </Button>
                </div>
            </div>
            <div className="mt-2 px-2">
                <p className="text-center text-sm text-muted-foreground font-mono">
                    Move {currentMoveIndex} / {solution.length}: <span className="text-foreground font-bold">{solution[currentMoveIndex-1] || '-'}</span>
                </p>
                <Progress value={(currentMoveIndex / (solution.length || 1)) * 100} className="h-2 mt-1" />
            </div>
        </Card>
      )}
    </div>
  );
}
