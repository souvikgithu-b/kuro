import { supabase, isSupabaseConfigured } from './supabase';
import type { AnalyticsEventType, AnalyticsSummary, AnalyticsEvent } from '../types/analytics';
import { INITIAL_DEMO_MOVIES } from './demoData';

const SESSION_KEY = 'kuro_anon_session_id';
const LOCAL_ANALYTICS_KEY = 'kuro_analytics_events';

/**
 * Retrieve or generate an anonymous, privacy-compliant session ID for the current visitor.
 */
export function getSessionId(): string {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

/**
 * Record a legitimate platform event (page view, step click, stream launch).
 */
export async function trackEvent(
  eventType: AnalyticsEventType,
  movieId?: string | null
): Promise<void> {
  const sessionId = getSessionId();
  const event: AnalyticsEvent = {
    movie_id: movieId || null,
    event_type: eventType,
    session_id: sessionId,
    created_at: new Date().toISOString(),
  };

  // Always keep a local log for immediate display & fallback
  try {
    const raw = localStorage.getItem(LOCAL_ANALYTICS_KEY);
    const list: AnalyticsEvent[] = raw ? JSON.parse(raw) : [];
    list.unshift(event);
    if (list.length > 200) list.pop(); // keep last 200 locally
    localStorage.setItem(LOCAL_ANALYTICS_KEY, JSON.stringify(list));
  } catch {
    // Ignore storage quota or private mode errors
  }

  if (!isSupabaseConfigured()) {
    return;
  }

  try {
    await supabase.from('analytics_events').insert([
      {
        movie_id: movieId || null,
        event_type: eventType,
        session_id: sessionId,
      },
    ]);
  } catch (err) {
    console.warn('Analytics event logging error:', err);
  }
}

/**
 * Compile analytics metrics and funnel performance for the admin dashboard.
 */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  // If Supabase is available, we can fetch real aggregated data, or supplement with local events
  let events: AnalyticsEvent[] = [];
  let loadedFromSupabase = false;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (!error && data) {
        events = data as AnalyticsEvent[];
        loadedFromSupabase = true;
      }
    } catch (e) {
      console.warn('Supabase analytics fetch error, falling back to local:', e);
    }
  }

  if (!loadedFromSupabase) {
    const raw = localStorage.getItem(LOCAL_ANALYTICS_KEY);
    if (raw) {
      try {
        events = JSON.parse(raw);
      } catch {
        events = [];
      }
    }
  }

  const todayStr = new Date().toISOString().slice(0, 10);

  let todayViews = 0;
  let totalViews = 0;
  let todayWatchClicks = 0;
  let totalWatchClicks = 0;

  const funnel = {
    watchClicks: 0,
    step1Clicks: 0,
    step2Clicks: 0,
    step3Clicks: 0,
    finalDestinationClicks: 0,
  };

  const viewCountMap: Record<string, number> = {};
  const clickCountMap: Record<string, number> = {};

  for (const ev of events) {
    const isToday = ev.created_at ? ev.created_at.startsWith(todayStr) : true;
    const mId = ev.movie_id || 'unknown';

    if (ev.event_type === 'page_view') {
      totalViews++;
      if (isToday) todayViews++;
      viewCountMap[mId] = (viewCountMap[mId] || 0) + 1;
    } else if (ev.event_type === 'watch_click') {
      totalWatchClicks++;
      if (isToday) todayWatchClicks++;
      funnel.watchClicks++;
      clickCountMap[mId] = (clickCountMap[mId] || 0) + 1;
    } else if (ev.event_type === 'step_1_click') {
      funnel.step1Clicks++;
      clickCountMap[mId] = (clickCountMap[mId] || 0) + 1;
    } else if (ev.event_type === 'step_2_click') {
      funnel.step2Clicks++;
      clickCountMap[mId] = (clickCountMap[mId] || 0) + 1;
    } else if (ev.event_type === 'step_3_click') {
      funnel.step3Clicks++;
      clickCountMap[mId] = (clickCountMap[mId] || 0) + 1;
    } else if (ev.event_type === 'final_destination_click') {
      funnel.finalDestinationClicks++;
      clickCountMap[mId] = (clickCountMap[mId] || 0) + 1;
    }
  }

  // Movie lookup dictionary for readable titles
  const movieTitleMap = new Map<string, { title: string; slug: string }>();
  for (const m of INITIAL_DEMO_MOVIES) {
    movieTitleMap.set(m.id, { title: m.title, slug: m.slug });
  }

  if (isSupabaseConfigured()) {
    const { data: movies } = await supabase.from('movies').select('id,title,slug');
    for (const movie of movies || []) {
      movieTitleMap.set(movie.id, { title: movie.title, slug: movie.slug });
    }
  }

  const mostViewedMovies = Object.entries(viewCountMap)
    .map(([id, count]) => ({
      id,
      title: movieTitleMap.get(id)?.title || `Movie #${id.substring(0, 6)}`,
      slug: movieTitleMap.get(id)?.slug || '',
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const mostClickedMovies = Object.entries(clickCountMap)
    .map(([id, count]) => ({
      id,
      title: movieTitleMap.get(id)?.title || `Movie #${id.substring(0, 6)}`,
      slug: movieTitleMap.get(id)?.slug || '',
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const recentEvents = events.slice(0, 10).map((ev, idx) => ({
    id: ev.id || `ev-${idx}`,
    eventType: ev.event_type,
    movieTitle: (ev.movie_id && movieTitleMap.get(ev.movie_id)?.title) || 'Archive Portal',
    timestamp: ev.created_at || new Date().toISOString(),
  }));

  return {
    todayViews,
    totalViews,
    todayWatchClicks,
    totalWatchClicks,
    funnel: {
      watchClicks: funnel.watchClicks,
      step1Clicks: funnel.step1Clicks,
      step2Clicks: funnel.step2Clicks,
      step3Clicks: funnel.step3Clicks,
      finalDestinationClicks: funnel.finalDestinationClicks,
    },
    mostViewedMovies,
    mostClickedMovies,
    recentEvents,
  };
}
