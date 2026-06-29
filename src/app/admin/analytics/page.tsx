'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  BarChart3, TrendingUp, Download, Loader2, AlertTriangle,
  Eye, Globe, Monitor, Smartphone, Tablet, Search,
  Share2, MousePointerClick, Users,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
  Legend,
} from 'recharts';

const GOLD_COLORS = ['#C8A84E', '#E5D39B', '#8B7355', '#6B5B3A', '#A88E3A', '#DAC173'];

interface AnalyticsData {
  totalProjects: number;
  totalPhotos: number;
  totalVideos: number;
  totalRequests: number;
  totalVisitors: number;
  mostViewedProjects: { id: string; title: string; views: number }[];
  latestRequests: any[];
  monthlyStats: { month: string; visitors: number; requests: number }[];
  deviceTypes: { desktop: number; mobile: number; tablet: number };
  trafficSources: { direct: number; social: number; search: number; referral: number };
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/analytics');
      if (!res.ok) throw new Error('Failed');
      setData(await res.json());
    } catch {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const exportReport = () => {
    if (!data) return;
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalProjects: data.totalProjects,
        totalVisitors: data.totalVisitors,
        totalRequests: data.totalRequests,
      },
      deviceTypes: data.deviceTypes,
      trafficSources: data.trafficSources,
      monthlyStats: data.monthlyStats,
      mostViewed: data.mostViewedProjects,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported');
  };

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center py-20">
        <AlertTriangle className="w-12 h-12 text-gold/40 mb-4" />
        <p className="text-white/40 mb-4">{error || 'No data available'}</p>
        <button onClick={fetchData} className="px-4 py-2 bg-gold/10 text-gold rounded-lg hover:bg-gold/20 text-sm">
          Try Again
        </button>
      </div>
    );
  }

  const deviceData = [
    { name: 'Desktop', value: data.deviceTypes.desktop, icon: <Monitor className="w-3.5 h-3.5" />, color: '#C8A84E' },
    { name: 'Mobile', value: data.deviceTypes.mobile, icon: <Smartphone className="w-3.5 h-3.5" />, color: '#E5D39B' },
    { name: 'Tablet', value: data.deviceTypes.tablet, icon: <Tablet className="w-3.5 h-3.5" />, color: '#8B7355' },
  ];

  const trafficData = [
    { name: 'Direct', value: data.trafficSources.direct, icon: <MousePointerClick className="w-3.5 h-3.5" />, color: '#C8A84E' },
    { name: 'Social', value: data.trafficSources.social, icon: <Share2 className="w-3.5 h-3.5" />, color: '#E5D39B' },
    { name: 'Search', value: data.trafficSources.search, icon: <Search className="w-3.5 h-3.5" />, color: '#8B7355' },
    { name: 'Referral', value: data.trafficSources.referral, icon: <Globe className="w-3.5 h-3.5" />, color: '#6B5B3A' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics</h2>
          <p className="text-sm text-white/40 mt-1">Detailed website performance metrics</p>
        </div>
        <button
          onClick={exportReport}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/60 rounded-xl px-4 py-2.5 transition-colors text-sm"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Visitors', value: data.totalVisitors, icon: <Users className="w-4 h-4" />, color: 'text-gold' },
          { label: 'Projects', value: data.totalProjects, icon: <BarChart3 className="w-4 h-4" />, color: 'text-blue-400' },
          { label: 'Requests', value: data.totalRequests, icon: <TrendingUp className="w-4 h-4" />, color: 'text-green-400' },
          { label: 'Photos', value: data.totalPhotos, icon: <Eye className="w-4 h-4" />, color: 'text-purple-400' },
          { label: 'Videos', value: data.totalVideos, icon: <Eye className="w-4 h-4" />, color: 'text-orange-400' },
        ].map(stat => (
          <div key={stat.label} className="bg-primary-200 border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={stat.color}>{stat.icon}</span>
              <span className="text-xs text-white/40">{stat.label}</span>
            </div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* Visitor Chart */}
      <div className="bg-primary-200 border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white mb-6">Monthly Visitors & Requests (12 Months)</h3>
        {data.monthlyStats.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={data.monthlyStats}>
              <defs>
                <linearGradient id="visitorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C8A84E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C8A84E" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="requestGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E5D39B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#E5D39B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: '#1A1A1A',
                  border: '1px solid rgba(200,168,78,0.2)',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#C8A84E' }}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}
              />
              <Area
                type="monotone"
                dataKey="visitors"
                stroke="#C8A84E"
                fill="url(#visitorGradient)"
                strokeWidth={2}
                name="Visitors"
              />
              <Area
                type="monotone"
                dataKey="requests"
                stroke="#E5D39B"
                fill="url(#requestGradient)"
                strokeWidth={2}
                name="Requests"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[350px] text-white/20">
            No monthly data available yet
          </div>
        )}
      </div>

      {/* Device & Traffic */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Breakdown */}
        <div className="bg-primary-200 border border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Device Breakdown</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={index} fill={GOLD_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#1A1A1A',
                    border: '1px solid rgba(200,168,78,0.2)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 flex-1">
              {deviceData.map(item => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span style={{ color: item.color }}>{item.icon}</span>
                    <span className="text-sm text-white/60">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${item.value}%`, backgroundColor: item.color }}
                      />
                    </div>
                    <span className="text-xs text-white w-8 text-right">{item.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-primary-200 border border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Traffic Sources</h3>
          <div className="space-y-4">
            {trafficData.map(item => (
              <div key={item.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span style={{ color: item.color }}>{item.icon}</span>
                    <span className="text-sm text-white/60">{item.name}</span>
                  </div>
                  <span className="text-sm text-white">{item.value}%</span>
                </div>
                <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${item.value}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Growth Rate Chart */}
      <div className="bg-primary-200 border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white mb-6">Monthly Growth</h3>
        {data.monthlyStats.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: '#1A1A1A',
                  border: '1px solid rgba(200,168,78,0.2)',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="visitors" fill="#C8A84E" radius={[4, 4, 0, 0]} name="Visitors" />
              <Bar dataKey="requests" fill="rgba(200,168,78,0.3)" radius={[4, 4, 0, 0]} name="Requests" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-white/20">
            No data available yet
          </div>
        )}
      </div>

      {/* Most Viewed Projects */}
      <div className="bg-primary-200 border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Popular Projects</h3>
        {data.mostViewedProjects.length > 0 ? (
          <div className="space-y-3">
            {data.mostViewedProjects.map((project, idx) => (
              <div key={project.id} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-xs text-gold font-semibold shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{project.title}</p>
                  <div className="w-full h-1.5 bg-white/5 rounded-full mt-1.5">
                    <div
                      className="h-full bg-gold/40 rounded-full"
                      style={{
                        width: `${(project.views / (data.mostViewedProjects[0]?.views || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm text-white/40 shrink-0">{project.views.toLocaleString()} views</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-40 text-white/20">
            No project views recorded yet
          </div>
        )}
      </div>
    </motion.div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="w-32 h-7 skeleton mb-2" />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-primary-200 border border-white/5 rounded-2xl p-4">
            <div className="w-16 h-3 skeleton mb-2" />
            <div className="w-12 h-6 skeleton" />
          </div>
        ))}
      </div>
      <div className="bg-primary-200 border border-white/5 rounded-2xl p-6">
        <div className="w-40 h-4 skeleton mb-4" />
        <div className="w-full h-[350px] skeleton rounded-xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-primary-200 border border-white/5 rounded-2xl p-6">
          <div className="w-32 h-4 skeleton mb-4" />
          <div className="w-[180px] h-[180px] skeleton rounded-full mx-auto" />
        </div>
        <div className="bg-primary-200 border border-white/5 rounded-2xl p-6">
          <div className="w-32 h-4 skeleton mb-4" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-full h-6 skeleton rounded-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
