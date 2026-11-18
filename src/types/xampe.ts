export type NicheId =
  | 'fitness'
  | 'smarthome'
  | 'pets'
  | 'fashion'
  | 'home'
  | 'car'
  | 'baby';

export type LayoutTemplateId =
  | 'minimalist'
  | 'dtc'
  | 'luxury'
  | 'vibrant'
  | 'editorial';

export type ColorThemeId =
  | 'orange'
  | 'obsidian'
  | 'emerald'
  | 'cobalt'
  | 'terracotta'
  | 'crimson';

export type BuilderTabMode = 'niche' | 'custom';
export type CustomSourceMode = 'link' | 'photo' | 'manual';

export type PageRoute =
  | 'home'
  | 'tools-hub'
  | 'tool-name-generator'
  | 'tool-profit-calculator'
  | 'tool-ad-hooks'
  | 'tool-theme-analyzer'
  | 'feature-winning-products'
  | 'feature-store-pages'
  | 'feature-custom-domain'
  | 'solution-themes'
  | 'solution-pets'
  | 'solution-electronics'
  | 'solution-fashion'
  | 'solution-home'
  | 'solution-fitness'
  | 'guides-hub'
  | 'guide-dropship-shopify'
  | 'guide-ai-dropshipping'
  | 'guide-marketing-tiktok'
  | 'guide-shopify-seo'
  | 'guide-start-shopify'
  | 'guide-how-shopify-works'
  | 'glossary'
  | 'success-stories'
  | 'blog'
  | 'faq'
  | 'privacy'
  | 'terms'
  | 'contact';

export interface HeroPhotoItem {
  src: string;
  fallbackSrc?: string;
  alt: string;
  objectPosition: string;
  source?: string;
}

export interface NicheInfo {
  id: NicheId;
  label: string;
  shortLabel: string;
  description: string;
  avgMargin: string;
  avgAov: string;
  productCount: number;
  searchQuery: string;
  fallbackQuery: string;
  relevanceKeywords: string[];
  heroQuery: string;
  heroImages: HeroPhotoItem[];
  heroTaglines: string[];
  heroSubheadlines: string[];
  suggestedNames: string[];
}

export interface WinningProduct {
  id: string;
  sku: string;
  niche: NicheId;
  name: string;
  category: string;
  shortDescription: string;
  supplierCost: number;
  retailPrice: number;
  priceDisplay?: string;
  source?: string;
  link?: string;
  delivery?: string;
  rating: number;
  reviews: number;
  shippingDays: string;
  adHook: string;
  imageUrl: string;
  imagePosition?: string;
  benefits?: string[];
  isCustomImported?: boolean;
  isLiveApi?: boolean;
  sourceUrl?: string;
}

export interface CustomProductDraft {
  sourceMode: CustomSourceMode;
  sourceUrl: string;
  sourcePlatform: string;
  productLink?: string;
  title: string;
  niche: NicheId;
  category: string;
  imageUrl: string;
  sellingPrice: number;
  supplierCost: number;
  rating?: number;
  reviews?: number;
  benefits: [string, string, string];
  shortDescription: string;
  adHook: string;
  isLiveImported?: boolean;
}

export interface ColorThemePreset {
  id: ColorThemeId;
  name: string;
  primary: string;
  primaryText: string;
  accentLight: string;
  accentText: string;
  border: string;
}

export interface LayoutTemplateMeta {
  id: LayoutTemplateId;
  name: string;
  description: string;
}

export interface GeneratedStore {
  id: string;
  storeName: string;
  niche: NicheId;
  searchQuery: string;
  layout: LayoutTemplateId;
  colorTheme: ColorThemeId;
  heroImageIndex: number;
  heroImages: HeroPhotoItem[];
  heroTagline: string;
  heroSubheadline: string;
  products: WinningProduct[];
  liveProductPool?: WinningProduct[];
  featuredCustomProduct?: WinningProduct | null;
  generatedAt: string;
}
