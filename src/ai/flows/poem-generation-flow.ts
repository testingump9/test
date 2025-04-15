'use server';

/**
 * @fileOverview Generates a poem based on an image.
 *
 * - generatePoem - A function that handles the poem generation process.
 * - GeneratePoemInput - The input type for the generatePoem function.
 * - GeneratePoemOutput - The return type for the GeneratePoem function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {analyzeImage, ImageAnalysisOutput} from "@/ai/flows/image-analysis-flow";

const GeneratePoemInputSchema = z.object({
  imageUrl: z.string().describe('The URL of the image to generate a poem from.'),
});
export type GeneratePoemInput = z.infer<typeof GeneratePoemInputSchema>;

const GeneratePoemOutputSchema = z.object({
  poem: z.string().describe('The generated poem.'),
});
export type GeneratePoemOutput = z.infer<typeof GeneratePoemOutputSchema>;

export async function generatePoem(input: GeneratePoemInput): Promise<GeneratePoemOutput> {
  return generatePoemFlow(input);
}

const poemPrompt = ai.definePrompt({
  name: 'poemPrompt',
  input: {
    schema: z.object({
      imageUrl: z.string().describe('The URL of the image.'),
      objects: z.array(z.string()).describe('A list of dominant objects in the image.'),
      colors: z.array(z.string()).describe('A list of dominant colors in the image.'),
      mood: z.string().describe('The overall mood of the image.'),
    }),
  },
  output: {
    schema: z.object({
      poem: z.string().describe('The generated poem.'),
    }),
  },
  prompt: `You are a poet. Generate a poem based on the following image analysis.

  Objects: {{{objects}}}
  Colors: {{{colors}}}
  Mood: {{{mood}}}

  Write a poem that captures the essence of the image, using vivid language and imagery related to the analyzed objects, colors, and mood.

  The poem should be no more than 20 lines.
`,
});

const generatePoemFlow = ai.defineFlow<
  typeof GeneratePoemInputSchema,
  typeof GeneratePoemOutputSchema
>(
  {
    name: 'generatePoemFlow',
    inputSchema: GeneratePoemInputSchema,
    outputSchema: GeneratePoemOutputSchema,
  },
  async input => {
    const imageAnalysis = await analyzeImage({photoUrl: input.imageUrl});

    if (!imageAnalysis.isSuitableForPoem) {
      return {
        poem: 'Sorry, this image is not suitable for poem generation.',
      };
    }

    const {output} = await poemPrompt({
      imageUrl: input.imageUrl,
      objects: imageAnalysis.objects,
      colors: imageAnalysis.colors,
      mood: imageAnalysis.mood,
    });
    return output!;
  }
);
