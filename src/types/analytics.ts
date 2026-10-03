export type AnalyticsEventType =
  | 'page_view'
  | 'watch_click'
  | 'step_1_click'
  | 'step_2_click'
  | 'step_3_click'
  | 'final_destination_click';

export interface AnalyticsEvent {
  id?: string;
  movie_id: string | null;
  event_type: AnalyticsEventType;
  session_id: string;
  created_at?: string;
}

export interface MoviePerformanceItem {
  id: string;
  title: string;
  slug: string;
  count: number;
}

export interface AnalyticsSummary {
  todayViews: number;
  totalViews: number;
  todayWatchClicks: number;
  totalWatchClicks: number;
  funnel: {
    watchClicks: number;
    step1Clicks: number;
    step2Clicks: number;
    step3Clicks: number;
    finalDestinationClicks: number;
  };
  mostViewedMovies: MoviePerformanceItem[];
  mostClickedMovies: MoviePerformanceItem[];
  recentEvents: {
    id: string;
    eventType: AnalyticsEventType;
    movieTitle: string;
    timestamp: string;
  }[];
}
