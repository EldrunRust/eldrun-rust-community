'use client';

import { TikTokClipGenerator } from '@/features/tiktok-clip-generator';
import { Video, Zap } from 'lucide-react';
import { AuthGate } from '@/components/AuthGate';

export default function ClipGeneratorPage() {
  return (
    <AuthGate>
      <div className="min-h-screen bg-metal-950 pt-24">
      <div className="bg-metal-900 border-b border-metal-800">
        <div className="container-rust py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-600 rounded-xl flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  TikTok Clip Generator
                  <Zap className="w-5 h-5 text-pink-500" />
                </h1>
                <p className="text-gray-400">Erstelle epische Clips für Social Media</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">AAA Feature</p>
                <p className="text-xs text-pink-400">Powered by AI</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TikTokClipGenerator
        videoUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        onClipGenerated={(clip) => {
          // // console.log('Clip generated:', clip);
          // Implement download/share functionality
          const clipData = {
            ...clip,
            id: `clip_${Date.now()}`,
            generatedAt: new Date().toISOString()
          };
          
          // Save to localStorage
          const savedClips = JSON.parse(localStorage.getItem('eldrun_clips') || '[]');
          savedClips.push(clipData);
          localStorage.setItem('eldrun_clips', JSON.stringify(savedClips));
          
          // Create download link
          const downloadLink = document.createElement('a');
          downloadLink.href = clip.url;
          downloadLink.download = `${clip.title}.mp4`;
          downloadLink.click();
          
          // Show success message
          alert('Clip erfolgreich generiert und heruntergeladen!');
        }}
        autoDetect={true}
      />
      </div>
    </AuthGate>
  );
}
