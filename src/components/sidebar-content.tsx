
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCubeStore, ColorScheme, faceToColor, SOLVED_CUBE_CONFIG } from '@/lib/store';
import { Bot, Calendar, Box, History, Loader, Sprout, Trophy, Palette, Undo, Camera, Pencil } from 'lucide-react';
import React, { useState } from 'react';
import { generateSolution } from '@/ai/flows/generate-solution';
import { useToast } from '@/hooks/use-toast';
import { generateScramble, getInitialCube, applyMove, cubeConfigToCube } from '@/lib/cube-utils';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { ScrollArea } from './ui/scroll-area';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import { detectCubeState } from '@/ai/flows/detect-cube-state';


const faceMap = [
  { id: 'U', name: 'Up' },
  { id: 'D', name: 'Down' },
  { id: 'L', name: 'Left' },
  { id: 'R', name: 'Right' },
  { id: 'F', name: 'Front' },
  { id: 'B', name: 'Back' },
];

const faceLayout: {[key in keyof ColorScheme]: number[]} = {
    U: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    R: [9, 10, 11, 12, 13, 14, 15, 16, 17],
    F: [18, 19, 20, 21, 22, 23, 24, 25, 26],
    D: [27, 28, 29, 30, 31, 32, 33, 34, 35],
    L: [36, 37, 38, 39, 40, 41, 42, 43, 44],
    B: [45, 46, 47, 48, 49, 50, 51, 52, 53],
};

const colorToFace: Record<string, keyof ColorScheme> = {
    W: 'U',
    R: 'R',
    G: 'F',
    Y: 'D',
    O: 'L',
    B: 'B',
};

function CubeStateEditor() {
    const { colorScheme, cubeConfig, setCubeConfig } = useCubeStore();
    const [selectedColor, setSelectedColor] = useState<keyof ColorScheme>('U');
    
    const faceColors = {
      U: cubeConfig.substring(0, 9).split(''),
      R: cubeConfig.substring(9, 18).split(''),
      F: cubeConfig.substring(18, 27).split(''),
      D: cubeConfig.substring(27, 36).split(''),
      L: cubeConfig.substring(36, 45).split(''),
      B: cubeConfig.substring(45, 54).split(''),
    };
    
    const handleStickerClick = (face: keyof ColorScheme, index: number) => {
        const configIndex = faceLayout[face][index];
        const newColorChar = faceToColor[selectedColor];
        const newCubeConfig = cubeConfig.substring(0, configIndex) + newColorChar + cubeConfig.substring(configIndex + 1);
        setCubeConfig(newCubeConfig);
    };

    const colorToHex = (colorChar: string) => {
        const face = colorToFace[colorChar];
        return face ? colorScheme[face] : '#000000';
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Pencil className="text-accent w-5 h-5" />Manual Input</CardTitle>
                <CardDescription>Click a color, then paint the faces of your cube.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex justify-center items-center gap-2 mb-4 p-2 rounded-lg bg-muted">
                    {Object.entries(colorScheme).map(([face, color]) => (
                        <button
                            key={face}
                            onClick={() => setSelectedColor(face as keyof ColorScheme)}
                            className={cn(
                                "w-7 h-7 rounded-full border-2",
                                selectedColor === face ? 'border-primary ring-2 ring-primary/50' : 'border-muted'
                            )}
                            style={{ backgroundColor: color }}
                            title={faceMap.find(f => f.id === face)?.name}
                        />
                    ))}
                </div>
                <div className="grid grid-cols-4 grid-rows-3 gap-1 aspect-[4/3] mx-auto w-48">
                    {/* Up Face */}
                    <div className="col-start-2 grid grid-cols-3 grid-rows-3 gap-0.5">
                        {faceColors.U.map((color, i) => (
                             <div key={`U-${i}`} onClick={() => handleStickerClick('U', i)} className="aspect-square rounded-sm cursor-pointer" style={{backgroundColor: colorToHex(color)}} />
                        ))}
                    </div>
                    {/* Left Face */}
                    <div className="row-start-2 grid grid-cols-3 grid-rows-3 gap-0.5">
                         {faceColors.L.map((color, i) => (
                             <div key={`L-${i}`} onClick={() => handleStickerClick('L', i)} className="aspect-square rounded-sm cursor-pointer" style={{backgroundColor: colorToHex(color)}} />
                        ))}
                    </div>
                    {/* Front Face */}
                    <div className="row-start-2 grid grid-cols-3 grid-rows-3 gap-0.5">
                         {faceColors.F.map((color, i) => (
                             <div key={`F-${i}`} onClick={() => handleStickerClick('F', i)} className="aspect-square rounded-sm cursor-pointer" style={{backgroundColor: colorToHex(color)}} />
                        ))}
                    </div>
                    {/* Right Face */}
                    <div className="row-start-2 grid grid-cols-3 grid-rows-3 gap-0.5">
                         {faceColors.R.map((color, i) => (
                             <div key={`R-${i}`} onClick={() => handleStickerClick('R', i)} className="aspect-square rounded-sm cursor-pointer" style={{backgroundColor: colorToHex(color)}} />
                        ))}
                    </div>
                     {/* Back Face */}
                    <div className="row-start-2 grid grid-cols-3 grid-rows-3 gap-0.5">
                         {faceColors.B.map((color, i) => (
                             <div key={`B-${i}`} onClick={() => handleStickerClick('B', i)} className="aspect-square rounded-sm cursor-pointer" style={{backgroundColor: colorToHex(color)}} />
                        ))}
                    </div>
                    {/* Down Face */}
                    <div className="row-start-3 col-start-2 grid grid-cols-3 grid-rows-3 gap-0.5">
                         {faceColors.D.map((color, i) => (
                             <div key={`D-${i}`} onClick={() => handleStickerClick('D', i)} className="aspect-square rounded-sm cursor-pointer" style={{backgroundColor: colorToHex(color)}} />
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function validateCubeConfig(config: string): boolean {
    if (config.length !== 54) return false;
    const counts: {[key: string]: number} = {'W': 0, 'R': 0, 'G': 0, 'Y': 0, 'O': 0, 'B': 0};
    for (const char of config) {
        if (counts[char] !== undefined) {
            counts[char]++;
        } else {
            return false; // Invalid character
        }
    }
    return Object.values(counts).every(count => count === 9);
}


export function SidebarContent() {
  const { 
    setCubeConfig,
    cubeConfig,
    setStatus, 
    setSolution,
    status,
    scramble,
    setScramble,
    solvingMethod,
    setSolvingMethod,
    scrambleHistory,
    addScrambleToHistory,
    colorScheme,
    setColorScheme,
    resetColorScheme,
  } = useCubeStore();
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleGenerateSolution = async () => {
    let effectiveScramble = scramble;
    let configToUse = cubeConfig;

    // Determine if we're solving from manual input or a scramble
    const isManualInput = cubeConfig !== SOLVED_CUBE_CONFIG && !scramble;

    if (isManualInput) {
      if (!validateCubeConfig(cubeConfig)) {
        toast({ title: 'Invalid Cube State', description: 'Each color must have exactly 9 stickers. Please check your manual input.', variant: 'destructive' });
        return;
      }
      // TODO: When there's a flow to convert config to scramble
      // effectiveScramble = await configToScramble(cubeConfig)
      // For now, we pass the config and expect the AI to handle it.
      // We will adjust the prompt to clarify this.
      effectiveScramble = `config:${cubeConfig}`;

    } else if (scramble) {
       const wcaRegex = /^(?:[RUFLDBrufldbMESxyz]'?2?|[RUFLDBrufldbMESxyz]w'?2?)(?:\s+(?:[RUFLDBrufldbMESxyz]'?2?|[RUFLDBrufldbMESxyz]w'?2?))*$/;
       if (!wcaRegex.test(scramble.trim())) {
         toast({ title: 'Invalid Scramble', description: 'Please check your WCA notation.', variant: 'destructive' });
         return;
       }
    } else {
      toast({ title: 'No Input', description: 'Please enter a scramble or set the cube state manually.', variant: 'destructive' });
      return;
    }


    setStatus('solving');
    setSolution([]);
    toast({ title: 'Generating Solution...', description: `Using the ${solvingMethod} method.` });

    try {
      const result = await generateSolution({ scramble: effectiveScramble, solvingMethod });
      
      let newCube = getInitialCube();
      const moves = scramble.split(' ').filter(m => m);
      moves.forEach(move => {
        newCube = applyMove(newCube, move);
      });

      setSolution(result.solution.split(' '));
      // Applying the scramble will now happen in the cube viewer based on the scramble string
      setStatus('solved');
      if (scramble) {
        addScrambleToHistory(scramble);
      }
      toast({ title: 'Solution Found!', description: 'The solution is ready to be animated.', variant: 'default' });
    } catch (error) {
      console.error(error);
      setStatus('ready');
      toast({ title: 'Solving Failed', description: 'The AI could not find a solution.', variant: 'destructive' });
    }
  };

  const handleScramble = () => {
    const newScramble = generateScramble();
    setScramble(newScramble);
    setCubeConfig(SOLVED_CUBE_CONFIG);
    setStatus('scrambled');
    setSolution([]);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus('detecting');
    toast({ title: 'Detecting Cube State...', description: 'Please wait while we analyze your image.' });

    const reader = new FileReader();
    reader.onload = async (e) => {
      const photoDataUri = e.target?.result as string;
      try {
        const { cubeState } = await detectCubeState({ photoDataUri });
        if (validateCubeConfig(cubeState)) {
            setCubeConfig(cubeState);
            setScramble('');
            setStatus('ready');
            toast({ title: 'Detection Complete!', description: 'Your cube state is ready.' });
        } else {
            setStatus('ready');
            toast({ title: 'Detection Failed', description: 'Could not detect a valid cube state. Please try another image.', variant: 'destructive' });
        }
      } catch (error) {
        setStatus('ready');
        toast({ title: 'Detection Failed', description: 'Could not detect cube state from the image.', variant: 'destructive' });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex h-full flex-col text-sm">
      <div className="flex items-center gap-3 p-4 border-b">
         <Box className="w-8 h-8 text-primary" />
         <div className="flex flex-col">
            <h1 className="font-headline text-lg font-bold tracking-tight">CubeAce</h1>
            <p className="text-xs text-muted-foreground -mt-1">AI Cube Solver</p>
         </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">
          <Tabs defaultValue="solve" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="solve"><Sprout className="w-4 h-4 mr-1.5" />Solve</TabsTrigger>
              <TabsTrigger value="scan"><Camera className="w-4 h-4 mr-1.5" />Scan</TabsTrigger>
              <TabsTrigger value="practice"><History className="w-4 h-4 mr-1.5" />Practice</TabsTrigger>
            </TabsList>
            <TabsContent value="solve" className="space-y-4 mt-4">
              <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Bot className="text-accent w-5 h-5"/>AI Solver</CardTitle>
                      <CardDescription>Enter a scramble or manually set the colors below.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div className="grid w-full gap-1.5">
                        <Label htmlFor="scramble">WCA Scramble (Overrides Manual Input)</Label>
                        <Textarea 
                          id="scramble" 
                          placeholder="e.g., R U R' U' F2 D'..."
                          value={scramble}
                          onChange={(e) => setScramble(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <RadioGroup value={solvingMethod} onValueChange={(val: 'beginner' | 'advanced') => setSolvingMethod(val)}>
                          <Label>Solving Method</Label>
                          <div className="flex gap-4 pt-2">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="beginner" id="r1" />
                                <Label htmlFor="r1">Beginner</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="advanced" id="r2" />
                                <Label htmlFor="r2">Advanced</Label>
                            </div>
                          </div>
                      </RadioGroup>
                      <Button onClick={handleGenerateSolution} disabled={status === 'solving'} className="w-full">
                          {status === 'solving' ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                          Generate Solution
                      </Button>
                  </CardContent>
              </Card>
              <CubeStateEditor />
            </TabsContent>
            <TabsContent value="scan" className="mt-4">
              <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Camera className="text-accent w-5 h-5" />Scan Your Cube</CardTitle>
                      <CardDescription>Upload a photo of your cube to detect its state automatically.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                      <Button onClick={() => fileInputRef.current?.click()} className="w-full" disabled={status === 'detecting'}>
                          {status === 'detecting' ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                          Upload Image
                      </Button>
                      <p className="text-xs text-muted-foreground text-center mt-3">This feature uses AI and may not be 100% accurate.</p>
                  </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="practice" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Practice Mode</CardTitle>
                  <CardDescription>Generate a random scramble to practice.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={handleScramble} className="w-full">Generate New Scramble</Button>
                  <Separator/>
                  <h3 className="font-medium text-sm mt-4">Scramble History</h3>
                  <ScrollArea className="h-40">
                    <div className="space-y-2 pr-4">
                      {scrambleHistory.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">No scrambles yet.</p>}
                      {scrambleHistory.map((s, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <p className="text-xs font-mono p-2 bg-muted rounded-md truncate flex-1">{s}</p>
                          <Button variant="ghost" size="sm" onClick={() => {
                            setScramble(s);
                            setCubeConfig(SOLVED_CUBE_CONFIG);
                            setStatus('scrambled');
                            setSolution([]);
                          }}>Use</Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        <div className="px-4 space-y-4">
            <Separator />
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5 text-accent" />Color Scheme</CardTitle>
                    <CardDescription>Customize the cube's face colors.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {faceMap.map(face => (
                            <div key={face.id} className="grid gap-1.5">
                                <Label>{face.name} ({face.id})</Label>
                                <div className="flex items-center gap-2">
                                     <Input 
                                        type="color" 
                                        value={colorScheme[face.id as keyof typeof colorScheme]} 
                                        onChange={(e) => setColorScheme({ [face.id]: e.target.value })}
                                        className="p-1 h-8 w-8"
                                    />
                                    <span className="font-mono text-muted-foreground">{colorScheme[face.id as keyof typeof colorScheme]}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button variant="outline" size="sm" onClick={resetColorScheme} className="w-full">
                        <Undo className="w-4 h-4 mr-2" /> Reset to WCA Defaults
                    </Button>
                </CardContent>
            </Card>
            <div className="space-y-2">
                <Label>Cube Type</Label>
                <Select defaultValue="3x3">
                    <SelectTrigger>
                        <SelectValue placeholder="Select cube size" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="2x2" disabled>2x2x2</SelectItem>
                        <SelectItem value="3x3">3x3x3</SelectItem>
                        <SelectItem value="4x4" disabled>4x4x4</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
      </ScrollArea>
    </div>
  );
}
