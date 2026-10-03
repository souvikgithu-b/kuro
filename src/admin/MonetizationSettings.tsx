import React, { useState, useEffect } from 'react';
import { getMonetizationSettings, saveMonetizationSettings } from '../lib/monetization';
import { MONETIZATION_PROVIDERS } from '../types/monetization';
import type { MonetizationSettings as IMonetizationSettings } from '../types/monetization';
import { useToast } from '../components/Toast';
import {
  Coins,
  ExternalLink,
  Save,
  Info,
} from 'lucide-react';

export const MonetizationSettings: React.FC = () => {
  const toast = useToast();
  const [settings, setSettings] = useState<IMonetizationSettings>({
    id: 'global-monetization-001',
    provider_name: 'Monetag',
    enabled: true,
    step_1_url: '',
    step_2_url: '',
    step_3_url: '',
    notes: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getMonetizationSettings();
        setSettings(data);
      } catch (err: any) {
        toast.error('Failed to load settings', err?.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveMonetizationSettings(settings);
      toast.success(
        'Monetization Settings Saved',
        `Active provider: ${settings.provider_name}. URLs updated.`
      );
    } catch (err: any) {
      toast.error('Save failed', err?.message);
    } finally {
      setSaving(false);
    }
  };

  const handleApplyPreset = (providerName: string) => {
    setSettings((prev) => ({
      ...prev,
      provider_name: providerName,
    }));
    toast.success('Preset Selected', `Provider name changed to ${providerName}`);
  };

  const testUrl = (url: string | null | undefined, stepName: string) => {
    if (!url) {
      toast.error('No URL configured', `Please provide a URL for ${stepName} before testing.`);
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="p-8 text-xs font-mono text-ink-400">
        Loading monetization configuration...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center space-x-2">
            <Coins className="w-5 h-5 text-amber-400" />
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Monetization & Link Provider
            </h1>
          </div>
          <p className="text-xs font-mono text-ink-400 mt-1">
            Configure global default 3-step screening URLs. Generic provider architecture allows seamless migration between ad networks.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="ink-btn-primary px-5 py-2.5 text-xs font-mono tracking-wider uppercase rounded-sm inline-flex items-center space-x-2 self-start sm:self-auto disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {/* Architecture Disclaimer / Notice */}
      <div className="p-4 bg-ink-900/60 border border-white/10 rounded-sm flex items-start space-x-3.5">
        <Info className="w-5 h-5 text-ink-300 mt-0.5 shrink-0" />
        <div className="space-y-1 text-xs font-mono text-ink-300">
          <p className="font-bold text-white uppercase tracking-wider">
            Generic Provider Abstraction
          </p>
          <p className="leading-relaxed text-ink-400">
            This website does NOT hardcode Monetag or any specific vendor. You can switch between Monetag SmartLinks, PropellerAds, custom URL shorteners, or affiliate sponsors at any time without redeploying code.
          </p>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: PROVIDER CONFIG */}
        <div className="bg-ink-900/60 border border-white/10 rounded-sm p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <h2 className="font-serif text-lg font-bold text-white">Provider Configuration</h2>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                className="w-4 h-4 rounded bg-ink-950 border-white/20 text-white focus:ring-0"
              />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Enable Monetization Routing
              </span>
            </label>
          </div>

          <div className="space-y-4">
            {/* Provider Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-ink-300">
                Provider Name (e.g. Monetag, Custom, PropellerAds)
              </label>
              <input
                type="text"
                required
                value={settings.provider_name}
                onChange={(e) => setSettings({ ...settings, provider_name: e.target.value })}
                placeholder="Monetag"
                className="w-full px-3 py-2 bg-ink-950 text-white font-mono text-xs border border-white/10 rounded-sm focus:outline-none focus:border-white/30"
              />
            </div>

            {/* Provider Presets */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-ink-500">
                Quick Provider Presets:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {MONETIZATION_PROVIDERS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset.name)}
                    className={`p-3 text-left border rounded-sm transition-all ${
                      settings.provider_name.toLowerCase() === preset.name.toLowerCase()
                        ? 'bg-white/5 border-white text-white'
                        : 'bg-ink-950 border-white/5 text-ink-400 hover:border-white/20'
                    }`}
                  >
                    <div className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                      {preset.name}
                    </div>
                    <div className="text-[10px] font-mono text-ink-500 line-clamp-2 mt-1">
                      {preset.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: 3-STEP GLOBAL DEFAULT URLS */}
        <div className="bg-ink-900/60 border border-white/10 rounded-sm p-6 space-y-6">
          <div className="pb-3 border-b border-white/[0.08]">
            <h2 className="font-serif text-lg font-bold text-white">Default Destination URLs</h2>
            <p className="text-xs font-mono text-ink-400 mt-0.5">
              Applied automatically when an individual movie does not configure its own unique links.
            </p>
          </div>

          {/* STEP 1 URL */}
          <div className="space-y-2 bg-ink-950/70 p-4 border border-white/5 rounded-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-ink-800 border border-white/15 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                  1
                </span>
                <label className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                  Step 1 Destination URL
                </label>
              </div>

              <button
                type="button"
                onClick={() => testUrl(settings.step_1_url, 'Step 1')}
                className="ink-btn-secondary px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded-sm inline-flex items-center space-x-1"
              >
                <span>Test Step 1</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <input
              type="url"
              value={settings.step_1_url || ''}
              onChange={(e) => setSettings({ ...settings, step_1_url: e.target.value })}
              placeholder="https://al5sm.com/fullpage.php?section=General&pub=... (or Step 1 Direct Link)"
              className="w-full px-3 py-2 bg-ink-900 text-white font-mono text-xs border border-white/10 rounded-sm focus:outline-none focus:border-white/30"
            />
            <p className="text-[10px] font-mono text-ink-500">
              When the visitor clicks "Continue" on Step 1, this destination will open in a new tab.
            </p>
          </div>

          {/* STEP 2 URL */}
          <div className="space-y-2 bg-ink-950/70 p-4 border border-white/5 rounded-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-ink-800 border border-white/15 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                  2
                </span>
                <label className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                  Step 2 Destination URL
                </label>
              </div>

              <button
                type="button"
                onClick={() => testUrl(settings.step_2_url, 'Step 2')}
                className="ink-btn-secondary px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded-sm inline-flex items-center space-x-1"
              >
                <span>Test Step 2</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <input
              type="url"
              value={settings.step_2_url || ''}
              onChange={(e) => setSettings({ ...settings, step_2_url: e.target.value })}
              placeholder="https://al5sm.com/fullpage.php?section=General&pub=... (or Step 2 Direct Link)"
              className="w-full px-3 py-2 bg-ink-900 text-white font-mono text-xs border border-white/10 rounded-sm focus:outline-none focus:border-white/30"
            />
            <p className="text-[10px] font-mono text-ink-500">
              When the visitor clicks "Proceed" on Step 2, this destination will open.
            </p>
          </div>

          {/* STEP 3 URL */}
          <div className="space-y-2 bg-ink-950/70 p-4 border border-white/5 rounded-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-ink-800 border border-white/15 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                  3
                </span>
                <label className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                  Step 3 Destination URL
                </label>
              </div>

              <button
                type="button"
                onClick={() => testUrl(settings.step_3_url, 'Step 3')}
                className="ink-btn-secondary px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded-sm inline-flex items-center space-x-1"
              >
                <span>Test Step 3</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <input
              type="url"
              value={settings.step_3_url || ''}
              onChange={(e) => setSettings({ ...settings, step_3_url: e.target.value })}
              placeholder="https://al5sm.com/fullpage.php?section=General&pub=... (or Step 3 Direct Link)"
              className="w-full px-3 py-2 bg-ink-900 text-white font-mono text-xs border border-white/10 rounded-sm focus:outline-none focus:border-white/30"
            />
            <p className="text-[10px] font-mono text-ink-500">
              When the visitor clicks "Next Step" on Step 3, this destination will open before video playback begins.
            </p>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="ink-btn-primary px-8 py-3 text-xs font-mono tracking-widest uppercase rounded-sm inline-flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
