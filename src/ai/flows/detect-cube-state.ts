'use server';

/**
 * @fileOverview An AI agent that detects the state of a Rubik's Cube from an image.
 *
 * - detectCubeState - A function that handles the cube state detection process.
 * - DetectCubeStateInput - The input type for the detectCubeState function.
 * - DetectCubeStateOutput - The return type for the detectCubeState function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectCubeStateInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a Rubik's Cube, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DetectCubeStateInput = z.infer<typeof DetectCubeStateInputSchema>;

const DetectCubeStateOutputSchema = z.object({
  cubeState: z
    .string()
    .describe(
      'A string representing the detected state of the Rubik\'s Cube, using standard cube notation (e.g., URFDLB).'
    ),
});
export type DetectCubeStateOutput = z.infer<typeof DetectCubeStateOutputSchema>;

export async function detectCubeState(input: DetectCubeStateInput): Promise<DetectCubeStateOutput> {
  return detectCubeStateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectCubeStatePrompt',
  input: {schema: DetectCubeStateInputSchema},
  output: {schema: DetectCubeStateOutputSchema},
  prompt: `You are an AI expert in recognizing the state of a Rubik's Cube from an image.

You will analyze the provided image and determine the color arrangement on each face of the cube.

Based on the detected colors, you will represent the cube state as a single string using the standard cube notation (URFDLB), where each character represents the color of a specific cubie.

Ensure the accuracy of the detected cube state, as this information will be used to generate a solution.

Image: {{media url=photoDataUri}}

Cube State: `,
});

const detectCubeStateFlow = ai.defineFlow(
  {
    name: 'detectCubeStateFlow',
    inputSchema: DetectCubeStateInputSchema,
    outputSchema: DetectCubeStateOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
