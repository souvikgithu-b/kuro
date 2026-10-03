export interface MonetizationSettings {
  id: string;
  provider_name: string; // e.g., 'Monetag', 'PropellerAds', 'Custom', etc.
  enabled: boolean;
  step_1_url: string | null;
  step_2_url: string | null;
  step_3_url: string | null;
  notes?: string;
  updated_at?: string;
}

export interface ProviderPreset {
  id: string;
  name: string;
  description: string;
  step1Placeholder: string;
  step2Placeholder: string;
  step3Placeholder: string;
  docUrl?: string;
}

export const MONETIZATION_PROVIDERS: ProviderPreset[] = [
  {
    id: 'monetag',
    name: 'Monetag',
    description: 'Direct Link / SmartLink monetization network. Paste your Direct Link tags for Step 1, 2, and 3.',
    step1Placeholder: 'https://al5sm.com/fullpage.php?section=General&pub=... (or SmartLink 1)',
    step2Placeholder: 'https://al5sm.com/fullpage.php?section=General&pub=... (or SmartLink 2)',
    step3Placeholder: 'https://al5sm.com/fullpage.php?section=General&pub=... (or SmartLink 3)',
    docUrl: 'https://monetag.com',
  },
  {
    id: 'custom',
    name: 'Custom Provider / Shortener',
    description: 'Use your own intermediate verification, sponsor, link shortener, or partner landing pages.',
    step1Placeholder: 'https://partner-link.com/step1',
    step2Placeholder: 'https://partner-link.com/step2',
    step3Placeholder: 'https://partner-link.com/step3',
  },
  {
    id: 'other',
    name: 'Other Advertising Network',
    description: 'Configure standard HTTP / HTTPS redirect URLs for any legitimate affiliate or ad provider.',
    step1Placeholder: 'https://provider.example.com/link1',
    step2Placeholder: 'https://provider.example.com/link2',
    step3Placeholder: 'https://provider.example.com/link3',
  }
];
