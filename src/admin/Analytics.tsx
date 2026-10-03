import React from 'react';
import { useAnalyticsData } from '../hooks/useAnalytics';
import {
  BarChart3,
  Eye,
  MousePointerClick,
  TrendingUp,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export const Analytics: React.FC = () => {
  const { data: analytics, loading, refresh } = useAnalyticsData();

  if (loading || !analytics) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-ink-900 animate-pulse rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-ink-900 animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  const funnel = analytics.funnel;
  const watchClicks = funnel.watchClicks || 1;
  const s1Rate = Math.round((funnel.step1Clicks / watchClicks) * 100);
  const s2Rate = Math.round((funnel.step2Clicks / watchClicks) * 100);
  const s3Rate = Math.round((funnel.step3Clicks / watchClicks) * 100);
  const finalRate = Math.round((funnel.finalDestinationClicks / watchClicks) * 100);

  return (
    <div className="space-y-8 max-w-5xl select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-white" />
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Screening & Link Analytics
            </h1>
          </div>
          <p className="text-xs font-mono text-ink-400 mt-1">
            Real-time verification metrics, conversion funnel drop-off, and screening trends.
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          className="ink-btn-secondary px-3.5 py-2 text-xs font-mono tracking-wider uppercase rounded-sm inline-flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Top 4 Stat Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Views */}
        <div className="p-5 bg-ink-900/60 border border-white/10 rounded-sm space-y-2">
          <div className="flex items-center justify-between text-ink-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Today's Views</span>
            <Eye className="w-4 h-4 text-ink-300" />
          </div>
          <div className="font-serif text-3xl font-bold text-white">{analytics.todayViews}</div>
          <div className="text-[10px] font-mono text-ink-500">
            Total all-time views: {analytics.totalViews}
          </div>
        </div>

        {/* Today's Watch Clicks */}
        <div className="p-5 bg-ink-900/60 border border-white/10 rounded-sm space-y-2">
          <div className="flex items-center justify-between text-ink-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Today's Watch Clicks</span>
            <MousePointerClick className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-serif text-3xl font-bold text-emerald-400">
            {analytics.todayWatchClicks}
          </div>
          <div className="text-[10px] font-mono text-ink-500">
            Total watch intent: {analytics.totalWatchClicks}
          </div>
        </div>

        {/* Final Stream Launches */}
        <div className="p-5 bg-ink-900/60 border border-white/10 rounded-sm space-y-2">
          <div className="flex items-center justify-between text-ink-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Completed Streams</span>
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div className="font-serif text-3xl font-bold text-white">
            {funnel.finalDestinationClicks}
          </div>
          <div className="text-[10px] font-mono text-ink-500">
            Reached final destination video
          </div>
        </div>

        {/* End-to-End Conversion Rate */}
        <div className="p-5 bg-ink-900/60 border border-white/10 rounded-sm space-y-2">
          <div className="flex items-center justify-between text-ink-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Funnel Conversion</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-serif text-3xl font-bold text-amber-400">
            {finalRate}%
          </div>
          <div className="text-[10px] font-mono text-ink-500">
            From Watch click to Final Video
          </div>
        </div>
      </div>

      {/* 3-STEP LINK CONVERSION FUNNEL */}
      <div className="p-6 bg-ink-900/60 border border-white/10 rounded-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div>
            <h2 className="font-serif text-lg font-bold text-white">
              Three-Step Link Conversion Funnel
            </h2>
            <p className="text-xs font-mono text-ink-400 mt-0.5">
              Drop-off visualization from "Watch" click through Step 1, Step 2, Step 3, and Video Launch.
            </p>
          </div>
        </div>

        <div className="space-y-4 font-mono text-xs">
          {/* Watch Click */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-ink-300">
              <span className="font-bold text-white">1. Initial Watch Button Clicks</span>
              <span>{funnel.watchClicks} users (100%)</span>
            </div>
            <div className="h-3 w-full bg-ink-950 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: '100%' }} />
            </div>
          </div>

          {/* Step 1 */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-ink-300">
              <span>2. Step 1 (Verification) Completed</span>
              <span>{funnel.step1Clicks} users ({s1Rate}%)</span>
            </div>
            <div className="h-3 w-full bg-ink-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-ink-300 rounded-full transition-all duration-500"
                style={{ width: `${s1Rate}%` }}
              />
            </div>
          </div>

          {/* Step 2 */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-ink-300">
              <span>3. Step 2 (Direct Link) Completed</span>
              <span>{funnel.step2Clicks} users ({s2Rate}%)</span>
            </div>
            <div className="h-3 w-full bg-ink-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-ink-400 rounded-full transition-all duration-500"
                style={{ width: `${s2Rate}%` }}
              />
            </div>
          </div>

          {/* Step 3 */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-ink-300">
              <span>4. Step 3 (Gateway) Completed</span>
              <span>{funnel.step3Clicks} users ({s3Rate}%)</span>
            </div>
            <div className="h-3 w-full bg-ink-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-ink-500 rounded-full transition-all duration-500"
                style={{ width: `${s3Rate}%` }}
              />
            </div>
          </div>

          {/* Final Video Stream */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-ink-300">
              <span className="font-bold text-emerald-400">5. Final Stream Playback Launched</span>
              <span className="text-emerald-400 font-bold">{funnel.finalDestinationClicks} users ({finalRate}%)</span>
            </div>
            <div className="h-3 w-full bg-ink-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${finalRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboards: Most Viewed & Most Clicked Movies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Most Viewed Movies */}
        <div className="p-5 bg-ink-900/60 border border-white/10 rounded-sm space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-white/[0.06]">
            <Eye className="w-4 h-4 text-ink-400" />
            <h3 className="font-serif text-base font-bold text-white">Most Viewed Cinema Titles</h3>
          </div>

          <div className="space-y-2">
            {analytics.mostViewedMovies.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 bg-ink-950/70 border border-white/5 rounded text-xs font-mono"
              >
                <div className="flex items-center space-x-3 min-w-0 pr-2">
                  <span className="text-ink-500 font-bold">#{idx + 1}</span>
                  <span className="text-white font-sans font-bold truncate">{item.title}</span>
                </div>
                <span className="text-ink-400 shrink-0">{item.count} views</span>
              </div>
            ))}
          </div>
        </div>

        {/* Most Clicked Movies */}
        <div className="p-5 bg-ink-900/60 border border-white/10 rounded-sm space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-white/[0.06]">
            <MousePointerClick className="w-4 h-4 text-ink-400" />
            <h3 className="font-serif text-base font-bold text-white">Most Clicked Step Flows</h3>
          </div>

          <div className="space-y-2">
            {analytics.mostClickedMovies.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 bg-ink-950/70 border border-white/5 rounded text-xs font-mono"
              >
                <div className="flex items-center space-x-3 min-w-0 pr-2">
                  <span className="text-ink-500 font-bold">#{idx + 1}</span>
                  <span className="text-white font-sans font-bold truncate">{item.title}</span>
                </div>
                <span className="text-emerald-400 font-bold shrink-0">{item.count} clicks</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="p-5 bg-ink-900/60 border border-white/10 rounded-sm space-y-4">
        <h3 className="font-serif text-base font-bold text-white pb-2 border-b border-white/[0.06]">
          Recent Anonymous Event Activity
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase text-ink-500">
                <th className="py-2 px-3">Event Type</th>
                <th className="py-2 px-3">Context / Screening</th>
                <th className="py-2 px-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {analytics.recentEvents.map((ev) => (
                <tr key={ev.id} className="hover:bg-white/[0.02]">
                  <td className="py-2 px-3">
                    <span className="px-2 py-0.5 text-[10px] uppercase rounded-sm bg-ink-950 border border-white/10 text-ink-300">
                      {ev.eventType.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-white font-sans">{ev.movieTitle}</td>
                  <td className="py-2 px-3 text-right text-ink-500">
                    {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
