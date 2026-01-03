// Eldrun Features Module - AAA-Level Implementation
// Export all feature modules for easy integration

// AI// Feature exports
export { aiModeration } from './ai-moderation';
export { aiAssistant } from './ai-assistant';
export { MapEditor } from './ugc-map-editor';
export { TikTokClipGenerator } from './tiktok-clip-generator';
export { voiceChatManager, useVoiceChat } from './voice-chat';
export { analyticsManager, useAnalytics } from './analytics';

// Feature registry for dynamic loading
export const FEATURE_MODULES = {
  'ai-moderation': {
    name: 'AI Content Moderation',
    description: 'Intelligent content moderation powered by OpenAI',
    version: '1.0.0',
    enabled: true,
    dependencies: ['openai'],
  },
  'ai-assistant': {
    name: 'GPT-4 Assistant',
    description: 'AI-powered support and help system',
    version: '1.0.0',
    enabled: true,
    dependencies: ['openai'],
  },
  'ugc-map-editor': {
    name: 'UGC Map Editor',
    description: 'Create and share custom Rust maps',
    version: '1.0.0',
    enabled: true,
    dependencies: [],
  },
  'tiktok-clip-generator': {
    name: 'TikTok Clip Generator',
    description: 'Auto-generate highlights for social media',
    version: '1.0.0',
    enabled: true,
    dependencies: [],
  },
};

// Feature initialization
export async function initializeFeatures() {
  // console.log('🚀 Initializing Eldrun AAA Features...');
  
  const enabledFeatures = Object.entries(FEATURE_MODULES)
    .filter(([_, config]) => config.enabled)
    .map(([id, config]) => ({ id, ...config }));

  console.log(`✅ ${enabledFeatures.length} features enabled:`, enabledFeatures.map(f => f.name));
  
  // Initialize each feature
  for (const feature of enabledFeatures) {
    try {
      // console.log(`   → Loading ${feature.name}...`);
      // Feature-specific initialization would go here
      // console.log(`   ✓ ${feature.name} loaded`);
    } catch (error) {
      console.error(`   ✗ Failed to load ${feature.name}:`, error);
    }
  }
  
  // console.log('🎉 All features initialized successfully!');
  return enabledFeatures;
}
