import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Mail,
  Search,
  Star,
} from 'lucide-react';
import {
  BLOG_ARTICLES,
  EXTENDED_FAQS,
  FEATURE_PAGES,
  GLOSSARY_TERMS,
  GUIDES,
  NICHE_SOLUTIONS,
  SUCCESS_STORIES,
} from '../data/contentPages';
import { NICHES, WINNING_PRODUCTS, getMarginPercent } from '../data/products';
import { NicheId, PageRoute } from '../types/xampe';
import { HeroImage, ProductStudioVisual } from '../components/ProductStudioVisual';

interface ContentNavProps {
  onNavigate: (route: PageRoute) => void;
  onBuildNicheStore: (niche?: NicheId) => void;
}

const PageTopBar: React.FC<{
  onNavigate: (route: PageRoute) => void;
  sectionLabel: string;
}> = ({ onNavigate, sectionLabel }) => (
  <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#E5E7EB]">
    <button
      type="button"
      onClick={() => onNavigate('home')}
      className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-[#111827] cursor-pointer"
    >
      <ArrowLeft className="w-3.5 h-3.5" />
      Back to Home
    </button>
    <span className="text-xs font-medium text-neutral-500">{sectionLabel}</span>
  </div>
);

const BuildStoreCtaBanner: React.FC<{
  onBuildNicheStore: (niche?: NicheId) => void;
  niche?: NicheId;
  headline?: string;
}> = ({ onBuildNicheStore, niche, headline }) => (
  <div className="mt-12 sm:mt-14 bg-[#111827] text-white rounded-xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-8">
    <div>
      <p className="text-xs font-semibold text-orange-400 mb-1.5">
        Xampe Store Builder · 100% Free • No Sign-Up Required
      </p>
      <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-2">
        {headline || 'Create a Ready-to-Launch Shopify Dropshipping Store in 60 Seconds'}
      </h3>
      <p className="text-sm text-neutral-300 max-w-2xl">
        Pick your niche, inspect verified supplier margins, preview 5 high-converting themes, and upload directly to Shopify in 1 click.
      </p>
    </div>
    <button
      type="button"
      onClick={() => onBuildNicheStore(niche)}
      className="px-6 py-3 text-sm font-semibold text-white bg-[#EA580C] hover:bg-[#C2410C] rounded-lg transition-colors whitespace-nowrap shrink-0 inline-flex items-center justify-center gap-2 cursor-pointer self-start md:self-auto"
    >
      <span>Build My Store Now</span>
      <ArrowRight className="w-4 h-4" />
    </button>
  </div>
);

// ==========================================
// FEATURES DETAIL PAGES
// ==========================================
export const FeatureDetailPage: React.FC<
  ContentNavProps & { route: PageRoute }
> = ({ route, onNavigate, onBuildNicheStore }) => {
  const page = FEATURE_PAGES[route] ?? FEATURE_PAGES['feature-winning-products'];

  return (
    <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <PageTopBar onNavigate={onNavigate} sectionLabel="Xampe Platform Features" />

      <div className="max-w-3xl mb-8 sm:mb-10">
        <p className="text-xs font-semibold text-[#EA580C] mb-2">{page.kicker}</p>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#111827] leading-tight mb-4">
          {page.title}
        </h1>
        <p className="text-base text-neutral-600 leading-relaxed">{page.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
        {page.highlights.map((h) => (
          <div
            key={h.label}
            className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-6"
          >
            <span className="text-xs font-medium text-neutral-500 block mb-1">
              {h.label}
            </span>
            <span className="font-display text-2xl font-extrabold text-[#111827] block mb-1 tabular-nums">
              {h.value}
            </span>
            <span className="text-xs text-neutral-600">{h.detail}</span>
          </div>
        ))}
      </div>

      <div className="max-w-3xl space-y-10">
        {page.sections.map((sec) => (
          <section key={sec.heading} className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-[#111827]">
              {sec.heading}
            </h2>
            {sec.paragraphs.map((p) => (
              <p key={p} className="text-[15px] text-neutral-700 leading-[1.75]">
                {p}
              </p>
            ))}
            {sec.bullets && (
              <ul className="space-y-2.5 pt-2">
                {sec.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-neutral-700">
                    <CheckCircle2 className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
            {sec.proTip && (
              <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg p-5 mt-4">
                <p className="text-xs font-bold text-[#EA580C] mb-1">Pro Tip</p>
                <p className="text-sm text-neutral-700 leading-relaxed">{sec.proTip}</p>
              </div>
            )}
          </section>
        ))}
      </div>

      <BuildStoreCtaBanner onBuildNicheStore={onBuildNicheStore} />
    </div>
  );
};

// ==========================================
// NICHE SOLUTION LANDING PAGES
// ==========================================
export const NicheSolutionPage: React.FC<
  ContentNavProps & { route: PageRoute }
> = ({ route, onNavigate, onBuildNicheStore }) => {
  const content = NICHE_SOLUTIONS[route] ?? NICHE_SOLUTIONS['solution-pets'];
  const nicheInfo = NICHES[content.nicheId];
  const sampleProducts = WINNING_PRODUCTS.filter(
    (p) => p.niche === content.nicheId
  ).slice(0, 3);

  return (
    <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <PageTopBar onNavigate={onNavigate} sectionLabel={`Solutions · ${nicheInfo.label}`} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center mb-12">
        <div className="lg:col-span-7">
          <p className="text-xs font-semibold text-[#EA580C] mb-2">
            Shopify Niche Solution · {nicheInfo.label}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#111827] leading-tight mb-4">
            {content.title}
          </h1>
          <p className="text-base text-neutral-600 leading-relaxed mb-6">
            {content.subtitle}
          </p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-7">
            <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg px-4 py-3 tabular-nums">
              <span className="text-xs text-neutral-500 block">Avg. Gross Margin</span>
              <span className="text-xl font-bold text-[#059669]">{content.avgMargin}</span>
            </div>
            <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg px-4 py-3 tabular-nums">
              <span className="text-xs text-neutral-500 block">Typical Order Value</span>
              <span className="text-xl font-bold text-[#111827]">{content.avgAov}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onBuildNicheStore(content.nicheId)}
            className="px-6 py-3 text-sm font-semibold text-white bg-[#EA580C] hover:bg-[#C2410C] rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Create {nicheInfo.shortLabel} Store Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="lg:col-span-5 rounded-xl overflow-hidden border border-[#E5E7EB] h-[240px] sm:h-[300px]">
          <HeroImage
            src={nicheInfo.heroImages[0].src}
            alt={nicheInfo.heroImages[0].alt}
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Top Trending Sub-Niches */}
      <section className="mb-12">
        <h2 className="font-display text-xl font-bold text-[#111827] mb-4">
          Top Trending Sub-Niches &amp; Price Benchmarks
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {content.topSubNiches.map((sub) => (
            <div
              key={sub.name}
              className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-5"
            >
              <p className="text-xs font-semibold text-[#EA580C] mb-1 tabular-nums">
                Retail Range: {sub.typicalPrice}
              </p>
              <h3 className="font-display text-base font-bold text-[#111827] mb-1.5">
                {sub.name}
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">{sub.demandNote}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sample Winning Products */}
      <section className="mb-12">
        <h2 className="font-display text-xl font-bold text-[#111827] mb-4">
          Sample Winning Products Included in This Niche
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sampleProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden"
            >
              <ProductStudioVisual
                imageUrl={p.imageUrl}
                imagePosition={p.imagePosition}
                productName={p.name}
              />
              <div className="p-4">
                <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                  <span>{p.category}</span>
                  <span className="text-[#059669] font-semibold tabular-nums">
                    {getMarginPercent(p)}% Margin
                  </span>
                </div>
                <h4 className="font-display text-sm font-bold text-[#111827] mb-1">
                  {p.name}
                </h4>
                <p className="text-xs text-neutral-600 mb-3">{p.shortDescription}</p>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-100 tabular-nums">
                  <span className="text-neutral-500">Cost: ${p.supplierCost}</span>
                  <span className="font-bold text-[#111827]">Retail: ${p.retailPrice}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Educational Sections */}
      <div className="max-w-3xl space-y-8">
        {content.sections.map((sec) => (
          <section key={sec.heading} className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-[#111827]">
              {sec.heading}
            </h2>
            {sec.paragraphs.map((p) => (
              <p key={p} className="text-[15px] text-neutral-700 leading-[1.75]">
                {p}
              </p>
            ))}
            {sec.bullets && (
              <ul className="space-y-2 pt-1">
                {sec.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-neutral-700">
                    <CheckCircle2 className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
            {sec.proTip && (
              <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg p-5">
                <p className="text-xs font-bold text-[#EA580C] mb-1">Niche Tip</p>
                <p className="text-sm text-neutral-700 leading-relaxed">{sec.proTip}</p>
              </div>
            )}
          </section>
        ))}
      </div>

      <BuildStoreCtaBanner
        onBuildNicheStore={onBuildNicheStore}
        niche={content.nicheId}
        headline={`Generate Your ${nicheInfo.label} Shopify Store in 60 Seconds`}
      />
    </div>
  );
};

// ==========================================
// GUIDES HUB & INDIVIDUAL GUIDE ARTICLES
// ==========================================
export const GuidesHubPage: React.FC<ContentNavProps> = ({
  onNavigate,
  onBuildNicheStore,
}) => {
  const guideList = Object.values(GUIDES);

  return (
    <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <PageTopBar onNavigate={onNavigate} sectionLabel="E-Commerce Playbooks & Guides" />

      <div className="mb-10">
        <p className="text-xs font-semibold text-[#EA580C] mb-2">
          Xampe Academy · Practical Documentation
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#111827] mb-2">
          Shopify Dropshipping Guides &amp; Playbooks
        </h1>
        <p className="text-sm text-neutral-600 max-w-2xl">
          Actionable, step-by-step guides written for new and scaling store owners—covering product research, AI workflows, TikTok ads, SEO, and store setup.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {guideList.map((g) => (
          <div
            key={g.route}
            className="bg-white border border-[#E5E7EB] rounded-xl p-6 flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-medium text-[#EA580C] block mb-2">
                {g.category}
              </span>
              <h2 className="font-display text-lg font-bold text-[#111827] mb-2 leading-snug">
                {g.title}
              </h2>
              <p className="text-xs text-neutral-600 leading-relaxed mb-5">
                {g.subtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate(g.route)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#111827] hover:text-[#EA580C] cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Read Full Guide</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-base font-bold text-[#111827]">
              Dropshipping Glossary
            </h3>
            <p className="text-xs text-neutral-600 mt-1">
              14 essential metrics explained: AOV, ROAS, CPA, Margin, Fulfillment, SKU, and more.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('glossary')}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#EA580C] hover:bg-[#C2410C] rounded-lg cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            Open Glossary
          </button>
        </div>

        <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-base font-bold text-[#111827]">
              Xampe E-Commerce Blog
            </h3>
            <p className="text-xs text-neutral-600 mt-1">
              Deep-dive articles on product scoring, cold-traffic CRO, and reading ad metrics.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('blog')}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#EA580C] hover:bg-[#C2410C] rounded-lg cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            Read Blog
          </button>
        </div>
      </div>

      <BuildStoreCtaBanner onBuildNicheStore={onBuildNicheStore} />
    </div>
  );
};

export const GuideArticlePage: React.FC<
  ContentNavProps & { route: PageRoute }
> = ({ route, onNavigate, onBuildNicheStore }) => {
  const guide = GUIDES[route] ?? GUIDES['guide-dropship-shopify'];
  const related = Object.values(GUIDES)
    .filter((g) => g.route !== guide.route)
    .slice(0, 3);

  return (
    <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#E5E7EB]">
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
            onClick={() => onNavigate('guides-hub')}
            className="hover:text-[#111827] cursor-pointer"
          >
            All Guides
          </button>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-[#111827]">{guide.readTime}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        <article className="lg:col-span-8">
          <div className="text-xs text-neutral-500 flex items-center gap-2 mb-3">
            <span className="font-semibold text-[#EA580C]">{guide.category}</span>
            <span aria-hidden="true">·</span>
            <span>{guide.updatedAt}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#111827] leading-tight mb-4">
            {guide.title}
          </h1>
          <p className="text-base text-neutral-600 leading-relaxed pb-8 mb-8 border-b border-[#E5E7EB]">
            {guide.subtitle}
          </p>

          <div className="space-y-9">
            {guide.sections.map((sec) => (
              <section key={sec.heading} className="space-y-4">
                <h2 className="font-display text-2xl font-bold text-[#111827]">
                  {sec.heading}
                </h2>
                {sec.paragraphs.map((p) => (
                  <p key={p} className="text-[15px] text-neutral-700 leading-[1.8]">
                    {p}
                  </p>
                ))}
                {sec.bullets && (
                  <ul className="space-y-2.5 pt-2">
                    {sec.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2.5 text-sm text-neutral-700">
                        <CheckCircle2 className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {sec.proTip && (
                  <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg p-5">
                    <p className="text-xs font-bold text-[#EA580C] mb-1">Key Takeaway</p>
                    <p className="text-sm text-neutral-700 leading-relaxed">{sec.proTip}</p>
                  </div>
                )}
              </section>
            ))}
          </div>
        </article>

        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-6">
            <h3 className="font-display text-base font-bold text-[#111827] mb-3">
              Related Guides
            </h3>
            <div className="space-y-4">
              {related.map((r) => (
                <button
                  key={r.route}
                  type="button"
                  onClick={() => onNavigate(r.route)}
                  className="block text-left w-full pb-3 border-b border-neutral-200 last:border-none last:pb-0 cursor-pointer group"
                >
                  <span className="text-[11px] font-medium text-[#EA580C] block mb-0.5">
                    {r.readTime}
                  </span>
                  <span className="text-sm font-semibold text-[#111827] group-hover:text-[#EA580C] transition-colors">
                    {r.title}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#111827] text-white rounded-xl p-6">
            <h4 className="font-display text-base font-bold mb-2">
              Skip Manual Theme Setup
            </h4>
            <p className="text-xs text-neutral-300 leading-relaxed mb-4">
              Create a custom dropshipping store with 6 winning products and verified margins in 60 seconds — 100% free.
            </p>
            <button
              type="button"
              onClick={() => onBuildNicheStore()}
              className="w-full py-2.5 text-xs font-semibold bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-lg cursor-pointer"
            >
              Create Dropshipping Store
            </button>
          </div>
        </aside>
      </div>

      <BuildStoreCtaBanner onBuildNicheStore={onBuildNicheStore} />
    </div>
  );
};

// ==========================================
// GLOSSARY PAGE
// ==========================================
export const GlossaryPage: React.FC<ContentNavProps> = ({
  onNavigate,
  onBuildNicheStore,
}) => {
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState<'All' | 'Financial' | 'Marketing' | 'Operations'>('All');

  const filtered = useMemo(() => {
    return GLOSSARY_TERMS.filter((item) => {
      const matchesCat = catFilter === 'All' || item.category === catFilter;
      const q = query.trim().toLowerCase();
      const matchesQ =
        !q ||
        item.term.toLowerCase().includes(q) ||
        item.fullName.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q);
      return matchesCat && matchesQ;
    });
  }, [query, catFilter]);

  return (
    <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <PageTopBar onNavigate={onNavigate} sectionLabel="E-Commerce Glossary" />

      <div className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#111827] mb-2">
            Dropshipping &amp; Shopify Metrics Glossary
          </h1>
          <p className="text-sm text-neutral-600 max-w-2xl">
            Plain-English definitions and exact formulas for every core financial, marketing, and fulfillment term used in e-commerce.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search terms (e.g. ROAS, SKU)..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1 p-1 bg-neutral-100 rounded-lg self-start">
            {(['All', 'Financial', 'Marketing', 'Operations'] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCatFilter(c)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer ${
                  catFilter === c
                    ? 'bg-white text-[#111827]'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((entry) => (
          <div
            key={entry.term}
            className="bg-white border border-[#E5E7EB] rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-display text-lg font-extrabold text-[#111827]">
                {entry.term}
              </span>
              <span className="text-xs font-medium text-[#EA580C]">
                {entry.category}
              </span>
            </div>
            <p className="text-xs font-semibold text-neutral-500 mb-2">
              {entry.fullName}
            </p>
            <p className="text-sm text-neutral-700 leading-relaxed mb-3">
              {entry.definition}
            </p>
            <div className="bg-[#FAFAFA] border border-neutral-200 rounded-md px-3 py-2 text-xs text-neutral-600 font-mono-tabular">
              {entry.formulaOrExample}
            </div>
          </div>
        ))}
      </div>

      <BuildStoreCtaBanner onBuildNicheStore={onBuildNicheStore} />
    </div>
  );
};

// ==========================================
// SUCCESS STORIES PAGE
// ==========================================
export const SuccessStoriesPage: React.FC<ContentNavProps> = ({
  onNavigate,
  onBuildNicheStore,
}) => {
  return (
    <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <PageTopBar onNavigate={onNavigate} sectionLabel="Founder Case Studies" />

      <div className="mb-10">
        <p className="text-xs font-semibold text-[#EA580C] mb-2">
          Verified Operator Playbooks
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#111827] mb-2">
          Beginner-to-Profitable Store Success Stories
        </h1>
        <p className="text-sm text-neutral-600 max-w-2xl">
          How independent founders launched focused niche Shopify stores using Xampe’s curated product selection and unit-economics workflow.
        </p>
      </div>

      <div className="space-y-8">
        {SUCCESS_STORIES.map((story) => (
          <article
            key={story.id}
            className="bg-white border border-[#E5E7EB] rounded-xl p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8"
          >
            <div className="lg:col-span-4 bg-[#FAFAFA] border border-neutral-200 rounded-xl p-5 sm:p-6 flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-[#EA580C] mb-1">
                  {story.nicheLabel}
                </p>
                <h2 className="font-display text-xl font-bold text-[#111827]">
                  {story.storeName}
                </h2>
                <p className="text-xs text-neutral-500 mb-5">
                  Founded by {story.founder} · {story.location}
                </p>

                <div className="space-y-3 border-t border-neutral-200 pt-4 text-xs tabular-nums">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Monthly Revenue</span>
                    <span className="font-bold text-[#111827]">{story.monthlyRevenue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Net Profit Margin</span>
                    <span className="font-bold text-[#059669]">{story.netMargin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Starting Budget</span>
                    <span className="font-semibold text-neutral-800">{story.startingBudget}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Timeline</span>
                    <span className="font-semibold text-neutral-800">{story.timeframe}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onBuildNicheStore(story.niche)}
                className="mt-6 w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#EA580C] hover:bg-[#C2410C] rounded-lg transition-colors cursor-pointer"
              >
                Build a {story.nicheLabel} Store
              </button>
            </div>

            <div className="lg:col-span-8 flex flex-col justify-between">
              <div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-[#111827] mb-4">
                  {story.headline}
                </h3>
                <div className="space-y-3.5 mb-6">
                  {story.storyParagraphs.map((p) => (
                    <p key={p} className="text-[15px] text-neutral-700 leading-relaxed">
                      {p}
                    </p>
                  ))}
                </div>
              </div>

              <div className="border-t border-neutral-200 pt-4">
                <p className="text-xs font-bold text-[#111827] mb-2">
                  Key Execution Decisions:
                </p>
                <ul className="space-y-1.5">
                  {story.keyTakeaways.map((k) => (
                    <li key={k} className="flex items-start gap-2 text-xs text-neutral-600">
                      <Star className="w-3.5 h-3.5 text-[#EA580C] shrink-0 mt-0.5" />
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>

      <BuildStoreCtaBanner onBuildNicheStore={onBuildNicheStore} />
    </div>
  );
};

// ==========================================
// BLOG PAGE
// ==========================================
export const BlogPage: React.FC<ContentNavProps> = ({
  onNavigate,
  onBuildNicheStore,
}) => {
  const [activeId, setActiveId] = useState<string>(BLOG_ARTICLES[0].id);
  const currentArticle =
    BLOG_ARTICLES.find((a) => a.id === activeId) ?? BLOG_ARTICLES[0];

  return (
    <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <PageTopBar onNavigate={onNavigate} sectionLabel="Xampe E-Commerce Blog" />

      <div className="mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#111827] mb-2">
          Xampe E-Commerce &amp; Growth Blog
        </h1>
        <p className="text-sm text-neutral-600">
          Practical research notes on product selection, storefront UX, and paid media testing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Article Selector List */}
        <div className="lg:col-span-4 space-y-3">
          {BLOG_ARTICLES.map((art) => {
            const active = art.id === currentArticle.id;
            return (
              <button
                key={art.id}
                type="button"
                onClick={() => setActiveId(art.id)}
                className={`w-full text-left p-5 rounded-xl border transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#FAFAFA] border-[#EA580C]'
                    : 'bg-white border-[#E5E7EB] hover:border-neutral-400'
                }`}
              >
                <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1.5">
                  <span className="font-semibold text-[#EA580C]">{art.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{art.readTime}</span>
                </div>
                <h2 className="font-display text-sm font-bold text-[#111827] leading-snug mb-1.5">
                  {art.title}
                </h2>
                <p className="text-xs text-neutral-600 line-clamp-2">{art.excerpt}</p>
              </button>
            );
          })}
        </div>

        {/* Full Readable Article */}
        <article className="lg:col-span-8 bg-white border border-[#E5E7EB] rounded-xl p-5 sm:p-8">
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-3">
            <span className="font-semibold text-[#EA580C]">{currentArticle.category}</span>
            <span aria-hidden="true">·</span>
            <span>{currentArticle.publishedAt}</span>
            <span aria-hidden="true">·</span>
            <span>{currentArticle.readTime}</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#111827] leading-tight mb-3">
            {currentArticle.title}
          </h2>
          <p className="text-xs font-medium text-neutral-500 pb-6 mb-6 border-b border-neutral-200">
            By {currentArticle.author}
          </p>

          <div className="space-y-8">
            {currentArticle.sections.map((sec) => (
              <section key={sec.heading} className="space-y-4">
                <h3 className="font-display text-xl font-bold text-[#111827]">
                  {sec.heading}
                </h3>
                {sec.paragraphs.map((p) => (
                  <p key={p} className="text-[15px] text-neutral-700 leading-[1.8]">
                    {p}
                  </p>
                ))}
                {sec.bullets && (
                  <ul className="space-y-2 pt-1">
                    {sec.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2.5 text-sm text-neutral-700">
                        <CheckCircle2 className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {sec.proTip && (
                  <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg p-5">
                    <p className="text-xs font-bold text-[#EA580C] mb-1">Editor Note</p>
                    <p className="text-sm text-neutral-700 leading-relaxed">{sec.proTip}</p>
                  </div>
                )}
              </section>
            ))}
          </div>
        </article>
      </div>

      <BuildStoreCtaBanner onBuildNicheStore={onBuildNicheStore} />
    </div>
  );
};

// ==========================================
// FAQ PAGE
// ==========================================
export const FaqPage: React.FC<ContentNavProps> = ({
  onNavigate,
  onBuildNicheStore,
}) => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <PageTopBar onNavigate={onNavigate} sectionLabel="Help & FAQ" />

      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#111827] mb-2">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-neutral-600">
            Everything you need to know about Xampe’s free dropshipping store builder, winning products, pricing, and 1-click Shopify upload.
          </p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl divide-y divide-[#E5E7EB]">
          {EXTENDED_FAQS.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full px-5 sm:px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-neutral-50 cursor-pointer"
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
      </div>

      <BuildStoreCtaBanner onBuildNicheStore={onBuildNicheStore} />
    </div>
  );
};

// ==========================================
// PRIVACY POLICY & TERMS OF SERVICE
// ==========================================
export const LegalPage: React.FC<{
  type: 'privacy' | 'terms';
  onNavigate: (route: PageRoute) => void;
}> = ({ type, onNavigate }) => {
  const isPrivacy = type === 'privacy';

  return (
    <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <PageTopBar
        onNavigate={onNavigate}
        sectionLabel={isPrivacy ? 'Legal · Privacy Policy' : 'Legal · Terms of Service'}
      />

      <div className="max-w-3xl space-y-6 text-[15px] text-neutral-700 leading-[1.8]">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#111827]">
          {isPrivacy ? 'Privacy Policy — Xampe (xampe.com)' : 'Terms of Service — Xampe (xampe.com)'}
        </h1>
        <p className="text-xs text-neutral-500">Effective Date: November 1, 2026</p>

        {isPrivacy ? (
          <>
            <p>
              Xampe (“we,” “our,” or “us”) respects the privacy of visitors using xampe.com. This Privacy Policy describes what information is processed when you use our interactive dropshipping store builder, e-commerce calculators, and support contact forms.
            </p>
            <h2 className="font-display text-xl font-bold text-[#111827] pt-2">
              1. Information You Provide Voluntarily
            </h2>
            <p>
              Store names, niche selections, product cost figures, and calculator inputs entered inside Xampe tools are processed locally in your browser session to generate previews and connect to Shopify when you authorize 1-click upload. When you submit our Contact Support form, we collect only the name, email address, and message content you choose to submit so our team at support@xampe.com can respond.
            </p>
            <h2 className="font-display text-xl font-bold text-[#111827] pt-2">
              2. No Sale of Personal Data
            </h2>
            <p>
              Xampe does not sell, rent, or trade your personal contact information or generated brand names to third-party data brokers or competing merchants.
            </p>
            <h2 className="font-display text-xl font-bold text-[#111827] pt-2">
              3. Contact &amp; Data Requests
            </h2>
            <p>
              To request deletion or clarification regarding any support correspondence, write to support@xampe.com with the subject line &ldquo;Privacy Inquiry.&rdquo;
            </p>
          </>
        ) : (
          <>
            <p>
              By accessing xampe.com and using Xampe’s dropshipping store builder, product margin tools, and educational guides, you agree to these Terms of Service.
            </p>
            <h2 className="font-display text-xl font-bold text-[#111827] pt-2">
              1. Permitted Commercial Use
            </h2>
            <p>
              You are free to upload, customize, and launch store blueprints, product descriptions, ad hooks, and catalogs created on Xampe directly into your own Shopify merchant storefronts for commercial operation.
            </p>
            <h2 className="font-display text-xl font-bold text-[#111827] pt-2">
              2. Financial &amp; Profit Estimates Disclaimer
            </h2>
            <p>
              Supplier costs, recommended retail prices, profit margins, and Break-Even ROAS projections displayed inside Xampe tools are educational benchmarks based on typical e-commerce unit economics. Actual merchant profitability depends on your chosen fulfillment partner, shipping region, ad platform CPMs, and store conversion performance.
            </p>
            <h2 className="font-display text-xl font-bold text-[#111827] pt-2">
              3. Third-Party Platforms
            </h2>
            <p>
              Xampe is an independent e-commerce SaaS tool and is not formally affiliated with or endorsed by Shopify Inc. For assistance, reach our team at support@xampe.com.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

// ==========================================
// CONTACT SUPPORT PAGE
// ==========================================
export const ContactPage: React.FC<{ onNavigate: (route: PageRoute) => void }> = ({
  onNavigate,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('Store Upload & Shopify Setup');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.includes('@') || message.trim().length < 10) {
      setError('Please enter your name, a valid email address, and a message of at least 10 characters.');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  return (
    <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <PageTopBar onNavigate={onNavigate} sectionLabel="Contact & Support" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        <div className="lg:col-span-5 space-y-6">
          <div>
            <p className="text-xs font-semibold text-[#EA580C] mb-2">
              Xampe Merchant Support
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#111827] mb-3">
              Contact Our Support Team
            </h1>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Have a question about uploading your store to Shopify, picking a niche, or calculating your ad break-even thresholds? Send us a note below.
            </p>
          </div>

          <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[#EA580C] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-neutral-500">Direct Support Email</p>
                <p className="text-sm font-bold text-[#111827]">support@xampe.com</p>
                <p className="text-xs text-neutral-500 mt-1">
                  Typical reply window: within 1 business day
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white border border-[#E5E7EB] rounded-xl p-5 sm:p-8">
          {submitted ? (
            <div className="py-10 text-center space-y-4">
              <CheckCircle2 className="w-10 h-10 text-[#EA580C] mx-auto" />
              <h2 className="font-display text-xl font-bold text-[#111827]">
                Message Received
              </h2>
              <p className="text-sm text-neutral-600 max-w-md mx-auto">
                Thank you, {name}. Our support desk at <strong>support@xampe.com</strong> has logged your inquiry regarding <strong>{topic}</strong> and will reply to <strong>{email}</strong>.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setMessage('');
                }}
                className="px-4 py-2 text-xs font-semibold border border-neutral-300 rounded-lg text-neutral-700 cursor-pointer"
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Taylor"
                    className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Topic
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg bg-white"
                >
                  <option>Store Export &amp; Shopify Setup</option>
                  <option>Product Selection &amp; Suppliers</option>
                  <option>Free Tools &amp; Margin Calculators</option>
                  <option>Partnerships &amp; Press</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Message
                </label>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe how our team can help..."
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg"
                />
              </div>

              {error && <p className="text-xs font-medium text-red-600">{error}</p>}

              <button
                type="submit"
                className="px-6 py-3 text-sm font-semibold text-white bg-[#EA580C] hover:bg-[#C2410C] rounded-lg transition-colors cursor-pointer"
              >
                Send Message to support@xampe.com
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
