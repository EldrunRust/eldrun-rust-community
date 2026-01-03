// Analytics Dashboard Component
// Real-time server metrics and event monitoring

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Users, MessageSquare, Server, HardDrive, 
  Wifi, AlertTriangle, TrendingUp, TrendingDown,
  BarChart3, LineChart, PieChart, Zap, Clock,
  Filter, Download, RefreshCw, Maximize2
} from 'lucide-react';
import { useAnalytics, AnalyticsMetric, AnalyticsEvent } from './index';

interface AnalyticsDashboardProps {
  embedded?: boolean
}

export function AnalyticsDashboard({ embedded = false }: AnalyticsDashboardProps) {
  const {
    data,
    metrics,
    events,
    isConnected,
    connect,
    trackEvent
  } = useAnalytics();

  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const [isExpanded, setIsExpanded] = useState<boolean>(embedded);

  useEffect(() => {
    if (!isConnected) {
      connect();
    }
  }, [isConnected, connect]);

  const formatNumber = (value: number, decimals: number = 1): string => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(decimals) + 'M';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(decimals) + 'K';
    }
    return value.toString();
  };

  const getChangeIcon = (type: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'decrease':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <div className="w-4 h-4" />;
    }
  };

  const getEventIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      user_login: <Users className="w-4 h-4 text-green-400" />,
      user_logout: <Users className="w-4 h-4 text-red-400" />,
      message_sent: <MessageSquare className="w-4 h-4 text-blue-400" />,
      chat_created: <MessageSquare className="w-4 h-4 text-purple-400" />,
      error_occurred: <AlertTriangle className="w-4 h-4 text-red-400" />,
      feature_used: <Zap className="w-4 h-4 text-yellow-400" />
    };
    return icons[type] || <Activity className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="w-full">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[800px] bg-metal-900/95 backdrop-blur-xl border border-metal-700 rounded-2xl shadow-2xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-metal-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Analytics Dashboard</h3>
                    <p className="text-xs text-metal-400">
                      {isConnected ? 'Live' : 'Offline'} • {selectedTimeRange}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedTimeRange}
                    onChange={(e) => setSelectedTimeRange(e.target.value)}
                    className="px-3 py-1 bg-metal-800 text-metal-300 text-sm rounded-lg border border-metal-700 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="1h">Letzte Stunde</option>
                    <option value="24h">Letzte 24h</option>
                    <option value="7d">Letzte 7 Tage</option>
                    <option value="30d">Letzte 30 Tage</option>
                  </select>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="text-metal-400 hover:text-white transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="p-4">
              <div className="grid grid-cols-4 gap-3 mb-6">
                {metrics.map((metric) => (
                  <motion.div
                    key={metric.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-metal-800/50 border border-metal-700 rounded-xl p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg">{metric.icon}</span>
                      {getChangeIcon(metric.changeType)}
                    </div>
                    <p className="text-white font-bold text-lg">
                      {formatNumber(metric.value)}
                      <span className="text-xs text-metal-400 ml-1">{metric.unit}</span>
                    </p>
                    <p className="text-xs text-metal-400">{metric.name}</p>
                    {metric.change > 0 && (
                      <p className={`text-xs mt-1 ${
                        metric.changeType === 'increase' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {metric.changeType === 'increase' ? '+' : '-'}{metric.change.toFixed(1)}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Activity Chart */}
                <div className="bg-metal-800/50 border border-metal-700 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400" />
                    Server Activity
                  </h4>
                  <div className="h-32 flex items-end gap-1">
                    {[...Array(24)].map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t"
                        style={{ height: `${Math.random() * 100}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-metal-500">
                    <span>00:00</span>
                    <span>06:00</span>
                    <span>12:00</span>
                    <span>18:00</span>
                    <span>24:00</span>
                  </div>
                </div>

                {/* Performance Chart */}
                <div className="bg-metal-800/50 border border-metal-700 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <Server className="w-4 h-4 text-green-400" />
                    Performance
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-metal-400">CPU</span>
                        <span className="text-white">{data.serverLoad.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-metal-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full transition-all"
                          style={{ width: `${data.serverLoad}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-metal-400">Memory</span>
                        <span className="text-white">{data.memoryUsage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-metal-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all"
                          style={{ width: `${data.memoryUsage}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-metal-400">Latency</span>
                        <span className="text-white">{data.networkLatency}ms</span>
                      </div>
                      <div className="w-full bg-metal-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-yellow-500 to-orange-400 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(data.networkLatency / 100 * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Events */}
              <div className="bg-metal-800/50 border border-metal-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    Recent Events
                  </h4>
                  <button className="text-xs text-metal-400 hover:text-white transition-colors">
                    View All
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {events.slice(0, 10).map((event) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-metal-700/50 transition-colors"
                    >
                      {getEventIcon(event.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{event.action}</p>
                        <p className="text-xs text-metal-400">
                          {event.username} • {new Date(event.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button - Only show when not embedded */}
      {!embedded && !isExpanded && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExpanded(true)}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
            isConnected 
              ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white' 
              : 'bg-metal-800 text-metal-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-6 h-6" />
        </motion.button>
      )}
    </div>
  );
}
