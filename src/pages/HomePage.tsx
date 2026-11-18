import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Baby,
  Car,
  CheckCircle2,
  ChevronDown,
  Dumbbell,
  Edit3,
  ExternalLink,
  Home as HomeIcon,
  Link2,
  Loader2,
  PawPrint,
  Search,
  Shirt,
  Smartphone,
  Upload,
  Wand2,
  X,
} from 'lucide-react';
import {
  COLOR_THEMES,
  LAYOUT_TEMPLATES,
  NICHES,
} from '../data/products';
import { HOME_FAQS } from '../data/contentPages';
import {
  BuilderTabMode,
  ColorThemeId,
  CustomProductDraft,
  CustomSourceMode,
  GeneratedStore,
  HeroPhotoItem,
  LayoutTemplateId,
  NicheId,
  PageRoute,
  WinningProduct,
} from '../types/xampe';
import { StorePreview } from '../components/StorePreview';
import { fetchLiveHeroPhotos, fetchLiveShoppingProducts } from '../utils/liveApi';
import { fetchRealProductFromUrl } from '../utils/urlImporter';

interface HomePageProps {
  selectedNiche: NicheId | null;
  onSelectNiche: (niche: NicheId | null) => void;
  storeNameInput: string;
  onChangeStoreName: (name: string) => void;
  onNavigate: (route: PageRoute) => void;
  builderSectionRef: React.RefObject<HTMLDivElement | null>;
  hasSerperKey: boolean;
  keysRevision: number;
  shopifySuccess?: {
    shop: string;
    count: number;
    storeName: string;
  } | null;
  onDismissShopifySuccess?: () => void;
  shopifyError?: string;
  onDismissShopifyError?: () => void;
}

const BUILD_STEPS = [
  'Scanning 25 live market listings with Xampe AI...',
  'Filtering exact niche-matched products, images, and wholesale cost margins...',
  'Curating 15 landscape lifestyle hero banners tailored to your brand...',
  'Assembling your complete 6-product dropshipping store & ad hooks...',
];

const NICHE_ORDER: NicheId[] = [
  'pets',
  'smarthome',
  'fitness',
  'fashion',
  'car',
  'baby',
];

const NICHE_ICONS: Record<NicheId, React.ReactNode> = {
  fitness: <Dumbbell className="w-5 h-5" />,
  smarthome: <Smartphone className="w-5 h-5" />,
  pets: <PawPrint className="w-5 h-5" />,
  fashion: <Shirt className="w-5 h-5" />,
  home: <HomeIcon className="w-5 h-5" />,
  car: <Car className="w-5 h-5" />,
  baby: <Baby className="w-5 h-5" />,
};

const QUICK_SEARCH_QUERIES = [
  'posture corrector',
  'portable blender',
  'LED dog collar',
  'sunrise alarm clock',
];

const SAMPLE_URLS = [
  {
    label: 'AliExpress Massage Gun',
    url: 'https://www.aliexpress.com/item/portable-percussion-deep-tissue-massage-gun-pro.html',
  },
  {
    label: 'Amazon Monitor Light Bar',
    url: 'https://www.amazon.com/dp/B09LMX4K21/asymmetric-led-monitor-light-bar-wireless-dimmer',
  },
  {
    label: 'Shopify Orthopedic Dog Bed',
    url: 'https://hearthhound.myshopify.com/products/cloudweave-orthopedic-linen-dog-bed',
  },
  {
    label: 'CJdropshipping Generic ID',
    url: 'https://app.cjdropshipping.com/product-detail.html?id=100500684219',
  },
];

function pickDifferent<T>(items: T[], exclude?: T): T {
  const pool = exclude && items.length > 1 ? items.filter((i) => i !== exclude) : items;
  return pool[Math.floor(Math.random() * pool.length)];
}

function shuffleItems<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function inferNicheFromQuery(query: string, fallback: NicheId): NicheId {
  const q = query.toLowerCase();
  if (/baby|infant|toddler|nursery|stroller|diaper|crib|pacifier/.test(q)) return 'baby';
  if (/dog|cat|pet|collar|leash|bowl|paw/.test(q)) return 'pets';
  if (/car|tire|dash|auto|vacuum|trunk|seat/.test(q)) return 'car';
  if (/posture|massage|gym|fitness|yoga|band|rope|workout/.test(q)) return 'fitness';
  if (/jade|skincare|beauty|bag|sunglass|makeup|hair|watch|facial|vanity/.test(q)) return 'fashion';
  if (/blender|kitchen|plant|diffuser|lamp|home|coffee|mug/.test(q)) return 'home';
  if (/charger|light|desk|monitor|usb|smart|speaker|clock|projector/.test(q)) return 'smarthome';
  return fallback;
}

export const HomePage: React.FC<HomePageProps> = ({
  selectedNiche,
  onSelectNiche,
  storeNameInput,
  onChangeStoreName,
  onNavigate,
  builderSectionRef,
  hasSerperKey,
  keysRevision,
  shopifySuccess,
  onDismissShopifySuccess,
  shopifyError,
  onDismissShopifyError,
}) => {
  const [builderTab, setBuilderTab] = useState<BuilderTabMode>('niche');
  const [customSourceMode, setCustomSourceMode] = useState<CustomSourceMode>('link');

  // Real-Time Marketplace Search State
  const [liveSearchInput, setLiveSearchInput] = useState('');
  const [liveProductsPool, setLiveProductsPool] = useState<WinningProduct[]>([]);
  const [liveHeroPool, setLiveHeroPool] = useState<HeroPhotoItem[]>([]);
  const [liveBatchQuery, setLiveBatchQuery] = useState('');
  const [isFetchingLive, setIsFetchingLive] = useState(false);
  const [liveFetchError, setLiveFetchError] = useState('');

  // URL Extraction State
  const [isExtractingUrl, setIsExtractingUrl] = useState(false);
  const [hasExtractedUrl, setHasExtractedUrl] = useState(false);
  const [urlError, setUrlError] = useState('');

  const [customDraft, setCustomDraft] = useState<CustomProductDraft>({
    sourceMode: 'link',
    sourceUrl: '',
    sourcePlatform: '',
    productLink: '',
    title: '',
    niche: 'smarthome',
    category: 'Trending Product',
    imageUrl: '',
    sellingPrice: 49.99,
    supplierCost: 17.5,
    benefits: [
      'High-demand trending specification engineered for everyday reliability',
      'Tracked fulfillment with 30-day customer satisfaction guarantee',
      'Clean packaging ready for cold-traffic TikTok & Meta video hooks',
    ],
    shortDescription: '',
    adHook: '',
    isLiveImported: false,
  });

  const [isBuilding, setIsBuilding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [buildError, setBuildError] = useState('');
  const [generatedStore, setGeneratedStore] = useState<GeneratedStore | null>(null);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  const previewRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const nameCounterRef = useRef(0);
  const customDraftRef = useRef<CustomProductDraft>(customDraft);
  customDraftRef.current = customDraft;

  const livePoolRef = useRef<{
    query: string;
    products: WinningProduct[];
    heroPhotos: HeroPhotoItem[];
  }>({
    query: liveBatchQuery,
    products: liveProductsPool,
    heroPhotos: liveHeroPool,
  });
  livePoolRef.current = {
    query: liveBatchQuery,
    products: liveProductsPool,
    heroPhotos: liveHeroPool,
  };

  // Fetch live market products (num: 25, exact matching, guaranteed 6) + hero banners
  const runLiveBatchFetch = async (
    serperQuery: string,
    heroQuery: string,
    niche: NicheId,
    isUserSearch = false
  ): Promise<{ products: WinningProduct[]; heroPhotos: HeroPhotoItem[] } | null> => {
    setIsFetchingLive(true);
    setLiveFetchError('');

    try {
      const [products, heroPhotos] = await Promise.all([
        fetchLiveShoppingProducts(serperQuery, {
          num: 25,
          niche,
          categoryLabel: NICHES[niche].shortLabel,
          appendTrending: false,
          exactKeywordMatch: isUserSearch,
          fallbackQuery: isUserSearch
            ? `${serperQuery} bestseller`
            : NICHES[niche].fallbackQuery,
          nicheQueryFallback: NICHES[niche].searchQuery,
          nicheRelevanceKeywords: isUserSearch
            ? undefined
            : NICHES[niche].relevanceKeywords,
        }),
        fetchLiveHeroPhotos(heroQuery, {
          num: 15,
        }),
      ]);

      setLiveProductsPool(products);
      setLiveHeroPool(heroPhotos);
      setLiveBatchQuery(serperQuery);
      livePoolRef.current = {
        query: serperQuery,
        products,
        heroPhotos,
      };
      return { products, heroPhotos };
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'We couldn’t find exact matches for that keyword—try a broader product name.';
      setLiveFetchError(msg);
      return null;
    } finally {
      setIsFetchingLive(false);
    }
  };

  // Re-fetch when private owner settings are saved only if a query or niche is actively chosen
  useEffect(() => {
    if (keysRevision === 0) return;
    setLiveFetchError('');
    setUrlError('');
    setBuildError('');
    const trimmedSearch = liveSearchInput.trim();
    if (hasSerperKey && builderTab === 'niche' && (trimmedSearch || selectedNiche)) {
      const targetNiche = selectedNiche ?? 'pets';
      const q = trimmedSearch || NICHES[targetNiche].searchQuery;
      const hq = trimmedSearch || NICHES[targetNiche].heroQuery;
      runLiveBatchFetch(q, hq, targetNiche, Boolean(trimmedSearch));
    }
  }, [keysRevision]);

  const handleSelectNicheCard = (id: NicheId) => {
    onSelectNiche(id);
    setLiveSearchInput('');
    setBuildError('');
    if (hasSerperKey) {
      runLiveBatchFetch(NICHES[id].searchQuery, NICHES[id].heroQuery, id, false);
    } else {
      setLiveFetchError('');
    }
  };

  const handleRunLiveSearch = (overrideQuery?: string) => {
    const q = (overrideQuery ?? liveSearchInput).trim();
    if (!q) return;
    if (overrideQuery !== undefined) {
      setLiveSearchInput(overrideQuery);
    }
    const inferred = inferNicheFromQuery(q, selectedNiche ?? 'smarthome');
    onSelectNiche(inferred);
    setBuildError('');
    runLiveBatchFetch(q, q, inferred, true);
  };

  const handleSwitchTab = (tab: BuilderTabMode) => {
    setBuilderTab(tab);
    setBuildError('');
    if (tab === 'custom') {
      setCustomSourceMode('link');
      setCustomDraft((prev) => ({ ...prev, sourceMode: 'link' }));
    }
  };

  const handleSwitchCustomSource = (mode: CustomSourceMode) => {
    setCustomSourceMode(mode);
    setCustomDraft((prev) => ({ ...prev, sourceMode: mode }));
  };

  const handleFetchUrlDetails = async (overrideUrl?: string) => {
    const targetUrl = (overrideUrl ?? customDraft.sourceUrl).trim();
    if (!targetUrl) {
      setUrlError(
        'Paste an AliExpress, Amazon, CJdropshipping, or Shopify product link first.'
      );
      return;
    }
    setUrlError('');
    if (overrideUrl) {
      setCustomDraft((prev) => ({ ...prev, sourceUrl: overrideUrl }));
    }
    setIsExtractingUrl(true);

    try {
      const parsed = await fetchRealProductFromUrl(targetUrl);
      const nextDraft: CustomProductDraft = {
        ...customDraftRef.current,
        sourceMode: 'link',
        sourceUrl: targetUrl,
        sourcePlatform: parsed.sourcePlatform,
        productLink: parsed.productLink,
        title: parsed.title,
        niche: parsed.niche,
        category: parsed.category,
        imageUrl: parsed.imageUrl,
        sellingPrice: parsed.sellingPrice,
        supplierCost: parsed.supplierCost,
        rating: parsed.rating,
        reviews: parsed.reviews,
        benefits: parsed.benefits,
        shortDescription: parsed.shortDescription,
        adHook: parsed.adHook,
        isLiveImported: true,
      };
      customDraftRef.current = nextDraft;
      setCustomDraft(nextDraft);
      onSelectNiche(parsed.niche);
      setHasExtractedUrl(true);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'We couldn’t find an exact match for that product link—try another link or enter the product title manually.';
      setUrlError(msg);
    } finally {
      setIsExtractingUrl(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCustomDraft((prev) => ({
          ...prev,
          imageUrl: reader.result as string,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const assembleStoreFromLivePool = (params: {
    niche: NicheId;
    searchQuery: string;
    customName: string;
    liveProducts: WinningProduct[];
    heroPhotos: HeroPhotoItem[];
    previous?: GeneratedStore | null;
    useCustomHero: boolean;
  }): GeneratedStore => {
    const {
      niche,
      searchQuery,
      customName,
      liveProducts,
      heroPhotos,
      previous,
      useCustomHero,
    } = params;
    const activeDraft = customDraftRef.current;
    const nicheInfo = NICHES[niche];
    const layoutIds = LAYOUT_TEMPLATES.map((t) => t.id);
    const themeIds = COLOR_THEMES.map((c) => c.id);

    const nextLayout =
      useCustomHero && !previous
        ? 'editorial'
        : pickDifferent(layoutIds, previous?.layout);
    const nextColor = previous
      ? pickDifferent(themeIds, previous.colorTheme)
      : 'orange';

    const heroCount = Math.max(1, heroPhotos.length);
    const nextHeroIndex =
      previous && heroCount > 1
        ? (previous.heroImageIndex + 1 + Math.floor(Math.random() * (heroCount - 1))) %
          heroCount
        : 0;

    let products: WinningProduct[] = [];
    let featuredCustomProduct: WinningProduct | null = null;
    let heroTagline = searchQuery
      ? `${searchQuery.replace(/\b\w/g, (c) => c.toUpperCase())} — Curated Everyday Essentials`
      : pickDifferent(nicheInfo.heroTaglines, previous?.heroTagline);
    let heroSubheadline = pickDifferent(
      nicheInfo.heroSubheadlines,
      previous?.heroSubheadline
    );

    if (useCustomHero) {
      const cleanTitle = activeDraft.title.trim() || 'Featured Hero Essential';
      const customHero: WinningProduct = {
        id: 'custom-hero-1',
        sku: 'XMP-HERO-001',
        niche: activeDraft.niche,
        name: cleanTitle,
        category: activeDraft.sourcePlatform || activeDraft.category || nicheInfo.shortLabel,
        source: activeDraft.sourcePlatform || 'Featured Hero',
        link: activeDraft.productLink || activeDraft.sourceUrl || undefined,
        shortDescription:
          activeDraft.benefits[0] ||
          activeDraft.shortDescription ||
          'High-converting flagship item sourced with live market pricing.',
        supplierCost: Math.max(1, Number(activeDraft.supplierCost) || 15),
        retailPrice: Math.max(5, Number(activeDraft.sellingPrice) || 49),
        rating: activeDraft.rating || 4.9,
        reviews: activeDraft.reviews || 418,
        shippingDays: '5–8 days',
        adHook:
          activeDraft.adHook ||
          `Stop settling for generic alternatives—meet ${cleanTitle}.`,
        imageUrl: activeDraft.imageUrl,
        imagePosition: 'center center',
        benefits: activeDraft.benefits.filter((b) => b.trim().length > 0),
        isCustomImported: true,
        isLiveApi: true,
        sourceUrl: activeDraft.sourceUrl || undefined,
      };

      featuredCustomProduct = customHero;
      const complementary = shuffleItems(
        liveProducts.filter((p) => p.imageUrl !== customHero.imageUrl)
      ).slice(0, 5);
      products = [customHero, ...complementary];
      heroTagline = `${cleanTitle} — Built for Modern Routines`;
      heroSubheadline = activeDraft.benefits[0] || heroSubheadline;
    } else if (!previous) {
      products = liveProducts.slice(0, 6);
    } else {
      const prevIds = new Set(previous.products.map((p) => p.id));
      const freshSlice = liveProducts.filter((p) => !prevIds.has(p.id));
      const pool =
        freshSlice.length >= 6 ? shuffleItems(freshSlice) : shuffleItems(liveProducts);
      products = pool.slice(0, 6);
    }

    const resolvedName =
      customName.trim() ||
      pickDifferent(nicheInfo.suggestedNames, previous?.storeName);

    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      storeName: resolvedName,
      niche,
      searchQuery,
      layout: nextLayout,
      colorTheme: nextColor,
      heroImageIndex: nextHeroIndex,
      heroImages: heroPhotos,
      heroTagline,
      heroSubheadline,
      products,
      liveProductPool: liveProducts,
      featuredCustomProduct,
      generatedAt: new Date().toISOString(),
    };
  };

  const handleAutoGenerateName = () => {
    const targetNiche =
      builderTab === 'custom' ? customDraft.niche : (selectedNiche ?? 'pets');
    const pool = NICHES[targetNiche].suggestedNames;
    nameCounterRef.current = (nameCounterRef.current + 1) % pool.length;
    const candidate = pool[nameCounterRef.current];
    onChangeStoreName(
      candidate === storeNameInput
        ? pool[(nameCounterRef.current + 1) % pool.length]
        : candidate
    );
  };

  const startGeneration = async () => {
    setBuildError('');

    const isCustomMode = builderTab === 'custom';

    // Do not waste product search calls if user hasn't picked a niche or entered a product
    if (!isCustomMode && !selectedNiche && !liveSearchInput.trim()) {
      setBuildError('Select a niche or enter a product above to begin.');
      return;
    }

    // Validate custom mode inputs before starting
    if (isCustomMode && customSourceMode === 'link' && !customDraft.sourceUrl.trim() && !customDraft.title.trim()) {
      setUrlError('Paste a product link or switch to Manual Details before building your store.');
      return;
    }

    if (isCustomMode && customSourceMode !== 'link' && !customDraft.title.trim()) {
      setBuildError('Enter a Product Title for your custom hero item before building your store.');
      return;
    }

    setIsBuilding(true);
    setProgress(5);

    const startTime = Date.now();
    const minDurationMs = 3800;

    // Smoothly advance visual progress up to 92% while awaiting real API calls
    const progressTimer = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(92, Math.round((elapsed / minDurationMs) * 92));
      setProgress((prev) => (pct > prev ? pct : prev));
    }, 60);

    try {
      let activeDraft = customDraftRef.current;

      // Auto-fetch URL if user pasted URL and skipped clicking "Fetch Product Details"
      if (
        isCustomMode &&
        customSourceMode === 'link' &&
        activeDraft.sourceUrl.trim() &&
        !hasExtractedUrl
      ) {
        const parsed = await fetchRealProductFromUrl(activeDraft.sourceUrl);
        activeDraft = {
          ...activeDraft,
          sourceMode: 'link',
          sourcePlatform: parsed.sourcePlatform,
          productLink: parsed.productLink,
          title: parsed.title,
          niche: parsed.niche,
          category: parsed.category,
          imageUrl: parsed.imageUrl,
          sellingPrice: parsed.sellingPrice,
          supplierCost: parsed.supplierCost,
          rating: parsed.rating,
          reviews: parsed.reviews,
          benefits: parsed.benefits,
          shortDescription: parsed.shortDescription,
          adHook: parsed.adHook,
          isLiveImported: true,
        };
        customDraftRef.current = activeDraft;
        setCustomDraft(activeDraft);
        setHasExtractedUrl(true);
      }

      const customQueryText = liveSearchInput.trim();
      const targetNiche = isCustomMode
        ? activeDraft.niche
        : (selectedNiche ?? inferNicheFromQuery(customQueryText, 'smarthome'));
      const isUserSearch = Boolean(!isCustomMode && customQueryText);
      const serperQuery = isCustomMode
        ? NICHES[targetNiche].searchQuery
        : customQueryText || NICHES[targetNiche].searchQuery;
      const heroBannerQuery = isCustomMode
        ? activeDraft.title || NICHES[targetNiche].heroQuery
        : customQueryText || NICHES[targetNiche].heroQuery;

      let products: WinningProduct[] = [];
      let heroPhotos: HeroPhotoItem[] = [];

      // Reuse already-fetched live batch if query matches & already has 6+ valid products, otherwise fetch fresh
      if (
        !isCustomMode &&
        livePoolRef.current.query === serperQuery &&
        livePoolRef.current.products.length >= 6 &&
        livePoolRef.current.heroPhotos.length > 0
      ) {
        products = livePoolRef.current.products;
        heroPhotos = livePoolRef.current.heroPhotos;
      } else {
        const [fetchedProducts, fetchedPhotos] = await Promise.all([
          fetchLiveShoppingProducts(serperQuery, {
            num: 25,
            niche: targetNiche,
            categoryLabel: NICHES[targetNiche].shortLabel,
            appendTrending: false,
            exactKeywordMatch: isUserSearch,
            fallbackQuery: isUserSearch
              ? `${serperQuery} bestseller`
              : NICHES[targetNiche].fallbackQuery,
            nicheQueryFallback: NICHES[targetNiche].searchQuery,
            nicheRelevanceKeywords: isUserSearch
              ? undefined
              : NICHES[targetNiche].relevanceKeywords,
          }),
          fetchLiveHeroPhotos(heroBannerQuery, { num: 15 }),
        ]);
        products = fetchedProducts;
        heroPhotos = fetchedPhotos;
        setLiveProductsPool(products);
        setLiveHeroPool(heroPhotos);
        setLiveBatchQuery(serperQuery);
      }

      // If custom mode had no hero photo selected yet (e.g. Manual entry without upload), use top matching Serper photo
      if (isCustomMode && !activeDraft.imageUrl && products[0]) {
        activeDraft = { ...activeDraft, imageUrl: products[0].imageUrl };
        customDraftRef.current = activeDraft;
        setCustomDraft(activeDraft);
      }

      const remainingWait = Math.max(0, minDurationMs - (Date.now() - startTime));
      if (remainingWait > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, remainingWait));
      }

      window.clearInterval(progressTimer);
      setProgress(100);

      const freshStore = assembleStoreFromLivePool({
        niche: targetNiche,
        searchQuery: isCustomMode
          ? activeDraft.title
          : customQueryText || NICHES[targetNiche].label,
        customName: storeNameInput,
        liveProducts: products,
        heroPhotos,
        previous: generatedStore,
        useCustomHero: isCustomMode,
      });

      setGeneratedStore(freshStore);
      setIsBuilding(false);
      window.setTimeout(() => {
        previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    } catch (err) {
      window.clearInterval(progressTimer);
      setIsBuilding(false);
      setProgress(0);
      const msg =
        err instanceof Error
          ? err.message
          : 'We couldn’t find exact matches for that keyword—try a broader product name or pick one of our curated niches.';
      setBuildError(msg);
    }
  };

  const currentStepIndex = Math.min(
    BUILD_STEPS.length - 1,
    Math.floor((progress / 100) * BUILD_STEPS.length)
  );

  const handleRegenerateStore = async () => {
    if (!generatedStore) return;
    const pool = generatedStore.liveProductPool || liveProductsPool;
    const heroPhotos =
      generatedStore.heroImages && generatedStore.heroImages.length > 0
        ? generatedStore.heroImages
        : liveHeroPool;

    if (pool.length === 0 || heroPhotos.length === 0) return;

    const fresh = assembleStoreFromLivePool({
      niche: generatedStore.niche,
      searchQuery: generatedStore.searchQuery,
      customName: storeNameInput,
      liveProducts: pool,
      heroPhotos,
      previous: generatedStore,
      useCustomHero: Boolean(generatedStore.featuredCustomProduct),
    });
    setGeneratedStore(fresh);
  };

  const handleUpdateLayout = (layout: LayoutTemplateId) => {
    setGeneratedStore((prev) => (prev ? { ...prev, layout } : prev));
  };

  const handleUpdateColorTheme = (colorTheme: ColorThemeId) => {
    setGeneratedStore((prev) => (prev ? { ...prev, colorTheme } : prev));
  };

  const handleShuffleHeroImage = () => {
    setGeneratedStore((prev) => {
      if (!prev) return prev;
      const count =
        prev.heroImages && prev.heroImages.length > 0
          ? prev.heroImages.length
          : NICHES[prev.niche].heroImages.length;
      return {
        ...prev,
        heroImageIndex: (prev.heroImageIndex + 1) % count,
      };
    });
  };

  const customMarginPct =
    customDraft.sellingPrice > 0
      ? Math.round(
          ((customDraft.sellingPrice - customDraft.supplierCost) /
            customDraft.sellingPrice) *
            100
        )
      : 0;

  return (
    <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6">
      {/* SHOPIFY 1-CLICK UPLOAD CELEBRATION BANNER */}
      {shopifySuccess && shopifySuccess.shop && (
        <div className="mt-6 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#059669] text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-[#065F46]">
                {shopifySuccess.storeName} is Live on Shopify ({shopifySuccess.count} Winning Products Uploaded)
              </h2>
              <p className="text-xs text-[#047857] mt-1">
                All curated titles, descriptions, high-resolution product images, and retail pricing have been synced directly to <strong>{shopifySuccess.shop}</strong>.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href={`https://${shopifySuccess.shop}/admin/products`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 text-xs font-semibold text-white bg-[#059669] hover:bg-[#047857] rounded-lg inline-flex items-center gap-1.5 transition-colors"
            >
              <span>Open My Live Shopify Store</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            {onDismissShopifySuccess && (
              <button
                type="button"
                onClick={onDismissShopifySuccess}
                className="p-2 text-[#065F46] hover:bg-[#D1FAE5] rounded-lg cursor-pointer"
                aria-label="Dismiss Shopify success banner"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {shopifyError && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs font-medium text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{shopifyError}</span>
          </div>
          {onDismissShopifyError && (
            <button
              type="button"
              onClick={onDismissShopifyError}
              className="p-1.5 text-red-600 hover:bg-red-100 rounded cursor-pointer"
              aria-label="Dismiss Shopify notice"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* HERO & LIVE DROPSHIPPING STORE BUILDER */}
      <section ref={builderSectionRef} className="pt-8 sm:pt-14 pb-10 sm:pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF7ED] border border-[#FED7AA] text-[11px] sm:text-xs font-semibold text-[#9A3412] mb-5 sm:mb-6">
            <span>No Sign-Up Required</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-[46px] leading-[1.15] lg:leading-[1.12] font-extrabold tracking-tight text-[#111827] text-balance mb-4 sm:mb-5">
            Create a Ready-to-Launch Shopify Dropshipping Store in 60 Seconds
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 leading-relaxed max-w-3xl mx-auto mb-8 sm:mb-10">
            Search any winning product, pick a profitable niche, or paste a marketplace URL. Xampe AI pulls 6 niche-matched dropshipping products, live pricing, and lifestyle hero banners — with no sign-up required.
          </p>
        </div>

        {/* Main Builder Container */}
        <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-4 sm:p-8">
          {/* 2-Tab Mode Switcher: Winning Niche vs Upload Your Own Product */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-5 sm:pb-6 mb-5 sm:mb-6 border-b border-[#E5E7EB]">
            <div className="inline-flex flex-wrap sm:flex-nowrap items-center p-1 bg-white border border-[#E5E7EB] rounded-lg gap-1 self-start">
              <button
                type="button"
                onClick={() => handleSwitchTab('niche')}
                className={`px-3.5 sm:px-4 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  builderTab === 'niche'
                    ? 'bg-[#EA580C] text-white'
                    : 'text-neutral-700 hover:text-[#111827]'
                }`}
              >
                Choose a Winning Niche
              </button>
              <button
                type="button"
                onClick={() => handleSwitchTab('custom')}
                className={`px-3.5 sm:px-4 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  builderTab === 'custom'
                    ? 'bg-[#EA580C] text-white'
                    : 'text-neutral-700 hover:text-[#111827]'
                }`}
              >
                Upload Your Own Product
              </button>
            </div>

            <span className="text-xs font-medium text-neutral-500 tabular-nums">
              {builderTab === 'niche'
                ? 'Live Winning Product Catalog'
                : 'Xampe AI + 5 Complementary Winners'}
            </span>
          </div>

          {builderTab === 'niche' ? (
            <>
              {/* Real-Time Product Search Bar */}
              <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 mb-5">
                <label
                  htmlFor="live-product-search"
                  className="block text-xs font-semibold text-neutral-700 mb-2"
                >
                  Search Any Winning Product
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                    <input
                      id="live-product-search"
                      type="text"
                      value={liveSearchInput}
                      onChange={(e) => setLiveSearchInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleRunLiveSearch();
                        }
                      }}
                      placeholder='Search any product (e.g., "posture corrector", "portable blender", "LED dog collar")...'
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg text-[#111827] placeholder:text-neutral-400 focus:outline-none focus:border-[#EA580C]"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={isFetchingLive || !liveSearchInput.trim()}
                    onClick={() => handleRunLiveSearch()}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center justify-center gap-2"
                  >
                    {isFetchingLive && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Find Winning Products</span>
                  </button>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                  <span>Try winning query:</span>
                  {QUICK_SEARCH_QUERIES.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleRunLiveSearch(q)}
                      className="px-2.5 py-1 rounded bg-[#FAFAFA] border border-[#E5E7EB] hover:border-[#EA580C] text-neutral-700 hover:text-[#EA580C] font-medium cursor-pointer transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* RESPONSIVE 3-COLUMN NICHE SELECTOR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                {NICHE_ORDER.map((id) => {
                  const info = NICHES[id];
                  const isSelected = selectedNiche === id && !liveSearchInput.trim();

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleSelectNicheCard(id)}
                      className={`text-left p-5 rounded-lg border transition-colors cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-white border-[#EA580C] ring-1 ring-[#EA580C]'
                          : 'bg-white border-[#E5E7EB] hover:border-neutral-400'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className={`w-9 h-9 rounded-md flex items-center justify-center border ${
                              isSelected
                                ? 'bg-[#EA580C] text-white border-[#EA580C]'
                                : 'bg-[#FAFAFA] text-neutral-700 border-[#E5E7EB]'
                            }`}
                          >
                            {NICHE_ICONS[id]}
                          </div>
                          <span className="text-xs font-semibold text-[#EA580C] tabular-nums">
                            Avg. {info.avgMargin} margin
                          </span>
                        </div>
                        <h3 className="font-display text-base font-bold text-[#111827] mb-1.5">
                          {info.label}
                        </h3>
                        <p className="text-xs text-neutral-600 leading-relaxed">
                          {info.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500 tabular-nums">
                        <span>Avg. AOV {info.avgAov}</span>
                        <span className={isSelected ? 'font-semibold text-[#EA580C]' : ''}>
                          {isSelected ? 'Selected · Click to Refresh' : 'Select Niche'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Live Marketplace Preview Bar */}
              {isFetchingLive && (
                <div className="mb-5 bg-[#FFF7ED] border border-[#FED7AA] rounded-lg px-4 py-3 flex items-center gap-3 text-xs font-semibold text-[#9A3412]">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0 text-[#EA580C]" />
                  <span>
                    Scanning 25 marketplace listings for 6 exact niche-matched products &amp; 15 lifestyle hero banners...
                  </span>
                </div>
              )}

              {liveFetchError && !isFetchingLive && (
                <div className="mb-5 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-2.5 text-xs font-medium text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{liveFetchError}</span>
                </div>
              )}

              {!isFetchingLive && !liveFetchError && liveProductsPool.length > 0 && (
                <div className="mb-5 bg-white border border-[#E5E7EB] rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#059669]">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>
                        Xampe AI Ready: {liveProductsPool.length} verified winning products &amp;{' '}
                        {liveHeroPool.length} lifestyle hero banners for &ldquo;{liveBatchQuery}&rdquo;
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-500">
                      Previewing top 6 live items
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {liveProductsPool.slice(0, 6).map((item) => (
                      <div
                        key={item.id}
                        className="border border-[#E5E7EB] rounded-md p-2 bg-[#FAFAFA]"
                      >
                        <div className="aspect-square bg-white rounded border border-neutral-100 overflow-hidden mb-1.5 flex items-center justify-center p-1">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <p className="text-[11px] font-semibold text-[#111827] truncate">
                          {item.name}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-neutral-500 mt-0.5 tabular-nums">
                          <span className="truncate max-w-[70px]">{item.source}</span>
                          <span className="font-bold text-[#111827]">
                            ${item.retailPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* TAB 2: CUSTOM PRODUCT WITH 3-WAY SOURCE TOGGLE */
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 sm:p-6 mb-6">
              {/* 3-Way Source Toggle */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 pb-4 border-b border-neutral-100">
                <div>
                  <h2 className="font-display text-base font-bold text-[#111827]">
                    Import or Define Your Featured Hero Product
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Xampe AI analyzes your product and builds your dropshipping store alongside 5 complementary winners.
                  </p>
                </div>

                <div className="flex flex-wrap sm:inline-flex items-center p-1 bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg gap-1 self-start">
                  <button
                    type="button"
                    onClick={() => handleSwitchCustomSource('link')}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                      customSourceMode === 'link'
                        ? 'bg-[#EA580C] text-white'
                        : 'text-neutral-700 hover:text-[#111827]'
                    }`}
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    Paste Product Link
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchCustomSource('photo')}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                      customSourceMode === 'photo'
                        ? 'bg-[#EA580C] text-white'
                        : 'text-neutral-700 hover:text-[#111827]'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchCustomSource('manual')}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                      customSourceMode === 'manual'
                        ? 'bg-[#EA580C] text-white'
                        : 'text-neutral-700 hover:text-[#111827]'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Enter Details Manually
                  </button>
                </div>
              </div>

              {/* OPTION 1: SMART PRODUCT LINK IMPORTER */}
              {customSourceMode === 'link' && (
                <div className="mb-6 pb-6 border-b border-[#E5E7EB]">
                  <label
                    htmlFor="product-url-input"
                    className="block text-xs font-semibold text-neutral-700 mb-2"
                  >
                    Direct Supplier or Competitor Product URL
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1">
                      <Link2 className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                      <input
                        id="product-url-input"
                        type="url"
                        value={customDraft.sourceUrl}
                        onChange={(e) => {
                          setUrlError('');
                          setHasExtractedUrl(false);
                          setCustomDraft((prev) => ({
                            ...prev,
                            sourceUrl: e.target.value,
                          }));
                        }}
                        placeholder="Paste AliExpress, Amazon, CJdropshipping, or competitor product link..."
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg text-[#111827] placeholder:text-neutral-400 focus:outline-none focus:border-[#EA580C]"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={isExtractingUrl}
                      onClick={() => handleFetchUrlDetails()}
                      className="px-5 py-2.5 text-sm font-semibold text-white bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center justify-center gap-2"
                    >
                      {isExtractingUrl && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>
                        {isExtractingUrl ? 'Fetching...' : 'Fetch Product Details'}
                      </span>
                    </button>
                  </div>

                  {/* Helper note directly beneath URL input */}
                  <p className="mt-2 text-xs text-neutral-500 leading-relaxed">
                    <span className="font-semibold text-neutral-700">Tip:</span> Paste the full product page URL from your browser address bar (e.g., https://amazon.com/... or https://store.com/...) rather than shortened mobile app share links for instant, exact product matching.
                  </p>

                  {/* Quick sample links + Extraction feedback */}
                  <div className="mt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap items-center gap-2 text-neutral-500">
                      <span>Try sample URL:</span>
                      {SAMPLE_URLS.map((s, idx) => (
                        <React.Fragment key={s.label}>
                          {idx > 0 && <span aria-hidden="true">·</span>}
                          <button
                            type="button"
                            onClick={() => handleFetchUrlDetails(s.url)}
                            className="text-[#EA580C] hover:underline font-medium cursor-pointer"
                          >
                            {s.label}
                          </button>
                        </React.Fragment>
                      ))}
                    </div>
                    {hasExtractedUrl && !isExtractingUrl && (
                      <span className="text-[#059669] font-semibold inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified Market Match ({customDraft.sourcePlatform})
                      </span>
                    )}
                  </div>

                  {urlError && (
                    <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span className="text-xs font-medium text-red-700">{urlError}</span>
                    </div>
                  )}

                  {isExtractingUrl && (
                    <div className="mt-4 bg-[#FFF7ED] border border-[#FED7AA] rounded-lg px-4 py-3 flex items-center gap-3 text-xs font-semibold text-[#9A3412]">
                      <Loader2 className="w-4 h-4 animate-spin shrink-0 text-[#EA580C]" />
                      <span>
                        Analyzing product link with Xampe AI...
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* OPTION 2: UPLOAD PHOTO ZONE */}
              {customSourceMode === 'photo' && (
                <div className="mb-6 pb-6 border-b border-[#E5E7EB]">
                  <label className="block text-xs font-semibold text-neutral-700 mb-2">
                    Upload Your Own Product Photo (PNG, JPG, WebP)
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-dashed border-[#FED7AA] bg-[#FFF7ED]/70 hover:bg-[#FFF7ED] rounded-lg p-6 text-center cursor-pointer transition-colors"
                  >
                    <Upload className="w-6 h-6 text-[#EA580C] mx-auto mb-2" />
                    <p className="text-sm font-semibold text-[#111827]">
                      Click to choose a product photo from your computer
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Or paste a link in &ldquo;Paste Product Link&rdquo; to pull a real marketplace product image automatically
                    </p>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              {/* REVIEW & EDIT PRODUCT DETAILS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-700">
                      Hero Product Photo
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-semibold text-[#EA580C] hover:underline cursor-pointer"
                    >
                      Upload Custom Photo
                    </button>
                  </div>

                  <div className="rounded-lg overflow-hidden border border-[#E5E7EB] aspect-[4/3] bg-white flex items-center justify-center p-2">
                    {customDraft.imageUrl ? (
                      <img
                        src={customDraft.imageUrl}
                        alt={customDraft.title || 'Custom hero product'}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-center px-4">
                        <p className="text-xs font-medium text-neutral-500">
                          Paste a product URL above &amp; click &ldquo;Fetch Product Details&rdquo; or upload a photo
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-8 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    <div className="sm:col-span-7">
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        {customSourceMode === 'link'
                          ? 'Extracted Product Title'
                          : 'Product Title'}
                      </label>
                      <input
                        type="text"
                        value={customDraft.title}
                        onChange={(e) =>
                          setCustomDraft((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        placeholder="e.g. Cordless Portable Mini Blender"
                        className="w-full px-3.5 py-2 text-sm bg-white border border-[#D1D5DB] rounded-lg focus:outline-none focus:border-[#EA580C]"
                      />
                    </div>

                    <div className="sm:col-span-5">
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Complementary Store Niche
                      </label>
                      <select
                        value={customDraft.niche}
                        onChange={(e) => {
                          const nextNiche = e.target.value as NicheId;
                          setCustomDraft((prev) => ({ ...prev, niche: nextNiche }));
                          onSelectNiche(nextNiche);
                        }}
                        className="w-full px-3 py-2 text-sm bg-white border border-[#D1D5DB] rounded-lg focus:outline-none focus:border-[#EA580C]"
                      >
                        {[...NICHE_ORDER, 'home' as NicheId].map((id) => (
                          <option key={id} value={id}>
                            {NICHES[id].label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Selling Price ($)
                      </label>
                      <input
                        type="number"
                        min={5}
                        step={0.01}
                        value={customDraft.sellingPrice}
                        onChange={(e) =>
                          setCustomDraft((prev) => ({
                            ...prev,
                            sellingPrice: Math.max(1, Number(e.target.value)),
                          }))
                        }
                        className="w-full px-3.5 py-2 text-sm bg-white border border-[#D1D5DB] rounded-lg font-mono-tabular focus:outline-none focus:border-[#EA580C]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Est. Wholesale Cost (~35%)
                      </label>
                      <input
                        type="number"
                        min={1}
                        step={0.01}
                        value={customDraft.supplierCost}
                        onChange={(e) =>
                          setCustomDraft((prev) => ({
                            ...prev,
                            supplierCost: Math.max(1, Number(e.target.value)),
                          }))
                        }
                        className="w-full px-3.5 py-2 text-sm bg-white border border-[#D1D5DB] rounded-lg font-mono-tabular focus:outline-none focus:border-[#EA580C]"
                      />
                    </div>
                    <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg px-3.5 py-2 flex flex-col justify-center tabular-nums">
                      <span className="text-[11px] text-neutral-500">Projected Margin</span>
                      <span className="text-sm font-bold text-[#059669]">
                        {customMarginPct}% (+$
                        {(customDraft.sellingPrice - customDraft.supplierCost).toFixed(2)})
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                      High-Converting Bullet Benefits (Featured on Storefront)
                    </label>
                    <div className="space-y-2">
                      {customDraft.benefits.map((b, idx) => (
                        <input
                          key={idx}
                          type="text"
                          value={b}
                          onChange={(e) => {
                            const updated: [string, string, string] = [
                              ...customDraft.benefits,
                            ] as [string, string, string];
                            updated[idx] = e.target.value;
                            setCustomDraft((prev) => ({
                              ...prev,
                              benefits: updated,
                            }));
                          }}
                          placeholder={`Benefit bullet ${idx + 1}`}
                          className="w-full px-3.5 py-1.5 text-xs bg-white border border-[#D1D5DB] rounded-md focus:outline-none focus:border-[#EA580C]"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Build Error Callout */}
          {buildError && (
            <div className="mb-5 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-2 text-xs font-medium text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{buildError}</span>
            </div>
          )}

          {/* Store Name Input + Auto-Generate Name + Primary CTA */}
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 sm:p-5 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="flex-1">
              <label
                htmlFor="xampe-store-name"
                className="block text-xs font-semibold text-neutral-700 mb-1.5"
              >
                Store Name (Optional — enter your brand name or auto-generate one)
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <input
                  id="xampe-store-name"
                  type="text"
                  value={storeNameInput}
                  onChange={(e) => onChangeStoreName(e.target.value)}
                  placeholder={`e.g. ${
                    NICHES[builderTab === 'custom' ? customDraft.niche : (selectedNiche ?? 'pets')]
                      .suggestedNames[0]
                  }`}
                  className="flex-1 px-4 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg text-[#111827] placeholder:text-neutral-400 focus:outline-none focus:border-[#EA580C]"
                />
                <button
                  type="button"
                  onClick={handleAutoGenerateName}
                  className="px-4 py-2.5 text-xs font-semibold text-neutral-800 bg-[#FAFAFA] hover:bg-neutral-100 border border-[#D1D5DB] rounded-lg inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <Wand2 className="w-3.5 h-3.5 text-[#EA580C]" />
                  Auto-Generate Name
                </button>
              </div>
            </div>

            <div className="flex flex-col items-stretch lg:items-end gap-1.5 shrink-0">
              <button
                type="button"
                disabled={isBuilding}
                onClick={startGeneration}
                className="px-7 py-3 text-sm font-semibold text-white bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-60 rounded-lg transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <span>{isBuilding ? 'Building Your Store...' : 'Create Dropshipping Store'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-medium text-neutral-500 text-center lg:text-right">
                100% Free • No Credit Card • No Sign-Up Required
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ANIMATED STORE BUILDING PROGRESS SCREEN */}
      {isBuilding && (
        <section className="my-6 bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-10">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-3 gap-2">
              <span className="text-xs font-semibold text-[#EA580C]">
                Building Live{' '}
                {storeNameInput.trim() ||
                  (builderTab === 'custom'
                    ? customDraft.title || 'Custom'
                    : liveSearchInput.trim() || (selectedNiche ? NICHES[selectedNiche].label : 'Winning'))}{' '}
                Dropshipping Store
              </span>
              <span className="text-sm font-bold text-[#111827] tabular-nums">
                {progress}%
              </span>
            </div>

            <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden mb-8 border border-[#E5E7EB]">
              <div
                className="h-full bg-[#EA580C] transition-all duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="space-y-3">
              {BUILD_STEPS.map((stepText, idx) => {
                const isDone = idx < currentStepIndex || progress === 100;
                const isCurrent = idx === currentStepIndex && progress < 100;
                return (
                  <div
                    key={stepText}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm transition-colors ${
                      isCurrent
                        ? 'bg-[#FAFAFA] border-[#EA580C] text-[#111827] font-semibold'
                        : isDone
                          ? 'bg-[#FFF7ED] border-[#FED7AA] text-[#9A3412]'
                          : 'bg-white border-[#E5E7EB] text-neutral-400'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${
                        isDone
                          ? 'text-[#EA580C]'
                          : isCurrent
                            ? 'text-[#111827]'
                            : 'text-neutral-300'
                      }`}
                    />
                    <span>{stepText}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* GENERATED LIVE STOREFRONT PREVIEW */}
      {!isBuilding && generatedStore && (
        <div ref={previewRef}>
          <StorePreview
            store={generatedStore}
            onUpdateLayout={handleUpdateLayout}
            onUpdateColorTheme={handleUpdateColorTheme}
            onShuffleHeroImage={handleShuffleHeroImage}
            onRegenerateStore={handleRegenerateStore}
          />
        </div>
      )}

      {/* HOW XAMPE WORKS IN 3 STEPS */}
      <section className="mt-14 pt-12 border-t border-[#E5E7EB]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#111827]">
              How Xampe Works in 3 Steps
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              Go from a winning product query or link to a complete Shopify dropshipping store in one session — 100% free.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('tools-hub')}
            className="text-xs font-semibold text-[#EA580C] hover:text-[#C2410C] inline-flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            Explore Free E-Commerce Calculators
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-6">
            <span className="font-mono-tabular text-xs font-bold text-[#EA580C] block mb-2">
              01. Search, Pick Niche, or Paste Link
            </span>
            <h3 className="font-display text-base font-bold text-[#111827] mb-2">
              Find 6 Winning Products Instantly
            </h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Use Xampe AI to pull 6 real niche-matched dropshipping products from any keyword, niche card, or supplier product URL.
            </p>
          </div>

          <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-6">
            <span className="font-mono-tabular text-xs font-bold text-[#EA580C] block mb-2">
              02. Customize &amp; Verify Margins
            </span>
            <h3 className="font-display text-base font-bold text-[#111827] mb-2">
              Preview Desktop &amp; Mobile Themes
            </h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Rotate between 5 Shopify layout templates, 6 color palettes, 15 lifestyle hero banners, and projected daily profit margins.
            </p>
          </div>

          <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-6">
            <span className="font-mono-tabular text-xs font-bold text-[#EA580C] block mb-2">
              03. Launch Directly on Shopify
            </span>
            <h3 className="font-display text-base font-bold text-[#111827] mb-2">
              Upload to Shopify Automatically (1-Click)
            </h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Connect your .myshopify.com store and upload all 6 winning products, photos, descriptions, and retail pricing automatically in 1 click.
            </p>
          </div>
        </div>
      </section>

      {/* 4-QUESTION FAQ SECTION */}
      <section className="mt-14 pt-12 border-t border-[#E5E7EB]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#111827]">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              Quick answers on Xampe AI, winning products, profit margins, and 1-click Shopify store uploads.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('faq')}
            className="text-xs font-semibold text-[#EA580C] hover:text-[#C2410C] inline-flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            View All Questions
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="border border-[#E5E7EB] rounded-xl divide-y divide-[#E5E7EB] bg-white">
          {HOME_FAQS.map((item, idx) => {
            const isOpen = openFaqIdx === idx;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                  className="w-full px-5 sm:px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-[#FAFAFA] transition-colors cursor-pointer"
                >
                  <span className="font-display text-sm font-semibold text-[#111827]">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-500 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 text-sm text-neutral-600 leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
