import { supabase, isSupabaseConfigured } from './supabase';
import type { MonetizationSettings } from '../types/monetization';
import { INITIAL_MONETIZATION_SETTINGS } from './demoData';

const LOCAL_STORAGE_KEY = 'kuro_monetization_settings';
const DISABLED_MONETIZATION_SETTINGS: MonetizationSettings = {
  id: 'global-monetization-001',
  provider_name: 'Custom',
  enabled: false,
  step_1_url: null,
  step_2_url: null,
  step_3_url: null,
};

/**
 * Fetch current monetization settings.
 */
export async function getMonetizationSettings(): Promise<MonetizationSettings> {
  if (!isSupabaseConfigured()) {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // fallback
      }
    }
    return INITIAL_MONETIZATION_SETTINGS;
  }

  try {
    const { data, error } = await supabase
      .from('monetization_settings')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return DISABLED_MONETIZATION_SETTINGS;
    }

    return {
      id: data.id,
      provider_name: data.provider_name || 'Monetag',
      enabled: Boolean(data.enabled),
      step_1_url: data.step_1_url || null,
      step_2_url: data.step_2_url || null,
      step_3_url: data.step_3_url || null,
      notes: data.notes || '',
      updated_at: data.updated_at,
    };
  } catch (err) {
    console.error('Failed to load monetization settings from Supabase:', err);
    return DISABLED_MONETIZATION_SETTINGS;
  }
}

/** Read only the active link configuration required by the public watch flow. */
export async function getPublicMonetizationSettings(): Promise<MonetizationSettings> {
  if (!isSupabaseConfigured()) {
    return getMonetizationSettings();
  }

  const { data, error } = await supabase.rpc('get_public_monetization_settings');
  if (error || !data) {
    return DISABLED_MONETIZATION_SETTINGS;
  }

  const settings = data as Partial<MonetizationSettings>;
  return {
    id: settings.id || DISABLED_MONETIZATION_SETTINGS.id,
    provider_name: settings.provider_name || 'Custom',
    enabled: Boolean(settings.enabled),
    step_1_url: settings.enabled ? settings.step_1_url || null : null,
    step_2_url: settings.enabled ? settings.step_2_url || null : null,
    step_3_url: settings.enabled ? settings.step_3_url || null : null,
    updated_at: settings.updated_at,
  };
}

/**
 * Save / Update monetization settings.
 */
export async function saveMonetizationSettings(
  settings: Partial<MonetizationSettings>
): Promise<MonetizationSettings> {
  const updated: MonetizationSettings = {
    id: settings.id || 'global-monetization-001',
    provider_name: settings.provider_name || 'Monetag',
    enabled: settings.enabled ?? true,
    step_1_url: settings.step_1_url || null,
    step_2_url: settings.step_2_url || null,
    step_3_url: settings.step_3_url || null,
    notes: settings.notes || '',
    updated_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured()) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }

  // Update or insert into Supabase
  const { data, error } = await supabase
    .from('monetization_settings')
    .upsert(
      {
        id: updated.id,
        provider_name: updated.provider_name,
        enabled: updated.enabled,
        step_1_url: updated.step_1_url,
        step_2_url: updated.step_2_url,
        step_3_url: updated.step_3_url,
        updated_at: updated.updated_at,
      },
      { onConflict: 'id' }
    )
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save monetization settings: ${error.message}`);
  }

  return {
    id: data.id,
    provider_name: data.provider_name,
    enabled: data.enabled,
    step_1_url: data.step_1_url,
    step_2_url: data.step_2_url,
    step_3_url: data.step_3_url,
    updated_at: data.updated_at,
  };
}
