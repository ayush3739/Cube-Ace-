
'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useCubeStore, ColorScheme, SOLVED_CUBE_CONFIG } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, FastForward, Eye, EyeOff, Info } from 'lucide-react';
import { Progress } from './ui/progress';
import { applyMove, getInitialCube, Cube, cubeConfigToCube } from '@/lib/cube-utils';

const PI_2 = Math.PI / 2;

const createStickerMaterials = (colorScheme: ColorScheme) => ({
    W: new THREE.MeshBasicMaterial({ color: colorScheme.U }), // White on Up face
    Y: new THREE.MeshBasicMaterial({ color: colorScheme.D }), // Yellow on Down face
    G: new THREE.MeshBasicMaterial({ color: colorScheme.F }), // Green on Front face
    B: new THREE.MeshBasicMaterial({ color: colorScheme.B }), // Blue on Back face
    R: new THREE.MeshBasicMaterial({ color: colorScheme.R }), // Red on Right face
    O: new THREE.MeshBasicMaterial({ color: colorScheme.L }), // Orange on Left face
    Core: new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.5, metalness: 0.2 }),
});

export function CubeViewer() {
  const mountRef = useRef<HTMLDivElement>(null);
  const { solution, setStatus, colorScheme, resetCube, scramble, cubeConfig } = useCubeStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [solutionVisible, setSolutionVisible] = useState(false);
  const [cube, setCube] = useState<Cube>(getInitialCube());
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cubeGroupRef = useRef<THREE.Group | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const stickerMaterials = useMemo(() => createStickerMaterials(colorScheme), [colorScheme]);

  const resetCubeToScrambledOrConfig = useCallback(() => {
    let newCube: Cube;
    if (scramble) {
      newCube = getInitialCube();
      const moves = scramble.split(' ').filter(m => m);
      moves.forEach(move => {
        newCube = applyMove(newCube, move);
      });
    } else {
      newCube = cubeConfigToCube(cubeConfig);
    }
    setCube(newCube);
    setCurrentMoveIndex(0);
  }, [scramble, cubeConfig]);


  const applySolutionMoves = useCallback((targetMoveIndex: number) => {
    let currentCube;
    if (scramble) {
        currentCube = getInitialCube();
        const scrambleMoves = scramble.split(' ').filter(m => m);
        scrambleMoves.forEach(move => {
            currentCube = applyMove(currentCube, move);
        });
    } else {
        currentCube = cubeConfigToCube(cubeConfig);
    }

    const solutionMoves = solution.slice(0, targetMoveIndex);
    solutionMoves.forEach(move => {
      currentCube = applyMove(currentCube, move);
    });
    setCube(currentCube);
  }, [solution, scramble, cubeConfig]);


  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(50, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(4, 4, 6);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.5;
    controls.minDistance = 5;
    controls.maxDistance = 20;
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);
    
    const group = new THREE.Group();
    cubeGroupRef.current = group;
    scene.add(group);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
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
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      controls.dispose();
    };
  }, []);

  useEffect(() => {
    const group = cubeGroupRef.current;
    if (!group) return;

    // Clear previous cubies
    while(group.children.length > 0){ 
        group.remove(group.children[0]); 
    }

    const stickerSize = 0.9;
    const stickerGeo = new THREE.PlaneGeometry(stickerSize, stickerSize);

    for (let i = 0; i < 27; i++) {
        const cubieData = cube[i];
        if (!cubieData) continue;
    
        const cubie = new THREE.Group();
        const coreGeo = new THREE.BoxGeometry(1, 1, 1);
        const core = new THREE.Mesh(coreGeo, stickerMaterials.Core);
        cubie.add(core);

        const faces = ['U', 'D', 'F', 'B', 'R', 'L'] as const;
        faces.forEach(face => {
            const color = cubieData[face];
            if (color && stickerMaterials[color]) {
                const sticker = new THREE.Mesh(stickerGeo, stickerMaterials[color]);
                const offset = 0.51;
                switch (face) {
                    case 'U': sticker.position.set(0, offset, 0); sticker.rotation.set(-PI_2, 0, 0); break;
                    case 'D': sticker.position.set(0, -offset, 0); sticker.rotation.set(PI_2, 0, 0); break;
                    case 'R': sticker.position.set(offset, 0, 0); sticker.rotation.set(0, PI_2, 0); break;
                    case 'L': sticker.position.set(-offset, 0, 0); sticker.rotation.set(0, -PI_2, 0); break;
                    case 'F': sticker.position.set(0, 0, offset); break;
                    case 'B': sticker.position.set(0, 0, -offset); sticker.rotation.set(0, Math.PI, 0); break;
                }
                cubie.add(sticker);
            }
        });

        cubie.position.set(
            (i % 3) - 1,
            -1 * (Math.floor((i % 9) / 3) - 1), // Invert Y
            -1 * (Math.floor(i / 9) - 1)       // Invert Z
        );
        cubie.rotation.set(0, 0, 0);
        group.add(cubie);
    }
  }, [cube, stickerMaterials, colorScheme]);

  useEffect(() => {
    resetCubeToScrambledOrConfig();
  }, [scramble, cubeConfig, resetCubeToScrambledOrConfig]);
  
  useEffect(() => {
    applySolutionMoves(currentMoveIndex);
  }, [currentMoveIndex, applySolutionMoves]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);

  const handleNext = useCallback(() => {
    setCurrentMoveIndex(i => Math.min(i + 1, solution.length));
  }, [solution.length]);
  
  const handlePrev = () => setCurrentMoveIndex(i => Math.max(i - 1, 0));
  
  const handleReset = () => {
    setCurrentMoveIndex(0);
    setIsPlaying(false);
    resetCube();
    resetCubeToScrambledOrConfig();
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
  
  useEffect(() => {
    // Reset animation when a new solution is generated
    setCurrentMoveIndex(0);
    setIsPlaying(false);
    resetCubeToScrambledOrConfig();
  }, [solution, resetCubeToScrambledOrConfig]);

  return (
    <div className="flex-1 flex flex-col min-h-0 gap-4">
      <Card className="flex-1 relative overflow-hidden bg-card/70">
        <div ref={mountRef} className="w-full h-full" />
         <Card className="absolute bottom-2 left-2 p-3 bg-card/80 backdrop-blur-sm max-w-xs">
            <h4 className="font-bold flex items-center gap-2 mb-2"><Info className="w-4 h-4"/>Cube Orientation</h4>
            <div className="grid grid-cols-3 gap-x-3 gap-y-1 text-sm">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor: colorScheme.F}}/>Front (G)</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor: colorScheme.B}}/>Back (B)</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor: colorScheme.U}}/>Up (W)</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor: colorScheme.D}}/>Down (Y)</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor: colorScheme.L}}/>Left (O)</div>
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
                    Move {currentMoveIndex} / {solution.length}: <span className="text-foreground font-bold">{solution[currentMoveIndex] || '-'}</span>
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
