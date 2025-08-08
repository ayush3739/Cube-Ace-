
'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { useCubeStore, ColorScheme } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, FastForward, Eye, EyeOff, Info } from 'lucide-react';
import { Progress } from './ui/progress';

const PI_2 = Math.PI / 2;

const createStickerMaterials = (colorScheme: ColorScheme) => ({
    U: new THREE.MeshStandardMaterial({ color: colorScheme.U, roughness: 0.2, metalness: 0.1 }),
    D: new THREE.MeshStandardMaterial({ color: colorScheme.D, roughness: 0.2, metalness: 0.1 }),
    F: new THREE.MeshStandardMaterial({ color: colorScheme.F, roughness: 0.2, metalness: 0.1 }),
    B: new THREE.MeshStandardMaterial({ color: colorScheme.B, roughness: 0.2, metalness: 0.1 }),
    R: new THREE.MeshStandardMaterial({ color: colorScheme.R, roughness: 0.2, metalness: 0.1 }),
    L: new THREE.MeshStandardMaterial({ color: colorScheme.L, roughness: 0.2, metalness: 0.1 }),
});

export function CubeViewer() {
  const mountRef = useRef<HTMLDivElement>(null);
  const { solution, setStatus, colorScheme } = useCubeStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [solutionVisible, setSolutionVisible] = useState(false);

  const stickerMaterials = useMemo(() => createStickerMaterials(colorScheme), [colorScheme]);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(4, 4, 4);
    camera.lookAt(0,0,0);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);
    
    const geometry = new THREE.BoxGeometry(2.5, 2.5, 2.5);
    
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

    const animate = () => {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.005;
      cube.rotation.y += 0.005;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [stickerMaterials]); // Re-run effect if materials change

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
    if (currentMoveIndex === solution.length && solution.length > 0) {
      setIsPlaying(false);
      setStatus('solved');
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentMoveIndex, solution.length, setStatus, handleNext]);

  return (
    <div className="flex-1 flex flex-col min-h-0 gap-4">
      <Card className="flex-1 relative overflow-hidden bg-card/70">
        <div ref={mountRef} className="w-full h-full" />
         <Card className="absolute bottom-2 left-2 p-3 bg-card/80 backdrop-blur-sm max-w-xs">
            <h4 className="font-bold flex items-center gap-2 mb-2"><Info className="w-4 h-4"/>Cube Orientation</h4>
            <div className="grid grid-cols-3 gap-x-3 gap-y-1 text-sm">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor: colorScheme.F}}/>Front (F)</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor: colorScheme.B}}/>Back (B)</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor: colorScheme.U}}/>Up (U)</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor: colorScheme.D}}/>Down (D)</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor: colorScheme.L}}/>Left (L)</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor: colorScheme.R}}/>Right (R)</div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Hold the cube with the Front face towards you and the Up face on top.</p>
        </Card>
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
            <div className="mt-4 px-2 text-center">
              <Button variant="outline" size="sm" onClick={() => setSolutionVisible(!solutionVisible)}>
                {solutionVisible ? <EyeOff className="mr-2" /> : <Eye className="mr-2" />}
                {solutionVisible ? 'Hide' : 'Reveal'} full solution
              </Button>
              {solutionVisible && (
                 <Card className="mt-2 p-3 bg-muted">
                    <p className="font-mono text-sm text-left whitespace-pre-wrap break-words">
                      {solution.join(' ')}
                    </p>
                 </Card>
              )}
            </div>
        </Card>
      )}
    </div>
  );
}
