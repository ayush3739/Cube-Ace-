
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
      'A string representing the Rubik\'s Cube scramble in WCA notation, OR a cube state config string prefixed with "config:". Example: "R U R\' U\'" or "config:WWWWWWWWWRRRRRRRRRGGGGGGGGGYYYYYYYYYOOOOOOOOOBBBBBBBBB"'
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
  prompt: `You are an expert Rubik's Cube solver. Your task is to provide a step-by-step solution to solve a cube from a given state.

The state can be provided in two ways:
1. A standard WCA scramble (e.g., "R U R' U'").
2. A 54-character string representing the color of each sticker on each face, prefixed with "config:".

The solved state is represented by this 54-character string: "WWWWWWWWWRRRRRRRRRGGGGGGGGGYYYYYYYYYOOOOOOOOOBBBBBBBBB".
The order of faces in the string is Up, Right, Front, Down, Left, Back.
- Up (U): White (W)
- Right (R): Red (R)
- Front (F): Green (G)
- Down (D): Yellow (Y)
- Left (L): Orange (O)
- Back (B): Blue (B)

Given the following input and solving method, generate an efficient solution in WCA notation.

Input:
{{{scramble}}}

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
