// TikTok Clip Generator for Eldrun
// Automatically generates highlight clips for social media

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, 
  Download, 
  Play, 
  Pause, 
  Scissors, 
  Music, 
  Type, 
  Sparkles,
  Share,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react';

export interface ClipSegment {
  id: string;
  startTime: number;
  endTime: number;
  type: 'kill' | 'win' | 'funny' | 'skill' | 'highlight';
  score: number;
  thumbnail?: string;
}

export interface ClipSettings {
  duration: number; // in seconds
  resolution: '720p' | '1080p' | '4k';
  fps: 30 | 60;
  quality: 'low' | 'medium' | 'high';
  music: boolean;
  subtitles: boolean;
  watermark: boolean;
  effects: boolean;
}

export interface GeneratedClip {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  duration: number;
  fps: number;
  resolution: string;
  effects: string[];
  music: string;
}

interface TikTokClipGeneratorProps {
  videoUrl?: string;
  onClipGenerated?: (clip: GeneratedClip) => void;
  autoDetect?: boolean;
}

export function TikTokClipGenerator({
  videoUrl,
  onClipGenerated,
  autoDetect = true,
}: TikTokClipGeneratorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [segments, setSegments] = useState<ClipSegment[]>([]);
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [settings, setSettings] = useState<ClipSettings>({
    duration: 30,
    resolution: '1080p',
    fps: 60,
    quality: 'high',
    music: true,
    subtitles: true,
    watermark: true,
    effects: true,
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Auto-detect highlights when video loads
  useEffect(() => {
    if (videoUrl && autoDetect) {
      detectHighlights();
    }
  }, [videoUrl, autoDetect]);

  // Detect highlights in video
  const detectHighlights = async () => {
    if (!videoRef.current) return;

    setIsProcessing(true);
    
    // Simulate AI detection
    setTimeout(() => {
      const mockSegments: ClipSegment[] = [
        {
          id: '1',
          startTime: 10,
          endTime: 15,
          type: 'kill',
          score: 0.95,
        },
        {
          id: '2',
          startTime: 25,
          endTime: 30,
          type: 'skill',
          score: 0.88,
        },
        {
          id: '3',
          startTime: 45,
          endTime: 55,
          type: 'win',
          score: 0.92,
        },
        {
          id: '4',
          startTime: 70,
          endTime: 75,
          type: 'funny',
          score: 0.75,
        },
      ];
      
      setSegments(mockSegments);
      setIsProcessing(false);
    }, 2000);
  };

  // Generate clip from selected segments
  const generateClip = async () => {
    if (!videoRef.current || selectedSegments.length === 0) return;

    setIsProcessing(true);

    try {
      // Create canvas for video processing
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas resolution
      canvas.width = settings.resolution === '4k' ? 3840 : settings.resolution === '1080p' ? 1920 : 1280;
      canvas.height = canvas.width / 16 * 9; // 16:9 aspect ratio

      // Get selected segments
      const selected = segments.filter(s => selectedSegments.includes(s.id));
      
      // Create video stream
      const stream = canvas.captureStream(settings.fps);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: settings.quality === 'high' ? 8000000 : settings.quality === 'medium' ? 4000000 : 2000000,
      });

      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        const generatedClip: GeneratedClip = {
          id: `clip_${Date.now()}`,
          title: `Eldrun Clip - ${new Date().toLocaleDateString()}`,
          url,
          thumbnailUrl: '/images/clip-thumbnail.jpg',
          duration: settings.duration,
          fps: settings.fps,
          resolution: settings.resolution,
          effects: settings.effects ? ['slow-mo', 'zoom', 'glitch'] : [],
          music: settings.music ? 'epic-battle-music.mp3' : ''
        };
        
        onClipGenerated?.(generatedClip);
        setIsProcessing(false);
      };

      // Start recording
      mediaRecorder.start();

      // Process each segment
      for (const segment of selected) {
        await processSegment(segment, ctx, canvas);
      }

      // Stop recording
      mediaRecorder.stop();
    } catch (error) {
      console.error('Failed to generate clip:', error);
      setIsProcessing(false);
    }
  };

  // Process a single segment
  const processSegment = async (
    segment: ClipSegment,
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ) => {
    const video = videoRef.current;
    if (!video) return;

    const duration = segment.endTime - segment.startTime;
    const frames = duration * settings.fps;

    for (let i = 0; i < frames; i++) {
      const time = segment.startTime + (i / settings.fps);
      video.currentTime = time;
      
      await new Promise(resolve => {
        video.onseeked = resolve;
      });

      // Draw video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Add effects if enabled
      if (settings.effects) {
        addEffects(ctx, canvas, segment.type);
      }

      // Add watermark if enabled
      if (settings.watermark) {
        addWatermark(ctx, canvas);
      }

      // Add subtitles if enabled
      if (settings.subtitles) {
        addSubtitles(ctx, canvas, segment);
      }

      // Wait for frame rate
      await new Promise(resolve => setTimeout(resolve, 1000 / settings.fps));
    }
  };

  // Add visual effects
  const addEffects = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    type: string
  ) => {
    ctx.save();

    switch (type) {
      case 'kill':
        // Red flash effect
        ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        break;
      case 'skill':
        // Blue glow effect
        ctx.shadowColor = '#0066ff';
        ctx.shadowBlur = 20;
        break;
      case 'win':
        // Gold particles effect
        for (let i = 0; i < 20; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          ctx.fillStyle = '#FFD700';
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      case 'funny':
        // Distortion effect
        ctx.filter = 'contrast(1.2) saturate(1.5)';
        break;
    }

    ctx.restore();
  };

  // Add watermark
  const addWatermark = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '24px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('@Eldrun', canvas.width - 20, canvas.height - 20);
    ctx.restore();
  };

  // Add subtitles
  const addSubtitles = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    segment: ClipSegment
  ) => {
    ctx.save();
    
    // Background for text
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
    
    // Text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(getSegmentText(segment.type), canvas.width / 2, canvas.height - 40);
    
    ctx.restore();
  };

  // Get text for segment type
  const getSegmentText = (type: string): string => {
    const texts = {
      kill: '🔥 ELIMINIERT!',
      skill: '⚡ SKILL SHOT!',
      win: '🏆 SIEG!',
      funny: '😂 LUSTIGER MOMENT!',
      highlight: '✨ HIGHLIGHT!',
    };
    return texts[type as keyof typeof texts] || '✨ HIGHLIGHT!';
  };

  // Toggle segment selection
  const toggleSegment = (segmentId: string) => {
    setSelectedSegments(prev => 
      prev.includes(segmentId)
        ? prev.filter(id => id !== segmentId)
        : [...prev, segmentId]
    );
  };

  // Share to TikTok
  const shareToTikTok = async (clip: Blob) => {
    // In a real implementation, this would use TikTok's API
    // For now, we'll just download the clip
    const url = URL.createObjectURL(clip);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'eldrun-clip.webm';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Video className="w-8 h-8 text-purple-500" />
            TikTok Clip Generator
          </h1>
          <p className="text-gray-400">
            Erstelle automatisch epische Clips für Social Media
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Preview */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full rounded-lg bg-black"
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              
              {/* Video Controls */}
              <div className="mt-4 flex items-center gap-4">
                <button
                  onClick={() => {
                    if (isPlaying) {
                      videoRef.current?.pause();
                    } else {
                      videoRef.current?.play();
                    }
                  }}
                  className="p-2 bg-gray-700 rounded hover:bg-gray-600"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max={videoRef.current?.duration || 0}
                    value={currentTime}
                    onChange={(e) => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = Number(e.target.value);
                      }
                    }}
                    className="w-full"
                  />
                </div>
                
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 bg-gray-700 rounded hover:bg-gray-600"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Timeline with Segments */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Scissors className="w-4 h-4" />
                Highlight Segmente
              </h3>
              
              {isProcessing ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
                  <span className="ml-2">Analysiere Video...</span>
                </div>
              ) : segments.length > 0 ? (
                <div className="space-y-2">
                  {segments.map(segment => (
                    <div
                      key={segment.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedSegments.includes(segment.id)
                          ? 'bg-purple-600 border-purple-500'
                          : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                      }`}
                      onClick={() => toggleSegment(segment.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">
                            {segment.type === 'kill' && '🔥'}
                            {segment.type === 'skill' && '⚡'}
                            {segment.type === 'win' && '🏆'}
                            {segment.type === 'funny' && '😂'}
                            {segment.type === 'highlight' && '✨'}
                          </span>
                          <div>
                            <p className="font-medium capitalize">{segment.type}</p>
                            <p className="text-sm text-gray-400">
                              {segment.startTime}s - {segment.endTime}s
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-400">Score</p>
                          <p className="font-medium">{Math.round(segment.score * 100)}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  Keine Segmente gefunden. Lade ein Video hoch.
                </p>
              )}
            </div>
          </div>

          {/* Settings Panel */}
          <div className="space-y-4">
            {/* Settings */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Einstellungen
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-400">Dauer</label>
                  <select
                    value={settings.duration}
                    onChange={(e) => setSettings(prev => ({ ...prev, duration: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-gray-700 rounded"
                  >
                    <option value={15}>15 Sekunden</option>
                    <option value={30}>30 Sekunden</option>
                    <option value={60}>60 Sekunden</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">Auflösung</label>
                  <select
                    value={settings.resolution}
                    onChange={(e) => setSettings(prev => ({ ...prev, resolution: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-gray-700 rounded"
                  >
                    <option value="720p">720p</option>
                    <option value="1080p">1080p</option>
                    <option value="4k">4K</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">FPS</label>
                  <select
                    value={settings.fps}
                    onChange={(e) => setSettings(prev => ({ ...prev, fps: Number(e.target.value) as 30 | 60 }))}
                    className="w-full px-3 py-2 bg-gray-700 rounded"
                  >
                    <option value={30}>30 FPS</option>
                    <option value={60}>60 FPS</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.music}
                      onChange={(e) => setSettings(prev => ({ ...prev, music: e.target.checked }))}
                      className="rounded"
                    />
                    <Music className="w-4 h-4" />
                    <span className="text-sm">Musik hinzufügen</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.subtitles}
                      onChange={(e) => setSettings(prev => ({ ...prev, subtitles: e.target.checked }))}
                      className="rounded"
                    />
                    <Type className="w-4 h-4" />
                    <span className="text-sm">Untertitel</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.watermark}
                      onChange={(e) => setSettings(prev => ({ ...prev, watermark: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm">Watermark</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.effects}
                      onChange={(e) => setSettings(prev => ({ ...prev, effects: e.target.checked }))}
                      className="rounded"
                    />
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm">Effekte</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-800 rounded-lg p-4">
              <button
                onClick={generateClip}
                disabled={selectedSegments.length === 0 || isProcessing}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <Scissors className="w-5 h-5" />
                {isProcessing ? 'Wird verarbeitet...' : 'Clip generieren'}
              </button>
              
              <button
                onClick={() => detectHighlights()}
                disabled={isProcessing}
                className="w-full mt-2 py-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Highlights neu analysieren
              </button>
            </div>

            {/* Tips */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-medium mb-2">💡 Tipps</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Wähle die besten Highlights aus</li>
                <li>• Kurze Clips (15-30s) performen besser</li>
                <li>• Füge Musik und Effekte hinzu</li>
                <li>• Verwende relevante Hashtags</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
