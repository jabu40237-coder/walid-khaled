'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FolderKanban,
  Image,
  Video,
  MessageSquare,
  Eye,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import Link from 'next/link';

interface DashboardData {
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

const COLORS = ['#C8A84E', '#E5D39B', '#8B7355', '#6B5B3A'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/analytics');
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertTriangle className="w-12 h-12 text-gold/40 mb-4" />
        <p className="text-white/40 mb-4">{error || 'No data available'}</p>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 bg-gold/10 text-gold rounded-lg hover:bg-gold/20 transition-colors text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  const stats = [
    { label: 'Total Projects', value: data.totalProjects, icon: FolderKanban, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
    { label: 'Total Photos', value: data.totalPhotos, icon: Image, color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
    { label: 'Total Videos', value: data.totalVideos, icon: Video, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
    { label: 'Total Requests', value: data.totalRequests, icon: MessageSquare, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
    { label: 'Total Visitors', value: data.totalVisitors, icon: Eye, color: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/20' },
  ];

  const deviceData = [
    { name: 'Desktop', value: data.deviceTypes.desktop },
    { name: 'Mobile', value: data.deviceTypes.mobile },
    { name: 'Tablet', value: data.deviceTypes.tablet },
  ];

  const trafficData = [
    { name: 'Direct', value: data.trafficSources.direct },
    { name: 'Social', value: data.trafficSources.social },
    { name: 'Search', value: data.trafficSources.search },
    { name: 'Referral', value: data.trafficSources.referral },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard</h2>
          <p className="text-sm text-white/40 mt-1">Overview of your website performance</p>
        </div>
        <Link
          href="/admin/analytics"
          className="flex items-center gap-1 text-sm text-gold hover:text-gold-400 transition-colors"
        >
          View Analytics
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ y: -2 }}
            className={`${stat.bg} ${stat.border} border rounded-2xl p-4 transition-all`}
          >
            <div className="flex items-center gap-3 mb-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className="text-xs text-white/40">{stat.label}</span>
            </div>
            <div className={`text-2xl font-bold ${stat.color}`}>
              {stat.value.toLocaleString()}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Visitors Chart */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-primary-200 border border-white/5 rounded-2xl p-6"
        >
          <h3 className="text-sm font-semibold text-white mb-6">Monthly Visitors & Requests</h3>
          {data.monthlyStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="month"
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={11}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#1A1A1A',
                    border: '1px solid rgba(200,168,78,0.2)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: '#C8A84E' }}
                />
                <Bar dataKey="visitors" fill="#C8A84E" radius={[4, 4, 0, 0]} name="Visitors" />
                <Bar dataKey="requests" fill="rgba(200,168,78,0.3)" radius={[4, 4, 0, 0]} name="Requests" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </motion.div>

        {/* Device Types Pie */}
        <motion.div
          variants={itemVariants}
          className="bg-primary-200 border border-white/5 rounded-2xl p-6"
        >
          <h3 className="text-sm font-semibold text-white mb-4">Device Types</h3>
          <ResponsiveContainer width="100%" height={200}>
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
                {deviceData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
          <div className="space-y-2 mt-4">
            {deviceData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-white/60">{item.name}</span>
                </div>
                <span className="text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Requests */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-3 bg-primary-200 border border-white/5 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Recent Requests</h3>
            <Link
              href="/admin/requests"
              className="text-xs text-gold hover:text-gold-400 transition-colors"
            >
              View All
            </Link>
          </div>

          {data.latestRequests.length > 0 ? (
            <div className="space-y-2">
              {data.latestRequests.slice(0, 5).map((req) => (
                <div
                  key={req.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-primary/30 border border-white/5 hover:border-gold/10 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{req.fullName}</p>
                    <p className="text-xs text-white/40 truncate">{req.projectType}</p>
                  </div>
                  <div className="text-xs text-white/30">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </div>
                  {req.read ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400/50" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-gold" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-8 h-8 text-white/10 mx-auto mb-2" />
              <p className="text-sm text-white/30">No requests yet</p>
            </div>
          )}
        </motion.div>

        {/* Most Viewed Projects */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-primary-200 border border-white/5 rounded-2xl p-6"
        >
          <h3 className="text-sm font-semibold text-white mb-4">Most Viewed Projects</h3>

          {data.mostViewedProjects.length > 0 ? (
            <div className="space-y-3">
              {data.mostViewedProjects.map((project, idx) => (
                <div key={project.id} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center text-xs text-gold shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{project.title}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-white/40">
                    <Eye className="w-3 h-3" />
                    {project.views}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="w-8 h-8 text-white/10 mx-auto mb-2" />
              <p className="text-sm text-white/30">No project views yet</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Activity Feed */}
      <motion.div
        variants={itemVariants}
        className="bg-primary-200 border border-white/5 rounded-2xl p-6"
      >
        <h3 className="text-sm font-semibold text-white mb-4">Activity Feed</h3>
        <div className="space-y-3">
          {data.latestRequests.slice(0, 4).map((req, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-white/20 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-white/70">
                  New consultation request from <span className="text-gold">{req.fullName}</span>
                </p>
                <p className="text-xs text-white/30 mt-0.5">
                  {new Date(req.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
          {data.latestRequests.length === 0 && (
            <div className="text-center py-4">
              <p className="text-sm text-white/30">No recent activity</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function EmptyChart() {
  return (
    <div className="flex flex-col items-center justify-center h-[280px]">
      <TrendingUp className="w-10 h-10 text-white/10 mb-2" />
      <p className="text-sm text-white/30">No data available yet</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="w-48 h-7 skeleton mb-2" />
        <div className="w-64 h-4 skeleton" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-primary-200 border border-white/5 rounded-2xl p-4">
            <div className="w-8 h-8 skeleton rounded-lg mb-3" />
            <div className="w-16 h-3 skeleton mb-2" />
            <div className="w-12 h-6 skeleton" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-primary-200 border border-white/5 rounded-2xl p-6">
          <div className="w-40 h-5 skeleton mb-4" />
          <div className="w-full h-[280px] skeleton rounded-xl" />
        </div>
        <div className="bg-primary-200 border border-white/5 rounded-2xl p-6">
          <div className="w-32 h-5 skeleton mb-4" />
          <div className="w-[200px] h-[200px] skeleton rounded-full mx-auto mb-4" />
        </div>
      </div>
    </div>
  );
}
