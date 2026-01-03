// Advanced Analytics System for Eldrun
// Real-time server and user analytics

'use client';

import { useEffect, useState, useRef } from 'react';

export interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  unit: string;
  icon: string;
}

export interface AnalyticsEvent {
  id: string;
  type: string;
  userId?: string;
  username?: string;
  action: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AnalyticsData {
  onlineUsers: number;
  totalUsers: number;
  activeChats: number;
  messagesPerMinute: number;
  serverLoad: number;
  memoryUsage: number;
  networkLatency: number;
  errorRate: number;
}

class AnalyticsManager {
  private ws: WebSocket | null = null;
  private metrics: Map<string, AnalyticsMetric> = new Map();
  private events: AnalyticsEvent[] = [];
  private listeners: Set<(data: AnalyticsData) => void> = new Set();
  private eventListeners: Set<(events: AnalyticsEvent[]) => void> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.initializeMetrics();
  }

  private initializeMetrics() {
    this.metrics.set('onlineUsers', {
      id: 'onlineUsers',
      name: 'Online Users',
      value: 0,
      change: 0,
      changeType: 'neutral',
      unit: '',
      icon: '👥'
    });

    this.metrics.set('totalUsers', {
      id: 'totalUsers',
      name: 'Total Users',
      value: 0,
      change: 0,
      changeType: 'neutral',
      unit: '',
      icon: '📊'
    });

    this.metrics.set('activeChats', {
      id: 'activeChats',
      name: 'Active Chats',
      value: 0,
      change: 0,
      changeType: 'neutral',
      unit: '',
      icon: '💬'
    });

    this.metrics.set('messagesPerMinute', {
      id: 'messagesPerMinute',
      name: 'Messages/Min',
      value: 0,
      change: 0,
      changeType: 'neutral',
      unit: '',
      icon: '📈'
    });

    this.metrics.set('serverLoad', {
      id: 'serverLoad',
      name: 'Server Load',
      value: 0,
      change: 0,
      changeType: 'neutral',
      unit: '%',
      icon: '⚡'
    });

    this.metrics.set('memoryUsage', {
      id: 'memoryUsage',
      name: 'Memory Usage',
      value: 0,
      change: 0,
      changeType: 'neutral',
      unit: '%',
      icon: '💾'
    });

    this.metrics.set('networkLatency', {
      id: 'networkLatency',
      name: 'Network Latency',
      value: 0,
      change: 0,
      changeType: 'neutral',
      unit: 'ms',
      icon: '🌐'
    });

    this.metrics.set('errorRate', {
      id: 'errorRate',
      name: 'Error Rate',
      value: 0,
      change: 0,
      changeType: 'neutral',
      unit: '%',
      icon: '⚠️'
    });
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // In production, connect to real WebSocket
        // this.ws = new WebSocket('wss://api.eldrun.com/analytics');
        
        // For demo, simulate connection
        this.simulateConnection();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  private simulateConnection() {
    // Simulate real-time data updates
    setInterval(() => {
      this.updateMetrics();
    }, 2000);

    // Simulate events
    setInterval(() => {
      this.generateRandomEvent();
    }, 5000);
  }

  private updateMetrics() {
    const updates: Partial<AnalyticsData> = {
      onlineUsers: Math.floor(Math.random() * 100) + 150,
      totalUsers: 2847,
      activeChats: Math.floor(Math.random() * 20) + 10,
      messagesPerMinute: Math.floor(Math.random() * 50) + 20,
      serverLoad: Math.random() * 30 + 20,
      memoryUsage: Math.random() * 20 + 40,
      networkLatency: Math.floor(Math.random() * 20) + 10,
      errorRate: Math.random() * 2
    };

    Object.entries(updates).forEach(([key, value]) => {
      const metric = this.metrics.get(key);
      if (metric) {
        const oldValue = metric.value;
        metric.value = value as number;
        
        const change = value - oldValue;
        metric.change = Math.abs(change);
        metric.changeType = change > 0 ? 'increase' : change < 0 ? 'decrease' : 'neutral';
      }
    });

    const data = this.getCurrentData();
    this.listeners.forEach(listener => listener(data));
  }

  private generateRandomEvent() {
    const eventTypes = [
      'user_login',
      'user_logout',
      'message_sent',
      'chat_created',
      'error_occurred',
      'feature_used'
    ];

    const usernames = ['Shadow', 'DragonSlayer', 'Phoenix', 'Ninja', 'Warrior', 'Mage'];
    
    const event: AnalyticsEvent = {
      id: Math.random().toString(36).substr(2, 9),
      type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      username: usernames[Math.floor(Math.random() * usernames.length)],
      action: this.getActionForType(eventTypes[Math.floor(Math.random() * eventTypes.length)]),
      timestamp: new Date(),
      metadata: {
        ip: '192.168.1.' + Math.floor(Math.random() * 255),
        userAgent: 'Eldrun Client'
      }
    };

    this.events.unshift(event);
    if (this.events.length > 100) {
      this.events = this.events.slice(0, 100);
    }

    this.eventListeners.forEach(listener => listener(this.events));
  }

  private getActionForType(type: string): string {
    const actions: Record<string, string[]> = {
      user_login: ['Logged in from game client', 'Logged in from web', 'Auto-login successful'],
      user_logout: ['Session expired', 'Manual logout', 'Connection lost'],
      message_sent: ['Sent message in global chat', 'Sent private message', 'Sent faction message'],
      chat_created: ['Created new channel', 'Joined voice chat', 'Started group chat'],
      error_occurred: ['Failed to load resource', 'Database timeout', 'API rate limit exceeded'],
      feature_used: ['Used map editor', 'Generated clip', 'Accessed AI assistant']
    };

    const typeActions = actions[type] || ['Unknown action'];
    return typeActions[Math.floor(Math.random() * typeActions.length)];
  }

  trackEvent(type: string, action: string, metadata?: Record<string, any>) {
    const event: AnalyticsEvent = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      action,
      timestamp: new Date(),
      metadata
    };

    this.events.unshift(event);
    this.eventListeners.forEach(listener => listener(this.events));
  }

  getCurrentData(): AnalyticsData {
    return {
      onlineUsers: this.metrics.get('onlineUsers')?.value || 0,
      totalUsers: this.metrics.get('totalUsers')?.value || 0,
      activeChats: this.metrics.get('activeChats')?.value || 0,
      messagesPerMinute: this.metrics.get('messagesPerMinute')?.value || 0,
      serverLoad: this.metrics.get('serverLoad')?.value || 0,
      memoryUsage: this.metrics.get('memoryUsage')?.value || 0,
      networkLatency: this.metrics.get('networkLatency')?.value || 0,
      errorRate: this.metrics.get('errorRate')?.value || 0
    };
  }

  getMetrics(): AnalyticsMetric[] {
    return Array.from(this.metrics.values());
  }

  getEvents(limit: number = 50): AnalyticsEvent[] {
    return this.events.slice(0, limit);
  }

  subscribe(listener: (data: AnalyticsData) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  subscribeToEvents(listener: (events: AnalyticsEvent[]) => void) {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Singleton instance
export const analyticsManager = new AnalyticsManager();

// React hook
export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData>(analyticsManager.getCurrentData());
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>(analyticsManager.getMetrics());
  const [events, setEvents] = useState<AnalyticsEvent[]>(analyticsManager.getEvents());
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const unsubscribeData = analyticsManager.subscribe(setData);
    const unsubscribeEvents = analyticsManager.subscribeToEvents(setEvents);
    
    const metricsInterval = setInterval(() => {
      setMetrics(analyticsManager.getMetrics());
    }, 2000);

    return () => {
      unsubscribeData();
      unsubscribeEvents();
      clearInterval(metricsInterval);
    };
  }, []);

  const connect = async () => {
    try {
      await analyticsManager.connect();
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect analytics:', error);
      setIsConnected(false);
    }
  };

  const trackEvent = (type: string, action: string, metadata?: Record<string, any>) => {
    analyticsManager.trackEvent(type, action, metadata);
  };

  return {
    data,
    metrics,
    events,
    isConnected,
    connect,
    trackEvent
  };
}
