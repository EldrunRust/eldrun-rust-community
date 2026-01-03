// AI Moderator Component - Real-time content moderation UI
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Settings } from 'lucide-react';
import { useAIModeration, ModerationResult } from './index';

interface AIModeratorProps {
  content: string;
  onContentChange?: (content: string) => void;
  userId?: string;
  context?: 'chat' | 'forum' | 'profile' | 'message';
  showUI?: boolean;
  autoFilter?: boolean;
}

export function AIModerator({
  content,
  onContentChange,
  userId,
  context = 'chat',
  showUI = true,
  autoFilter = false,
}: AIModeratorProps) {
  const { moderate } = useAIModeration();
  const [result, setResult] = useState<ModerationResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const analyzeContent = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      const moderationResult = await moderate(content, userId, context);
      setResult(moderationResult);
      
      // Auto-filter if enabled and content is not allowed
      if (autoFilter && !moderationResult.isAllowed && onContentChange) {
        onContentChange(moderationResult.filteredContent || '');
      }
    } catch (error) {
      console.error('Moderation analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [content, userId, context, autoFilter, onContentChange, moderate]);

  // Analyze content when it changes
  useEffect(() => {
    if (content.length > 0) {
      analyzeContent();
    } else {
      setResult(null);
    }
  }, [content, userId, context, autoFilter, onContentChange, analyzeContent]);

  if (!showUI) {
    return null;
  }

  const getStatusColor = () => {
    if (!result) return 'text-gray-500';
    if (result.isAllowed) return 'text-green-500';
    return 'text-red-500';
  };

  const getStatusIcon = () => {
    if (isAnalyzing) {
      return <Shield className="w-4 h-4 animate-pulse" />;
    }
    if (!result) {
      return <Shield className="w-4 h-4" />;
    }
    if (result.isAllowed) {
      return <CheckCircle className="w-4 h-4" />;
    }
    return <XCircle className="w-4 h-4" />;
  };

  const getConfidenceColor = () => {
    if (!result) return 'bg-gray-200';
    if (result.confidence > 0.8) return 'bg-green-500';
    if (result.confidence > 0.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="ai-moderator">
      {/* Status Bar */}
      <div className={`flex items-center gap-2 text-sm ${getStatusColor()}`}>
        {getStatusIcon()}
        <span>
          {isAnalyzing
            ? 'Analysiere Inhalt...'
            : !result
            ? 'Bereit zur Analyse'
            : result.isAllowed
            ? 'Inhalt zulässig'
            : 'Inhalt blockiert'}
        </span>
        
        {result && (
          <div className="ml-auto flex items-center gap-2">
            {/* Confidence Indicator */}
            <div className="flex items-center gap-1">
              <span className="text-xs">Vertrauen:</span>
              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${getConfidenceColor()}`}
                  style={{ width: `${result.confidence * 100}%` }}
                />
              </div>
              <span className="text-xs">
                {Math.round(result.confidence * 100)}%
              </span>
            </div>
            
            {/* Details Toggle */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Settings className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Warning Message */}
      {result && !result.isAllowed && result.reason && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
          <div>
            <p className="text-sm text-red-800">{result.reason}</p>
            <p className="text-xs text-red-600 mt-1">
              Bitte passe deinen Inhalt an die Community-Richtlinien an.
            </p>
          </div>
        </div>
      )}

      {/* Details Panel */}
      {showDetails && result && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-2">
          <h4 className="font-medium text-sm">Analyse-Details:</h4>
          
          {/* Category Breakdown */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span>Spam:</span>
              <span className={result.categories.spam ? 'text-red-500' : 'text-green-500'}>
                {result.categories.spam ? 'Erkannt' : 'OK'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Toxizität:</span>
              <span className={result.categories.toxicity ? 'text-red-500' : 'text-green-500'}>
                {result.categories.toxicity ? 'Erkannt' : 'OK'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Belästigung:</span>
              <span className={result.categories.harassment ? 'text-red-500' : 'text-green-500'}>
                {result.categories.harassment ? 'Erkannt' : 'OK'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>NSFW:</span>
              <span className={result.categories.nsfw ? 'text-red-500' : 'text-green-500'}>
                {result.categories.nsfw ? 'Erkannt' : 'OK'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Gewalt:</span>
              <span className={result.categories.violence ? 'text-red-500' : 'text-green-500'}>
                {result.categories.violence ? 'Erkannt' : 'OK'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Selbstverletzung:</span>
              <span className={result.categories.selfHarm ? 'text-red-500' : 'text-green-500'}>
                {result.categories.selfHarm ? 'Erkannt' : 'OK'}
              </span>
            </div>
          </div>
          
          {/* Context Info */}
          <div className="text-xs text-gray-600 pt-2 border-t">
            <p>Kontext: {context}</p>
            <p>Benutzer-ID: {userId || 'Anonym'}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Higher-order component for wrapping inputs
export function withAIModeration<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<AIModeratorProps, 'content'>
) {
  return function ModeratedComponent(props: P & { content?: string; onContentChange?: (content: string) => void }) {
    const { content, onContentChange, ...rest } = props;
    
    return (
      <div>
        <Component {...(rest as P)} />
        <AIModerator
          content={content || ''}
          onContentChange={onContentChange}
          {...options}
        />
      </div>
    );
  };
}
