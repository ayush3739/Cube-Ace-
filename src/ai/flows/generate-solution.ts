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
  cubeConfiguration: z
    .string()
    .describe(
      'A string representing the Rubik\'s Cube configuration.  The format should be a string of 54 characters, representing the colors of each facelet. The order is U(9) R(9) F(9) D(9) L(9) B(9), where each face is read row by row, and the colors are represented by the letters U(p), R(ed), F(ront), D(own), L(eft), B(ack). Example: UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB'
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
  prompt: `You are an expert Rubik\'s Cube solver.  Given the following cube configuration and solving method, generate an efficient solution.

Cube Configuration:
{{cubeConfiguration}}

Solving Method:
{{solvingMethod}}

Solution:`, // Note: No Handlebars in prompt!
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
