import { useEffect, useState, useCallback } from 'react';
import { trackEvent, getAnalyticsSummary } from '../lib/analytics';
import type { AnalyticsEventType, AnalyticsSummary } from '../types/analytics';

/**
 * Hook to automatically track a page view on component mount.
 */
export function useTrackPageView(movieId?: string | null) {
  useEffect(() => {
    trackEvent('page_view', movieId);
  }, [movieId]);
}

/**
 * Hook to retrieve aggregated analytics for dashboard.
 */
export function useAnalyticsData() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await getAnalyticsSummary();
      setData(summary);
    } catch (err: any) {
      setError(err?.message || 'Failed to calculate analytics summary');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    data,
    loading,
    error,
    refresh,
    track: (type: AnalyticsEventType, movieId?: string | null) => trackEvent(type, movieId),
  };
}
