import { supabase, isSupabaseConfigured } from './supabase';

export type StorageBucket = 'movie-posters' | 'movie-backdrops' | 'movie-videos';

export interface UploadOptions {
  bucket: StorageBucket;
  file: File;
  onProgress?: (progressPercent: number) => void;
}

export interface UploadResult {
  publicUrl: string;
  fileName: string;
  fileSize: number;
}

/**
 * Uploads an asset (image or video) to Supabase Storage.
 * If Supabase is not yet configured, creates a local object URL with simulated progress.
 */
export async function uploadAsset({
  bucket,
  file,
  onProgress,
}: UploadOptions): Promise<UploadResult> {
  // Validate file size: 100MB max for posters/backdrops, 2GB for videos
  const maxBytes = bucket === 'movie-videos' ? 2 * 1024 * 1024 * 1024 : 10 * 1024 * 1024;
  if (file.size > maxBytes) {
    const maxMb = Math.round(maxBytes / (1024 * 1024));
    throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds limit of ${maxMb}MB.`);
  }

  // Generate unique clean file path
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${cleanName}`;

  if (!isSupabaseConfigured()) {
    // Graceful offline / demo simulation with progress
    if (onProgress) {
      for (let p = 15; p <= 100; p += 25) {
        onProgress(p);
        await new Promise((r) => setTimeout(r, 60));
      }
    }
    const publicUrl = URL.createObjectURL(file);
    return {
      publicUrl,
      fileName: file.name,
      fileSize: file.size,
    };
  }

  // Upload to real Supabase Storage bucket
  if (onProgress) onProgress(20);

  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  if (onProgress) onProgress(85);

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);

  if (onProgress) onProgress(100);

  return {
    publicUrl: publicUrlData.publicUrl,
    fileName: file.name,
    fileSize: file.size,
  };
}

/**
 * Format bytes into human readable string (KB, MB, GB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
