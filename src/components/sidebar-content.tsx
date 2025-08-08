'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCubeStore } from '@/lib/store';
import { Bot, Calendar, Box, History, Loader, Sprout, Trophy } from 'lucide-react';
import React, { useState } from 'react';
import { generateSolution } from '@/ai/flows/generate-solution';
import { useToast } from '@/hooks/use-toast';
import { generateScramble } from '@/lib/cube-utils';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { ScrollArea } from './ui/scroll-area';
import { Textarea } from './ui/textarea';

export function SidebarContent() {
  const { 
    setCubeConfig, 
    setStatus, 
    setSolution,
    status, 
    solvingMethod,
    setSolvingMethod,
    scrambleHistory,
    addScrambleToHistory,
  } = useCubeStore();
  const { toast } = useToast();
  const [scrambleInput, setScrambleInput] = useState('');

  const handleGenerateSolution = async () => {
    if (!scrambleInput) {
      toast({ title: 'No Scramble', description: 'Please enter a scramble first.', variant: 'destructive' });
      return;
    }
    // Very basic WCA validation regex
    const wcaRegex = /^(?:[RUFLDBrufldbMESxyz]'?2?|[RUFLDBrufldbMESxyz]w'?2?)(?:\s+(?:[RUFLDBrufldbMESxyz]'?2?|[RUFLDBrufldbMESxyz]w'?2?))*$/;
    if (!wcaRegex.test(scrambleInput.trim())) {
      toast({ title: 'Invalid Scramble', description: 'Please check your WCA notation.', variant: 'destructive' });
      return;
    }

    setStatus('solving');
    setSolution([]);
    toast({ title: 'Generating Solution...', description: `Using the ${solvingMethod} method.` });

    try {
      const result = await generateSolution({ scramble: scrambleInput, solvingMethod });
      setSolution(result.solution.split(' '));
      // A solved cube is the base for applying a scramble solution
      setCubeConfig('UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB');
      setStatus('solved');
      addScrambleToHistory(scrambleInput);
      toast({ title: 'Solution Found!', description: 'The solution is ready to be animated.', variant: 'default' });
    } catch (error) {
      console.error(error);
      setStatus('ready');
      toast({ title: 'Solving Failed', description: 'The AI could not find a solution.', variant: 'destructive' });
    }
  };

  const handleScramble = () => {
    const newScramble = generateScramble();
    setScrambleInput(newScramble);
    setCubeConfig('UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB'); // Reset to solved then apply scramble
    setStatus('scrambled');
    addScrambleToHistory(newScramble);
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="solve"><Bot className="w-4 h-4 mr-1.5" />Solve</TabsTrigger>
            <TabsTrigger value="practice"><History className="w-4 h-4 mr-1.5" />Practice</TabsTrigger>
            <TabsTrigger value="daily"><Calendar className="w-4 h-4 mr-1.5" />Daily</TabsTrigger>
          </TabsList>
          <TabsContent value="solve" className="space-y-4 mt-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sprout className="text-accent w-5 h-5"/>AI Solver</CardTitle>
                    <CardDescription>Enter a scramble, choose a method, and get the solution.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid w-full gap-1.5">
                      <Label htmlFor="scramble">WCA Scramble</Label>
                      <Textarea 
                        id="scramble" 
                        placeholder="e.g., R U R' U' F2 D'..."
                        value={scrambleInput}
                        onChange={(e) => setScrambleInput(e.target.value)}
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
                    <Button onClick={handleGenerateSolution} disabled={status === 'solving' || !scrambleInput} className="w-full">
                        {status === 'solving' ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                        Generate Solution
                    </Button>
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
                <h3 className="font-medium text-sm">Scramble History</h3>
                <ScrollArea className="h-40">
                  <div className="space-y-2 pr-4">
                    {scrambleHistory.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">No scrambles yet.</p>}
                    {scrambleHistory.map((scramble, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <p className="text-xs font-mono p-2 bg-muted rounded-md truncate flex-1">{scramble}</p>
                        <Button variant="ghost" size="sm" onClick={() => setScrambleInput(scramble)}>Use</Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="daily">
             <Card>
                <CardHeader>
                    <CardTitle>Daily Challenge</CardTitle>
                    <CardDescription>Today's official scramble. Good luck!</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm font-mono p-3 bg-muted rounded-md text-center">R U' F B2 L D2 R' F2 B U2 L'</p>
                    <Separator className="my-4"/>
                    <h3 className="font-medium text-sm flex items-center gap-2 mb-2"><Trophy className="w-4 h-4 text-secondary"/> Leaderboard</h3>
                     <p className="text-xs text-muted-foreground text-center py-4">Feature coming soon!</p>
                </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
        <div className="px-4 space-y-4">
            <Separator />
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
            <div className="space-y-2">
                <Label>Cube Theme</Label>
                <Select defaultValue="classic">
                    <SelectTrigger>
                        <SelectValue placeholder="Select cube theme" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="classic">Classic</SelectItem>
                        <SelectItem value="pastel" disabled>Pastel</SelectItem>
                        <SelectItem value="high-contrast" disabled>High Contrast</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
      </ScrollArea>
    </div>
  );
}
