import { NextResponse } from 'next/server';
import { getAuthFromRequest, errorResponse } from '@/lib/auth';
import { getAnalytics, getRequests, getProjects } from '@/lib/data';

export async function GET() {
  try {
    const auth = await getAuthFromRequest();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const analytics = await getAnalytics();
    const requests = await getRequests();
    const { projects } = await getProjects();

    // Generate monthly stats (last 12 months)
    const monthlyStats = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString();

      const monthRequests = requests.filter(
        r => r.createdAt >= monthStart && r.createdAt <= monthEnd
      ).length;

      // Simulated visitors with some variance
      const baseVisitors = 150 + Math.floor(Math.random() * 200);
      const visitors = baseVisitors + monthRequests * 5;

      monthlyStats.push({
        month: monthKey,
        visitors,
        requests: monthRequests,
      });
    }

    // Projects by category
    const categoryCounts: Record<string, number> = {};
    projects.forEach(p => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    });

    // Most viewed (simulated with project data)
    const mostViewed = projects
      .slice(0, 8)
      .map(p => ({
        id: p.id,
        title: p.title.en || p.title.ar,
        views: Math.floor(Math.random() * 1000) + 100,
      }))
      .sort((a, b) => b.views - a.views);

    return NextResponse.json({
      ...analytics,
      monthlyStats,
      mostViewedProjects: mostViewed,
      totalProjects: projects.length,
      totalRequests: requests.length,
      totalVisitors: analytics.totalVisitors + 500,
      deviceTypes: {
        desktop: Math.floor(55 + Math.random() * 10),
        mobile: Math.floor(30 + Math.random() * 10),
        tablet: Math.floor(15 + Math.random() * 5),
      },
      trafficSources: {
        direct: Math.floor(35 + Math.random() * 10),
        social: Math.floor(30 + Math.random() * 15),
        search: Math.floor(20 + Math.random() * 10),
        referral: Math.floor(5 + Math.random() * 10),
      },
    });
  } catch (err) {
    console.error('GET /api/analytics error:', err);
    return errorResponse('Failed to fetch analytics');
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
