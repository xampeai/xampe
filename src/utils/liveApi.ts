import { HeroPhotoItem, NicheId, WinningProduct } from '../types/xampe';
import { getClientApiKeys } from './apiKeys';

interface SerperShoppingItem {
  position?: number;
  title?: string;
  source?: string;
  link?: string;
  price?: string;
  extracted_price?: number;
  currency?: string;
  delivery?: string;
  imageUrl?: string;
  thumbnail?: string;
  rating?: number;
  ratingCount?: number;
  product_reviews?: number;
}

interface SerperShoppingResponse {
  shopping?: SerperShoppingItem[];
  error?: string;
  code?: string;
}

interface SerperImageItem {
  title?: string;
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  thumbnailUrl?: string;
  source?: string;
  link?: string;
}

interface SerperImagesResponse {
  images?: SerperImageItem[];
  error?: string;
  code?: string;
}

export class LiveApiError extends Error {
  code?: string;
  adminMessage?: string;
  constructor(message: string, code?: string, adminMessage?: string) {
    super(message);
    this.name = 'LiveApiError';
    this.code = code;
    this.adminMessage = adminMessage;
  }
}

const QUERY_STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'for',
  'in',
  'of',
  'on',
  'or',
  'the',
  'to',
  'with',
  'by',
  'best',
  'top',
  'new',
  'pro',
  'set',
  'kit',
  'pack',
]);

const IRRELEVANT_ITEM_PATTERN =
  /\b(book|books|paperback|hardcover|ebook|kindle|audiobook|gift\s*card|egift|e-gift|manual|instruction\s*booklet|replacement\s*screw|screws|bolts|washers|spare\s*part|repair\s*part|o-ring|gasket|pdf|magazine|subscription|voucher)\b/i;

function extractCoreKeywords(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 2 && !QUERY_STOP_WORDS.has(w));
}

function normalizeTitleKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .slice(0, 7)
    .join(' ');
}

function isIrrelevantProduct(title: string, query: string): boolean {
  const qLower = query.toLowerCase();
  // Allow only if the user explicitly asked for a book/manual/part
  if (IRRELEVANT_ITEM_PATTERN.test(qLower)) return false;
  return IRRELEVANT_ITEM_PATTERN.test(title);
}

function countKeywordMatches(title: string, keywords: string[]): number {
  if (keywords.length === 0) return 0;
  const lower = title.toLowerCase();
  let matches = 0;
  for (const kw of keywords) {
    if (lower.includes(kw)) matches += 1;
  }
  return matches;
}

function parseNumericPrice(item: SerperShoppingItem): number | null {
  if (typeof item.extracted_price === 'number' && item.extracted_price > 0) {
    return Number(item.extracted_price.toFixed(2));
  }
  if (typeof item.price === 'string') {
    const cleaned = item.price.replace(/,/g, '').match(/\d+(\.\d{1,2})?/);
    if (cleaned) {
      const parsed = parseFloat(cleaned[0]);
      if (!Number.isNaN(parsed) && parsed > 0) {
        return Number(parsed.toFixed(2));
      }
    }
  }
  return null;
}

function shortenTitle(title: string): string {
  const cleaned = title.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= 72) return cleaned;
  return `${cleaned.slice(0, 69).trim()}...`;
}

function buildAdHook(title: string, source: string): string {
  const shortName = title.split(',')[0].split(' - ')[0].slice(0, 44).trim();
  return `Why shoppers are switching to ${shortName} (${source} bestseller).`;
}

function mapSerperItem(
  item: SerperShoppingItem,
  idx: number,
  niche: NicheId,
  categoryLabel: string
): WinningProduct | null {
  const imageUrl = (item.imageUrl || item.thumbnail || '').trim();
  const rawTitle = (item.title || '').replace(/\s+/g, ' ').trim();
  if (
    !rawTitle ||
    (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://'))
  ) {
    return null;
  }

  const retailPrice = parseNumericPrice(item);
  if (retailPrice === null || retailPrice <= 0) {
    return null;
  }

  // Estimated supplier wholesale cost (~35% of marketplace retail price)
  const supplierCost = Number(Math.max(1.5, retailPrice * 0.35).toFixed(2));
  const source = (item.source || 'Verified Retailer').trim();
  const rating =
    typeof item.rating === 'number' && item.rating > 0
      ? Number(item.rating.toFixed(1))
      : Number((4.6 + ((idx % 4) * 0.1)).toFixed(1));
  const reviews =
    typeof item.ratingCount === 'number' && item.ratingCount > 0
      ? item.ratingCount
      : typeof item.product_reviews === 'number' && item.product_reviews > 0
        ? item.product_reviews
        : 120 + idx * 47;

  const deliveryText = item.delivery?.trim() || '5–8 days tracked';
  const shortDescription = `${source} trending listing · ${rating}/5 rating (${reviews.toLocaleString()} reviews) · ${deliveryText}.`;

  return {
    id: `live-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
    sku: `XMP-LIVE-${String(idx + 1).padStart(3, '0')}`,
    niche,
    name: shortenTitle(rawTitle),
    category: source || categoryLabel,
    shortDescription,
    supplierCost,
    retailPrice,
    priceDisplay: item.price || `$${retailPrice.toFixed(2)}`,
    source,
    link: item.link || undefined,
    delivery: deliveryText,
    rating,
    reviews,
    shippingDays: deliveryText.toLowerCase().includes('free')
      ? 'Free shipping'
      : '5–8 days',
    adHook: buildAdHook(rawTitle, source),
    imageUrl,
    imagePosition: 'center center',
    isLiveApi: true,
  };
}

async function executeSerperShoppingQuery(
  query: string,
  num: number
): Promise<SerperShoppingItem[]> {
  const { serperKey } = getClientApiKeys();
  const payload = { q: query, num };
  let data: SerperShoppingResponse | null = null;

  // Attempt server proxy first (reads SERPER_API_KEY env var or forwarded header)
  try {
    const proxyHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (serperKey) {
      proxyHeaders['x-serper-key'] = serperKey;
    }

    const res = await fetch('/api/serper-shopping', {
      method: 'POST',
      headers: proxyHeaders,
      body: JSON.stringify(payload),
    });

    if (res.status !== 404) {
      const json = (await res.json()) as SerperShoppingResponse;
      if (!res.ok) {
        throw new LiveApiError(
          `We couldn’t find exact matches for "${query}"—try a broader product name.`,
          json.code,
          json.error || `Shopping upstream status ${res.status}`
        );
      }
      data = json;
    }
  } catch (err) {
    if (err instanceof LiveApiError) throw err;
  }

  // Fallback: Direct POST request from browser (for static deploys using VITE_SERPER_API_KEY or saved local key)
  if (!data) {
    if (!serperKey) {
      throw new LiveApiError(
        `We couldn’t find exact matches for "${query}"—try a broader product name or refresh in a moment.`,
        'MISSING_SERPER_KEY',
        'No active search key configured in env or browser storage.'
      );
    }

    const directRes = await fetch('https://google.serper.dev/shopping', {
      method: 'POST',
      headers: {
        'X-API-KEY': serperKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const directJson = (await directRes.json()) as SerperShoppingResponse;
    if (!directRes.ok) {
      throw new LiveApiError(
        `We couldn’t find exact matches for "${query}"—try a broader product name.`,
        directRes.status === 401 || directRes.status === 403
          ? 'INVALID_SERPER_KEY'
          : undefined,
        directJson.error || `Upstream returned ${directRes.status}`
      );
    }
    data = directJson;
  }

  return Array.isArray(data.shopping) ? data.shopping : [];
}

function filterAndRankProducts(params: {
  rawItems: SerperShoppingItem[];
  query: string;
  niche: NicheId;
  categoryLabel: string;
  requiredKeywords: string[];
  nicheKeywords: string[];
  requireKeywordMatch: boolean;
  seenTitles: Set<string>;
  seenImages: Set<string>;
  startIdx: number;
}): WinningProduct[] {
  const {
    rawItems,
    query,
    niche,
    categoryLabel,
    requiredKeywords,
    nicheKeywords,
    requireKeywordMatch,
    seenTitles,
    seenImages,
    startIdx,
  } = params;

  const scored: { product: WinningProduct; score: number }[] = [];

  for (let i = 0; i < rawItems.length; i++) {
    const mapped = mapSerperItem(
      rawItems[i],
      startIdx + i,
      niche,
      categoryLabel
    );
    if (!mapped) continue;
    if (isIrrelevantProduct(mapped.name, query)) continue;

    const titleKey = normalizeTitleKey(mapped.name);
    if (!titleKey || seenTitles.has(titleKey)) continue;
    if (seenImages.has(mapped.imageUrl)) continue;

    const coreMatches = countKeywordMatches(mapped.name, requiredKeywords);
    const nicheMatches = countKeywordMatches(mapped.name, nicheKeywords);

    if (requireKeywordMatch && requiredKeywords.length > 0 && coreMatches === 0) {
      continue;
    }

    if (!requireKeywordMatch && nicheKeywords.length > 0 && nicheMatches === 0) {
      continue;
    }

    seenTitles.add(titleKey);
    seenImages.add(mapped.imageUrl);

    const score = coreMatches * 10 + nicheMatches * 3;
    scored.push({ product: mapped, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.map((entry) => entry.product);
}

export async function fetchLiveShoppingProducts(
  searchQuery: string,
  options?: {
    num?: number;
    niche?: NicheId;
    categoryLabel?: string;
    appendTrending?: boolean;
    exactKeywordMatch?: boolean;
    fallbackQuery?: string;
    nicheQueryFallback?: string;
    nicheRelevanceKeywords?: string[];
  }
): Promise<WinningProduct[]> {
  const num = options?.num ?? 25;
  const niche = options?.niche ?? 'smarthome';
  const categoryLabel = options?.categoryLabel ?? 'Trending Product';
  const trimmed = searchQuery.trim();
  const finalQuery = options?.appendTrending
    ? `${trimmed} trending product`
    : trimmed;

  const coreKeywords = extractCoreKeywords(trimmed);
  const nicheKeywords = options?.nicheRelevanceKeywords ?? [];
  const exactKeywordMatch = options?.exactKeywordMatch ?? false;

  const seenTitles = new Set<string>();
  const seenImages = new Set<string>();
  const collected: WinningProduct[] = [];

  // Pass 1: Exact primary query (num: 25) with strict relevance & quality filtering
  const primaryRaw = await executeSerperShoppingQuery(finalQuery, num);
  collected.push(
    ...filterAndRankProducts({
      rawItems: primaryRaw,
      query: trimmed,
      niche,
      categoryLabel,
      requiredKeywords: coreKeywords,
      nicheKeywords,
      requireKeywordMatch: exactKeywordMatch,
      seenTitles,
      seenImages,
      startIdx: 0,
    })
  );

  // Pass 2: If fewer than 6 valid products, automatically run broader fallback query
  if (collected.length < 6) {
    const secondQuery =
      options?.fallbackQuery?.trim() || `${trimmed} bestseller`;
    try {
      const secondaryRaw = await executeSerperShoppingQuery(secondQuery, 25);
      collected.push(
        ...filterAndRankProducts({
          rawItems: secondaryRaw,
          query: trimmed,
          niche,
          categoryLabel,
          requiredKeywords: coreKeywords,
          nicheKeywords,
          requireKeywordMatch: exactKeywordMatch,
          seenTitles,
          seenImages,
          startIdx: collected.length + 25,
        })
      );
    } catch {
      // Keep any valid items collected from Pass 1 if Pass 2 errors
    }
  }

  // Pass 3: If still fewer than 6 valid products, broaden to parent niche or relax keyword gate while keeping image/price/irrelevant checks
  if (collected.length < 6 && options?.nicheQueryFallback) {
    try {
      const thirdRaw = await executeSerperShoppingQuery(
        options.nicheQueryFallback,
        25
      );
      collected.push(
        ...filterAndRankProducts({
          rawItems: thirdRaw,
          query: trimmed,
          niche,
          categoryLabel,
          requiredKeywords: coreKeywords,
          nicheKeywords,
          requireKeywordMatch: false,
          seenTitles,
          seenImages,
          startIdx: collected.length + 50,
        })
      );
    } catch {
      // Ignore if parent niche fallback fails
    }
  }

  // Final safety backfill from already-fetched primary raw items (valid image + valid price + non-duplicate + non-junk) so 6 products are guaranteed if >= 6 valid items exist at all
  if (collected.length < 6 && primaryRaw.length > 0) {
    collected.push(
      ...filterAndRankProducts({
        rawItems: primaryRaw,
        query: trimmed,
        niche,
        categoryLabel,
        requiredKeywords: [],
        nicheKeywords: [],
        requireKeywordMatch: false,
        seenTitles,
        seenImages,
        startIdx: collected.length + 75,
      })
    );
  }

  if (collected.length === 0) {
    throw new LiveApiError(
      `We couldn’t find exact matches for "${trimmed}"—try a broader product name.`,
      'NO_RESULTS'
    );
  }

  // Guarantee unique SKUs and return up to 12 (with >= 6 distinct items whenever available)
  return collected.slice(0, 12).map((p, idx) => ({
    ...p,
    sku: `XMP-LIVE-${String(idx + 1).padStart(3, '0')}`,
  }));
}

export async function fetchLiveHeroPhotos(
  nicheOrProduct: string,
  options?: { num?: number }
): Promise<HeroPhotoItem[]> {
  const num = options?.num ?? 15;
  const cleanQuery = nicheOrProduct.trim() || 'modern ecommerce product';
  const payload = {
    q: `${cleanQuery} lifestyle aesthetic wide banner`,
    num,
  };

  const { serperKey } = getClientApiKeys();
  let data: SerperImagesResponse | null = null;

  // Attempt Express proxy first
  try {
    const proxyHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (serperKey) {
      proxyHeaders['x-serper-key'] = serperKey;
    }

    const res = await fetch('/api/serper-images', {
      method: 'POST',
      headers: proxyHeaders,
      body: JSON.stringify(payload),
    });

    if (res.status !== 404) {
      const json = (await res.json()) as SerperImagesResponse;
      if (!res.ok) {
        throw new LiveApiError(
          `We couldn’t find matching hero photography for "${cleanQuery}"—try a broader product name.`,
          json.code,
          json.error || `Images upstream status ${res.status}`
        );
      }
      data = json;
    }
  } catch (err) {
    if (err instanceof LiveApiError) throw err;
  }

  // Fallback: Direct POST request from browser (for static deploys)
  if (!data) {
    if (!serperKey) {
      throw new LiveApiError(
        `We couldn’t load hero photography for "${cleanQuery}" right now—try a broader product name or refresh in a moment.`,
        'MISSING_SERPER_KEY',
        'No active search key configured in env or browser storage.'
      );
    }

    const directRes = await fetch('https://google.serper.dev/images', {
      method: 'POST',
      headers: {
        'X-API-KEY': serperKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const directJson = (await directRes.json()) as SerperImagesResponse;
    if (!directRes.ok) {
      throw new LiveApiError(
        `We couldn’t find matching hero photography for "${cleanQuery}"—try a broader product name.`,
        directRes.status === 401 || directRes.status === 403
          ? 'INVALID_SERPER_KEY'
          : undefined,
        directJson.error || `Images upstream returned ${directRes.status}`
      );
    }
    data = directJson;
  }

  const rawImages = Array.isArray(data.images) ? data.images : [];
  const validItems = rawImages.filter((item) => {
    const url = (item.imageUrl || '').trim();
    return url.startsWith('http://') || url.startsWith('https://');
  });

  // Prioritize wide landscape images first, followed by any remaining valid items
  const landscapeFirst = [
    ...validItems.filter(
      (i) => !i.imageWidth || !i.imageHeight || i.imageWidth >= i.imageHeight
    ),
    ...validItems.filter(
      (i) => i.imageWidth && i.imageHeight && i.imageWidth < i.imageHeight
    ),
  ];

  const mapped: HeroPhotoItem[] = landscapeFirst.map((item): HeroPhotoItem => ({
    src: (item.imageUrl || item.thumbnailUrl || '').trim(),
    fallbackSrc: item.thumbnailUrl?.trim() || undefined,
    alt: item.title?.trim() || `${cleanQuery} lifestyle banner`,
    objectPosition: 'center center',
    source: item.source?.trim() || undefined,
  }));

  if (mapped.length === 0) {
    throw new LiveApiError(
      `We couldn’t find matching lifestyle hero banners for "${cleanQuery}"—try a broader product name.`,
      'NO_IMAGE_RESULTS'
    );
  }

  return mapped;
}

export async function testLiveConnections(): Promise<{
  shoppingOk: boolean;
  shoppingMessage: string;
  imagesOk: boolean;
  imagesMessage: string;
}> {
  let shoppingOk = false;
  let shoppingMessage = '';
  let imagesOk = false;
  let imagesMessage = '';

  try {
    const items = await fetchLiveShoppingProducts('wireless charger', {
      num: 3,
      appendTrending: false,
    });
    shoppingOk = items.length > 0;
    shoppingMessage = `Connected (${items.length} shopping results returned)`;
  } catch (err) {
    shoppingOk = false;
    shoppingMessage =
      err instanceof LiveApiError
        ? err.adminMessage || err.message
        : 'Product discovery connection failed';
  }

  try {
    const photos = await fetchLiveHeroPhotos('minimalist desk setup', {
      num: 3,
    });
    imagesOk = photos.length > 0;
    imagesMessage = `Connected (${photos.length} lifestyle banners returned)`;
  } catch (err) {
    imagesOk = false;
    imagesMessage =
      err instanceof LiveApiError
        ? err.adminMessage || err.message
        : 'Hero photography connection failed';
  }

  return { shoppingOk, shoppingMessage, imagesOk, imagesMessage };
}
