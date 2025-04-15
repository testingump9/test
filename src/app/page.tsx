'use client';

import {useState, useRef} from 'react';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {generatePoem} from '@/ai/flows/poem-generation-flow';
import {
  FileUp,
  Save,
  Loader2,
  RefreshCcw,
  Link,
  Image as ImageIcon,
  FileText,
  Layout,
} from 'lucide-react';
import {cn} from '@/lib/utils';
import {useToast} from '@/hooks/use-toast'; // Import useToast hook
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [poem, setPoem] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const {toast} = useToast(); // Initialize toast
  const [imageSource, setImageSource] = useState<'upload' | 'link'>('upload');
  const [imageUrl, setImageUrl] = useState<string>('');
  const poemContainerRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true); // Start loading
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setUploading(false); // End loading
    };
    reader.readAsDataURL(file);
  };

  const generate = async () => {
    let finalImage = image;
    if (imageSource === 'link') {
      finalImage = imageUrl;
    }
    if (!finalImage) return;
    setLoading(true);
    try {
      const result = await generatePoem({imageUrl: finalImage});
      setPoem(result.poem);
      toast({
        title: 'Poem Generated!',
        description: 'Your poem has been created from the image.',
      });
    } catch (error) {
      console.error('Error generating poem:', error);
      setPoem('Failed to generate poem. Please try again.');
      toast({
        variant: 'destructive',
        title: 'Error Generating Poem',
        description: 'There was an issue generating your poem. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePoem = () => {
    if (!poem || !image) return;

    const combinedContent = `Image URL: ${image}\n\nPoem:\n${poem}`;
    const blob = new Blob([combinedContent], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'poem.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Poem Saved!',
      description: 'The poem has been saved to your device.',
    });
  };

  const handleReset = () => {
    setImage(null);
    setPoem(null);
    setImageUrl('');
  };

  const downloadPoemAsImage = () => {
    if (!poem || !image) {
      toast({
        variant: 'destructive',
        title: 'Error Downloading Image',
        description: 'Please generate a poem first.',
      });
      return;
    }

    const container = poemContainerRef.current;
    if (!container) {
      toast({
        variant: 'destructive',
        title: 'Error Downloading Image',
        description: 'Poem container not found.',
      });
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const width = 600;
    const height = 800;

    canvas.width = width;
    canvas.height = height;

        // Apply the background gradient from the app
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#008080');  // Teal
        gradient.addColorStop(1, '#000080');  // Navy
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);


        // Set text styles to complement the background
        ctx.fillStyle = '#FFFFFF'; // White text
        ctx.textAlign = 'center';

        // Add PhotoPoet title
        ctx.font = 'bold 36px Arial';
        ctx.fillText('PhotoPoet', width / 2, 50);

        // Add poem
        ctx.font = '20px Arial';
        ctx.textAlign = 'left';
        const poemLines = poem.split('\n');
        let y = 100;
        ctx.fillStyle = '#E0E0E0'; // Light gray for the poem
        poemLines.forEach(line => {
            ctx.fillText(line, 50, y);
            y += 30;
        });

        // Add author
        ctx.font = 'italic 16px Arial';
        ctx.textAlign = 'center'; // Center the text
        ctx.fillStyle = '#D0D0D0'; // Lighter gray for the author
        ctx.fillText('Created with ❤️ by Soubhagya Ranjan Sahoo', width / 2, height - 30);


    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'photo_poem.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Image Downloaded!',
      description: 'The poem has been downloaded as an image.',
    });
  };

    const generateColorfulPlaceholderUrl = (width: number, height: number) => {
        return `https://picsum.photos/${width}/${height}?random=1&color`;
    };


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#008080] to-[#000080] text-white py-6 flex flex-col">
      {/* Header */}
      <header className="text-center py-4">
        <h1 className="text-4xl font-extrabold tracking-tight">
          <span className="text-teal-300">Photo</span>Poet
        </h1>
        <p className="mt-2 text-lg">
          Transform your images into beautiful poems.
        </p>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 flex-1 flex flex-col md:flex-row gap-6">
        {/* Image Input Section */}
        <section className="md:w-1/2 flex flex-col">
          <Card className="mb-6 rounded-xl shadow-lg overflow-hidden bg-gray-900 border-gray-700 flex-1">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-lg font-semibold text-white">
                {imageSource === 'upload' ? 'Upload Image' : 'Image URL'}
              </CardTitle>
              <CardDescription className="text-sm text-gray-400">
                {imageSource === 'upload'
                  ? 'Choose an image from your device.'
                  : 'Enter the URL of the image.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 flex flex-col">
              <RadioGroup
                defaultValue="upload"
                className="flex space-x-2 mb-4"
                onValueChange={value => {
                  setImageSource(value === 'upload' ? 'upload' : 'link');
                  setImage(null); // Clear existing image
                  setImageUrl(''); // Clear existing URL
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="upload" id="upload" />
                  <label
                    htmlFor="upload"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white"
                  >
                    <FileUp className="mr-2 h-4 w-4 inline-block" />
                    Upload
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="link" id="link" />
                  <label
                    htmlFor="link"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white"
                  >
                    <Link className="mr-2 h-4 w-4 inline-block" />
                    Link
                  </label>
                </div>
              </RadioGroup>

              {imageSource === 'upload' ? (
                <>
                  {image ? (
                    <div className="relative rounded-md overflow-hidden w-full mb-4">
                      <img
                        src={image}
                        alt="Uploaded"
                        className="w-full h-auto object-cover transition-transform duration-500 hover:scale-110"
                      />
                    </div>
                  ) : (
                    <label
                      htmlFor="upload-image"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer bg-gray-800 hover:bg-gray-700 transition-colors duration-300 mb-4"
                    >
                      {uploading ? (
                        <Loader2 className="h-6 w-6 text-gray-500 animate-spin mb-2" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-gray-500 mb-2" />
                      )}
                      <span className="text-sm text-gray-500">
                        {uploading ? 'Uploading...' : 'Click to upload'}
                      </span>
                    </label>
                  )}
                  <Input
                    type="file"
                    id="upload-image"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </>
              ) : (
                <div className="flex flex-col w-full">
                  <Input
                    type="url"
                    placeholder="Paste image URL here"
                    className="text-white bg-gray-800 border-gray-700 rounded-md mb-2"
                    value={imageUrl}
                    onChange={e => {
                      setImageUrl(e.target.value);
                      setImage(e.target.value);
                    }}
                  />
                  {imageUrl && (
                    <div className="relative rounded-md overflow-hidden w-full mt-2">
                      <img
                        src={imageUrl}
                        alt="Uploaded"
                        className="w-full h-auto object-cover transition-transform duration-500 hover:scale-110"
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-start gap-2 mt-2">
            <Button
              onClick={generate}
              disabled={
                (!image && imageSource === 'upload') ||
                (!imageUrl && imageSource === 'link') ||
                loading ||
                uploading
              }
              className="rounded-md shadow-md hover:shadow-lg transition-shadow duration-300 bg-teal-500 text-white hover:bg-teal-600 disabled:bg-gray-600"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Poem
                </>
              )}
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              disabled={
                (!image && imageSource === 'upload' && !poem) ||
                (!imageUrl && imageSource === 'link' && !poem) ||
                loading ||
                uploading
              }
              className="rounded-md shadow-md hover:shadow-lg transition-shadow duration-300 text-white hover:bg-gray-700 disabled:bg-gray-600"
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </section>

        {/* Poem Display Section */}
        <section className="md:w-1/2 flex flex-col">
          <Card className="flex-1 rounded-xl shadow-lg overflow-hidden bg-gray-900 border-gray-700">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-lg font-semibold text-white">
                Generated Poem
              </CardTitle>
              <CardDescription className="text-sm text-gray-400">
                Here's the poem generated from the image.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 flex flex-col" ref={poemContainerRef}>
              {poem ? (
                <Textarea
                  value={poem}
                  readOnly
                  className={cn(
                    'min-h-[200px] rounded-md shadow-inner transition-opacity duration-500 bg-gray-800 text-white',
                    loading ? 'animate-pulse' : 'opacity-100'
                  )}
                />
              ) : (
                <div className="text-center text-gray-500">
                  No poem generated yet.
                </div>
              )}
              <Button
                onClick={downloadPoemAsImage}
                disabled={!poem}
                variant="secondary"
                className="mt-4 self-end rounded-md shadow-md hover:shadow-lg transition-shadow duration-300 bg-blue-700 text-white hover:bg-blue-800 disabled:bg-gray-600"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Poem as Image
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-gray-500">
        <p>
          Created with <span className="text-red-500">&hearts;</span> by Soubhagya Ranjan Sahoo
        </p>
      </footer>
    </div>
  );
}


