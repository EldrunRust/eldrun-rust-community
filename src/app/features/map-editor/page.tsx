'use client';

import { MapEditor } from '@/features/ugc-map-editor';
import { Shield, Star } from 'lucide-react';
import { AuthGate } from '@/components/AuthGate';

export default function MapEditorPage() {
  return (
    <AuthGate>
      <div className="min-h-screen bg-metal-950 pt-24">
      <div className="bg-metal-900 border-b border-metal-800">
        <div className="container-rust py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  UGC Map Editor
                  <Shield className="w-5 h-5 text-purple-500" />
                </h1>
                <p className="text-gray-400">Erstelle und teile deine eigenen Rust-Maps</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">AAA Feature</p>
                <p className="text-xs text-purple-400">Powered by Eldrun</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MapEditor
        onSave={(map) => {
          // // console.log('Map saved:', map);
          // Implement save functionality
          const mapData = {
            ...map,
            id: `map_${Date.now()}`,
            author: 'CurrentUser',
            createdAt: new Date().toISOString(),
            version: '1.0'
          };
          
          // Save to localStorage
          const savedMaps = JSON.parse(localStorage.getItem('eldrun_maps') || '[]');
          savedMaps.push(mapData);
          localStorage.setItem('eldrun_maps', JSON.stringify(savedMaps));
          
          // Show success message
          alert('Map erfolgreich gespeichert!');
        }}
        onPreview={(map) => {
          // // console.log('Preview map:', map);
          // Implement preview functionality
          const previewData = {
            ...map,
            previewMode: true
          };
          
          // Open in new tab or modal
          const previewWindow = window.open('', '_blank');
          if (previewWindow) {
            previewWindow.document.write(`
              <html>
                <head><title>Map Preview</title></head>
                <body style="margin:0;background:#1a1a1a;">
                  <div style="padding:20px;color:white;">
                    <h2>Map Preview: ${map.name || 'Untitled'}</h2>
                    <p>Size: ${(map as any).width || 0}x${(map as any).height || 0}</p>
                    <p>Objects: ${(map as any).objects?.length || 0}</p>
                  </div>
                </body>
              </html>
            `);
          }
        }}
      />
      </div>
    </AuthGate>
  );
}
