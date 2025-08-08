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
  prompt: `You are an expert Rubik's Cube solver. Given the following scramble and solving method, generate an efficient solution. A solved cube state is UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB.

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
