// AI Content Moderation System for Eldrun
// Uses OpenAI API for intelligent content moderation

export interface ModerationResult {
  isAllowed: boolean;
  categories: {
    spam: boolean;
    toxicity: boolean;
    harassment: boolean;
    nsfw: boolean;
    violence: boolean;
    selfHarm: boolean;
  };
  confidence: number;
  reason?: string;
  filteredContent?: string;
}

export interface ModerationConfig {
  strictMode: boolean;
  autoDelete: boolean;
  warnUser: boolean;
  customFilters: string[];
  exemptRoles: string[];
}

class AIModerationService {
  private apiKey: string;
  private config: ModerationConfig;
  private cache = new Map<string, ModerationResult>();
  private rateLimitMap = new Map<string, number>();

  constructor(apiKey: string, config: ModerationConfig) {
    this.apiKey = apiKey;
    this.config = config;
  }

  // Check if content violates community guidelines
  async moderateContent(
    content: string,
    userId?: string,
    context?: 'chat' | 'forum' | 'profile' | 'message'
  ): Promise<ModerationResult> {
    // Rate limiting check
    if (userId && this.isRateLimited(userId)) {
      return {
        isAllowed: false,
        categories: {
          spam: true,
          toxicity: false,
          harassment: false,
          nsfw: false,
          violence: false,
          selfHarm: false,
        },
        confidence: 1.0,
        reason: 'Rate limit exceeded. Please slow down.'
      };
    }

    // Check cache first
    const cacheKey = this.getCacheKey(content);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const result = await this.analyzeWithAI(content, context);
      
      // Cache the result
      this.cache.set(cacheKey, result);
      
      // Log for analytics
      this.logModeration(content, result, userId, context);
      
      return result;
    } catch (error) {
      console.error('AI Moderation failed:', error);
      
      // Fallback to basic word filter
      return this.basicModeration(content);
    }
  }

  // Analyze content using OpenAI's moderation API
  private async analyzeWithAI(
    content: string,
    context?: string
  ): Promise<ModerationResult> {
    const response = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        input: content,
        model: 'text-moderation-latest',
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const results = data.results[0];

    // Apply additional context-specific rules
    const contextualResult = this.applyContextualRules(
      results,
      content,
      context
    );

    return {
      isAllowed: !contextualResult.flagged,
      categories: {
        spam: contextualResult.categories.includes('spam'),
        toxicity: contextualResult.categories.includes('toxicity'),
        harassment: contextualResult.categories.includes('harassment'),
        nsfw: contextualResult.categories.includes('sexual'),
        violence: contextualResult.categories.includes('violence'),
        selfHarm: contextualResult.categories.includes('self-harm'),
      },
      confidence: Math.max(...Object.values(contextualResult.category_scores).map(Number)),
      reason: contextualResult.flagged ? this.generateReason(contextualResult) : undefined,
    };
  }

  // Apply context-specific moderation rules
  private applyContextualRules(
    result: any,
    content: string,
    context?: string
  ): any {
    // Strict mode for certain contexts
    if (this.config.strictMode && (context === 'forum' || context === 'profile')) {
      // Lower threshold for public content
      if (result.category_scores.harassment > 0.1) {
        result.flagged = true;
        result.categories.push('harassment');
      }
    }

    // Check for custom filters
    for (const filter of this.config.customFilters) {
      if (content.toLowerCase().includes(filter.toLowerCase())) {
        result.flagged = true;
        result.categories.push('custom_filter');
        break;
      }
    }

    // Check for excessive caps (in chat)
    if (context === 'chat' && this.isExcessiveCaps(content)) {
      result.flagged = true;
      result.categories.push('spam');
    }

    // Check for rapid repetition
    if (this.isRepetitive(content)) {
      result.flagged = true;
      result.categories.push('spam');
    }

    return result;
  }

  // Basic fallback moderation without AI
  private basicModeration(content: string): ModerationResult {
    const bannedWords = [
      // Add your banned words list here
      'spam', 'scam', 'hack', 'cheat'
    ];

    const containsBannedWord = bannedWords.some(word =>
      content.toLowerCase().includes(word)
    );

    return {
      isAllowed: !containsBannedWord,
      categories: {
        spam: containsBannedWord,
        toxicity: false,
        harassment: false,
        nsfw: false,
        violence: false,
        selfHarm: false,
      },
      confidence: 0.5,
      reason: containsBannedWord ? 'Contains prohibited content' : undefined,
    };
  }

  // Check for excessive capitalization
  private isExcessiveCaps(content: string): boolean {
    const uppercaseCount = (content.match(/[A-Z]/g) || []).length;
    const totalChars = content.replace(/[^a-zA-Z]/g, '').length;
    return totalChars > 10 && (uppercaseCount / totalChars) > 0.7;
  }

  // Check for repetitive content
  private isRepetitive(content: string): boolean {
    const words = content.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    return words.length > 10 && (uniqueWords.size / words.length) < 0.3;
  }

  // Rate limiting check
  private isRateLimited(userId: string): boolean {
    const now = Date.now();
    const lastRequest = this.rateLimitMap.get(userId) || 0;
    
    if (now - lastRequest < 1000) { // 1 second cooldown
      return true;
    }
    
    this.rateLimitMap.set(userId, now);
    return false;
  }

  // Generate cache key
  private getCacheKey(content: string): string {
    // Simple hash function for caching
    return btoa(content.substring(0, 100)).substring(0, 20);
  }

  // Generate human-readable reason
  private generateReason(result: any): string {
    if (result.categories.includes('spam')) return 'Spam detected';
    if (result.categories.includes('harassment')) return 'Harassment detected';
    if (result.categories.includes('sexual')) return 'Inappropriate content';
    if (result.categories.includes('violence')) return 'Violent content';
    if (result.categories.includes('self-harm')) return 'Self-harm content';
    if (result.categories.includes('custom_filter')) return 'Custom filter triggered';
    return 'Content violates community guidelines';
  }

  // Log moderation events
  private logModeration(
    content: string,
    result: ModerationResult,
    userId?: string,
    context?: string
  ): void {
    // Send to analytics or logging service
    if (process.env.NODE_ENV === 'development') {
    //   console.log('[AI Moderation]', {
    //     userId,
    //     context,
    //     allowed: result.isAllowed,
    //     confidence: result.confidence,
    //     reason: result.reason,
    //   });
    }
  }

  // Filter and replace inappropriate words
  filterContent(content: string): string {
    // Replace inappropriate words with asterisks
    return content.replace(/\b(spam|scam|hack|cheat)\b/gi, '***');
  }

  // Update configuration
  updateConfig(newConfig: Partial<ModerationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const aiModeration = new AIModerationService(
  process.env.OPENAI_API_KEY || '',
  {
    strictMode: true,
    autoDelete: false,
    warnUser: true,
    customFilters: [],
    exemptRoles: ['admin', 'moderator'],
  }
);

// React hook for using AI moderation
export function useAIModeration() {
  const moderate = async (
    content: string,
    userId?: string,
    context?: 'chat' | 'forum' | 'profile' | 'message'
  ) => {
    return aiModeration.moderateContent(content, userId, context);
  };

  return { moderate };
}
