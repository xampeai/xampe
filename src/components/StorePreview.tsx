import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  Layers,
  Loader2,
  Menu,
  Monitor,
  RefreshCw,
  ShoppingBag,
  Smartphone,
  Star,
  Truck,
  X,
} from 'lucide-react';
import {
  COLOR_THEMES,
  LAYOUT_TEMPLATES,
  NICHES,
  getMarginPercent,
} from '../data/products';
import {
  ColorThemeId,
  GeneratedStore,
  LayoutTemplateId,
  WinningProduct,
} from '../types/xampe';
import { HeroImage, ProductStudioVisual } from './ProductStudioVisual';

// Replace with your official Shopify Affiliate tracking link before deploying
export const SHOPIFY_AFFILIATE_URL = 'https://pxf.io';

interface StorePreviewProps {
  store: GeneratedStore;
  onUpdateLayout: (layout: LayoutTemplateId) => void;
  onUpdateColorTheme: (theme: ColorThemeId) => void;
  onShuffleHeroImage: () => void;
  onRegenerateStore: () => void;
}

interface CartItem {
  product: WinningProduct;
  qty: number;
}

export const StorePreview: React.FC<StorePreviewProps> = ({
  store,
  onUpdateLayout,
  onUpdateColorTheme,
  onShuffleHeroImage,
  onRegenerateStore,
}) => {
  const nicheInfo = NICHES[store.niche];
  const colorTheme =
    COLOR_THEMES.find((t) => t.id === store.colorTheme) ?? COLOR_THEMES[0];
  const heroPool =
    store.heroImages && store.heroImages.length > 0
      ? store.heroImages
      : nicheInfo.heroImages;
  const heroImage = heroPool[store.heroImageIndex % heroPool.length];

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [dailySales, setDailySales] = useState<number>(12);
  const [copiedHookId, setCopiedHookId] = useState<string | null>(null);
  const [launchModalOpen, setLaunchModalOpen] = useState(false);
  const [shopifyDomain, setShopifyDomain] = useState(
    `${store.storeName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'my-brand'}.myshopify.com`
  );
  const [isPushingShopify, setIsPushingShopify] = useState(false);
  const [pendingAuthUrl, setPendingAuthUrl] = useState('');
  const [csvDownloaded, setCsvDownloaded] = useState(false);
  const [launchError, setLaunchError] = useState('');

  const [secondsLeft, setSecondsLeft] = useState(14 * 60 + 38);
  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 60 ? prev - 1 : 14 * 60 + 38));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setCart([]);
    setCartOpen(false);
    setShopifyDomain(
      `${store.storeName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'my-brand'}.myshopify.com`
    );
  }, [store.id, store.storeName]);

  useEffect(() => {
    const handleOAuthPopupMessage = (event: MessageEvent) => {
      const isAllowed =
        event.origin === window.location.origin ||
        event.origin.endsWith('.run.app') ||
        event.origin.startsWith('http://localhost:');
      if (!isAllowed || !event.data || typeof event.data !== 'object') return;
      if (event.data.type === 'SHOPIFY_INJECT_SUCCESS') {
        setIsPushingShopify(false);
        setPendingAuthUrl('');
        setLaunchModalOpen(false);
      } else if (event.data.type === 'SHOPIFY_INJECT_ERROR') {
        setIsPushingShopify(false);
        setPendingAuthUrl('');
        setLaunchError(
          String(
            event.data.message ||
              'Could not complete automatic Shopify upload. Please check your store domain and try again.'
          )
        );
      }
    };
    window.addEventListener('message', handleOAuthPopupMessage);
    return () => window.removeEventListener('message', handleOAuthPopupMessage);
  }, []);

  const formatCountdown = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return `00:${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  const addToCart = (product: WinningProduct) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { product, qty: 1 }];
    });
    setCartOpen(true);
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === id ? { ...item, qty: item.qty + delta } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.product.retailPrice * item.qty,
    0
  );

  const economics = useMemo(() => {
    const count = store.products.length || 1;
    const avgRetail =
      store.products.reduce((s, p) => s + p.retailPrice, 0) / count;
    const avgCost =
      store.products.reduce((s, p) => s + p.supplierCost, 0) / count;
    const avgGrossProfit = avgRetail - avgCost;
    const avgMarginPct = Math.round((avgGrossProfit / avgRetail) * 100);

    const dailyRevenue = avgRetail * dailySales;
    const dailyCost = avgCost * dailySales;
    const dailyProfit = avgGrossProfit * dailySales;
    const monthlyProfit = dailyProfit * 30;
    const yearlyRunRate = monthlyProfit * 12;

    return {
      avgRetail,
      avgCost,
      avgGrossProfit,
      avgMarginPct,
      dailyRevenue,
      dailyCost,
      dailyProfit,
      monthlyProfit,
      yearlyRunRate,
    };
  }, [store.products, dailySales]);

  const handleCopyHook = (id: string, hook: string) => {
    navigator.clipboard?.writeText(hook).catch(() => {});
    setCopiedHookId(id);
    window.setTimeout(() => setCopiedHookId(null), 1800);
  };

  const handleDownloadShopifyCsv = () => {
    const headers = [
      'Handle',
      'Title',
      'Body (HTML)',
      'Vendor',
      'Product Category',
      'Type',
      'Tags',
      'Published',
      'Option1 Name',
      'Option1 Value',
      'Variant SKU',
      'Variant Grams',
      'Variant Inventory Tracker',
      'Variant Inventory Qty',
      'Variant Inventory Policy',
      'Variant Fulfillment Service',
      'Variant Price',
      'Variant Compare At Price',
      'Variant Requires Shipping',
      'Variant Taxable',
      'Image Src',
      'Image Position',
      'Image Alt Text',
      'Cost per item',
      'Status',
    ];

    const escape = (val: string | number) =>
      `"${String(val ?? '').replace(/"/g, '""')}"`;

    const rows = store.products.map((p) => {
      const handle =
        p.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') || p.sku.toLowerCase();
      const bodyHtml = p.benefits?.length
        ? `<p>${p.shortDescription}</p><ul>${p.benefits.map((b) => `<li>${b}</li>`).join('')}</ul>`
        : `<p>${p.shortDescription}</p>`;
      const compareAtPrice = Math.max(
        p.retailPrice + 8,
        Math.ceil(p.retailPrice * 1.35)
      ).toFixed(2);
      const imageSrc =
        p.imageUrl &&
        (p.imageUrl.startsWith('http://') || p.imageUrl.startsWith('https://'))
          ? p.imageUrl
          : '';

      return [
        escape(handle),
        escape(p.name),
        escape(bodyHtml),
        escape(store.storeName),
        escape(nicheInfo.label),
        escape(p.category || nicheInfo.shortLabel),
        escape(`${nicheInfo.label}, Xampe Curated`),
        'TRUE',
        'Title',
        'Default Title',
        escape(p.sku),
        '450',
        'shopify',
        '50',
        'deny',
        'manual',
        p.retailPrice.toFixed(2),
        compareAtPrice,
        'TRUE',
        'TRUE',
        escape(imageSrc),
        imageSrc ? '1' : '',
        escape(p.name),
        p.supplierCost.toFixed(2),
        'active',
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'xampe-winning-products.csv';
    link.click();
    URL.revokeObjectURL(url);
    setCsvDownloaded(true);
    window.setTimeout(() => setCsvDownloaded(false), 2600);
  };

  const handlePushToShopify = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedShop = shopifyDomain.trim();
    if (!trimmedShop) {
      setLaunchError(
        'Enter your Shopify store domain (for example: my-brand.myshopify.com).'
      );
      return;
    }

    setLaunchError('');
    setPendingAuthUrl('');
    setIsPushingShopify(true);

    try {
      const res = await fetch('/api/shopify/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop: trimmedShop,
          storeName: store.storeName,
          colorTheme: store.colorTheme,
          primaryHex: colorTheme.primary,
          products: store.products.map((p) => ({
            name: p.name,
            shortDescription: p.shortDescription,
            benefits: p.benefits,
            category: p.category,
            sku: p.sku,
            retailPrice: p.retailPrice,
            supplierCost: p.supplierCost,
            imageUrl: p.imageUrl,
          })),
          origin: window.location.origin,
        }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        authUrl?: string;
        error?: string;
      };

      if (!res.ok || !data.ok || !data.authUrl) {
        setIsPushingShopify(false);
        setLaunchError(
          data.error ||
            'Could not connect to Shopify automatically right now. Verify your .myshopify.com domain or retry in a moment.'
        );
        return;
      }

      const inIframe = window.self !== window.top;
      if (inIframe) {
        setPendingAuthUrl(data.authUrl);
        const w = 720;
        const h = 780;
        const left = Math.max(0, window.screenX + (window.outerWidth - w) / 2);
        const top = Math.max(0, window.screenY + (window.outerHeight - h) / 2);
        window.open(
          data.authUrl,
          'xampe_shopify_oauth',
          `width=${w},height=${h},left=${left},top=${top}`
        );
      } else {
        window.location.href = data.authUrl;
      }
    } catch {
      setIsPushingShopify(false);
      setLaunchError(
        'Automatic Shopify upload requires an active server connection. Please try again in a moment.'
      );
    }
  };

  const isMobilePreview = previewDevice === 'mobile';
  const isLuxury = store.layout === 'luxury';
  const storeSlug =
    store.storeName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'xampe-store';
  const heroProduct = store.products[0];
  const hasCustomHero = Boolean(heroProduct?.isCustomImported);

  const renderProductCard = (product: WinningProduct, index: number) => {
    const isVibrant = store.layout === 'vibrant';
    const cardRadius = isVibrant ? 'rounded-2xl' : 'rounded-lg';
    const cardBg = isLuxury
      ? 'bg-[#18181B] border-zinc-800 text-white'
      : 'bg-white border-[#E5E7EB] text-[#111827]';

    return (
      <div
        key={product.id}
        className={`border ${cardRadius} ${cardBg} overflow-hidden flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5`}
      >
        <div>
          <div className="relative">
            <ProductStudioVisual
              imageUrl={product.imageUrl}
              imagePosition={product.imagePosition}
              productName={product.name}
              darkSurface={isLuxury}
              isLiveProduct={product.isLiveApi}
            />
            {(index === 0 || product.isCustomImported) && (
              <span
                className="absolute top-3 left-3 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide"
                style={{
                  backgroundColor: colorTheme.primary,
                  color: colorTheme.primaryText,
                  borderRadius: isVibrant ? '9999px' : '4px',
                }}
              >
                {product.isCustomImported ? 'Hero Bestseller' : 'Bestseller'}
              </span>
            )}
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className={`truncate max-w-[160px] ${isLuxury ? 'text-zinc-400' : 'text-neutral-500'}`}>
                {product.source || product.category}
              </span>
              <span className="flex items-center gap-1 font-medium tabular-nums shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {product.rating.toFixed(1)}
              </span>
            </div>
            <h4
              className={`font-semibold text-[15px] leading-snug mb-1.5 ${
                isLuxury ? 'font-serif-luxury text-white' : 'text-[#111827]'
              }`}
            >
              {product.name}
            </h4>
            <p
              className={`text-xs leading-relaxed line-clamp-2 ${
                isLuxury ? 'text-zinc-400' : 'text-neutral-600'
              }`}
            >
              {product.shortDescription}
            </p>
          </div>
        </div>

        <div className="px-4 pb-4 pt-2 flex items-center justify-between border-t border-black/5">
          <div className="tabular-nums">
            <span
              className={`text-base font-bold ${
                isLuxury ? 'text-white' : 'text-[#111827]'
              }`}
            >
              ${product.retailPrice.toFixed(2)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => addToCart(product)}
            style={{
              backgroundColor: colorTheme.primary,
              color: colorTheme.primaryText,
            }}
            className={`px-3.5 py-1.5 text-xs font-semibold cursor-pointer whitespace-nowrap transition-opacity hover:opacity-90 ${
              isVibrant ? 'rounded-full' : 'rounded-md'
            }`}
          >
            Add to Cart
          </button>
        </div>
      </div>
    );
  };

  return (
    <section className="mt-10 sm:mt-12">
      {/* Floating Customization Bar */}
      <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-4 mb-4 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 whitespace-nowrap">
            <Layers className="w-4 h-4 text-neutral-500" />
            <span>Layout:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {LAYOUT_TEMPLATES.map((tpl, idx) => {
              const active = store.layout === tpl.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => onUpdateLayout(tpl.id)}
                  title={tpl.description}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-[#EA580C] text-white border-[#EA580C]'
                      : 'bg-white text-neutral-700 border-[#E5E7EB] hover:border-neutral-400'
                  }`}
                >
                  {idx + 1}. {tpl.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 shrink-0">
          {/* Desktop / Mobile Preview Toggle */}
          <div className="inline-flex items-center p-0.5 bg-white border border-[#E5E7EB] rounded-md">
            <button
              type="button"
              onClick={() => setPreviewDevice('desktop')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                !isMobilePreview
                  ? 'bg-[#111827] text-white'
                  : 'text-neutral-600 hover:text-[#111827]'
              }`}
              aria-label="Desktop Preview"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('mobile')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                isMobilePreview
                  ? 'bg-[#111827] text-white'
                  : 'text-neutral-600 hover:text-[#111827]'
              }`}
              aria-label="Mobile Preview"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-700 whitespace-nowrap">
              Palette:
            </span>
            <div className="flex items-center gap-1.5">
              {COLOR_THEMES.map((theme) => {
                const selected = store.colorTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => onUpdateColorTheme(theme.id)}
                    title={theme.name}
                    aria-label={`Select ${theme.name} palette`}
                    className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                      selected ? 'scale-110 border-[#111827]' : 'border-white ring-1 ring-neutral-300'
                    }`}
                    style={{ backgroundColor: theme.primary }}
                  />
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={onShuffleHeroImage}
            title={`Cycle lifestyle hero banner (${(store.heroImageIndex % heroPool.length) + 1}/${heroPool.length})`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-white border border-[#D1D5DB] hover:border-neutral-500 rounded-md whitespace-nowrap cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Shuffle Hero ({(store.heroImageIndex % heroPool.length) + 1}/{heroPool.length})
          </button>

          <button
            type="button"
            onClick={onRegenerateStore}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#EA580C] hover:bg-[#C2410C] rounded-md whitespace-nowrap cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Regenerate Store
          </button>
        </div>
      </div>

      {/* Realistic Browser / Mobile Device Preview Frame */}
      <div
        className={`border border-[#E5E7EB] rounded-xl overflow-hidden ${
          isMobilePreview ? 'bg-[#F3F4F6]' : 'bg-white'
        }`}
      >
        {/* Browser Top Bar */}
        <div className="bg-[#FAFAFA] border-b border-[#E5E7EB] px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <span className="w-3 h-3 rounded-full bg-neutral-300" />
            <span className="w-3 h-3 rounded-full bg-neutral-300" />
            <span className="w-3 h-3 rounded-full bg-neutral-300" />
          </div>
          <div className="px-3 sm:px-4 py-1 bg-white border border-[#E5E7EB] rounded-md text-xs text-neutral-600 font-mono-tabular flex-1 max-w-[420px] text-center truncate">
            https://{storeSlug}.myshopify.com
          </div>
          <div className="text-xs text-neutral-500 font-medium whitespace-nowrap hidden md:block">
            Theme: {LAYOUT_TEMPLATES.find((l) => l.id === store.layout)?.name}
          </div>
        </div>

        {/* Storefront Canvas */}
        <div
          className={`relative transition-all ${
            isMobilePreview
              ? 'max-w-[390px] w-full mx-auto my-5 rounded-[26px] border-[5px] border-[#111827] overflow-hidden'
              : 'w-full'
          } ${isLuxury ? 'bg-[#111827] text-white' : 'bg-white text-[#111827]'}`}
        >
          {/* Announcement Bar */}
          {store.layout === 'dtc' ? (
            <div
              className="px-4 py-2 text-[11px] sm:text-xs font-semibold text-center flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 tabular-nums"
              style={{
                backgroundColor: colorTheme.primary,
                color: colorTheme.primaryText,
              }}
            >
              <span>FREE TRACKED SHIPPING OVER $45</span>
              <span aria-hidden="true">·</span>
              <span>ENDS IN {formatCountdown(secondsLeft)}</span>
            </div>
          ) : store.layout === 'vibrant' ? (
            <div
              className="px-4 py-2 text-[11px] sm:text-xs font-medium flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 text-center"
              style={{
                backgroundColor: colorTheme.accentLight,
                color: colorTheme.accentText,
              }}
            >
              <span>14 shoppers currently browsing {store.storeName}</span>
              <span aria-hidden="true">·</span>
              <span>312 orders shipped this week</span>
            </div>
          ) : (
            <div
              className={`px-4 py-1.5 text-[11px] font-medium text-center border-b ${
                isLuxury
                  ? 'bg-[#0B0F19] text-zinc-300 border-zinc-800'
                  : 'bg-[#FAFAFA] text-neutral-600 border-[#E5E7EB]'
              }`}
            >
              Complimentary Tracked Shipping on Orders $45+ · 30-Day Home Trial
            </div>
          )}

          {/* Storefront Header */}
          <div
            className={`${
              isMobilePreview ? 'px-4 h-14' : 'px-4 sm:px-8 h-16'
            } flex items-center justify-between gap-3 border-b ${
              isLuxury ? 'border-zinc-800' : 'border-[#E5E7EB]'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {isMobilePreview && (
                <Menu className={`w-4 h-4 shrink-0 ${isLuxury ? 'text-zinc-300' : 'text-neutral-700'}`} />
              )}
              <span
                className={`font-bold tracking-tight truncate ${
                  isLuxury
                    ? 'font-serif-luxury text-white text-lg sm:text-xl'
                    : 'font-display text-base sm:text-lg'
                }`}
              >
                {store.storeName}
              </span>
            </div>

            {!isMobilePreview && (
              <div
                className={`hidden md:flex items-center gap-6 text-xs font-medium ${
                  isLuxury ? 'text-zinc-300' : 'text-neutral-600'
                }`}
              >
                <span>Catalog</span>
                <span>Bestsellers</span>
                <span>Shipping &amp; Care</span>
                <span>Track Order</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-semibold border cursor-pointer shrink-0 ${
                isLuxury
                  ? 'border-zinc-700 text-white hover:bg-zinc-800'
                  : 'border-[#E5E7EB] text-[#111827] hover:bg-neutral-50'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Cart ({cartCount})</span>
            </button>
          </div>

          {/* Featured Imported Hero Product Spotlight Banner */}
          {hasCustomHero && store.layout !== 'editorial' && (
            <div
              className={`${
                isMobilePreview ? 'px-4 py-5' : 'px-4 sm:px-8 py-6'
              } border-b ${
                isLuxury
                  ? 'bg-[#111827] border-zinc-800'
                  : 'bg-[#FAFAFA] border-[#E5E7EB]'
              }`}
            >
              <div
                className={`grid ${
                  isMobilePreview
                    ? 'grid-cols-1 gap-4'
                    : 'grid-cols-1 md:grid-cols-12 gap-6 items-center'
                }`}
              >
                <div
                  className={`${
                    isMobilePreview ? '' : 'md:col-span-4'
                  } rounded-lg overflow-hidden border border-neutral-200/30`}
                >
                  <ProductStudioVisual
                    imageUrl={heroProduct.imageUrl}
                    imagePosition={heroProduct.imagePosition}
                    productName={heroProduct.name}
                    darkSurface={isLuxury}
                    isLiveProduct={heroProduct.isLiveApi}
                  />
                </div>
                <div className={isMobilePreview ? '' : 'md:col-span-8'}>
                  <p
                    className="text-xs font-semibold mb-1"
                    style={{ color: isLuxury ? '#FB923C' : colorTheme.primary }}
                  >
                    Featured Hero Bestseller · {heroProduct.category}
                  </p>
                  <h3
                    className={`${
                      isMobilePreview ? 'text-xl' : 'text-xl sm:text-2xl'
                    } font-bold mb-2 ${
                      isLuxury ? 'font-serif-luxury text-white' : 'font-display text-[#111827]'
                    }`}
                  >
                    {heroProduct.name}
                  </h3>
                  {heroProduct.benefits && heroProduct.benefits.length > 0 && (
                    <ul className="space-y-1.5 mb-4">
                      {heroProduct.benefits.map((b) => (
                        <li
                          key={b}
                          className={`flex items-start gap-2 text-xs ${
                            isLuxury ? 'text-zinc-300' : 'text-neutral-600'
                          }`}
                        >
                          <CheckCircle2
                            className="w-3.5 h-3.5 shrink-0 mt-0.5"
                            style={{ color: isLuxury ? '#FB923C' : colorTheme.primary }}
                          />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <span className="text-xl font-bold tabular-nums">
                      ${heroProduct.retailPrice.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => addToCart(heroProduct)}
                      style={{
                        backgroundColor: colorTheme.primary,
                        color: colorTheme.primaryText,
                      }}
                      className="px-4 sm:px-5 py-2 text-xs font-semibold rounded-md cursor-pointer"
                    >
                      Add Hero Bestseller to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5 DISTINCT RESPONSIVE LAYOUT HERO SECTIONS */}
          {store.layout === 'minimalist' && (
            <div className={isMobilePreview ? 'px-4 py-5' : 'px-4 sm:px-8 py-6 sm:py-10'}>
              <div
                className={`relative rounded-xl overflow-hidden border border-[#E5E7EB] ${
                  isMobilePreview ? 'h-[280px]' : 'h-[260px] sm:h-[340px]'
                }`}
              >
                <HeroImage
                  src={heroImage.src}
                  fallbackSrc={heroImage.fallbackSrc}
                  alt={heroImage.alt}
                  objectPosition={heroImage.objectPosition}
                  className="w-full h-full"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t from-neutral-950/85 via-neutral-900/40 to-transparent flex flex-col items-center justify-end text-center ${
                    isMobilePreview ? 'p-5' : 'p-5 sm:p-10'
                  }`}
                >
                  <p className="text-xs font-medium text-neutral-200 mb-1.5">
                    {nicheInfo.label} Collection
                  </p>
                  <h3
                    className={`font-display ${
                      isMobilePreview ? 'text-xl' : 'text-xl sm:text-3xl'
                    } font-bold text-white max-w-2xl text-balance mb-2 sm:mb-3`}
                  >
                    {store.heroTagline}
                  </h3>
                  <p
                    className={`${
                      isMobilePreview ? 'text-xs line-clamp-2' : 'text-xs sm:text-sm'
                    } text-neutral-200 max-w-xl mb-4 sm:mb-5`}
                  >
                    {store.heroSubheadline}
                  </p>
                  <button
                    type="button"
                    onClick={() => addToCart(heroProduct)}
                    style={{
                      backgroundColor: colorTheme.primary,
                      color: colorTheme.primaryText,
                    }}
                    className={`${
                      isMobilePreview ? 'w-full text-xs py-2' : 'px-6 py-2.5 text-sm'
                    } font-semibold rounded-md cursor-pointer truncate max-w-full`}
                  >
                    Shop {hasCustomHero ? heroProduct.name : 'Featured Collection'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {store.layout === 'dtc' && (
            <div
              className={`${
                isMobilePreview
                  ? 'px-4 py-5 grid grid-cols-1 gap-5'
                  : 'px-4 sm:px-8 py-6 sm:py-8 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8'
              } items-stretch border-b border-[#E5E7EB]`}
            >
              <div className="flex flex-col justify-center py-2">
                <p
                  className="text-xs font-semibold mb-2"
                  style={{ color: colorTheme.primary }}
                >
                  Rated 4.9/5 by 1,200+ Verified Customers
                </p>
                <h3
                  className={`font-display ${
                    isMobilePreview ? 'text-2xl' : 'text-2xl sm:text-3xl'
                  } font-extrabold text-[#111827] leading-tight mb-3 text-balance`}
                >
                  {store.heroTagline}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-5">
                  {store.heroSubheadline}
                </p>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-5">
                  <button
                    type="button"
                    onClick={() => addToCart(heroProduct)}
                    style={{
                      backgroundColor: colorTheme.primary,
                      color: colorTheme.primaryText,
                    }}
                    className={`${
                      isMobilePreview ? 'w-full justify-center' : ''
                    } px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-md cursor-pointer inline-flex items-center`}
                  >
                    Order Bestseller — ${heroProduct.retailPrice}
                  </button>
                  <span className="text-xs text-neutral-500 flex items-center gap-1.5">
                    <Truck className="w-4 h-4" />
                    Ships in {heroProduct.shippingDays}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-4 border-t border-[#E5E7EB] text-[11px] sm:text-xs text-neutral-600">
                  <div>
                    <p className="font-semibold text-[#111827]">30-Day Guarantee</p>
                    <p>Easy returns</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#111827]">Tracked Shipping</p>
                    <p>Live updates</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#111827]">24/7 Support</p>
                    <p>Fast reply</p>
                  </div>
                </div>
              </div>
              <div
                className={`rounded-lg overflow-hidden border border-[#E5E7EB] ${
                  isMobilePreview ? 'h-[220px]' : 'h-[240px] sm:h-[340px]'
                }`}
              >
                <HeroImage
                  src={hasCustomHero ? heroProduct.imageUrl : heroImage.src}
                  fallbackSrc={hasCustomHero ? undefined : heroImage.fallbackSrc}
                  alt={hasCustomHero ? heroProduct.name : heroImage.alt}
                  objectPosition={heroImage.objectPosition}
                  className="w-full h-full"
                />
              </div>
            </div>
          )}

          {store.layout === 'luxury' && (
            <div
              className={`relative ${
                isMobilePreview ? 'h-[300px]' : 'h-[300px] sm:h-[360px]'
              } overflow-hidden border-b border-zinc-800`}
            >
              <HeroImage
                src={heroImage.src}
                fallbackSrc={heroImage.fallbackSrc}
                alt={heroImage.alt}
                objectPosition={heroImage.objectPosition}
                className="w-full h-full opacity-75"
              />
              <div
                className={`absolute inset-0 bg-gradient-to-r from-[#090D16]/95 via-[#090D16]/75 to-transparent flex items-center ${
                  isMobilePreview ? 'px-5' : 'px-6 sm:px-12'
                }`}
              >
                <div className="max-w-xl">
                  <p className="text-[11px] sm:text-xs tracking-widest uppercase text-zinc-300 mb-2 sm:mb-3">
                    Atelier Selection · {nicheInfo.label}
                  </p>
                  <h3
                    className={`font-serif-luxury ${
                      isMobilePreview ? 'text-2xl' : 'text-2xl sm:text-4xl'
                    } font-semibold text-white leading-tight mb-3 sm:mb-4`}
                  >
                    {store.heroTagline}
                  </h3>
                  <p
                    className={`${
                      isMobilePreview ? 'text-xs line-clamp-2' : 'text-xs sm:text-sm'
                    } text-zinc-300 leading-relaxed mb-5`}
                  >
                    {store.heroSubheadline}
                  </p>
                  <button
                    type="button"
                    onClick={() => addToCart(heroProduct)}
                    style={{
                      backgroundColor: colorTheme.primary,
                      color: colorTheme.primaryText,
                    }}
                    className="px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-medium rounded-sm cursor-pointer border border-white/20"
                  >
                    Explore the Collection
                  </button>
                </div>
              </div>
            </div>
          )}

          {store.layout === 'vibrant' && (
            <div className={isMobilePreview ? 'px-4 pt-5 pb-3' : 'px-4 sm:px-8 pt-6 sm:pt-8 pb-4'}>
              <div
                className={`rounded-2xl overflow-hidden grid ${
                  isMobilePreview ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-12'
                } items-stretch border`}
                style={{
                  backgroundColor: colorTheme.accentLight,
                  borderColor: colorTheme.border,
                }}
              >
                <div
                  className={`${
                    isMobilePreview ? 'p-5' : 'md:col-span-6 p-6 sm:p-9'
                  } flex flex-col justify-center`}
                >
                  <span
                    className="text-xs font-bold mb-2"
                    style={{ color: colorTheme.accentText }}
                  >
                    New Season Drop · {nicheInfo.shortLabel}
                  </span>
                  <h3
                    className={`font-display ${
                      isMobilePreview ? 'text-2xl' : 'text-2xl sm:text-3xl'
                    } font-extrabold text-[#111827] leading-tight mb-3`}
                  >
                    {store.heroTagline}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed mb-5">
                    {store.heroSubheadline}
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => addToCart(heroProduct)}
                      style={{
                        backgroundColor: colorTheme.primary,
                        color: colorTheme.primaryText,
                      }}
                      className={`${
                        isMobilePreview ? 'w-full' : ''
                      } px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-full cursor-pointer`}
                    >
                      Shop All 6 Essentials
                    </button>
                  </div>
                </div>
                <div
                  className={`${
                    isMobilePreview ? 'h-[210px]' : 'md:col-span-6 h-[220px] sm:h-[310px]'
                  }`}
                >
                  <HeroImage
                    src={heroImage.src}
                    fallbackSrc={heroImage.fallbackSrc}
                    alt={heroImage.alt}
                    objectPosition={heroImage.objectPosition}
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>
          )}

          {store.layout === 'editorial' && (
            <div className={isMobilePreview ? 'px-4 pt-5 pb-3' : 'px-4 sm:px-8 pt-6 sm:pt-8 pb-4'}>
              <div
                className={`relative rounded-lg overflow-hidden ${
                  isMobilePreview ? 'h-[200px] mb-4' : 'h-[210px] sm:h-[240px] mb-6'
                } border border-[#E5E7EB]`}
              >
                <HeroImage
                  src={heroImage.src}
                  fallbackSrc={heroImage.fallbackSrc}
                  alt={heroImage.alt}
                  objectPosition={heroImage.objectPosition}
                  className="w-full h-full"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-r from-neutral-950/85 via-neutral-900/55 to-transparent flex items-center ${
                    isMobilePreview ? 'px-5' : 'px-6 sm:px-10'
                  }`}
                >
                  <div className="max-w-lg">
                    <h3
                      className={`font-display ${
                        isMobilePreview ? 'text-xl' : 'text-xl sm:text-2xl'
                      } font-bold text-white mb-2`}
                    >
                      {store.heroTagline}
                    </h3>
                    <p className="text-xs text-neutral-200 leading-relaxed line-clamp-3">
                      {store.heroSubheadline}
                    </p>
                  </div>
                </div>
              </div>

              {/* Asymmetric Featured Bestseller Spotlight */}
              <div
                className={`bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg ${
                  isMobilePreview
                    ? 'p-4 grid grid-cols-1 gap-4'
                    : 'p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center'
                }`}
              >
                <div
                  className={`${
                    isMobilePreview ? '' : 'md:col-span-5'
                  } rounded-md overflow-hidden border border-[#E5E7EB]`}
                >
                  <ProductStudioVisual
                    imageUrl={heroProduct.imageUrl}
                    imagePosition={heroProduct.imagePosition}
                    productName={heroProduct.name}
                    isLiveProduct={heroProduct.isLiveApi}
                  />
                </div>
                <div className={isMobilePreview ? '' : 'md:col-span-7'}>
                  <p
                    className="text-xs font-semibold mb-1.5"
                    style={{ color: colorTheme.primary }}
                  >
                    #1 Featured Hero Bestseller · {heroProduct.category}
                  </p>
                  <h4
                    className={`font-display ${
                      isMobilePreview ? 'text-lg' : 'text-xl sm:text-2xl'
                    } font-bold text-[#111827] mb-2`}
                  >
                    {heroProduct.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-3">
                    {heroProduct.shortDescription}
                  </p>
                  {heroProduct.benefits && heroProduct.benefits.length > 0 && (
                    <ul className="space-y-1 mb-4">
                      {heroProduct.benefits.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-xs text-neutral-700">
                          <CheckCircle2
                            className="w-3.5 h-3.5 shrink-0 mt-0.5"
                            style={{ color: colorTheme.primary }}
                          />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex flex-wrap items-center gap-4 mb-4 text-xs text-neutral-600 tabular-nums">
                    <span className="flex items-center gap-1 font-semibold text-[#111827]">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {heroProduct.rating} ({heroProduct.reviews} reviews)
                    </span>
                    <span>Dispatch: {heroProduct.shippingDays}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <span className="text-xl sm:text-2xl font-bold text-[#111827] tabular-nums">
                      ${heroProduct.retailPrice.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => addToCart(heroProduct)}
                      style={{
                        backgroundColor: colorTheme.primary,
                        color: colorTheme.primaryText,
                      }}
                      className="px-5 py-2.5 text-xs font-semibold rounded-md cursor-pointer"
                    >
                      Add Bestseller to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className={isMobilePreview ? 'px-4 py-5' : 'px-4 sm:px-8 py-6 sm:py-8'}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 sm:mb-6">
              <div>
                <h4
                  className={`${
                    isMobilePreview ? 'text-lg' : 'text-lg sm:text-xl'
                  } font-bold ${
                    isLuxury ? 'font-serif-luxury text-white' : 'font-display text-[#111827]'
                  }`}
                >
                  {store.layout === 'editorial'
                    ? 'Complementary Collection'
                    : hasCustomHero
                      ? 'Hero Bestseller & Complementary Products'
                      : 'Curated Winning Products'}
                </h4>
                <p
                  className={`text-xs mt-1 ${
                    isLuxury ? 'text-zinc-400' : 'text-neutral-500'
                  }`}
                >
                  {store.searchQuery
                    ? `Xampe AI results for “${store.searchQuery}”`
                    : nicheInfo.label}{' '}
                  · {store.products.length} verified high-margin items
                </p>
              </div>
              {!isMobilePreview && (
                <span
                  className={`text-xs font-medium ${
                    isLuxury ? 'text-zinc-400' : 'text-neutral-500'
                  }`}
                >
                  All prices in USD
                </span>
              )}
            </div>

            <div
              className={`grid ${
                isMobilePreview
                  ? 'grid-cols-1 gap-4'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6'
              }`}
            >
              {(store.layout === 'editorial'
                ? store.products.slice(1)
                : store.products
              ).map((p, idx) => renderProductCard(p, idx))}
            </div>
          </div>

          {/* Storefront Footer */}
          <div
            className={`${
              isMobilePreview
                ? 'px-4 py-5 flex-col items-start gap-2.5'
                : 'px-4 sm:px-8 py-6 flex-col sm:flex-row sm:items-center justify-between gap-3'
            } border-t flex text-xs ${
              isLuxury
                ? 'border-zinc-800 text-zinc-400 bg-[#0B0F19]'
                : 'border-[#E5E7EB] text-neutral-500 bg-[#FAFAFA]'
            }`}
          >
            <span>
              © 2026 {store.storeName}. All rights reserved.
            </span>
            <div className="flex flex-wrap items-center gap-4 sm:gap-5">
              <span>Shipping Policy</span>
              <span>30-Day Returns</span>
              <span>Contact Support</span>
            </div>
          </div>

          {/* Interactive Slide-Over Cart Drawer inside Preview */}
          {cartOpen && (
            <div className="absolute inset-0 bg-black/40 flex justify-end z-20">
              <div className="w-full max-w-[340px] bg-white text-[#111827] h-full border-l border-[#E5E7EB] flex flex-col justify-between p-5 sm:p-6">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
                    <h5 className="font-display font-bold text-base">
                      Your Cart ({cartCount})
                    </h5>
                    <button
                      type="button"
                      onClick={() => setCartOpen(false)}
                      className="p-1 text-neutral-500 hover:text-[#111827] cursor-pointer"
                      aria-label="Close cart"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {cart.length === 0 ? (
                    <p className="text-sm text-neutral-500 py-10 text-center">
                      Your preview cart is empty. Click &ldquo;Add to Cart&rdquo; on any product.
                    </p>
                  ) : (
                    <div className="divide-y divide-[#E5E7EB] mt-2 max-h-[380px] overflow-y-auto">
                      {cart.map(({ product, qty }) => (
                        <div key={product.id} className="py-3 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#111827] truncate">
                              {product.name}
                            </p>
                            <p className="text-xs text-neutral-500 tabular-nums">
                              ${product.retailPrice.toFixed(2)} each
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => updateCartQty(product.id, -1)}
                              className="w-6 h-6 border border-[#D1D5DB] rounded text-xs font-bold cursor-pointer"
                            >
                              -
                            </button>
                            <span className="text-xs font-semibold tabular-nums w-4 text-center">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartQty(product.id, 1)}
                              className="w-6 h-6 border border-[#D1D5DB] rounded text-xs font-bold cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[#E5E7EB]">
                  <div className="flex items-center justify-between text-sm font-bold mb-3 tabular-nums">
                    <span>Subtotal</span>
                    <span>${cartSubtotal.toFixed(2)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCartOpen(false);
                      setLaunchError('');
                      setPendingAuthUrl('');
                      setLaunchModalOpen(true);
                    }}
                    style={{
                      backgroundColor: colorTheme.primary,
                      color: colorTheme.primaryText,
                    }}
                    className="w-full py-2.5 rounded-md text-xs font-semibold cursor-pointer"
                  >
                    Upload to Shopify Automatically (1-Click)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Unit Economics Breakdown */}
      <div className="mt-8 sm:mt-10 bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
        <div className="px-4 sm:px-6 py-5 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAFAFA]">
          <div>
            <h3 className="font-display text-lg font-bold text-[#111827]">
              Selected 6-Product Supplier &amp; Profit Breakdown
            </h3>
            <p className="text-xs text-neutral-600 mt-0.5">
              Verified supplier costs, recommended retail prices, margin %, and ready-to-film TikTok/Meta ad hooks.
            </p>
          </div>
          <div className="sm:text-right tabular-nums">
            <span className="text-xs text-neutral-500 block">Catalog Avg. Margin</span>
            <span className="text-base font-bold text-[#EA580C]">
              {economics.avgMarginPct}% (${economics.avgGrossProfit.toFixed(2)} / order)
            </span>
          </div>
        </div>

        <div className="divide-y divide-[#E5E7EB]">
          {store.products.map((product) => {
            const marginPct = getMarginPercent(product);
            const profit = product.retailPrice - product.supplierCost;
            const copied = copiedHookId === product.id;

            return (
              <div
                key={product.id}
                className="px-4 sm:px-6 py-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start lg:items-center hover:bg-neutral-50/70 transition-colors"
              >
                <div className="lg:col-span-4 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-neutral-500 mb-0.5">
                    <span className="font-mono-tabular">{product.sku}</span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate font-medium text-neutral-700">
                      {product.source || product.category}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-0.5 text-neutral-700 font-medium tabular-nums shrink-0">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {product.rating.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-[#111827] truncate">
                      {product.name}
                    </p>
                    {product.isCustomImported && (
                      <span className="text-[11px] font-semibold text-[#EA580C] shrink-0">
                        (Hero)
                      </span>
                    )}
                    {product.link && (
                      <a
                        href={product.link}
                        target="_blank"
                        rel="noreferrer"
                        title="Open live marketplace listing"
                        className="text-neutral-400 hover:text-[#EA580C] shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-3 grid grid-cols-3 gap-2 text-xs tabular-nums">
                  <div>
                    <span className="text-neutral-500 block">Supplier</span>
                    <span className="font-semibold text-[#111827]">
                      ${product.supplierCost.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Retail</span>
                    <span className="font-semibold text-[#111827]">
                      ${product.retailPrice.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Margin</span>
                    <span className="font-bold text-[#059669]">
                      {marginPct}% (+${profit.toFixed(0)})
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5 flex items-center justify-between gap-3 bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg px-3 py-2">
                  <div className="min-w-0">
                    <span className="text-[11px] font-semibold text-neutral-500 block">
                      Ad Hook
                    </span>
                    <p className="text-xs text-neutral-800 truncate" title={product.adHook}>
                      “{product.adHook}”
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyHook(product.id, product.adHook)}
                    className="px-2.5 py-1 text-xs font-medium bg-white border border-[#E5E7EB] rounded hover:border-neutral-400 text-neutral-700 shrink-0 inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-[#EA580C]" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Daily Profit Potential Calculator Slider + 1-Click Automatic Shopify Upload CTA */}
      <div className="mt-6 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch lg:items-center">
        <div className="lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="font-display text-base font-bold text-[#111827]">
                Daily Profit Potential Calculator
              </h3>
              <p className="text-xs text-neutral-600">
                Slide to project revenue &amp; gross profit across 1–30 daily orders before ad spend.
              </p>
            </div>
            <div className="px-3 py-1 bg-white border border-[#D1D5DB] rounded-md text-sm font-bold text-[#111827] tabular-nums">
              {dailySales} orders / day
            </div>
          </div>

          <input
            type="range"
            min={1}
            max={30}
            value={dailySales}
            onChange={(e) => setDailySales(Number(e.target.value))}
            className="w-full accent-[#EA580C] cursor-pointer"
            aria-label="Daily sales volume slider"
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 tabular-nums">
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-3">
              <span className="text-[11px] text-neutral-500 block">Daily Revenue</span>
              <span className="text-base font-bold text-[#111827]">
                ${economics.dailyRevenue.toFixed(0)}
              </span>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-3">
              <span className="text-[11px] text-neutral-500 block">Daily Product Cost</span>
              <span className="text-base font-bold text-neutral-700">
                ${economics.dailyCost.toFixed(0)}
              </span>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-3">
              <span className="text-[11px] text-neutral-500 block">Daily Gross Profit</span>
              <span className="text-base font-bold text-[#059669]">
                ${economics.dailyProfit.toFixed(0)}
              </span>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-3">
              <span className="text-[11px] text-neutral-500 block">30-Day Gross Profit</span>
              <span className="text-base font-bold text-[#059669]">
                ${economics.monthlyProfit.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-[#E5E7EB] rounded-xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-[#EA580C] mb-1">
              1-Click Shopify Store Upload
            </p>
            <h4 className="font-display text-lg font-bold text-[#111827] mb-2">
              Upload {store.storeName} Directly to Shopify
            </h4>
            <p className="text-xs text-neutral-600 leading-relaxed mb-5">
              Connect your .myshopify.com store and Xampe automatically uploads all {store.products.length} winning products, images, descriptions, and retail pricing.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setLaunchError('');
              setPendingAuthUrl('');
              setLaunchModalOpen(true);
            }}
            className="w-full py-3.5 px-5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Upload to Shopify Automatically (1-Click)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1-Click Automatic Shopify Upload Modal */}
      {launchModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/60 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-[600px] bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#FAFAFA]">
              <div>
                <span className="text-xs font-semibold text-[#EA580C]">
                  1-Click Shopify Upload · {store.products.length} Winning SKUs
                </span>
                <h4 className="font-display text-lg font-bold text-[#111827]">
                  Upload {store.storeName} to Shopify
                </h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsPushingShopify(false);
                  setPendingAuthUrl('');
                  setLaunchModalOpen(false);
                }}
                className="p-1.5 text-neutral-500 hover:text-[#111827] cursor-pointer"
                aria-label="Close launch modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePushToShopify} className="p-5 sm:p-6 space-y-5">
              {/* Store Package Summary */}
              <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-neutral-500 block">Selected Niche</span>
                  <span className="font-semibold text-[#111827]">{nicheInfo.label}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Layout &amp; Palette</span>
                  <span className="font-semibold text-[#111827]">
                    {LAYOUT_TEMPLATES.find((l) => l.id === store.layout)?.name} ({colorTheme.primary})
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Catalog Ready</span>
                  <span className="font-semibold text-[#059669]">
                    {store.products.length} Winning Products
                  </span>
                </div>
              </div>

              {/* Shopify Domain Input + Affiliate Link */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                  <label
                    htmlFor="shopify-store-domain"
                    className="text-xs font-semibold text-neutral-700"
                  >
                    Your Shopify Store Domain (.myshopify.com)
                  </label>
                  <a
                    href={SHOPIFY_AFFILIATE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-[#EA580C] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Don’t have a Shopify store yet? Create one free first</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  id="shopify-store-domain"
                  type="text"
                  value={shopifyDomain}
                  onChange={(e) => {
                    setLaunchError('');
                    setShopifyDomain(e.target.value);
                  }}
                  placeholder="yourstore.myshopify.com"
                  className="w-full px-3.5 py-2.5 text-sm border border-[#D1D5DB] rounded-lg text-[#111827] focus:outline-none focus:border-[#EA580C]"
                />
              </div>

              {/* Primary 1-Click Automatic Upload Button */}
              <button
                type="submit"
                disabled={isPushingShopify}
                className="w-full py-3.5 px-5 bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-65 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                {isPushingShopify ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting to Shopify &amp; Uploading Store...</span>
                  </>
                ) : (
                  <>
                    <span>Connect &amp; Upload Store Automatically</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {pendingAuthUrl && (
                <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-lg p-4 text-xs text-[#9A3412] space-y-2">
                  <p className="font-semibold">
                    Complete authorization in your Shopify popup window to automatically upload all {store.products.length} products into {shopifyDomain}.
                  </p>
                  <a
                    href={pendingAuthUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-semibold text-[#EA580C] hover:underline"
                  >
                    <span>Popup didn’t open? Click here to authorize Shopify</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {launchError && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>{launchError}</span>
                </div>
              )}

              <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg p-3.5 text-xs text-neutral-600 space-y-2">
                <p className="font-semibold text-[#111827]">What happens on 1-click upload:</p>
                <p>
                  Xampe saves your 6 curated products, connects via official Shopify authorization, uploads every title, image, description, and price automatically, and returns you here once live.
                </p>
                <div className="pt-1 flex items-center justify-between border-t border-neutral-200">
                  <button
                    type="button"
                    onClick={handleDownloadShopifyCsv}
                    className="text-xs font-medium text-neutral-500 hover:text-[#111827] underline cursor-pointer"
                  >
                    Prefer manual import? Download backup CSV
                  </button>
                  {csvDownloaded && (
                    <span className="text-xs font-semibold text-[#059669] inline-flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      CSV saved
                    </span>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
