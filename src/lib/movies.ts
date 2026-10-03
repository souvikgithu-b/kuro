import { supabase, isSupabaseConfigured } from './supabase';
import type { Movie, MovieFilterParams, MovieFormData, MovieLink, MovieWatchFlow } from '../types/movie';
import { INITIAL_DEMO_MOVIES } from './demoData';
import { getMonetizationSettings } from './monetization';

const LOCAL_MOVIES_KEY = 'kuro_movies_db';
const PUBLIC_MOVIE_COLUMNS = 'id,title,slug,description,poster_url,backdrop_url,release_year,genre,duration,language,content_type,source_type,is_published,featured,director,created_at,updated_at';

/**
 * Helper to get local persisted movies list.
 */
function getLocalMovies(): Movie[] {
  try {
    const raw = localStorage.getItem(LOCAL_MOVIES_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_MOVIES_KEY, JSON.stringify(INITIAL_DEMO_MOVIES));
      return [...INITIAL_DEMO_MOVIES];
    }
    return JSON.parse(raw);
  } catch {
    return [...INITIAL_DEMO_MOVIES];
  }
}

/**
 * Helper to save local movies list.
 */
function setLocalMovies(movies: Movie[]): void {
  try {
    localStorage.setItem(LOCAL_MOVIES_KEY, JSON.stringify(movies));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

/**
 * Fetch published movies for visitors with optional search & filters.
 */
export async function getPublishedMovies(filters?: MovieFilterParams): Promise<Movie[]> {
  let movies: Movie[] = [];

  if (isSupabaseConfigured()) {
    try {
      let query = supabase
        .from('movies')
        .select(PUBLIC_MOVIE_COLUMNS)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (filters?.genre && filters.genre !== 'All') {
        query = query.ilike('genre', `%${filters.genre}%`);
      }

      if (filters?.release_year) {
        query = query.eq('release_year', filters.release_year);
      }

      if (filters?.language && filters.language !== 'All') {
        query = query.ilike('language', `%${filters.language}%`);
      }

      const { data, error } = await query;

      if (!error) {
        movies = (data || []).map((item: any) => ({
          ...item,
          video_url: null,
          external_video_url: null,
        }));
      } else if (import.meta.env.DEV) {
        console.warn('Supabase fetch failed, falling back to local dataset:', error);
        movies = getLocalMovies().filter((m) => m.is_published);
      } else {
        console.warn('Supabase fetch failed:', error);
      }
    } catch (err) {
      console.warn('Supabase fetch failed:', err);
      if (import.meta.env.DEV) {
        movies = getLocalMovies().filter((m) => m.is_published);
      }
    }
  } else {
    movies = getLocalMovies().filter((m) => m.is_published);
  }

  // Apply filters on memory dataset
  if (filters?.search) {
    const s = filters.search.toLowerCase().trim();
    movies = movies.filter(
      (m) =>
        m.title.toLowerCase().includes(s) ||
        m.description.toLowerCase().includes(s) ||
        m.genre.toLowerCase().includes(s) ||
        (m.director && m.director.toLowerCase().includes(s))
    );
  }

  if (filters?.genre && filters.genre !== 'All') {
    movies = movies.filter((m) => m.genre.toLowerCase().includes(filters.genre!.toLowerCase()));
  }

  if (filters?.release_year) {
    movies = movies.filter((m) => m.release_year === Number(filters.release_year));
  }

  if (filters?.language && filters.language !== 'All') {
    movies = movies.filter((m) => m.language.toLowerCase().includes(filters.language!.toLowerCase()));
  }

  return movies;
}

/**
 * Fetch a single movie by unique slug.
 */
export async function getMovieBySlug(slug: string): Promise<Movie | null> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('movies')
        .select(PUBLIC_MOVIE_COLUMNS)
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      return {
        ...data,
        video_url: null,
        external_video_url: null,
      };
    } catch (err) {
      console.warn('Supabase getMovieBySlug error:', err);
      if (!import.meta.env.DEV) return null;
    }
  }

  // Local fallback
  const local = getLocalMovies();
  return local.find((m) => m.slug === slug && m.is_published) || null;
}

/** Load private destination data only when the visitor enters the watch flow. */
export async function getMovieWatchFlow(slug: string): Promise<MovieWatchFlow | null> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.rpc('get_movie_watch_flow', { p_slug: slug });
    if (error) {
      throw new Error('Unable to load the movie destination. Please try again.');
    }
    return (data as MovieWatchFlow | null) ?? null;
  }

  const movie = getLocalMovies().find((item) => item.slug === slug);
  if (!movie || !movie.is_published) return null;
  return {
    source_type: movie.source_type,
    video_url: movie.video_url,
    external_video_url: movie.external_video_url,
    movie_links: movie.movie_links || null,
  };
}

/**
 * Fetch all movies for admin (including drafts).
 */
export async function getAllMoviesAdmin(): Promise<Movie[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('movies')
        .select(`
          *,
          movie_links (*)
        `)
        .order('created_at', { ascending: false });

      if (!error) {
        return (data || []).map((item: any) => ({
          ...item,
          movie_links: Array.isArray(item.movie_links) ? item.movie_links[0] : item.movie_links,
        }));
      }
      console.warn('Supabase getAllMoviesAdmin error:', error);
    } catch (err) {
      console.warn('Supabase getAllMoviesAdmin error:', err);
    }

    if (!import.meta.env.DEV) return [];
  }

  return getLocalMovies();
}

/**
 * Fetch a single movie by ID (for admin editing).
 */
export async function getMovieById(id: string): Promise<Movie | null> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('movies')
        .select(`
          *,
          movie_links (*)
        `)
        .eq('id', id)
        .maybeSingle();

      if (!error) {
        return data ? {
          ...data,
          movie_links: Array.isArray(data.movie_links) ? data.movie_links[0] : data.movie_links,
        } : null;
      }
      console.warn('Supabase getMovieById error:', error);
    } catch (err) {
      console.warn('Supabase getMovieById error:', err);
    }

    if (!import.meta.env.DEV) return null;
  }

  return getLocalMovies().find((m) => m.id === id) || null;
}

/**
 * Generate a URL-friendly slug from title.
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Create a new movie with links.
 */
export async function createMovie(formData: MovieFormData): Promise<Movie> {
  const globalMonetization = await getMonetizationSettings();

  // If user opted to inherit global monetization defaults or left them empty
  let step1 = formData.step_1_url?.trim() || null;
  let step2 = formData.step_2_url?.trim() || null;
  let step3 = formData.step_3_url?.trim() || null;

  if (formData.use_global_monetization_fallback && globalMonetization.enabled) {
    if (!step1) step1 = globalMonetization.step_1_url;
    if (!step2) step2 = globalMonetization.step_2_url;
    if (!step3) step3 = globalMonetization.step_3_url;
  }

  const finalDestinationType = formData.final_destination_type || 'video_source';
  const finalUrl = finalDestinationType === 'custom_url' ? (formData.final_url?.trim() || null) : null;

  const now = new Date().toISOString();
  const slug = formData.slug?.trim() || generateSlug(formData.title);

  if (isSupabaseConfigured()) {
    // Insert into movies table
    const { data: movieData, error: movieErr } = await supabase
      .from('movies')
      .insert([
        {
          title: formData.title.trim(),
          slug,
          description: formData.description.trim(),
          poster_url: formData.poster_url.trim(),
          backdrop_url: formData.backdrop_url?.trim() || formData.poster_url.trim(),
          release_year: Number(formData.release_year),
          genre: formData.genre.trim(),
          duration: formData.duration.trim(),
          language: formData.language.trim(),
          content_type: formData.content_type || 'movie',
          source_type: formData.source_type,
          video_url: formData.source_type === 'uploaded' ? formData.video_url?.trim() || null : null,
          external_video_url: formData.source_type === 'external' ? formData.external_video_url?.trim() || null : null,
          is_published: formData.is_published,
          featured: Boolean(formData.featured),
          director: formData.director?.trim() || '',
        },
      ])
      .select()
      .single();

    if (movieErr) {
      throw new Error(`Database error creating movie: ${movieErr.message}`);
    }

    // Insert into movie_links table
    const { data: linkData } = await supabase
      .from('movie_links')
      .insert([
        {
          movie_id: movieData.id,
          step_1_url: step1,
          step_2_url: step2,
          step_3_url: step3,
          final_url: finalUrl,
          final_destination_type: finalDestinationType,
        },
      ])
      .select()
      .single();

    return {
      ...movieData,
      movie_links: linkData || undefined,
    };
  }

  // Local Storage fallback creation
  const localMovies = getLocalMovies();
  const newId = `kuro-m-${Date.now().toString(36)}`;
  const newLink: MovieLink = {
    id: `kuro-l-${Date.now().toString(36)}`,
    movie_id: newId,
    step_1_url: step1,
    step_2_url: step2,
    step_3_url: step3,
    final_url: finalUrl,
    final_destination_type: finalDestinationType,
    created_at: now,
    updated_at: now,
  };

  const newMovie: Movie = {
    id: newId,
    title: formData.title.trim(),
    slug,
    description: formData.description.trim(),
    poster_url: formData.poster_url.trim(),
    backdrop_url: formData.backdrop_url?.trim() || formData.poster_url.trim(),
    release_year: Number(formData.release_year),
    genre: formData.genre.trim(),
    duration: formData.duration.trim(),
    language: formData.language.trim(),
    content_type: formData.content_type || 'movie',
    source_type: formData.source_type,
    video_url: formData.source_type === 'uploaded' ? formData.video_url?.trim() || null : null,
    external_video_url: formData.source_type === 'external' ? formData.external_video_url?.trim() || null : null,
    is_published: formData.is_published,
    featured: Boolean(formData.featured),
    director: formData.director?.trim() || '',
    created_at: now,
    updated_at: now,
    movie_links: newLink,
  };

  localMovies.unshift(newMovie);
  setLocalMovies(localMovies);
  return newMovie;
}

/**
 * Update an existing movie and its links.
 */
export async function updateMovie(id: string, formData: MovieFormData): Promise<Movie> {
  const now = new Date().toISOString();
  const slug = formData.slug?.trim() || generateSlug(formData.title);

  const finalDestinationType = formData.final_destination_type || 'video_source';
  const finalUrl = finalDestinationType === 'custom_url' ? (formData.final_url?.trim() || null) : null;

  if (isSupabaseConfigured()) {
    const { data: movieData, error: movieErr } = await supabase
      .from('movies')
      .update({
        title: formData.title.trim(),
        slug,
        description: formData.description.trim(),
        poster_url: formData.poster_url.trim(),
        backdrop_url: formData.backdrop_url?.trim() || formData.poster_url.trim(),
        release_year: Number(formData.release_year),
        genre: formData.genre.trim(),
        duration: formData.duration.trim(),
        language: formData.language.trim(),
        content_type: formData.content_type || 'movie',
        source_type: formData.source_type,
        video_url: formData.source_type === 'uploaded' ? formData.video_url?.trim() || null : null,
        external_video_url: formData.source_type === 'external' ? formData.external_video_url?.trim() || null : null,
        is_published: formData.is_published,
        featured: Boolean(formData.featured),
        director: formData.director?.trim() || '',
        updated_at: now,
      })
      .eq('id', id)
      .select()
      .single();

    if (movieErr) {
      throw new Error(`Error updating movie: ${movieErr.message}`);
    }

    // Upsert movie links
    const { data: linkData } = await supabase
      .from('movie_links')
      .upsert(
        {
          movie_id: id,
          step_1_url: formData.step_1_url?.trim() || null,
          step_2_url: formData.step_2_url?.trim() || null,
          step_3_url: formData.step_3_url?.trim() || null,
          final_url: finalUrl,
          final_destination_type: finalDestinationType,
          updated_at: now,
        },
        { onConflict: 'movie_id' }
      )
      .select()
      .single();

    return {
      ...movieData,
      movie_links: linkData || undefined,
    };
  }

  // Local storage update
  const local = getLocalMovies();
  const index = local.findIndex((m) => m.id === id);
  if (index === -1) {
    throw new Error('Movie not found');
  }

  const existing = local[index];
  const updatedMovie: Movie = {
    ...existing,
    title: formData.title.trim(),
    slug,
    description: formData.description.trim(),
    poster_url: formData.poster_url.trim(),
    backdrop_url: formData.backdrop_url?.trim() || formData.poster_url.trim(),
    release_year: Number(formData.release_year),
    genre: formData.genre.trim(),
    duration: formData.duration.trim(),
    language: formData.language.trim(),
    content_type: formData.content_type || 'movie',
    source_type: formData.source_type,
    video_url: formData.source_type === 'uploaded' ? formData.video_url?.trim() || null : null,
    external_video_url: formData.source_type === 'external' ? formData.external_video_url?.trim() || null : null,
    is_published: formData.is_published,
    featured: Boolean(formData.featured),
    director: formData.director?.trim() || '',
    updated_at: now,
    movie_links: {
      id: existing.movie_links?.id || `kuro-l-${id}`,
      movie_id: id,
      step_1_url: formData.step_1_url?.trim() || null,
      step_2_url: formData.step_2_url?.trim() || null,
      step_3_url: formData.step_3_url?.trim() || null,
      final_url: finalUrl,
      final_destination_type: finalDestinationType,
      updated_at: now,
    },
  };

  local[index] = updatedMovie;
  setLocalMovies(local);
  return updatedMovie;
}

/**
 * Toggle publish status of a movie.
 */
export async function togglePublishMovie(id: string, is_published: boolean): Promise<Movie> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('movies')
      .update({ is_published, updated_at: now })
      .eq('id', id)
      .select(`*, movie_links (*)`)
      .single();

    if (error) {
      throw new Error(`Failed to update publish state: ${error.message}`);
    }

    return {
      ...data,
      movie_links: Array.isArray(data.movie_links) ? data.movie_links[0] : data.movie_links,
    };
  }

  const local = getLocalMovies();
  const movie = local.find((m) => m.id === id);
  if (!movie) throw new Error('Movie not found');
  movie.is_published = is_published;
  movie.updated_at = now;
  setLocalMovies(local);
  return movie;
}

/**
 * Delete a movie.
 */
export async function deleteMovie(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    // Delete links first
    await supabase.from('movie_links').delete().eq('movie_id', id);
    const { error } = await supabase.from('movies').delete().eq('id', id);
    if (error) {
      throw new Error(`Failed to delete movie: ${error.message}`);
    }
    return;
  }

  const local = getLocalMovies().filter((m) => m.id !== id);
  setLocalMovies(local);
}
