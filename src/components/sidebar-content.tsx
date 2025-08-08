
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCubeStore, ColorScheme } from '@/lib/store';
import { Bot, Calendar, Box, History, Loader, Sprout, Trophy, Palette, Undo, Camera, Pencil } from 'lucide-react';
import React, { useState } from 'react';
import { generateSolution } from '@/ai/flows/generate-solution';
import { useToast } from '@/hooks/use-toast';
import { generateScramble, getInitialCube, applyMove } from '@/lib/cube-utils';
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

const faceLayout = {
  U: [ {row: 0, col: 1}, {x:1, y:0}, {x:2, y:0}, {x:0, y:1}, {x:1, y:1}, {x:2, y:1}, {x:0, y:2}, {x:1, y:2}, {x:2, y:2} ],
  L: [ {row: 1, col: 0}, {x:0, y:3}, {x:1, y:3}, {x:2, y:3}, {x:0, y:4}, {x:1, y:4}, {x:2, y:4}, {x:0, y:5}, {x:1, y:5}, {x:2, y:5} ],
  F: [ {row: 1, col: 1}, {x:0, y:3}, {x:1, y:3}, {x:2, y:3}, {x:0, y:4}, {x:1, y:4}, {x:2, y:4}, {x:0, y:5}, {x:1, y:5}, {x:2, y:5} ],
  R: [ {row: 1, col: 2}, {x:0, y:3}, {x:1, y:3}, {x:2, y:3}, {x:0, y:4}, {x:1, y:4}, {x:2, y:4}, {x:0, y:5}, {x:1, y:5}, {x:2, y:5} ],
  B: [ {row: 1, col: 3}, {x:0, y:3}, {x:1, y:3}, {x:2, y:3}, {x:0, y:4}, {x:1, y:4}, {x:2, y:4}, {x:0, y:5}, {x:1, y:5}, {x:2, y:5} ],
  D: [ {row: 2, col: 1}, {x:0, y:6}, {x:1, y:6}, {x:2, y:6}, {x:0, y:7}, {x:1, y:7}, {x:2, y:7}, {x:0, y:8}, {x:1, y:8}, {x:2, y:8} ],
};

function CubeStateEditor() {
    const { colorScheme, cubeConfig, setCubeConfig } = useCubeStore();
    const [selectedColor, setSelectedColor] = useState<keyof ColorScheme>('U');
    
    // This is a simplified representation. A real implementation would need
    // to map cubeConfig string to a 2D array for each face.
    const faceColors: { [key: string]: string[] } = {
        U: Array(9).fill(colorScheme.U),
        L: Array(9).fill(colorScheme.L),
        F: Array(9).fill(colorScheme.F),
        R: Array(9).fill(colorScheme.R),
        B: Array(9).fill(colorScheme.B),
        D: Array(9).fill(colorScheme.D),
    };

    const handleStickerClick = (face: string, index: number) => {
        // A more complex mapping from face+index to cubeConfig string index is needed
        console.log(`Setting ${face} sticker ${index} to ${colorScheme[selectedColor]}`);
    };

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
                <div className="grid grid-cols-4 grid-rows-3 gap-1 aspect-[4/3]">
                    {/* Up Face */}
                    <div className="col-start-2 grid grid-cols-3 grid-rows-3 gap-0.5">
                        {faceColors.U.map((color, i) => (
                             <div key={`U-${i}`} onClick={() => handleStickerClick('U', i)} className="aspect-square rounded-sm" style={{backgroundColor: color}} />
                        ))}
                    </div>
                    {/* Left Face */}
                    <div className="grid grid-cols-3 grid-rows-3 gap-0.5">
                         {faceColors.L.map((color, i) => (
                             <div key={`L-${i}`} onClick={() => handleStickerClick('L', i)} className="aspect-square rounded-sm" style={{backgroundColor: color}} />
                        ))}
                    </div>
                    {/* Front Face */}
                    <div className="grid grid-cols-3 grid-rows-3 gap-0.5">
                         {faceColors.F.map((color, i) => (
                             <div key={`F-${i}`} onClick={() => handleStickerClick('F', i)} className="aspect-square rounded-sm" style={{backgroundColor: color}} />
                        ))}
                    </div>
                    {/* Right Face */}
                    <div className="grid grid-cols-3 grid-rows-3 gap-0.5">
                         {faceColors.R.map((color, i) => (
                             <div key={`R-${i}`} onClick={() => handleStickerClick('R', i)} className="aspect-square rounded-sm" style={{backgroundColor: color}} />
                        ))}
                    </div>
                     {/* Back Face */}
                    <div className="grid grid-cols-3 grid-rows-3 gap-0.5">
                         {faceColors.B.map((color, i) => (
                             <div key={`B-${i}`} onClick={() => handleStickerClick('B', i)} className="aspect-square rounded-sm" style={{backgroundColor: color}} />
                        ))}
                    </div>
                    {/* Down Face */}
                    <div className="col-start-2 grid grid-cols-3 grid-rows-3 gap-0.5">
                         {faceColors.D.map((color, i) => (
                             <div key={`D-${i}`} onClick={() => handleStickerClick('D', i)} className="aspect-square rounded-sm" style={{backgroundColor: color}} />
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function SidebarContent() {
  const { 
    setCubeConfig, 
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
    if (!scramble) {
      toast({ title: 'No Scramble', description: 'Please enter a scramble first.', variant: 'destructive' });
      return;
    }
    const wcaRegex = /^(?:[RUFLDBrufldbMESxyz]'?2?|[RUFLDBrufldbMESxyz]w'?2?)(?:\s+(?:[RUFLDBrufldbMESxyz]'?2?|[RUFLDBrufldbMESxyz]w'?2?))*$/;
    if (!wcaRegex.test(scramble.trim())) {
      toast({ title: 'Invalid Scramble', description: 'Please check your WCA notation.', variant: 'destructive' });
      return;
    }

    setStatus('solving');
    setSolution([]);
    toast({ title: 'Generating Solution...', description: `Using the ${solvingMethod} method.` });

    try {
      const result = await generateSolution({ scramble: scramble, solvingMethod });
      
      let newCube = getInitialCube();
      const moves = scramble.split(' ').filter(m => m);
      moves.forEach(move => {
        newCube = applyMove(newCube, move);
      });

      setSolution(result.solution.split(' '));
      // Applying the scramble will now happen in the cube viewer based on the scramble string
      setStatus('solved');
      addScrambleToHistory(scramble);
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
        setCubeConfig(cubeState);
        setStatus('ready');
        toast({ title: 'Detection Complete!', description: 'Your cube state is ready.' });
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
        <Tabs defaultValue="solve" className="p-4">
          <TabsList className="grid w-full grid-cols-3 gap-1">
            <TabsTrigger value="solve"><Sprout className="w-4 h-4 mr-1.5" />Solve</TabsTrigger>
            <TabsTrigger value="scan"><Camera className="w-4 h-4 mr-1.5" />Scan</TabsTrigger>
            <TabsTrigger value="practice"><History className="w-4 h-4 mr-1.5" />Practice</TabsTrigger>
            
          </TabsList>
          <TabsContent value="solve" className="space-y-4 mt-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bot className="text-accent w-5 h-5"/>AI Solver</CardTitle>
                    <CardDescription>Enter a scramble, choose a method, and get the solution.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid w-full gap-1.5">
                      <Label htmlFor="scramble">WCA Scramble</Label>
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
                    <Button onClick={handleGenerateSolution} disabled={status === 'solving' || !scramble} className="w-full">
                        {status === 'solving' ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                        Generate Solution
                    </Button>
                </CardContent>
            </Card>
            <CubeStateEditor />
          </TabsContent>
           <TabsContent value="scan">
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
          <TabsContent value="practice">
            <Card>
              <CardHeader>
                <CardTitle>Practice Mode</CardTitle>
                <CardDescription>Generate a scramble and solve it with the AI.</CardDescription>
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
