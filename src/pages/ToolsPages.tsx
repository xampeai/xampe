import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  Check,
  Copy,
  LayoutTemplate,
  Megaphone,
  Search,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { LAYOUT_TEMPLATES, NICHES } from '../data/products';
import { NicheId, PageRoute } from '../types/xampe';

interface ToolsCommonProps {
  onNavigate: (route: PageRoute) => void;
  onUseStoreName: (name: string, niche?: NicheId) => void;
}

const BackToHomeBar: React.FC<{ onNavigate: (route: PageRoute) => void; currentLabel: string }> = ({
  onNavigate,
  currentLabel,
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 mb-8 border-b border-[#E5E7EB]">
    <button
      type="button"
      onClick={() => onNavigate('home')}
      className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-[#111827] cursor-pointer"
    >
      <ArrowLeft className="w-3.5 h-3.5" />
      Back to Store Builder
    </button>
    <div className="text-xs text-neutral-500 flex items-center gap-2">
      <button
        type="button"
        onClick={() => onNavigate('tools-hub')}
        className="hover:text-[#111827] cursor-pointer"
      >
        Free Tools
      </button>
      <span aria-hidden="true">/</span>
      <span className="font-medium text-[#111827]">{currentLabel}</span>
    </div>
  </div>
);

export const FreeToolsHubPage: React.FC<{ onNavigate: (route: PageRoute) => void }> = ({
  onNavigate,
}) => {
  const tools: {
    route: PageRoute;
    title: string;
    subtitle: string;
    detail: string;
    icon: React.ReactNode;
    cta: string;
  }[] = [
    {
      route: 'tool-name-generator',
      title: 'Shopify Business Name Generator',
      subtitle: 'Brand & Domain Ideation',
      detail:
        'Generate 12 clean, memorable store names from any niche keyword or tone, copy instantly, or load straight into the Xampe Store Builder.',
      icon: <Wand2 className="w-5 h-5" />,
      cta: 'Open Name Generator',
    },
    {
      route: 'tool-profit-calculator',
      title: 'Profit Margin & ROAS Calculator',
      subtitle: 'Unit Economics & Break-Even',
      detail:
        'Enter product cost, shipping, retail price, and ad spend CPA to calculate exact net profit per order, profit margin %, and Break-Even ROAS.',
      icon: <Calculator className="w-5 h-5" />,
      cta: 'Open Profit Calculator',
    },
    {
      route: 'tool-ad-hooks',
      title: 'AI Ad Hook & Copy Generator',
      subtitle: 'TikTok & Meta Creative Scripts',
      detail:
        'Pick your niche and product type to produce 5 scroll-stopping video opening hooks, primary ad body copy, and conversion headlines.',
      icon: <Megaphone className="w-5 h-5" />,
      cta: 'Open Ad Hook Generator',
    },
    {
      route: 'tool-theme-analyzer',
      title: 'Shopify Theme & Store Analyzer',
      subtitle: 'Architecture & Conversion Audit',
      detail:
        'Enter a store URL or select your niche to inspect recommended theme structures, essential Shopify apps, and a pre-launch conversion checklist.',
      icon: <LayoutTemplate className="w-5 h-5" />,
      cta: 'Open Theme Analyzer',
    },
  ];

  return (
    <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 sm:mb-10 border-b border-[#E5E7EB]">
        <div>
          <p className="text-xs font-semibold text-[#EA580C] mb-1.5">
            Xampe Free E-Commerce Suite
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#111827]">
            Free Shopify Tools &amp; Calculators
          </h1>
          <p className="text-sm text-neutral-600 mt-2 max-w-2xl">
            Every tool runs directly inside Xampe — 100% free with no sign-up required. Plan your brand name, verify unit margins, write ad hooks, and audit store structure before launch.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-[#EA580C] hover:bg-[#C2410C] rounded-lg transition-colors whitespace-nowrap cursor-pointer self-start sm:self-auto"
        >
          Back to Store Builder
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool) => (
          <div
            key={tool.route}
            className="bg-white border border-[#E5E7EB] rounded-xl p-7 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#FFF7ED] border border-[#FED7AA] flex items-center justify-center text-[#EA580C]">
                  {tool.icon}
                </div>
                <span className="text-xs font-medium text-neutral-500">
                  {tool.subtitle}
                </span>
              </div>
              <h2 className="font-display text-xl font-bold text-[#111827] mb-2">
                {tool.title}
              </h2>
              <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                {tool.detail}
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={() => onNavigate(tool.route)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#EA580C] hover:bg-[#C2410C] rounded-lg transition-colors cursor-pointer"
              >
                <span>{tool.cta}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 1. SHOPIFY BUSINESS NAME GENERATOR
// ==========================================
type NameTone = 'modern' | 'luxury' | 'playful' | 'minimal';

const TONE_SUFFIXES: Record<NameTone, string[]> = {
  modern: ['Supply', 'Lab', 'Goods', 'Studio', 'Co.', 'Works', 'Line', 'Craft'],
  luxury: ['Atelier', 'Maison', 'House', 'Collective', 'Reserve', 'Select'],
  playful: ['Pop', 'Nest', 'Loop', 'Spark', 'Club', 'Buddy', 'Spot'],
  minimal: ['Form', 'Base', 'Root', 'Object', 'Unit', 'Kind', 'Pure'],
};

const TONE_PREFIXES: Record<NameTone, string[]> = {
  modern: ['Kanso', 'Veloce', 'Apex', 'Nord', 'Grid', 'Core'],
  luxury: ['Sable', 'Aurelia', 'Ciel', 'Opal', 'Verve', 'Soleil'],
  playful: ['Milo', 'Pebble', 'Sunny', 'Zest', 'Cozy', 'Breeze'],
  minimal: ['Mono', 'Plain', 'True', 'Calm', 'Even', 'Still'],
};

export const NameGeneratorPage: React.FC<ToolsCommonProps> = ({
  onNavigate,
  onUseStoreName,
}) => {
  const [keyword, setKeyword] = useState('Paws');
  const [tone, setTone] = useState<NameTone>('modern');
  const [seed, setSeed] = useState(0);
  const [copiedName, setCopiedName] = useState<string | null>(null);

  const generatedNames = useMemo(() => {
    const clean = keyword
      .trim()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .split(/\s+/)[0] || 'Verve';
    const cap = clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
    const suffixes = TONE_SUFFIXES[tone];
    const prefixes = TONE_PREFIXES[tone];

    const list: { name: string; domain: string; style: string }[] = [];
    for (let i = 0; i < 12; i++) {
      const sfx = suffixes[(i + seed) % suffixes.length];
      const pfx = prefixes[(i + seed) % prefixes.length];
      let name = '';
      let style = '';

      if (i % 3 === 0) {
        name = `${cap} ${sfx}`;
        style = 'Two-Word Brand';
      } else if (i % 3 === 1) {
        name = `${pfx}${cap}`;
        style = 'Compound Wordmark';
      } else {
        name = `${pfx} & ${cap}`;
        style = 'Editorial Pairing';
      }

      const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const domain = i % 4 === 0 ? `${slug}.co` : `shop${slug}.com`;
      list.push({ name, domain, style });
    }
    return list;
  }, [keyword, tone, seed]);

  const handleCopy = (name: string) => {
    navigator.clipboard?.writeText(name).catch(() => {});
    setCopiedName(name);
    window.setTimeout(() => setCopiedName(null), 1500);
  };

  return (
    <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <BackToHomeBar onNavigate={onNavigate} currentLabel="Shopify Business Name Generator" />

      <div className="mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#111827] mb-2">
          Shopify Business Name Generator
        </h1>
        <p className="text-sm text-neutral-600 max-w-2xl">
          Enter any niche keyword or product focus to generate 12 clean, brandable Shopify store names. Copy any name or click &ldquo;Use This Name in Store Builder&rdquo; to build immediately.
        </p>
      </div>

      <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-4 sm:p-6 mb-8 grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 items-end">
        <div className="md:col-span-5">
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
            Niche or Seed Keyword
          </label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g. Stride, Desk, Paws, Glow, Garden, Cabin"
            className="w-full px-4 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg focus:outline-none focus:border-[#EA580C]"
          />
        </div>

        <div className="md:col-span-4">
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
            Brand Tone
          </label>
          <div className="grid grid-cols-4 gap-1.5 bg-white border border-[#D1D5DB] rounded-lg p-1">
            {(['modern', 'luxury', 'playful', 'minimal'] as NameTone[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTone(t)}
                className={`py-1.5 text-xs font-semibold rounded capitalize cursor-pointer ${
                  tone === t
                    ? 'bg-[#EA580C] text-white'
                    : 'text-neutral-600 hover:text-[#111827]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-3">
          <button
            type="button"
            onClick={() => setSeed((s) => s + 1)}
            className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#EA580C] hover:bg-[#C2410C] rounded-lg transition-colors cursor-pointer"
          >
            Generate 12 New Ideas
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {generatedNames.map((item) => {
          const isCopied = copiedName === item.name;
          return (
            <div
              key={item.name}
              className="bg-white border border-[#E5E7EB] rounded-xl p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                  <span>{item.style}</span>
                  <span className="font-mono-tabular text-[#EA580C]">{item.domain}</span>
                </div>
                <h3 className="font-display text-lg font-bold text-[#111827] mb-4">
                  {item.name}
                </h3>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => handleCopy(item.name)}
                  className="px-3 py-1.5 text-xs font-semibold border border-[#D1D5DB] rounded-md text-neutral-700 hover:border-neutral-500 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#EA580C]" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => onUseStoreName(item.name)}
                  className="flex-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#EA580C] hover:bg-[#C2410C] rounded-md transition-colors cursor-pointer whitespace-nowrap"
                >
                  Use This Name in Store Builder
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 2. PROFIT MARGIN & ROAS CALCULATOR
// ==========================================
export const ProfitCalculatorPage: React.FC<{ onNavigate: (route: PageRoute) => void }> = ({
  onNavigate,
}) => {
  const [productCost, setProductCost] = useState(14);
  const [shippingCost, setShippingCost] = useState(4.5);
  const [sellingPrice, setSellingPrice] = useState(54);
  const [adSpendCpa, setAdSpendCpa] = useState(16);
  const [feePercent, setFeePercent] = useState(2.9);

  const metrics = useMemo(() => {
    const processingFee = sellingPrice * (feePercent / 100) + 0.3;
    const preAdProfit = sellingPrice - productCost - shippingCost - processingFee;
    const netProfit = preAdProfit - adSpendCpa;
    const marginPct = sellingPrice > 0 ? (netProfit / sellingPrice) * 100 : 0;
    const grossMarginBeforeAds =
      sellingPrice > 0 ? (preAdProfit / sellingPrice) * 100 : 0;
    const breakEvenRoas = preAdProfit > 0 ? sellingPrice / preAdProfit : 0;
    const targetRoas20 =
      preAdProfit - sellingPrice * 0.2 > 0
        ? sellingPrice / (preAdProfit - sellingPrice * 0.2)
        : 0;
    const actualRoas = adSpendCpa > 0 ? sellingPrice / adSpendCpa : 0;

    return {
      processingFee,
      preAdProfit,
      netProfit,
      marginPct,
      grossMarginBeforeAds,
      breakEvenRoas,
      targetRoas20,
      actualRoas,
    };
  }, [productCost, shippingCost, sellingPrice, adSpendCpa, feePercent]);

  const volumes = [10, 50, 100, 500];

  return (
    <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <BackToHomeBar onNavigate={onNavigate} currentLabel="Profit Margin & ROAS Calculator" />

      <div className="mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#111827] mb-2">
          Profit Margin &amp; Break-Even ROAS Calculator
        </h1>
        <p className="text-sm text-neutral-600 max-w-2xl">
          Verify real unit economics before scaling paid ads. Calculates net profit per order, true profit margin percentage, and Break-Even ROAS automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Inputs */}
        <div className="lg:col-span-5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-5 sm:p-6 space-y-4">
          <h2 className="font-display text-base font-bold text-[#111827]">
            Order Cost &amp; Pricing Inputs
          </h2>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Product Cost ($ USD)
            </label>
            <input
              type="number"
              min={0}
              step={0.5}
              value={productCost}
              onChange={(e) => setProductCost(Math.max(0, Number(e.target.value)))}
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#D1D5DB] rounded-lg font-mono-tabular focus:outline-none focus:border-[#EA580C]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Shipping Cost ($ USD)
            </label>
            <input
              type="number"
              min={0}
              step={0.5}
              value={shippingCost}
              onChange={(e) => setShippingCost(Math.max(0, Number(e.target.value)))}
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#D1D5DB] rounded-lg font-mono-tabular focus:outline-none focus:border-[#EA580C]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Customer Selling Price ($ USD)
            </label>
            <input
              type="number"
              min={1}
              step={1}
              value={sellingPrice}
              onChange={(e) => setSellingPrice(Math.max(1, Number(e.target.value)))}
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#D1D5DB] rounded-lg font-mono-tabular focus:outline-none focus:border-[#EA580C]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Ad Spend CPA — Cost Per Acquisition ($ USD)
            </label>
            <input
              type="number"
              min={0}
              step={0.5}
              value={adSpendCpa}
              onChange={(e) => setAdSpendCpa(Math.max(0, Number(e.target.value)))}
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#D1D5DB] rounded-lg font-mono-tabular focus:outline-none focus:border-[#EA580C]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Payment Processing Fee (% + $0.30)
            </label>
            <input
              type="number"
              min={0}
              max={15}
              step={0.1}
              value={feePercent}
              onChange={(e) => setFeePercent(Math.max(0, Number(e.target.value)))}
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#D1D5DB] rounded-lg font-mono-tabular focus:outline-none focus:border-[#EA580C]"
            />
          </div>
        </div>

        {/* Right Live Output */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 tabular-nums">
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
              <span className="text-xs font-medium text-neutral-500 block mb-1">
                Net Profit / Order
              </span>
              <span
                className={`text-3xl font-extrabold font-mono-tabular ${
                  metrics.netProfit >= 0 ? 'text-[#059669]' : 'text-red-600'
                }`}
              >
                ${metrics.netProfit.toFixed(2)}
              </span>
              <span className="text-xs text-neutral-500 block mt-1">
                Pre-ad profit: ${metrics.preAdProfit.toFixed(2)}
              </span>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
              <span className="text-xs font-medium text-neutral-500 block mb-1">
                Net Profit Margin
              </span>
              <span
                className={`text-3xl font-extrabold font-mono-tabular ${
                  metrics.marginPct >= 15
                    ? 'text-[#059669]'
                    : metrics.marginPct >= 0
                      ? 'text-amber-600'
                      : 'text-red-600'
                }`}
              >
                {metrics.marginPct.toFixed(1)}%
              </span>
              <span className="text-xs text-neutral-500 block mt-1">
                Gross margin: {metrics.grossMarginBeforeAds.toFixed(1)}%
              </span>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
              <span className="text-xs font-medium text-neutral-500 block mb-1">
                Break-Even ROAS
              </span>
              <span className="text-3xl font-extrabold font-mono-tabular text-[#111827]">
                {metrics.breakEvenRoas > 0 ? `${metrics.breakEvenRoas.toFixed(2)}x` : 'N/A'}
              </span>
              <span className="text-xs text-neutral-500 block mt-1">
                Your ROAS at ${adSpendCpa} CPA: {metrics.actualRoas.toFixed(2)}x
              </span>
            </div>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 sm:p-6 overflow-x-auto">
            <h3 className="font-display text-base font-bold text-[#111827] mb-4">
              Monthly Scale Projections
            </h3>
            <table className="w-full min-w-[480px] text-sm text-left tabular-nums">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-xs text-neutral-500">
                  <th className="py-2 font-semibold">Monthly Orders</th>
                  <th className="py-2 font-semibold text-right">Gross Revenue</th>
                  <th className="py-2 font-semibold text-right">Product + Ship</th>
                  <th className="py-2 font-semibold text-right">Total Ad Spend</th>
                  <th className="py-2 font-semibold text-right">Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {volumes.map((v) => (
                  <tr key={v}>
                    <td className="py-3 font-semibold text-[#111827]">{v} orders</td>
                    <td className="py-3 text-right">${(sellingPrice * v).toLocaleString()}</td>
                    <td className="py-3 text-right">
                      ${((productCost + shippingCost) * v).toLocaleString()}
                    </td>
                    <td className="py-3 text-right">${(adSpendCpa * v).toLocaleString()}</td>
                    <td
                      className={`py-3 text-right font-bold ${
                        metrics.netProfit >= 0 ? 'text-[#059669]' : 'text-red-600'
                      }`}
                    >
                      ${(metrics.netProfit * v).toFixed(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. AI AD HOOK & COPY GENERATOR
// ==========================================
export const AdHookGeneratorPage: React.FC<{ onNavigate: (route: PageRoute) => void }> = ({
  onNavigate,
}) => {
  const [niche, setNiche] = useState<NicheId>('fitness');
  const [productName, setProductName] = useState('PulseMini Percussion Massager');
  const [benefit, setBenefit] = useState('relieves sore shoulders in 3 minutes anywhere');
  const [platform, setPlatform] = useState<'TikTok' | 'Facebook' | 'Instagram Reels'>('TikTok');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const angles = useMemo(() => {
    const p = productName.trim() || 'this essential';
    const b = benefit.trim() || 'saves time every single day';
    const nicheLabel = NICHES[niche].label;

    return [
      {
        angle: 'Problem-Agitation Hook',
        hook: `Stop wasting money on temporary fixes—here is why ${p} ${b}.`,
        primaryCopy: `Most ${nicheLabel.toLowerCase()} routines overcomplicate things. We engineered ${p} so it ${b} without bulky gear or salon appointments. Try it at home for 30 days risk-free.`,
        headline: `Meet ${p} — Built to Perform Daily`,
      },
      {
        angle: 'Before / After Contrast Hook',
        hook: `Watch the difference 60 seconds with ${p} makes on day one.`,
        primaryCopy: `Swipe past generic alternatives. ${p} delivers instant results and ${b}. Tracked shipping directly to your door in 5–8 days.`,
        headline: `Upgrade Your Routine With ${p}`,
      },
      {
        angle: 'Insider Discovery Hook',
        hook: `Why ${nicheLabel.toLowerCase()} enthusiasts quietly switched to ${p} this year.`,
        primaryCopy: `Over 1,200 five-star reviews say the same thing: ${p} ${b}. Clean design, durable build, and backed by our 30-day home trial.`,
        headline: `Rated 4.9/5 — Shop ${p} Today`,
      },
      {
        angle: 'Value Comparison Hook',
        hook: `Get the exact same result as a $240 boutique setup with ${p}.`,
        primaryCopy: `Skip the retail markup. ${p} gives you studio-grade quality at home and ${b}. Free tracked shipping unlocked on orders over $45.`,
        headline: `Premium Quality Without the Markup`,
      },
      {
        angle: '3-Reason Listicle Hook',
        hook: `3 reasons ${p} sold out twice before we restocked this week (${platform} favorite).`,
        primaryCopy: `1. Compact everyday build. 2. ${b.charAt(0).toUpperCase() + b.slice(1)}. 3. 30-day money-back promise. Tap Shop Now before this batch clears out.`,
        headline: `Back in Stock: ${p}`,
      },
    ];
  }, [niche, productName, benefit, platform]);

  const copyBlock = (idx: number, text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedIdx(idx);
    window.setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <BackToHomeBar onNavigate={onNavigate} currentLabel="AI Ad Hook & Copy Generator" />

      <div className="mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#111827] mb-2">
          AI Ad Hook &amp; Copy Generator
        </h1>
        <p className="text-sm text-neutral-600 max-w-2xl">
          Generate five conversion-tested video opening hooks, primary ad copy, and headlines tailored to your niche and product benefit.
        </p>
      </div>

      <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-4 sm:p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
        <div className="lg:col-span-3">
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
            Niche
          </label>
          <select
            value={niche}
            onChange={(e) => setNiche(e.target.value as NicheId)}
            className="w-full px-3 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg focus:outline-none focus:border-[#EA580C]"
          >
            {Object.values(NICHES).map((n) => (
              <option key={n.id} value={n.id}>
                {n.label}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-3">
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
            Product Name
          </label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg focus:outline-none focus:border-[#EA580C]"
          />
        </div>

        <div className="lg:col-span-4">
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
            Core Outcome / Benefit
          </label>
          <input
            type="text"
            value={benefit}
            onChange={(e) => setBenefit(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg focus:outline-none focus:border-[#EA580C]"
          />
        </div>

        <div className="lg:col-span-2">
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
            Channel
          </label>
          <select
            value={platform}
            onChange={(e) =>
              setPlatform(e.target.value as 'TikTok' | 'Facebook' | 'Instagram Reels')
            }
            className="w-full px-3 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg focus:outline-none focus:border-[#EA580C]"
          >
            <option value="TikTok">TikTok</option>
            <option value="Facebook">Facebook</option>
            <option value="Instagram Reels">Instagram Reels</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {angles.map((item, idx) => {
          const fullText = `HOOK: ${item.hook}\nPRIMARY TEXT: ${item.primaryCopy}\nHEADLINE: ${item.headline}`;
          const isCopied = copiedIdx === idx;
          return (
            <div
              key={item.angle}
              className="bg-white border border-[#E5E7EB] rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#EA580C]">
                  <span>0{idx + 1}. {item.angle}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-neutral-500">{platform}</span>
                </div>
                <p className="font-display text-base font-bold text-[#111827]">
                  “{item.hook}”
                </p>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  <strong>Primary Ad Text:</strong> {item.primaryCopy}
                </p>
                <p className="text-xs text-neutral-500">
                  <strong>Headline:</strong> {item.headline}
                </p>
              </div>
              <button
                type="button"
                onClick={() => copyBlock(idx, fullText)}
                className="px-4 py-2 text-xs font-semibold border border-[#D1D5DB] hover:border-neutral-500 rounded-lg text-neutral-800 inline-flex items-center gap-1.5 shrink-0 cursor-pointer self-start"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#EA580C]" />
                    Copied All
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Ad Pack
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 4. SHOPIFY THEME & STORE ANALYZER
// ==========================================
export const ThemeAnalyzerPage: React.FC<ToolsCommonProps> = ({
  onNavigate,
  onUseStoreName,
}) => {
  const [storeUrl, setStoreUrl] = useState('hearthandhound.com');
  const [niche, setNiche] = useState<NicheId>('pets');
  const [analyzed, setAnalyzed] = useState(true);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    c1: true,
    c2: true,
    c3: false,
    c4: true,
    c5: false,
    c6: false,
  });

  const checklist = [
    { id: 'c1', label: 'Above-the-fold hero headline fits cleanly with single primary CTA' },
    { id: 'c2', label: 'Custom .com domain connected (no .myshopify.com URL visible to buyers)' },
    { id: 'c3', label: 'Exact delivery window (e.g., 5–8 days) stated under Add to Cart' },
    { id: 'c4', label: 'Shop Pay and Apple Pay express wallets enabled in checkout' },
    { id: 'c5', label: '3-part Abandoned Cart email recovery flow active' },
    { id: 'c6', label: 'Minimum 4–6 cohesive niche products (zero mismatched clutter)' },
  ];

  const completedCount = checklist.filter((c) => checkedItems[c.id]).length;
  const recommendedLayout =
    niche === 'fashion' || niche === 'car'
      ? LAYOUT_TEMPLATES[2]
      : niche === 'fitness' || niche === 'smarthome'
        ? LAYOUT_TEMPLATES[1]
        : LAYOUT_TEMPLATES[0];

  const essentialApps = [
    { name: 'Judge.me Product Reviews', purpose: 'Photo reviews & star ratings under product titles', cost: 'Free plan available' },
    { name: 'Klaviyo Email & SMS', purpose: 'Abandoned cart & 7-day post-purchase cross-sell flows', cost: 'Free up to 250 contacts' },
    { name: 'DSers / Private Fulfillment Sync', purpose: 'Automated order routing & live tracking number updates', cost: 'Free – $19/mo' },
    { name: 'TinyIMG Speed & SEO', purpose: 'Image compression & clean search schema optimization', cost: 'Pay-as-you-go' },
  ];

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    setAnalyzed(true);
  };

  return (
    <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <BackToHomeBar onNavigate={onNavigate} currentLabel="Shopify Theme & Store Analyzer" />

      <div className="mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#111827] mb-2">
          Shopify Theme &amp; Store Analyzer
        </h1>
        <p className="text-sm text-neutral-600 max-w-2xl">
          Enter any store URL or pick your niche to inspect recommended theme structures, essential conversion apps, and a live launch readiness checklist.
        </p>
      </div>

      <form
        onSubmit={handleAnalyze}
        className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-4 sm:p-6 mb-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
      >
        <div className="md:col-span-5">
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
            Store URL or Brand Name
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={storeUrl}
              onChange={(e) => setStoreUrl(e.target.value)}
              placeholder="yourbrand.com"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg focus:outline-none focus:border-[#EA580C]"
            />
          </div>
        </div>

        <div className="md:col-span-4">
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
            Target Niche
          </label>
          <select
            value={niche}
            onChange={(e) => setNiche(e.target.value as NicheId)}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg focus:outline-none focus:border-[#EA580C]"
          >
            {Object.values(NICHES).map((n) => (
              <option key={n.id} value={n.id}>
                {n.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <button
            type="submit"
            className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#EA580C] hover:bg-[#C2410C] rounded-lg transition-colors cursor-pointer"
          >
            Analyze Store Stack
          </button>
        </div>
      </form>

      {analyzed && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <span className="text-xs font-semibold text-[#EA580C]">
                    Recommended Architecture for {storeUrl || NICHES[niche].label}
                  </span>
                  <h2 className="font-display text-xl font-bold text-[#111827] mt-0.5">
                    {recommendedLayout.name} Theme Structure
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => onUseStoreName('', niche)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#EA580C] hover:bg-[#C2410C] rounded-lg inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Build Matching Store in Xampe
                </button>
              </div>
              <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                {recommendedLayout.description} For <strong>{NICHES[niche].label}</strong> stores averaging {NICHES[niche].avgAov} order values, keep product cards clean in a 3-column desktop grid and focus above-the-fold real estate on one clear benefit statement.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-neutral-100 text-xs">
                <div className="bg-[#FAFAFA] p-3 rounded-lg border border-[#E5E7EB]">
                  <span className="text-neutral-500 block">Target Margin</span>
                  <span className="font-bold text-[#111827]">{NICHES[niche].avgMargin}</span>
                </div>
                <div className="bg-[#FAFAFA] p-3 rounded-lg border border-[#E5E7EB]">
                  <span className="text-neutral-500 block">Ideal SKU Count</span>
                  <span className="font-bold text-[#111827]">4 – 6 Focused Items</span>
                </div>
                <div className="bg-[#FAFAFA] p-3 rounded-lg border border-[#E5E7EB]">
                  <span className="text-neutral-500 block">Page Speed Target</span>
                  <span className="font-bold text-[#EA580C]">&lt; 1.8s LCP</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 sm:p-6">
              <h3 className="font-display text-base font-bold text-[#111827] mb-4">
                Essential Lean Shopify App Stack (Zero Bloat)
              </h3>
              <div className="divide-y divide-neutral-100">
                {essentialApps.map((app) => (
                  <div key={app.name} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-[#111827]">{app.name}</p>
                      <p className="text-xs text-neutral-500">{app.purpose}</p>
                    </div>
                    <span className="text-xs font-medium text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded self-start sm:self-auto shrink-0">
                      {app.cost}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white border border-[#E5E7EB] rounded-xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-base font-bold text-[#111827]">
                Conversion Readiness Checklist
              </h3>
              <span className="text-xs font-bold text-[#EA580C] tabular-nums">
                {completedCount} / {checklist.length} Checked
              </span>
            </div>
            <div className="space-y-3">
              {checklist.map((item) => {
                const checked = Boolean(checkedItems[item.id]);
                return (
                  <label
                    key={item.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      checked
                        ? 'bg-[#FFF7ED] border-[#FED7AA]'
                        : 'bg-[#FAFAFA] border-[#E5E7EB]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setCheckedItems((prev) => ({
                          ...prev,
                          [item.id]: !prev[item.id],
                        }))
                      }
                      className="mt-0.5 accent-[#EA580C]"
                    />
                    <span className="text-xs text-neutral-700 leading-relaxed">
                      {item.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
