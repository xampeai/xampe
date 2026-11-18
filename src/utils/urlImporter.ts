import { NICHES } from '../data/products';
import { NicheId } from '../types/xampe';
import { fetchLiveShoppingProducts } from './liveApi';

export interface ParsedUrlProduct {
  sourcePlatform: string;
  extractedKeywords: string;
  title: string;
  niche: NicheId;
  category: string;
  imageUrl: string;
  sellingPrice: number;
  supplierCost: number;
  rating: number;
  reviews: number;
  productLink?: string;
  benefits: [string, string, string];
  shortDescription: string;
  adHook: string;
}

const NOISE_WORDS = new Set([
  'www',
  'http',
  'https',
  'dp',
  'gp',
  'product',
  'products',
  'product-detail',
  'item',
  'items',
  'detail',
  'details',
  'p',
  's',
  'ref',
  'html',
  'htm',
  'php',
  'shop',
  'store',
  'collection',
  'collections',
  'listing',
  'aliexpress',
  'amazon',
  'cjdropshipping',
  'shopify',
  'myshopify',
  'temu',
  'walmart',
  'target',
  'com',
  'net',
  'org',
  'co',
  'us',
  'uk',
  'en',
  'id',
]);

const NICHE_KEYWORDS: { niche: NicheId; words: string[]; category: string }[] = [
  {
    niche: 'pets',
    category: 'Pet Care',
    words: ['pet', 'dog', 'cat', 'puppy', 'kitten', 'paw', 'bowl', 'leash', 'collar', 'harness', 'fountain', 'grooming', 'orthopedic', 'bed', 'fur'],
  },
  {
    niche: 'car',
    category: 'Auto Hardware',
    words: ['car', 'auto', 'vehicle', 'tire', 'inflator', 'compressor', 'vacuum', 'dash', 'magsafe', 'mount', 'trunk', 'seat', 'detailing', 'windshield'],
  },
  {
    niche: 'smarthome',
    category: 'Smart Tech',
    words: ['smart', 'lamp', 'light', 'led', 'desk', 'monitor', 'charger', 'wireless', 'dock', 'purifier', 'hepa', 'usb', 'hub', 'cable', 'timer', 'sensor', 'blender'],
  },
  {
    niche: 'fashion',
    category: 'Beauty & Carry',
    words: ['jade', 'roller', 'gua', 'sha', 'facial', 'skincare', 'serum', 'sunglass', 'sunglasses', 'eyewear', 'watch', 'bag', 'crossbody', 'vanity', 'silk', 'mirror', 'beauty'],
  },
  {
    niche: 'home',
    category: 'Home & Garden',
    words: ['home', 'garden', 'plant', 'planter', 'herb', 'watering', 'diffuser', 'aroma', 'ceramic', 'vase', 'linen', 'throw', 'kitchen', 'knife', 'solar', 'patio'],
  },
  {
    niche: 'baby',
    category: 'Baby & Kids',
    words: ['baby', 'infant', 'toddler', 'kids', 'nursery', 'stroller', 'crib', 'diaper', 'bottle', 'pacifier', 'monitor', 'teether', 'swaddle', 'caddy'],
  },
  {
    niche: 'fitness',
    category: 'Fitness & Recovery',
    words: ['fitness', 'gym', 'workout', 'massage', 'massager', 'percussion', 'posture', 'corrector', 'yoga', 'mat', 'cork', 'rope', 'jump', 'resistance', 'band', 'bottle', 'flask'],
  },
];

const GENERIC_ID_FALLBACK_QUERIES: { query: string; niche: NicheId }[] = [
  { query: 'portable percussion massage gun', niche: 'fitness' },
  { query: 'cordless portable mini blender', niche: 'home' },
  { query: 'wireless monitor led light bar', niche: 'smarthome' },
  { query: 'orthopedic dog bolster bed', niche: 'pets' },
  { query: 'cordless digital tire inflator', niche: 'car' },
  { query: 'jade facial roller gua sha set', niche: 'fashion' },
];

export function detectPlatform(urlStr: string): string {
  const lower = urlStr.toLowerCase();
  if (lower.includes('aliexpress')) return 'AliExpress';
  if (lower.includes('amazon') || lower.includes('amzn.')) return 'Amazon';
  if (lower.includes('cjdropshipping')) return 'CJdropshipping';
  if (lower.includes('myshopify') || lower.includes('/products/')) return 'Shopify Store';
  if (lower.includes('temu')) return 'Temu';
  if (lower.includes('walmart')) return 'Walmart';
  if (lower.includes('target')) return 'Target';
  return 'Marketplace Link';
}

export function extractKeywordsFromUrl(rawUrl: string): {
  keywords: string;
  platform: string;
  inferredNiche: NicheId;
  category: string;
} {
  const trimmed = rawUrl.trim();
  const platform = detectPlatform(trimmed);

  let pathPart = trimmed;
  try {
    const normalized = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    const parsed = new URL(normalized);
    pathPart = `${parsed.pathname} ${parsed.searchParams.get('keywords') || ''} ${
      parsed.searchParams.get('q') || ''
    }`;
  } catch {
    pathPart = trimmed;
  }

  const rawTokens = pathPart
    .replace(/\.html?$/i, '')
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean);

  const meaningfulTokens = rawTokens.filter((tok) => {
    const low = tok.toLowerCase();
    if (NOISE_WORDS.has(low)) return false;
    if (/^\d+$/.test(tok)) return false;
    if (/^b0[a-z0-9]{7,}$/i.test(tok)) return false;
    if (tok.length <= 1) return false;
    return true;
  });

  const searchable = `${trimmed.toLowerCase()} ${meaningfulTokens.join(' ').toLowerCase()}`;
  let inferredNiche: NicheId = 'smarthome';
  let category = 'Featured Gear';
  let bestScore = 0;

  for (const entry of NICHE_KEYWORDS) {
    let score = 0;
    for (const w of entry.words) {
      if (searchable.includes(w)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      inferredNiche = entry.niche;
      category = entry.category;
    }
  }

  let keywords = '';
  if (meaningfulTokens.length >= 2) {
    keywords = meaningfulTokens.slice(0, 6).join(' ');
  } else {
    // Clean fallback for pure numeric ID links (e.g. ?id=100500684219)
    let hash = 0;
    for (let i = 0; i < trimmed.length; i++) {
      hash = (hash * 31 + trimmed.charCodeAt(i)) % 10000;
    }
    const fallback =
      GENERIC_ID_FALLBACK_QUERIES[hash % GENERIC_ID_FALLBACK_QUERIES.length];
    keywords = fallback.query;
    inferredNiche = fallback.niche;
    category = NICHES[inferredNiche].shortLabel;
  }

  return { keywords, platform, inferredNiche, category };
}

export async function fetchRealProductFromUrl(
  rawUrl: string
): Promise<ParsedUrlProduct> {
  const { keywords, platform, inferredNiche, category } =
    extractKeywordsFromUrl(rawUrl);

  const liveMatches = await fetchLiveShoppingProducts(keywords, {
    num: 25,
    niche: inferredNiche,
    categoryLabel: category,
    appendTrending: false,
    exactKeywordMatch: true,
    nicheQueryFallback: NICHES[inferredNiche].searchQuery,
  });

  const match = liveMatches[0];
  const shortTitle = match.name;
  const sellingPrice = match.retailPrice;
  const supplierCost = match.supplierCost;
  const matchedPlatform = match.source || platform;

  const benefits: [string, string, string] = [
    `Top-rated ${shortTitle} sourced live from ${matchedPlatform} (${match.rating}/5 rating)`,
    `Estimated wholesale unit cost ~$${supplierCost.toFixed(2)} with strong retail margin at $${sellingPrice.toFixed(2)}`,
    `Compact high-demand ${NICHES[inferredNiche].shortLabel.toLowerCase()} item ready for TikTok & Meta video hooks`,
  ];

  return {
    sourcePlatform: matchedPlatform,
    extractedKeywords: keywords,
    title: shortTitle,
    niche: inferredNiche,
    category: match.category || category,
    imageUrl: match.imageUrl,
    sellingPrice,
    supplierCost,
    rating: match.rating,
    reviews: match.reviews,
    productLink: match.link || rawUrl,
    benefits,
    shortDescription: match.shortDescription,
    adHook: match.adHook,
  };
}
