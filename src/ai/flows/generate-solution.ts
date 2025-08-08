// src/ai/flows/generate-solution.ts
'use server';
/**
 * @fileOverview Generates a solution for a Rubik's Cube configuration.
 *
 * - generateSolution - A function that takes a cube configuration and returns a solution.
 * - GenerateSolutionInput - The input type for the generateSolution function.
 * - GenerateSolutionOutput - The return type for the generateSolution function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSolutionInputSchema = z.object({
  scramble: z
    .string()
    .describe(
      'A string representing the Rubik\'s Cube scramble in WCA notation. Example: R U R\' U\''
    ),
  solvingMethod: z
    .enum(['beginner', 'advanced'])
    .describe('The solving method to use: beginner or advanced.'),
});
export type GenerateSolutionInput = z.infer<typeof GenerateSolutionInputSchema>;

const GenerateSolutionOutputSchema = z.object({
  solution: z
    .string()
    .describe('A string representing the solution to the Rubik\'s Cube.'),
});
export type GenerateSolutionOutput = z.infer<typeof GenerateSolutionOutputSchema>;

export async function generateSolution(input: GenerateSolutionInput): Promise<GenerateSolutionOutput> {
  return generateSolutionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSolutionPrompt',
  input: {schema: GenerateSolutionInputSchema},
  output: {schema: GenerateSolutionOutputSchema},
  prompt: `You are an expert Rubik's Cube solver. Your task is to provide a step-by-step solution to solve a cube from a given scramble.

A solved cube has the following state, represented by the color of each sticker on each face:
- Up (U): White (WWWWWWWWW)
- Right (R): Red (RRRRRRRRR)
- Front (F): Green (GGGGGGGGG)
- Down (D): Yellow (YYYYYYYYY)
- Left (L): Orange (OOOOOOOOO)
- Back (B): Blue (BBBBBBBBB)

The final solved state string is "WWWWWWWWWRRRRRRRRRGGGGGGGGGYYYYYYYYYOOOOOOOOOBBBBBBBBB".

Given the following scramble and solving method, generate an efficient solution in WCA notation.

Scramble:
{{scramble}}

Solving Method:
{{solvingMethod}}

Solution:`,
});

const generateSolutionFlow = ai.defineFlow(
  {
    name: 'generateSolutionFlow',
    inputSchema: GenerateSolutionInputSchema,
    outputSchema: GenerateSolutionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
