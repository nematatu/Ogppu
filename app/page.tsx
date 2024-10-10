'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Download, History } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import Image from 'next/image'
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
        console.log('title:', title);
        const response = await axios.post('/api/ogp', {
            title,
        });

        if (response.status === 200) {
            const base64Image = `data:image/png;base64,${response.data.image}`;
            setGeneratedImage(base64Image);
            setHistory((prev) => [title, ...prev.slice(0, 4)]);
        } else {
            console.error('Failed to generate image:', response.statusText);
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // Axiosエラーの場合
            console.error('Axios Error:', error.response?.data || error.message);
            if (error.response) {
                // サーバーからのレスポンスがある場合
                console.error('Error status:', error.response.status);
                console.error('Error data:', error.response.data);
            }
        } else {
            // その他のエラーの場合
            console.error('Error:', error);
        }
    } finally {
        setIsGenerating(false);
    }
};

  const handleDownload = () => {
    // In a real app, this would trigger the actual download
    alert('Downloading image: ' + title)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 py-8">
      <div className="container mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Ogppu!</h1>
          <p className="text-gray-600">OGPのような画像を生成できます!
          </p>
        </header>

        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Create Your Ogppu!</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="space-y-4">
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title"
                className="text-lg py-3"
                required
              />
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