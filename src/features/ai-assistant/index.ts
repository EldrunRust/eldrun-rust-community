// GPT-4 AI Assistant for Eldrun Community
// Provides intelligent support, answers questions, and helps players

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  context?: {
    section?: 'general' | 'gameplay' | 'technical' | 'rules' | 'trading';
    relatedUrl?: string;
    metadata?: Record<string, any>;
  };
}

export interface AssistantConfig {
  model: 'gpt-4' | 'gpt-3.5-turbo';
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  knowledgeBase: string[];
  personality: 'helpful' | 'professional' | 'friendly' | 'epic';
}

class AIAssistantService {
  private apiKey: string;
  private config: AssistantConfig;
  private conversationHistory = new Map<string, AssistantMessage[]>();
  private knowledgeBase: Map<string, string> = new Map();

  constructor(apiKey: string, config: AssistantConfig) {
    this.apiKey = apiKey;
    this.config = config;
    this.initializeKnowledgeBase();
  }

  // Initialize with Eldrun-specific knowledge
  private initializeKnowledgeBase(): void {
    const baseKnowledge = [
      {
        id: 'eldrun-basics',
        content: `
Eldrun ist eine Rust Gaming Community mit folgenden Features:
- NASA-Level Forum mit AI-Moderation
- 3D Avatar-Generator mit Fraktionen (Seraphar, Vorgaroth, Netharis, Kaldrim)
- Klassen-System: Krieger, Assassine, Magier, Heiler, Wächter
- Live Chat mit Reaktionen und Gifts
- Casino mit Mini-Spielen
- Battle Pass und Quests
- Clan-System und Wars
- Server-Heatmap und Statistiken
- Marktplatz für Trading
        `.trim(),
      },
      {
        id: 'rust-gameplay',
        content: `
Rust Gameplay Basics:
- Sammle Ressourcen: Holz, Stein, Metall, Schwefel
- Baue eine Basis mit Werkbank und Schmiede
- Craft Waffen: Bogen, Speer, Pistole, AK
- Überlebe die Umwelt: Kälte, Strahlung, Tiere
- Interagiere mit anderen Spielern: Handel oder Kampf
- Joine einem Clan für Schutz und Ressourcen
        `.trim(),
      },
      {
        id: 'community-rules',
        content: `
Community Regeln:
1. Kein Cheating oder Exploiting
2. Keine Beleidigungen oder Toxizität
3. Kein Spam im Chat oder Forum
4. Respektiere Admins und Mods
5. Keine persön von persönlicher Agression
6. Reporte Bugs, nutze sie nicht aus
7. Halte dich an die Server-Sprache (Deutsch)
        `.trim(),
      },
      {
        id: 'technical-help',
        content: `
Technische Hilfe:
- Verbindung Probleme: Port 28082 freigeben
- Lags: Grafik auf mittel stellen
- Crashes: Spiel und Cache löschen
- Mods: EldrunCore installieren
- FPS Boost: Launch Options: -force-d3d11
        `.trim(),
      },
    ];

    baseKnowledge.forEach(item => {
      this.knowledgeBase.set(item.id, item.content);
    });
  }

  // Send message to AI assistant
  async sendMessage(
    message: string,
    userId: string,
    context?: AssistantMessage['context']
  ): Promise<AssistantMessage> {
    // Get or create conversation history
    const history = this.conversationHistory.get(userId) || [];
    
    // Add user message
    const userMessage: AssistantMessage = {
      id: this.generateId(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      context,
    };
    
    history.push(userMessage);

    // Prepare messages for API
    const messages = [
      {
        role: 'system' as const,
        content: this.buildSystemPrompt(context?.section),
      },
      ...this.formatHistoryForAPI(history.slice(-10)), // Keep last 10 messages
    ];

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const assistantContent = data.choices[0].message.content;

      // Create assistant message
      const assistantMessage: AssistantMessage = {
        id: this.generateId(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
        context,
      };

      // Update history
      history.push(assistantMessage);
      this.conversationHistory.set(userId, history);

      return assistantMessage;
    } catch (error) {
      console.error('AI Assistant error:', error);
      
      // Fallback response
      return {
        id: this.generateId(),
        role: 'assistant',
        content: 'Entschuldigung, ich habe gerade technische Schwierigkeiten. Bitte versuche es später erneut oder wende dich an einen Admin.',
        timestamp: new Date(),
        context,
      };
    }
  }

  // Build system prompt based on context
  private buildSystemPrompt(section?: string): string {
    const basePrompt = this.config.systemPrompt;
    
    let contextPrompt = '';
    switch (section) {
      case 'gameplay':
        contextPrompt = '\n\nDu bist ein Rust Gameplay Experte. Gib präzise Tipps zum Überleben, Bauen und Kämpfen.';
        break;
      case 'technical':
        contextPrompt = '\n\nDu bist ein technischer Support. Hilf bei Verbindungsproblemen, Performance und Bugs.';
        break;
      case 'rules':
        contextPrompt = '\n\nDu bist ein Moderator. Erkläre die Regeln klar und fair.';
        break;
      case 'trading':
        contextPrompt = '\n\nDu bist ein Trading Experte. Gib Tipps zum fairen Handel und Preisbewertung.';
        break;
      default:
        contextPrompt = '\n\nDu bist ein hilfreicher Eldrun Community Assistant.';
    }

    // Add knowledge base context
    const knowledgeContext = Array.from(this.knowledgeBase.values()).join('\n\n');

    return `${basePrompt}${contextPrompt}\n\nWichtiges Wissen über Eldrun:\n${knowledgeContext}`;
  }

  // Format history for API
  private formatHistoryForAPI(history: AssistantMessage[]) {
    return history.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  // Get conversation history
  getHistory(userId: string): AssistantMessage[] {
    return this.conversationHistory.get(userId) || [];
  }

  // Clear conversation history
  clearHistory(userId: string): void {
    this.conversationHistory.delete(userId);
  }

  // Search knowledge base
  searchKnowledge(query: string): Array<{ id: string; content: string; relevance: number }> {
    const results: Array<{ id: string; content: string; relevance: number }> = [];
    
    this.knowledgeBase.forEach((content, id) => {
      const relevance = this.calculateRelevance(query, content);
      if (relevance > 0.1) {
        results.push({ id, content, relevance });
      }
    });

    return results.sort((a, b) => b.relevance - a.relevance).slice(0, 3);
  }

  // Calculate relevance score
  private calculateRelevance(query: string, content: string): number {
    const queryWords = query.toLowerCase().split(/\s+/);
    const contentWords = content.toLowerCase().split(/\s+/);
    
    const matches = queryWords.filter(word => contentWords.includes(word));
    return matches.length / queryWords.length;
  }

  // Generate unique ID
  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Update configuration
  updateConfig(newConfig: Partial<AssistantConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Add knowledge to base
  addKnowledge(id: string, content: string): void {
    this.knowledgeBase.set(id, content);
  }

  // Get suggested questions
  getSuggestedQuestions(section?: string): string[] {
    const questions = {
      general: [
        'Was ist Eldrun?',
        'Wie joine ich einem Clan?',
        'Wo finde ich die Regeln?',
      ],
      gameplay: [
        'Wie crafte ich eine AK?',
        'Wofür brauche ich Schwefel?',
        'Wie schütze ich meine Basis?',
      ],
      technical: [
        'Warum laggt mein Spiel?',
        'Wie installiere ich Mods?',
        'Warum kann ich nicht connecten?',
      ],
      trading: [
        'Was ist ein Scrap wert?',
        'Wie trade ich sicher?',
        'Wo finde ich den Marktplatz?',
      ],
    };

    return questions[section as keyof typeof questions] || questions.general;
  }
}

// Default configuration
const defaultConfig: AssistantConfig = {
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 500,
  personality: 'helpful',
  systemPrompt: `
Du bist "Eldrun Assistant", ein KI-Helfer für die Eldrun Rust Gaming Community.
Deine Eigenschaften:
- Hilfsbereit und freundlich
- Kenntnisse über Rust und Eldrun
- Gib präzise, nützliche Antworten
- Bleib immer im Charakter
- Sprache: Deutsch
- Maximale Antwortlänge: 2-3 Sätze pro Absatz

Antworte immer als wärst du Teil der Community. Verw von persönlichlicher Ansprache ("Du").
  `.trim(),
  knowledgeBase: [],
};

// Export singleton instance
export const aiAssistant = new AIAssistantService(
  process.env.OPENAI_API_KEY || '',
  defaultConfig
);

// React hook for using AI assistant
export function useAIAssistant() {
  const sendMessage = async (
    message: string,
    userId: string,
    context?: AssistantMessage['context']
  ) => {
    return aiAssistant.sendMessage(message, userId, context);
  };

  const getHistory = (userId: string) => {
    return aiAssistant.getHistory(userId);
  };

  const clearHistory = (userId: string) => {
    aiAssistant.clearHistory(userId);
  };

  const getSuggestedQuestions = (section?: string) => {
    return aiAssistant.getSuggestedQuestions(section);
  };

  return { sendMessage, getHistory, clearHistory, getSuggestedQuestions };
}
