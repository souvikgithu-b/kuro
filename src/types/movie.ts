export type ContentType = 'movie' | 'short' | 'documentary' | 'series';
export type SourceType = 'uploaded' | 'external';
export type FinalDestinationType = 'video_source' | 'custom_url';

export interface MovieLink {
  id: string;
  movie_id: string;
  step_1_url: string | null;
  step_2_url: string | null;
  step_3_url: string | null;
  final_url: string | null;
  final_destination_type: FinalDestinationType;
  created_at?: string;
  updated_at?: string;
}

export interface MovieWatchFlow {
  source_type: SourceType;
  video_url: string | null;
  external_video_url: string | null;
  movie_links: MovieLink | null;
}

export interface Movie {
  id: string;
  title: string;
  slug: string;
  description: string;
  poster_url: string;
  backdrop_url: string;
  release_year: number;
  genre: string;
  duration: string;
  language: string;
  content_type: ContentType;
  source_type: SourceType;
  video_url: string | null;
  external_video_url: string | null;
  is_published: boolean;
  featured?: boolean;
  director?: string;
  created_at: string;
  updated_at: string;
  movie_links?: MovieLink;
}

export interface MovieFilterParams {
  search?: string;
  genre?: string;
  release_year?: number;
  language?: string;
  is_published?: boolean;
}

export interface MovieFormData {
  title: string;
  slug: string;
  description: string;
  poster_url: string;
  backdrop_url: string;
  release_year: number;
  genre: string;
  duration: string;
  language: string;
  content_type: ContentType;
  source_type: SourceType;
  video_url: string;
  external_video_url: string;
  is_published: boolean;
  featured?: boolean;
  director?: string;
  
  // Link flow properties
  step_1_url: string;
  step_2_url: string;
  step_3_url: string;
  final_url: string;
  final_destination_type: FinalDestinationType;
  use_global_monetization_fallback?: boolean;
}
