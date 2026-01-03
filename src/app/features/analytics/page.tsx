'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, Users, MessageSquare, Server, HardDrive, 
  Wifi, AlertTriangle, TrendingUp, TrendingDown,
  Activity, Zap, Clock, Filter, Download, RefreshCw,
  Calendar, Eye, MousePointer, Globe, Shield, Cpu
} from 'lucide-react';
import { useAnalytics } from '@/features/analytics';
import { AuthGate } from '@/components/AuthGate';

export default function AnalyticsPage() {
  const {
    data,
    metrics,
    events,
    isConnected,
    connect,
    trackEvent
  } = useAnalytics();

  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedMetric, setSelectedMetric] = useState('all');

  useEffect(() => {
    if (!isConnected) {
      connect();
    }
    trackEvent('page_view', 'Visited analytics dashboard');
  }, [isConnected, connect, trackEvent]);

  const formatNumber = (value: number, decimals: number = 1): string => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(decimals) + 'M';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(decimals) + 'K';
    }
    return value.toString();
  };

  return (
    <AuthGate>
    <div className="min-h-screen bg-metal-950 pt-24">
      <div className="bg-metal-900 border-b border-metal-800">
        <div className="container-rust py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  Analytics Dashboard
                  <Activity className="w-5 h-5 text-blue-500" />
                </h1>
                <p className="text-gray-400">Echtzeit-Server-Metriken und Benutzeraktivitäten</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">AAA Feature</p>
                <p className="text-xs text-blue-400">Real-time Analytics</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-rust py-12">
        {/* Controls */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-4 py-2 bg-metal-800 text-white rounded-lg border border-metal-700 focus:border-blue-500 focus:outline-none"
            >
              <option value="1h">Letzte Stunde</option>
              <option value="24h">Letzte 24h</option>
              <option value="7d">Letzte 7 Tage</option>
              <option value="30d">Letzte 30 Tage</option>
            </select>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-4 py-2 bg-metal-800 text-white rounded-lg border border-metal-700 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">Alle Metriken</option>
              <option value="users">Benutzer</option>
              <option value="performance">Performance</option>
              <option value="activity">Aktivität</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-metal-800 text-white rounded-lg hover:bg-metal-700 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-metal-900/50 border border-metal-800 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">{metric.icon}</span>
                <div className={`flex items-center gap-1 text-sm ${
                  metric.changeType === 'increase' ? 'text-green-400' : 
                  metric.changeType === 'decrease' ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {metric.changeType === 'increase' && <TrendingUp className="w-4 h-4" />}
                  {metric.changeType === 'decrease' && <TrendingDown className="w-4 h-4" />}
                  {metric.change > 0 && <span>{metric.change.toFixed(1)}%</span>}
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">
                {formatNumber(metric.value)}
                <span className="text-lg text-gray-400 ml-1">{metric.unit}</span>
              </h3>
              <p className="text-sm text-gray-400">{metric.name}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Activity Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-metal-900/50 border border-metal-800 rounded-xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              User Activity
            </h3>
            <div className="h-64 flex items-end gap-1">
              {[...Array(48)].map((_, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all hover:opacity-80"
                  style={{ height: `${Math.random() * 100}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-4 text-xs text-gray-400">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>24:00</span>
            </div>
          </motion.div>

          {/* Server Performance */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-metal-900/50 border border-metal-800 rounded-xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-green-400" />
              Server Performance
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-400">CPU Usage</span>
                  <span className="text-sm text-white">{data.serverLoad.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-metal-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-400 h-3 rounded-full transition-all"
                    style={{ width: `${data.serverLoad}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-400">Memory Usage</span>
                  <span className="text-sm text-white">{data.memoryUsage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-metal-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 h-3 rounded-full transition-all"
                    style={{ width: `${data.memoryUsage}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-400">Network Latency</span>
                  <span className="text-sm text-white">{data.networkLatency}ms</span>
                </div>
                <div className="w-full bg-metal-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-yellow-500 to-orange-400 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(data.networkLatency / 100 * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Pages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-metal-900/50 border border-metal-800 rounded-xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-400" />
              Top Pages
            </h3>
            <div className="space-y-3">
              {[
                { page: '/chat', views: 1234, change: 12 },
                { page: '/forum', views: 987, change: -5 },
                { page: '/shop', views: 756, change: 8 },
                { page: '/casino', views: 543, change: 15 },
                { page: '/features', views: 432, change: 23 }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">{item.page}</p>
                    <p className="text-xs text-gray-400">{formatNumber(item.views)} views</p>
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    item.change > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {item.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(item.change)}%
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* User Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-metal-900/50 border border-metal-800 rounded-xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <MousePointer className="w-5 h-5 text-yellow-400" />
              User Actions
            </h3>
            <div className="space-y-3">
              {[
                { action: 'Messages sent', count: 5678, icon: '💬' },
                { action: 'Items purchased', count: 234, icon: '🛒' },
                { action: 'Games played', count: 189, icon: '🎮' },
                { action: 'Features used', count: 456, icon: '✨' },
                { action: 'Reports filed', count: 12, icon: '📋' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <p className="text-sm text-white">{item.action}</p>
                  </div>
                  <p className="text-sm font-bold text-blue-400">{formatNumber(item.count)}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* System Health */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-metal-900/50 border border-metal-800 rounded-xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              System Health
            </h3>
            <div className="space-y-4">
              {[
                { service: 'API Server', status: 'online', uptime: '99.9%' },
                { service: 'Database', status: 'online', uptime: '99.8%' },
                { service: 'CDN', status: 'online', uptime: '100%' },
                { service: 'WebRTC', status: 'online', uptime: '99.5%' },
                { service: 'AI Service', status: 'online', uptime: '99.7%' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      item.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <p className="text-sm text-white">{item.service}</p>
                  </div>
                  <p className="text-xs text-gray-400">{item.uptime}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
    </AuthGate>
  );
}
