// UGC Map Editor for Eldrun Rust Maps
// Allows players to create, edit, and share custom Rust maps

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  Download, 
  Upload, 
  Grid3X3, 
  Layers, 
  Mountain, 
  Trees, 
  Building, 
  Package,
  Trash2,
  Undo,
  Redo,
  Play,
  Eye
} from 'lucide-react';

export interface MapElement {
  id: string;
  type: 'terrain' | 'building' | 'resource' | 'spawn' | 'zone';
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  properties: Record<string, any>;
}

export interface MapData {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  size: { width: number; height: number };
  elements: MapElement[];
  settings: {
    dayNightCycle: boolean;
    weather: 'clear' | 'foggy' | 'rainy' | 'stormy';
    maxPlayers: number;
    respawnTime: number;
  };
}

interface MapEditorProps {
  initialMap?: Partial<MapData>;
  onSave?: (map: MapData) => void;
  onPreview?: (map: MapData) => void;
  readOnly?: boolean;
}

export function MapEditor({
  initialMap,
  onSave,
  onPreview,
  readOnly = false,
}: MapEditorProps) {
  const [map, setMap] = useState<MapData>({
    id: generateId(),
    name: 'Neue Map',
    description: '',
    author: 'Anonymous',
    version: '1.0.0',
    size: { width: 1000, height: 1000 },
    elements: [],
    settings: {
      dayNightCycle: true,
      weather: 'clear',
      maxPlayers: 50,
      respawnTime: 30,
    },
    ...initialMap,
  });

  const [selectedTool, setSelectedTool] = useState<string>('select');
  const [selectedElement, setSelectedElement] = useState<MapElement | null>(null);
  const [history, setHistory] = useState<MapData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isPreview, setIsPreview] = useState(false);
  const [showGrid, setShowGrid] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Tool categories
  const tools = {
    basic: [
      { id: 'select', icon: <Grid3X3 className="w-4 h-4" />, name: 'Auswählen' },
      { id: 'terrain', icon: <Mountain className="w-4 h-4" />, name: 'Gelände' },
      { id: 'vegetation', icon: <Trees className="w-4 h-4" />, name: 'Vegetation' },
      { id: 'building', icon: <Building className="w-4 h-4" />, name: 'Gebäude' },
      { id: 'resource', icon: <Package className="w-4 h-4" />, name: 'Ressourcen' },
    ],
    advanced: [
      { id: 'spawn', icon: <Play className="w-4 h-4" />, name: 'Spawn-Punkte' },
      { id: 'zone', icon: <Layers className="w-4 h-4" />, name: 'Zonen' },
    ],
  };

  // Element templates
  const elementTemplates = {
    terrain: [
      { type: 'mountain', name: 'Berg', properties: { height: 50 } },
      { type: 'hill', name: 'Hügel', properties: { height: 20 } },
      { type: 'valley', name: 'Tal', properties: { depth: 30 } },
      { type: 'river', name: 'Fluss', properties: { width: 10, depth: 5 } },
    ],
    vegetation: [
      { type: 'tree', name: 'Baum', properties: { type: 'oak', height: 10 } },
      { type: 'bush', name: 'Busch', properties: { type: 'berry' } },
      { type: 'grass', name: 'Gras', properties: { density: 'high' } },
    ],
    building: [
      { type: 'foundation', name: 'Fundament', properties: { size: 3, material: 'wood' } },
      { type: 'wall', name: 'Mauer', properties: { height: 3, material: 'stone' } },
      { type: 'tower', name: 'Turm', properties: { height: 10, floors: 3 } },
    ],
    resource: [
      { type: 'ore', name: 'Erz', properties: { type: 'metal', amount: 1000 } },
      { type: 'chest', name: 'Kiste', properties: { slots: 30 } },
      { type: 'barrel', name: 'Fass', properties: { content: 'water' } },
    ],
    spawn: [
      { type: 'player', name: 'Spieler-Spawn', properties: { team: 'neutral' } },
      { type: 'npc', name: 'NPC-Spawn', properties: { type: 'vendor' } },
      { type: 'vehicle', name: 'Fahrzeug-Spawn', properties: { type: 'boat' } },
    ],
    zone: [
      { type: 'safe', name: 'Sichere Zone', properties: { radius: 50 } },
      { type: 'pvp', name: 'PVP Zone', properties: { radius: 100 } },
      { type: 'build', name: 'Bau-Zone', properties: { radius: 75 } },
    ],
  };

  // Save current state to history
  const saveToHistory = () => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(map)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Add element to map
  const addElement = (template: any) => {
    if (readOnly) return;

    const newElement: MapElement = {
      id: generateId(),
      type: selectedTool as any,
      position: { x: 500, y: 0, z: 500 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      properties: template.properties,
    };

    saveToHistory();
    setMap(prev => ({
      ...prev,
      elements: [...prev.elements, newElement],
    }));
    setSelectedElement(newElement);
  };

  // Remove selected element
  const removeElement = () => {
    if (!selectedElement || readOnly) return;

    saveToHistory();
    setMap(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== selectedElement.id),
    }));
    setSelectedElement(null);
  };

  // Undo
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setMap(history[historyIndex - 1]);
    }
  };

  // Redo
  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setMap(history[historyIndex + 1]);
    }
  };

  // Export map
  const exportMap = () => {
    const dataStr = JSON.stringify(map, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${map.name.replace(/\s+/g, '_')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Import map
  const importMap = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setMap(imported);
        saveToHistory();
      } catch (error) {
        console.error('Failed to import map:', error);
        alert('Fehler beim Importieren der Map-Datei');
      }
    };
    reader.readAsText(file);
  };

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = isPreview ? '#87CEEB' : '#2a2a2a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    if (showGrid && !isPreview) {
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    // Draw elements
    map.elements.forEach(element => {
      const x = (element.position.x / map.size.width) * canvas.width;
      const y = (element.position.z / map.size.height) * canvas.height;

      ctx.fillStyle = getElementColor(element.type);
      
      if (element.type === 'building') {
        ctx.fillRect(x - 10, y - 10, 20, 20);
      } else if (element.type === 'terrain') {
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
      } else if (element.type === 'resource') {
        ctx.beginPath();
        ctx.moveTo(x, y - 10);
        ctx.lineTo(x - 10, y + 10);
        ctx.lineTo(x + 10, y + 10);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillRect(x - 5, y - 5, 10, 10);
      }

      // Highlight selected
      if (selectedElement?.id === element.id) {
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 15, y - 15, 30, 30);
      }
    });
  }, [map, selectedElement, showGrid, isPreview]);

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar - Tools */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-white font-medium mb-2">Map Editor</h2>
          <input
            type="text"
            value={map.name}
            onChange={(e) => setMap(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-2 py-1 bg-gray-700 text-white rounded"
            placeholder="Map Name"
            disabled={readOnly}
          />
        </div>

        {/* Tools */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {Object.entries(tools).map(([category, toolList]) => (
              <div key={category}>
                <h3 className="text-gray-400 text-sm mb-2 capitalize">{category}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {toolList.map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => setSelectedTool(tool.id)}
                      className={`p-2 rounded flex flex-col items-center gap-1 transition-colors ${
                        selectedTool === tool.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                      disabled={readOnly}
                    >
                      {tool.icon}
                      <span className="text-xs">{tool.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Element Templates */}
          {selectedTool !== 'select' && elementTemplates[selectedTool as keyof typeof elementTemplates] && (
            <div className="mt-4">
              <h3 className="text-gray-400 text-sm mb-2">Elemente</h3>
              <div className="space-y-1">
                {elementTemplates[selectedTool as keyof typeof elementTemplates].map((template, idx) => (
                  <button
                    key={idx}
                    onClick={() => addElement(template)}
                    className="w-full px-2 py-1 bg-gray-700 text-gray-300 rounded text-left hover:bg-gray-600 text-sm"
                    disabled={readOnly}
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-700 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={undo}
              disabled={historyIndex <= 0 || readOnly}
              className="flex-1 px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 flex items-center justify-center gap-1"
            >
              <Undo className="w-4 h-4" />
              Undo
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1 || readOnly}
              className="flex-1 px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 flex items-center justify-center gap-1"
            >
              <Redo className="w-4 h-4" />
              Redo
            </button>
          </div>
          
          <button
            onClick={() => setShowGrid(!showGrid)}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 flex items-center justify-center gap-2"
          >
            <Grid3X3 className="w-4 h-4" />
            {showGrid ? 'Grid aus' : 'Grid an'}
          </button>

          <button
            onClick={() => setIsPreview(!isPreview)}
            className="w-full px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {isPreview ? 'Edit Mode' : 'Vorschau'}
          </button>

          {!readOnly && (
            <>
              <button
                onClick={() => selectedElement && removeElement()}
                disabled={!selectedElement}
                className="w-full px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Löschen
              </button>

              <button
                onClick={() => onSave && onSave(map)}
                className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Speichern
              </button>
            </>
          )}

          <div className="flex gap-2">
            <button
              onClick={exportMap}
              className="flex-1 px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 flex items-center justify-center gap-1"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <label className="flex-1 px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 flex items-center justify-center gap-1 cursor-pointer">
              <Upload className="w-4 h-4" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={importMap}
                className="hidden"
                disabled={readOnly}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">
              Größe: {map.size.width}x{map.size.height}
            </span>
            <span className="text-gray-400 text-sm">
              Elemente: {map.elements.length}
            </span>
            {selectedElement && (
              <span className="text-gray-400 text-sm">
                Ausgewählt: {selectedElement.type}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">
              Version: {map.version}
            </span>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 p-4 bg-gray-900 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="border border-gray-700 rounded cursor-crosshair"
          />
        </div>

        {/* Properties Panel */}
        {selectedElement && (
          <div className="h-48 bg-gray-800 border-t border-gray-700 p-4">
            <h3 className="text-white font-medium mb-2">Eigenschaften</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-gray-400 text-xs">Position X</label>
                <input
                  type="number"
                  value={selectedElement.position.x}
                  onChange={(e) => {
                    const updated = { ...selectedElement, position: { ...selectedElement.position, x: Number(e.target.value) } };
                    setSelectedElement(updated);
                    setMap(prev => ({
                      ...prev,
                      elements: prev.elements.map(el => el.id === updated.id ? updated : el)
                    }));
                  }}
                  className="w-full px-2 py-1 bg-gray-700 text-white rounded"
                  disabled={readOnly}
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs">Position Y</label>
                <input
                  type="number"
                  value={selectedElement.position.y}
                  onChange={(e) => {
                    const updated = { ...selectedElement, position: { ...selectedElement.position, y: Number(e.target.value) } };
                    setSelectedElement(updated);
                    setMap(prev => ({
                      ...prev,
                      elements: prev.elements.map(el => el.id === updated.id ? updated : el)
                    }));
                  }}
                  className="w-full px-2 py-1 bg-gray-700 text-white rounded"
                  disabled={readOnly}
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs">Position Z</label>
                <input
                  type="number"
                  value={selectedElement.position.z}
                  onChange={(e) => {
                    const updated = { ...selectedElement, position: { ...selectedElement.position, z: Number(e.target.value) } };
                    setSelectedElement(updated);
                    setMap(prev => ({
                      ...prev,
                      elements: prev.elements.map(el => el.id === updated.id ? updated : el)
                    }));
                  }}
                  className="w-full px-2 py-1 bg-gray-700 text-white rounded"
                  disabled={readOnly}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to generate ID
function generateId(): string {
  return `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper function to get element color
function getElementColor(type: string): string {
  const colors = {
    terrain: '#8B4513',
    building: '#696969',
    resource: '#FFD700',
    spawn: '#00FF00',
    zone: '#FF00FF',
  };
  return colors[type as keyof typeof colors] || '#FFFFFF';
}
