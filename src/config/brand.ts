/**
 * Brand Configuration for KURO // 黒
 * 
 * Easily customize the website brand name, tagline, logo mark,
 * and editorial visual identity in this single configuration file.
 */

export const BRAND_CONFIG = {
  // Brand name
  name: 'KURO',
  kanji: '黒',
  fullName: 'KURO // 黒',
  tagline: 'Modern Cinema Archive',
  subtitle: 'Curated Film Showcase & Destination Stream',
  
  // Editorial aesthetic descriptors
  aesthetic: 'Ink & Cinema',
  stampText: '上映中', // "Now Screening" Hanko stamp
  stampTextEn: 'NOW SCREENING',

  // SEO & Social Defaults
  description: 'KURO // 黒 — An independent minimalist cinema archive and curated film destination. Featuring black-and-white ink aesthetics, editorial film showcases, and direct screening flows.',
  ogImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop',
  
  // Footer and Legal
  legalNotice: 'KURO is an independent cinema catalog and curation showcase. Only content that the site owner has the legal right or permission to distribute/host is permitted.',
  copyrightYear: 2026,
  
  // 5 Alternative suggested names for user reference:
  // 1. KURO (黒 - Selected Default: Minimalist Japanese Ink & Cinema)
  // 2. CINEVO (Cinematic destination & evolution)
  // 3. NOIRIX (Noir cinema + sleek digital direct links)
  // 4. KAGE (影 - Japanese Silhouette & Shadow cinema)
  // 5. VISTA9 (Wide-aspect modern cinematic stream)
  nameSuggestions: [
    { name: 'KURO', kanji: '黒', meaning: 'Black / Ink Cinema Archive (Selected)', tag: 'Default' },
    { name: 'CINEVO', kanji: '映進', meaning: 'Cinematic Evolution & Stream', tag: 'Alternative' },
    { name: 'NOIRIX', kanji: '暗夜', meaning: 'Noir Cinema Matrix', tag: 'Alternative' },
    { name: 'KAGE', kanji: '影', meaning: 'Shadow & Silhouette Arthouse', tag: 'Alternative' },
    { name: 'VISTA9', kanji: '遠景', meaning: 'Widescreen Vista Archive', tag: 'Alternative' },
  ],
} as const;
