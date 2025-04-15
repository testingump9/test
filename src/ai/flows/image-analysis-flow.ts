'use server';
/**
 * @fileOverview Analyzes an image to identify objects, colors, and mood.
 *
 * - analyzeImage - A function that handles the image analysis process.
 * - ImageAnalysisInput - The input type for the analyzeImage function.
 * - ImageAnalysisOutput - The return type for the analyzeImage function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const ImageAnalysisInputSchema = z.object({
  photoUrl: z.string().describe('The URL of the image to analyze.'),
});
export type ImageAnalysisInput = z.infer<typeof ImageAnalysisInputSchema>;

const ImageAnalysisOutputSchema = z.object({
  objects: z.array(z.string()).describe('A list of dominant objects in the image.'),
  colors: z.array(z.string()).describe('A list of dominant colors in the image.'),
  mood: z.string().describe('The overall mood of the image.'),
  isSuitableForPoem: z.boolean().describe('Whether the image is suitable for generating a poem.'),
});
export type ImageAnalysisOutput = z.infer<typeof ImageAnalysisOutputSchema>;

export async function analyzeImage(input: ImageAnalysisInput): Promise<ImageAnalysisOutput> {
  return imageAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'imageAnalysisPrompt',
  input: {
    schema: z.object({
      photoUrl: z.string().describe('The URL of the image to analyze.'),
    }),
  },
  output: {
    schema: ImageAnalysisOutputSchema,
  },
  prompt: `You are an AI assistant that analyzes images and extracts information relevant for generating poems.

  Analyze the image provided via URL and identify the following:
  - Dominant objects present in the image.
  - Dominant colors in the image.
  - The overall mood or feeling conveyed by the image.

  Output the information in a structured JSON format.

  Image URL: {{photoUrl}}`,
});

const imageAnalysisFlow = ai.defineFlow<
  typeof ImageAnalysisInputSchema,
  typeof ImageAnalysisOutputSchema
>({
  name: 'imageAnalysisFlow',
  inputSchema: ImageAnalysisInputSchema,
  outputSchema: ImageAnalysisOutputSchema,
}, async input => {
  try {
    const {output} = await prompt(input);
    return {
      objects: output!.objects,
      colors: output!.colors,
      mood: output!.mood,
      isSuitableForPoem: true,
    };
  } catch (error) {
    console.error('Error in image analysis flow:', error);
    return {
      objects: [],
      colors: [],
      mood: 'Error analyzing image',
      isSuitableForPoem: false,
    };
  }
});
