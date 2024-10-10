'use client'

import { useState, } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Download, History } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import axios from 'axios'

export default function ImageGeneratorDemo() {
  const [title, setTitle] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [history, setHistory] = useState<string[]>([])

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const response = await axios.post('/api/ogp', { title });

      if (response.status === 200) {
        const { backgroundImage, font, title } = response.data;
        const image = await generateImage(backgroundImage, font, title);
        setGeneratedImage(image);
        setHistory((prev) => [title, ...prev.slice(0, 4)]);
      } else {
        console.error('Failed to generate image:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateImage = async (backgroundImage: string, font: string, text: string): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        
        const fontFace = new FontFace('IrohaKaku', `url(${font})`);
        fontFace.load().then(() => {
          document.fonts.add(fontFace);
          
          ctx.font = '80px IrohaKaku';
          ctx.fillStyle = 'black';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const maxWidth = 1520;
          const lines = wrapText(ctx, text, maxWidth);

          const lineHeight = 130;
          const startY = (1080 - (lines.length * lineHeight)) / 2;
          lines.forEach((line, index) => {
            ctx.fillText(line, 960, startY + (index * lineHeight));
          });

          const date = new Date();
          const formattedDate = `${date.getFullYear().toString().slice(-2)}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
          ctx.font = '80px IrohaKaku';
          ctx.textAlign = 'right';
          ctx.fillText(formattedDate, 1780, 1020);

          resolve(canvas.toDataURL());
        });
      };
      img.src = backgroundImage;
    });
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split('');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + word).width;
      if (width < maxWidth) {
        currentLine += word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `${title}.png`;
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 py-8">
      <div className="container mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Ogppu!</h1>
          <p className="text-gray-600">OGPのような画像を生成できます!</p>
        </header>

        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Create Your Ogppu!</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className='flex flex-col w-1/2 '>
                <label htmlFor="title" className="font-bold text-lg">Title</label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter title"
                  className="text-lg py-3"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isGenerating}
                className="w-full py-6 text-lg relative overflow-hidden"
              >
                {isGenerating ? (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-primary"
                    initial={{ x: '-100%' }}
                    animate={{ x: '0%' }}
                    transition={{ duration: 2, ease: 'linear' }}
                  >
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </motion.div>
                ) : null}
                <span className={isGenerating ? 'opacity-0' : ''}>Generate Image</span>
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center">
            {generatedImage && (
              <div className="mt-4 space-y-4 w-full">
                <img src={generatedImage} alt={title} className="w-full h-full object-cover rounded-lg shadow-lg" />
                <Button onClick={handleDownload} className="w-full">
                  <Download className="mr-2 h-4 w-4" /> Download Image
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>

        {history.length > 0 && (
          <Card className="mt-8 w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="mr-2" />
                Recent Generations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {history.map((item, index) => (
                  <li key={index} className="text-gray-700">{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}