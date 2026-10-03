import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MovieFormData, Movie } from '../types/movie';
import { uploadAsset, formatBytes } from '../lib/storage';
import { generateSlug } from '../lib/movies';
import { useToast } from '../components/Toast';
import {
  Upload,
  ExternalLink,
} from 'lucide-react';

interface MovieFormProps {
  initialMovie?: Movie;
  onSubmit: (data: MovieFormData) => Promise<void>;
  submitLabel?: string;
  isEditing?: boolean;
}

export const MovieForm: React.FC<MovieFormProps> = ({
  initialMovie,
  onSubmit,
  submitLabel = 'Save Movie',
  isEditing = false,
}) => {
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState<MovieFormData>({
    title: initialMovie?.title || '',
    slug: initialMovie?.slug || '',
    description: initialMovie?.description || '',
    poster_url: initialMovie?.poster_url || '',
    backdrop_url: initialMovie?.backdrop_url || '',
    release_year: initialMovie?.release_year || new Date().getFullYear(),
    genre: initialMovie?.genre || 'Cyberpunk Noir',
    duration: initialMovie?.duration || '110 min',
    language: initialMovie?.language || 'Japanese (Subtitled)',
    content_type: initialMovie?.content_type || 'movie',
    source_type: initialMovie?.source_type || 'uploaded',
    video_url: initialMovie?.video_url || '',
    external_video_url: initialMovie?.external_video_url || '',
    is_published: initialMovie?.is_published ?? true,
    featured: initialMovie?.featured ?? false,
    director: initialMovie?.director || '',
    step_1_url: initialMovie?.movie_links?.step_1_url || '',
    step_2_url: initialMovie?.movie_links?.step_2_url || '',
    step_3_url: initialMovie?.movie_links?.step_3_url || '',
    final_url: initialMovie?.movie_links?.final_url || '',
    final_destination_type: initialMovie?.movie_links?.final_destination_type || 'video_source',
    use_global_monetization_fallback: false,
  });

  const [saving, setSaving] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEditing);

  // File Upload states
  const [posterUploading, setPosterUploading] = useState(false);
  const [posterProgress, setPosterProgress] = useState(0);

  const [backdropUploading, setBackdropUploading] = useState(false);
  const [backdropProgress, setBackdropProgress] = useState(0);

  const [videoUploading, setVideoUploading] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoFileSize, setVideoFileSize] = useState<string | null>(null);

  // Auto-generate slug when title changes unless manually edited
  const handleTitleChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: slugManuallyEdited ? prev.slug : generateSlug(val),
    }));
  };

  // Upload handlers
  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPosterUploading(true);
    setPosterProgress(0);
    try {
      const res = await uploadAsset({
        bucket: 'movie-posters',
        file,
        onProgress: setPosterProgress,
      });
      setFormData((prev) => ({ ...prev, poster_url: res.publicUrl }));
      toast.success('Poster Uploaded', `${file.name} (${formatBytes(res.fileSize)})`);
    } catch (err: any) {
      toast.error('Poster upload failed', err?.message);
    } finally {
      setPosterUploading(false);
    }
  };

  const handleBackdropUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBackdropUploading(true);
    setBackdropProgress(0);
    try {
      const res = await uploadAsset({
        bucket: 'movie-backdrops',
        file,
        onProgress: setBackdropProgress,
      });
      setFormData((prev) => ({ ...prev, backdrop_url: res.publicUrl }));
      toast.success('Backdrop Uploaded', `${file.name} (${formatBytes(res.fileSize)})`);
    } catch (err: any) {
      toast.error('Backdrop upload failed', err?.message);
    } finally {
      setBackdropUploading(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoUploading(true);
    setVideoProgress(0);
    setVideoFileSize(formatBytes(file.size));
    try {
      const res = await uploadAsset({
        bucket: 'movie-videos',
        file,
        onProgress: setVideoProgress,
      });
      setFormData((prev) => ({ ...prev, video_url: res.publicUrl }));
      toast.success('Video File Ready', `${file.name} uploaded successfully.`);
    } catch (err: any) {
      toast.error('Video upload failed', err?.message);
    } finally {
      setVideoUploading(false);
    }
  };

  const handleSubmit = async (publishStatus: boolean) => {
    if (!formData.title.trim()) {
      toast.error('Validation Error', 'Movie title is required.');
      return;
    }

    if (!formData.poster_url.trim()) {
      toast.error('Validation Error', 'A poster image URL or uploaded file is required.');
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        ...formData,
        is_published: publishStatus,
      });
      toast.success(
        isEditing ? 'Movie Updated' : 'Movie Created',
        publishStatus ? 'The film is now published and active.' : 'Saved as draft.'
      );
      navigate('/admin/movies');
    } catch (err: any) {
      toast.error('Save failed', err?.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-10 max-w-4xl select-none">
      {/* SECTION 1: PRIMARY INFORMATION */}
      <section className="bg-ink-900/60 border border-white/10 rounded-sm p-6 space-y-5">
        <div className="flex items-center space-x-2 pb-3 border-b border-white/[0.08]">
          <span className="text-xs font-mono text-vermilion uppercase tracking-widest font-bold">01 //</span>
          <h2 className="font-serif text-lg font-bold text-white">Film Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-300">
              Movie Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. SILHOUETTE OF THE RONIN"
              className="w-full px-3 py-2 bg-ink-950 text-white font-sans font-bold text-base border border-white/10 rounded-sm focus:outline-none focus:border-white/30"
            />
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-300">
              URL Slug *
            </label>
            <div className="flex items-center">
              <span className="px-2.5 py-2 bg-ink-950 text-ink-500 font-mono text-xs border border-r-0 border-white/10 rounded-l-sm">
                /movie/
              </span>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => {
                  setSlugManuallyEdited(true);
                  setFormData({ ...formData, slug: e.target.value });
                }}
                className="w-full px-3 py-2 bg-ink-950 text-white font-mono text-xs border border-white/10 rounded-r-sm focus:outline-none focus:border-white/30"
              />
            </div>
          </div>

          {/* Director */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-300">
              Director
            </label>
            <input
              type="text"
              value={formData.director}
              onChange={(e) => setFormData({ ...formData, director: e.target.value })}
              placeholder="e.g. Kenji Takahashi"
              className="w-full px-3 py-2 bg-ink-950 text-white font-sans text-xs border border-white/10 rounded-sm focus:outline-none focus:border-white/30"
            />
          </div>

          {/* Release Year */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-300">
              Release Year
            </label>
            <input
              type="number"
              value={formData.release_year}
              onChange={(e) => setFormData({ ...formData, release_year: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-ink-950 text-white font-mono text-xs border border-white/10 rounded-sm focus:outline-none focus:border-white/30"
            />
          </div>

          {/* Genre */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-300">
              Genre
            </label>
            <input
              type="text"
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              placeholder="e.g. Cyberpunk Noir, Psychological Thriller"
              className="w-full px-3 py-2 bg-ink-950 text-white font-mono text-xs border border-white/10 rounded-sm focus:outline-none focus:border-white/30"
            />
          </div>

          {/* Duration */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-300">
              Duration
            </label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="e.g. 114 min"
              className="w-full px-3 py-2 bg-ink-950 text-white font-mono text-xs border border-white/10 rounded-sm focus:outline-none focus:border-white/30"
            />
          </div>

          {/* Language */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-300">
              Language / Audio
            </label>
            <input
              type="text"
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              placeholder="e.g. Japanese (Subtitled)"
              className="w-full px-3 py-2 bg-ink-950 text-white font-mono text-xs border border-white/10 rounded-sm focus:outline-none focus:border-white/30"
            />
          </div>

          {/* Featured on Homepage */}
          <div className="md:col-span-2 pt-2">
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 rounded bg-ink-950 border-white/20 text-white focus:ring-0"
              />
              <span className="text-xs font-mono text-ink-200">
                Pin to Homepage Hero Section (Featured Film)
              </span>
            </label>
          </div>

          {/* Description */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-300">
              Synopsis / Film Overview
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter synopsis of the film..."
              className="w-full px-3 py-2 bg-ink-950 text-white font-sans text-xs border border-white/10 rounded-sm focus:outline-none focus:border-white/30 leading-relaxed"
            />
          </div>
        </div>
      </section>

      {/* SECTION 2: VISUAL MEDIA ASSETS */}
      <section className="bg-ink-900/60 border border-white/10 rounded-sm p-6 space-y-5">
        <div className="flex items-center space-x-2 pb-3 border-b border-white/[0.08]">
          <span className="text-xs font-mono text-vermilion uppercase tracking-widest font-bold">02 //</span>
          <h2 className="font-serif text-lg font-bold text-white">Visual Posters & Backdrops</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Poster Field & Upload */}
          <div className="space-y-3">
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-300">
              Poster Image (2:3 Ratio) *
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={formData.poster_url}
                onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
                placeholder="Paste poster image URL or upload below..."
                className="w-full px-3 py-2 bg-ink-950 text-white font-mono text-xs border border-white/10 rounded-sm focus:outline-none focus:border-white/30"
              />

              <div className="flex items-center space-x-2">
                <label className="cursor-pointer ink-btn-secondary px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-sm inline-flex items-center space-x-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Poster File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePosterUpload}
                    className="hidden"
                  />
                </label>
                {posterUploading && (
                  <span className="text-xs font-mono text-ink-400">
                    Uploading ({posterProgress}%)...
                  </span>
                )}
              </div>
            </div>

            {/* Poster Preview */}
            {formData.poster_url && (
              <div className="w-24 aspect-[2/3] bg-ink-950 border border-white/20 rounded-sm overflow-hidden mt-2">
                <img src={formData.poster_url} alt="Poster preview" className="w-full h-full object-cover filter grayscale" />
              </div>
            )}
          </div>

          {/* Backdrop Field & Upload */}
          <div className="space-y-3">
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-300">
              Cinematic Backdrop Image (16:9 Landscape)
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={formData.backdrop_url}
                onChange={(e) => setFormData({ ...formData, backdrop_url: e.target.value })}
                placeholder="Paste landscape backdrop image URL or upload below..."
                className="w-full px-3 py-2 bg-ink-950 text-white font-mono text-xs border border-white/10 rounded-sm focus:outline-none focus:border-white/30"
              />

              <div className="flex items-center space-x-2">
                <label className="cursor-pointer ink-btn-secondary px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-sm inline-flex items-center space-x-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Backdrop File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBackdropUpload}
                    className="hidden"
                  />
                </label>
                {backdropUploading && (
                  <span className="text-xs font-mono text-ink-400">
                    Uploading ({backdropProgress}%)...
                  </span>
                )}
              </div>
            </div>

            {/* Backdrop Preview */}
            {formData.backdrop_url && (
              <div className="w-48 aspect-video bg-ink-950 border border-white/20 rounded-sm overflow-hidden mt-2">
                <img src={formData.backdrop_url} alt="Backdrop preview" className="w-full h-full object-cover filter grayscale" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 3: VIDEO DESTINATION & SOURCE */}
      <section className="bg-ink-900/60 border border-white/10 rounded-sm p-6 space-y-5">
        <div className="flex items-center space-x-2 pb-3 border-b border-white/[0.08]">
          <span className="text-xs font-mono text-vermilion uppercase tracking-widest font-bold">03 //</span>
          <h2 className="font-serif text-lg font-bold text-white">Video Destination Source</h2>
        </div>

        {/* Source Radio Toggle */}
        <div className="space-y-3">
          <label className="block text-xs font-mono uppercase tracking-wider text-ink-300">
            Source Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label
              className={`p-4 border rounded-sm flex items-start space-x-3 cursor-pointer transition-all ${
                formData.source_type === 'uploaded'
                  ? 'bg-white/5 border-white text-white'
                  : 'bg-ink-950 border-white/5 text-ink-400 hover:border-white/20'
              }`}
            >
              <input
                type="radio"
                name="source_type"
                value="uploaded"
                checked={formData.source_type === 'uploaded'}
                onChange={() => setFormData({ ...formData, source_type: 'uploaded' })}
                className="mt-1"
              />
              <div>
                <div className="font-mono text-xs uppercase tracking-wider font-bold text-white">
                  Direct Uploaded Video
                </div>
                <div className="text-[11px] font-mono text-ink-400 mt-1">
                  Plays in KURO's custom cinema player (MP4, WebM, Supabase Storage).
                </div>
              </div>
            </label>

            <label
              className={`p-4 border rounded-sm flex items-start space-x-3 cursor-pointer transition-all ${
                formData.source_type === 'external'
                  ? 'bg-white/5 border-white text-white'
                  : 'bg-ink-950 border-white/5 text-ink-400 hover:border-white/20'
              }`}
            >
              <input
                type="radio"
                name="source_type"
                value="external"
                checked={formData.source_type === 'external'}
                onChange={() => setFormData({ ...formData, source_type: 'external' })}
                className="mt-1"
              />
              <div>
                <div className="font-mono text-xs uppercase tracking-wider font-bold text-white">
                  External Video Destination
                </div>
                <div className="text-[11px] font-mono text-ink-400 mt-1">
                  Embeddable stream (YouTube, Vimeo, HLS stream, or direct URL).
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Uploaded Video Input & Uploader */}
        {formData.source_type === 'uploaded' && (
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-ink-300">
                Direct Video File URL (or Upload File)
              </label>
              <input
                type="text"
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                placeholder="https://.../video.mp4"
                className="w-full px-3 py-2 bg-ink-950 text-white font-mono text-xs border border-white/10 rounded-sm focus:outline-none focus:border-white/30"
              />
            </div>

            <div className="p-4 bg-ink-950 border border-white/10 rounded-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-ink-300 tracking-wider">
                  Supabase Storage Upload
                </span>
                <span className="text-[10px] font-mono text-ink-500">Max size: 2GB</span>
              </div>

              <label className="cursor-pointer ink-btn-secondary px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-sm inline-flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Select Video File</span>
                <input
                  type="file"
                  accept="video/mp4,video/webm"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
              </label>

              {videoUploading && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-[11px] font-mono text-ink-400">
                    <span>Uploading Video ({videoFileSize})...</span>
                    <span>{videoProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-ink-850 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-300"
                      style={{ width: `${videoProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* External Video Input */}
        {formData.source_type === 'external' && (
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-300">
              External Video Stream URL
            </label>
            <input
              type="text"
              value={formData.external_video_url}
              onChange={(e) => setFormData({ ...formData, external_video_url: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/... or direct stream"
              className="w-full px-3 py-2 bg-ink-950 text-white font-mono text-xs border border-white/10 rounded-sm focus:outline-none focus:border-white/30"
            />
            <p className="text-[11px] font-mono text-ink-500">
              Supports standard YouTube, Vimeo, and direct MP4/WebM video stream destinations.
            </p>
          </div>
        )}
      </section>

      {/* SECTION 4: 3-STEP LINK FLOW CONFIGURATION */}
      <section className="bg-ink-900/60 border border-white/10 rounded-sm p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-vermilion uppercase tracking-widest font-bold">04 //</span>
            <h2 className="font-serif text-lg font-bold text-white">Three-Step Link Routing</h2>
          </div>
          <span className="text-[10px] font-mono text-ink-400 uppercase tracking-widest bg-ink-950 px-2 py-0.5 border border-white/10">
            Individual Routing
          </span>
        </div>

        <p className="text-xs font-mono text-ink-400">
          Configure individual destination URLs for each step of this movie's screening flow. You may also inherit global monetization defaults.
        </p>

        {/* Global Fallback checkbox */}
        <div className="p-3 bg-ink-950 border border-white/5 rounded-sm">
          <label className="flex items-center space-x-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.use_global_monetization_fallback}
              onChange={(e) =>
                setFormData({ ...formData, use_global_monetization_fallback: e.target.checked })
              }
              className="w-4 h-4 rounded bg-ink-950 border-white/20 text-white focus:ring-0"
            />
            <span className="text-xs font-mono text-ink-300">
              Inherit global Monetag / Provider defaults for any empty step fields
            </span>
          </label>
        </div>

        {/* Step 1 */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-300">
              Step 1 URL (e.g. Monetag Direct Link 1)
            </label>
            {formData.step_1_url && (
              <a
                href={formData.step_1_url}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-mono text-ink-400 hover:text-white inline-flex items-center space-x-1"
              >
                <span>Test Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <input
            type="url"
            value={formData.step_1_url}
            onChange={(e) => setFormData({ ...formData, step_1_url: e.target.value })}
            placeholder="https://example.com/step1-direct"
            className="w-full px-3 py-2 bg-ink-950 text-white font-mono text-xs border border-white/10 rounded-sm focus:outline-none focus:border-white/30"
          />
        </div>

        {/* Step 2 */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-300">
              Step 2 URL (e.g. Monetag Direct Link 2)
            </label>
            {formData.step_2_url && (
              <a
                href={formData.step_2_url}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-mono text-ink-400 hover:text-white inline-flex items-center space-x-1"
              >
                <span>Test Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <input
            type="url"
            value={formData.step_2_url}
            onChange={(e) => setFormData({ ...formData, step_2_url: e.target.value })}
            placeholder="https://example.com/step2-sponsor"
            className="w-full px-3 py-2 bg-ink-950 text-white font-mono text-xs border border-white/10 rounded-sm focus:outline-none focus:border-white/30"
          />
        </div>

        {/* Step 3 */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-300">
              Step 3 URL (e.g. Monetag Direct Link 3)
            </label>
            {formData.step_3_url && (
              <a
                href={formData.step_3_url}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-mono text-ink-400 hover:text-white inline-flex items-center space-x-1"
              >
                <span>Test Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <input
            type="url"
            value={formData.step_3_url}
            onChange={(e) => setFormData({ ...formData, step_3_url: e.target.value })}
            placeholder="https://example.com/step3-gateway"
            className="w-full px-3 py-2 bg-ink-950 text-white font-mono text-xs border border-white/10 rounded-sm focus:outline-none focus:border-white/30"
          />
        </div>

        {/* Final Destination Type */}
        <div className="space-y-2 pt-2 border-t border-white/[0.05]">
          <label className="block text-xs font-mono uppercase tracking-wider text-ink-300">
            Final Step Destination
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              className={`p-3 border rounded-sm flex items-center space-x-2 cursor-pointer text-xs font-mono ${
                formData.final_destination_type === 'video_source'
                  ? 'bg-white/5 border-white text-white'
                  : 'bg-ink-950 border-white/5 text-ink-400'
              }`}
            >
              <input
                type="radio"
                name="final_destination_type"
                value="video_source"
                checked={formData.final_destination_type === 'video_source'}
                onChange={() => setFormData({ ...formData, final_destination_type: 'video_source' })}
              />
              <span>Automatic (Use Video Source Above)</span>
            </label>

            <label
              className={`p-3 border rounded-sm flex items-center space-x-2 cursor-pointer text-xs font-mono ${
                formData.final_destination_type === 'custom_url'
                  ? 'bg-white/5 border-white text-white'
                  : 'bg-ink-950 border-white/5 text-ink-400'
              }`}
            >
              <input
                type="radio"
                name="final_destination_type"
                value="custom_url"
                checked={formData.final_destination_type === 'custom_url'}
                onChange={() => setFormData({ ...formData, final_destination_type: 'custom_url' })}
              />
              <span>Custom External Final URL</span>
            </label>
          </div>

          {formData.final_destination_type === 'custom_url' && (
            <input
              type="url"
              value={formData.final_url}
              onChange={(e) => setFormData({ ...formData, final_url: e.target.value })}
              placeholder="https://external-destination.com/final-screening"
              className="w-full px-3 py-2 bg-ink-950 text-white font-mono text-xs border border-white/10 rounded-sm focus:outline-none focus:border-white/30 mt-2"
            />
          )}
        </div>
      </section>

      {/* SECTION 5: ACTIONS BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/[0.08]">
        <button
          type="button"
          onClick={() => navigate('/admin/movies')}
          className="text-xs font-mono text-ink-400 hover:text-white uppercase tracking-wider"
        >
          Cancel and Return
        </button>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSubmit(false)}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-ink-900 hover:bg-ink-800 text-ink-200 border border-white/15 text-xs font-mono uppercase tracking-wider rounded-sm transition-all disabled:opacity-50"
          >
            Save Draft
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSubmit(true)}
            className="flex-1 sm:flex-none px-6 py-2.5 bg-white text-ink-950 hover:bg-ink-100 font-bold text-xs uppercase tracking-widest border border-white rounded-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {saving ? 'Saving...' : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
