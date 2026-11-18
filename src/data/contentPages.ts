import { NicheId, PageRoute } from '../types/xampe';

export interface ArticleSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  proTip?: string;
}

export interface GuideContent {
  route: PageRoute;
  category: string;
  title: string;
  subtitle: string;
  readTime: string;
  updatedAt: string;
  sections: ArticleSection[];
}

export interface FeaturePageContent {
  route: PageRoute;
  kicker: string;
  title: string;
  subtitle: string;
  highlights: { label: string; value: string; detail: string }[];
  sections: ArticleSection[];
}

export interface NicheSolutionContent {
  route: PageRoute;
  nicheId: NicheId;
  title: string;
  subtitle: string;
  avgMargin: string;
  avgAov: string;
  topSubNiches: { name: string; demandNote: string; typicalPrice: string }[];
  sections: ArticleSection[];
}

export interface GlossaryEntry {
  term: string;
  fullName: string;
  category: 'Financial' | 'Marketing' | 'Operations';
  definition: string;
  formulaOrExample: string;
}

export interface CaseStudy {
  id: string;
  founder: string;
  location: string;
  storeName: string;
  niche: NicheId;
  nicheLabel: string;
  timeframe: string;
  monthlyRevenue: string;
  netMargin: string;
  startingBudget: string;
  headline: string;
  storyParagraphs: string[];
  keyTakeaways: string[];
}

export interface BlogArticle {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  readTime: string;
  sections: ArticleSection[];
}

export const FEATURE_PAGES: Record<string, FeaturePageContent> = {
  'feature-winning-products': {
    route: 'feature-winning-products',
    kicker: 'Core Feature · Product Intelligence',
    title: 'Winning Dropshipping Products Backed by Unit Economics',
    subtitle:
      'Skip guesswork and saturated novelty gadgets. Xampe curates problem-solving SKUs with 60%+ gross margins, compact parcel weights, and verified supplier pricing.',
    highlights: [
      { label: 'Curated Catalog', value: '48+ SKUs', detail: 'Vetted across 6 high-velocity niches' },
      { label: 'Target Gross Margin', value: '62% – 76%', detail: 'Leaves room for paid TikTok & Meta acquisition' },
      { label: 'Dispatch Speed', value: '4 – 9 Days', detail: 'Fast regional and express fulfillment lines' },
    ],
    sections: [
      {
        heading: 'How Xampe Filters Out Dead-End Inventory',
        paragraphs: [
          'Most new Shopify stores fail before their first ad campaign because they import twenty random low-margin items that solve no clear everyday problem. When a product costs $14 from a supplier and sells for $24, there is only $10 left to cover payment processing fees, shipping variance, and customer acquisition costs. A single $18 click-to-purchase cost wipes out your profit.',
          'Xampe reverses that equation. Every item in our catalog is vetted for perceived value, lightweight shipping dimensions under 1.2 kg, and clean visual demonstration potential. Products such as wireless desk light bars, orthopedic pet bolsters, and brushless cabin vacuums deliver an immediate before-and-after contrast in a 5-second short-form video.',
        ],
        bullets: [
          'Minimum 3x retail-to-landed-cost markup target on core hero SKUs',
          'Low defect and return profile (avoiding fragile glass or complex sizing matrices)',
          'Year-round evergreen demand paired with giftable Q4 spikes',
          'Pre-written scroll-stopping video hooks tailored for TikTok and Reels',
        ],
        proTip:
          'Start with 4 to 6 tightly related products in a single store rather than 50 unrelated items. Focused catalogs convert 2x higher on cold traffic because shoppers trust niche specialists.',
      },
      {
        heading: 'Built-In Margin Visibility Before You Spend $1 on Ads',
        paragraphs: [
          'Every storefront generated on Xampe includes a transparent SKU-by-SKU unit economics breakdown. You see exact supplier cost, recommended retail price, net dollar profit per order, and customer star rating benchmarks right underneath your store preview.',
          'Combined with our interactive Daily Profit Potential slider and standalone Profit Margin & ROAS Calculator, you know your exact break-even ROAS before launching a single ad set.',
        ],
      },
    ],
  },
  'feature-store-pages': {
    route: 'feature-store-pages',
    kicker: 'Core Feature · Conversion Architecture',
    title: 'High-Converting Store Pages Engineered Like Top DTC Brands',
    subtitle:
      'Shoppers judge brand credibility in under three seconds. Xampe builds structured storefronts with clear hierarchy, benefit-led copy, and distraction-free checkout paths.',
    highlights: [
      { label: 'Storefront Archetypes', value: '5 Layouts', detail: 'Minimalist, DTC, Luxury Dark, Vibrant, Editorial' },
      { label: 'Palette Presets', value: '6 Curated Themes', detail: 'Accessible contrast ratios across every surface' },
      { label: 'Copywriting', value: 'Included', detail: 'Taglines, product descriptions, and ad hooks ready at launch' },
    ],
    sections: [
      {
        heading: 'Why Generic Dropshipping Templates Lose Cold Traffic',
        paragraphs: [
          'Traditional free themes often look unfinished out of the box—oversized banners push products below the fold, product titles look like raw factory keywords, and mismatched neon badges erode buyer trust. Modern shoppers who click an ad on TikTok or Instagram expect the clean polish of an established direct-to-consumer brand.',
          'Xampe rotates between five distinct layout templates modeled after high-converting 7-figure Shopify brands. Whether your niche calls for the warm editorial restraint of a homewares studio or the split-screen urgency of a performance fitness brand, each layout balances whitespace, clear pricing, and prominent add-to-cart actions.',
        ],
        bullets: [
          'Clean above-the-fold hero positioning with one unmistakable primary CTA',
          'Consistent 4:3 product card proportions so grids never sag or misalign',
          'Interactive live cart drawer preview so you can test the shopper flow before exporting',
          'Pre-populated trust pillars covering shipping timelines, warranty, and support',
        ],
        proTip:
          'Match your template to your price point: use Luxury Dark Boutique or Modern Minimalist for $55+ hero items, and High-Converting DTC or Vibrant Grid for impulse-friendly $25–$45 accessories.',
      },
      {
        heading: 'Anti-Repetition Engine Keeps Your Brand Distinct',
        paragraphs: [
          'If thousands of founders launch identical clones, ad platforms penalize creative fatigue and shoppers recognize recycled templates. Every time you click Regenerate Unique Store on Xampe, our engine rotates layout structure, shuffles hero photography, selects a fresh 6-product combination, and pairs clean typography with a new color palette.',
        ],
      },
    ],
  },
  'feature-custom-domain': {
    route: 'feature-custom-domain',
    kicker: 'Core Feature · Launch & Deployment',
    title: 'Custom Domain Setup & 1-Click Shopify Launch Workflow',
    subtitle:
      'Move from niche idea to a live .com storefront with Shopify-ready CSV product imports, theme configuration bundles, and clean DNS onboarding.',
    highlights: [
      { label: 'Export Format', value: 'Shopify CSV', detail: 'Standard Shopify Admin product & theme preset bundle' },
      { label: 'Setup Time', value: 'Under 15 Mins', detail: 'Upload catalog, connect domain, and activate payments' },
      { label: 'Cost to Generate', value: '$0 Free', detail: 'Build and customize unlimited store previews on Xampe' },
    ],
    sections: [
      {
        heading: 'From Xampe Preview to Live Custom Domain',
        paragraphs: [
          'Launching on a bare `.myshopify.com` subdomain hurts conversion rates and triggers skepticism at checkout. Connecting a crisp, brandable `.com` domain (generated right inside our Business Name Generator) immediately signals legitimacy to customers, Meta reviewers, and payment processors.',
          'Once your Xampe storefront preview matches your vision, our 2-Step Shopify Launch Modal packages your selected products, SKUs, retail pricing, and descriptions into a clean Shopify-ready CSV file alongside a ready-to-apply Storefront Theme Preset.',
        ],
        bullets: [
          'Step 1: Generate your brand name and verify domain availability ideas in Xampe',
          'Step 2: Export your 6-product Shopify CSV and import directly in Shopify Admin > Products',
          'Step 3: Point your domain A-record (23.227.38.65) and CNAME (shops.myshopify.com) inside your registrar',
          'Step 4: Enable Shop Pay, Apple Pay, and automated order confirmation emails',
        ],
        proTip:
          'Avoid hyphens, numbers, or the word "dropship" in your domain name. Short two-word combinations like KansoLiving.com or StrideLab.co look timeless and resellable.',
      },
    ],
  },
};

export const NICHE_SOLUTIONS: Record<string, NicheSolutionContent> = {
  'solution-pets': {
    route: 'solution-pets',
    nicheId: 'pets',
    title: 'AI-Built Pet Accessories Shopify Stores',
    subtitle:
      'Tap into a $150B+ emotional spending category where owners consistently upgrade bedding, hydration, and daily walk gear.',
    avgMargin: '71%',
    avgAov: '$49.00',
    topSubNiches: [
      { name: 'Orthopedic & Calming Sleep', demandNote: 'High repeat gifting & senior-dog demand', typicalPrice: '$59 – $89' },
      { name: 'Grooming & Shedding Solutions', demandNote: 'Viral before/after short-form video hooks', typicalPrice: '$24 – $38' },
      { name: 'Walk, Travel & Hydration Gear', demandNote: 'Strong spring/summer impulse conversions', typicalPrice: '$26 – $44' },
    ],
    sections: [
      {
        heading: 'Why Pet Accessories Remain One of Shopify’s Highest-Margin Niches',
        paragraphs: [
          'Pet owners rarely shop purely on lowest price—they shop for comfort, safety, and relief from everyday messes like shedding hair or muddy paws. That emotional buying motivation supports healthy 65% to 75% gross margins even on $28–$48 everyday accessories.',
          'Pet products are also uniquely suited for organic short-form video. A 7-second clip showing a mist grooming brush lifting loose fur or a dog immediately curling into a woven bolster bed outperforms scripted studio commercials every day of the week.',
        ],
        bullets: [
          'Zero seasonal collapse—pet food, grooming, and walking gear sell all 12 months',
          'Easy multi-item cart bundling (e.g., Elevated Ceramic Bowls + Travel Bottle)',
          'Low return rates when sizing is universal or clearly measured by breed weight',
        ],
        proTip:
          'Include breed weight guidelines directly in the first two lines of your product description to eliminate sizing hesitation at checkout.',
      },
    ],
  },
  'solution-electronics': {
    route: 'solution-electronics',
    nicheId: 'smarthome',
    title: 'AI-Built Smart Home & Electronics Stores',
    subtitle:
      'Capture remote workers, desk setup enthusiasts, and modern apartment dwellers with sleek, cable-free functional hardware.',
    avgMargin: '64%',
    avgAov: '$61.00',
    topSubNiches: [
      { name: 'Minimalist Desk & Monitor Lighting', demandNote: 'Huge organic interest across desk-setup communities', typicalPrice: '$42 – $68' },
      { name: 'MagSafe & Multi-Device Charging', demandNote: 'High perceived value & low return rate', typicalPrice: '$48 – $74' },
      { name: 'Motion-Sensor Home Ambient LEDs', demandNote: 'High multi-unit cart quantities (2–4 per order)', typicalPrice: '$29 – $44' },
    ],
    sections: [
      {
        heading: 'Positioning Smart Home Tech Without Competing Against Big-Box Retailers',
        paragraphs: [
          'You never want to sell generic commodity cables or cheap plastic phone cases on Shopify. Instead, winning electronics stores focus on aesthetic problem-solvers: asymmetric monitor light bars that save desk space, anodized aluminum 3-in-1 docks, and magnetic under-cabinet motion strips.',
          'These items carry a strong $50–$80 average order value while keeping parcel weights compact and supplier costs between $7 and $24.',
        ],
        bullets: [
          'Lead with clean architectural photography showing the product inside a real room',
          'Highlight USB-C compatibility and tool-free installation in your first bullet point',
          'Offer 2-pack and 4-pack bundle discounts on motion lights to lift AOV above $65',
        ],
        proTip:
          'Always specify plug type / USB-C power specs clearly on your product page so international shoppers buy with confidence.',
      },
    ],
  },
  'solution-fashion': {
    route: 'solution-fashion',
    nicheId: 'fashion',
    title: 'AI-Built Fashion & Beauty Shopify Stores',
    subtitle:
      'Build high-margin boutique storefronts around skincare rituals, travel vanity goods, polarized eyewear, and capsule accessories.',
    avgMargin: '74%',
    avgAov: '$58.00',
    topSubNiches: [
      { name: 'Non-Consumable Beauty Tools', demandNote: 'Jade rollers, stainless gua sha & LED mirrors avoid FDA complexity', typicalPrice: '$26 – $45' },
      { name: 'Travel Vanity & Silk Hair Care', demandNote: 'Strong viral "Get Ready With Me" creator appeal', typicalPrice: '$29 – $42' },
      { name: 'Boutique Carry & Polarized Eyewear', demandNote: 'Zero shoe/apparel sizing return headaches', typicalPrice: '$44 – $74' },
    ],
    sections: [
      {
        heading: 'How to Win in Beauty & Fashion Without Sizing Returns',
        paragraphs: [
          'Selling fitted dresses or shoes via dropshipping can trigger 20%+ size-exchange headaches. Smart Shopify operators focus instead on one-size-fits-all beauty hardware, structured cosmetic bags, silk hair curlers, watches, and eyewear—keeping return rates under 3% while achieving 70%+ gross margins.',
          'Presentation is everything in beauty and fashion. Pairing Xampe’s Luxury Dark Boutique or Modern Minimalist layout with calm neutral copy transforms a $7 supplier item into a $34 boutique staple.',
        ],
        bullets: [
          'Focus on hardware and accessories rather than ingestibles or regulated creams',
          'Bundle morning-routine duos (Stainless Gua Sha + Jade Roller) for higher AOV',
          'Highlight tactile materials: 22-momme silk, 304 stainless steel, UV400 acetate',
        ],
      },
    ],
  },
  'solution-home': {
    route: 'solution-home',
    nicheId: 'home',
    title: 'AI-Built Home & Garden Shopify Stores',
    subtitle:
      'Sell calm architectural accents, indoor herb care tools, stoneware diffusers, and warm outdoor lighting to homeowners and renters.',
    avgMargin: '69%',
    avgAov: '$52.00',
    topSubNiches: [
      { name: 'Indoor Botanical & Herb Care', demandNote: 'Booming urban plant-parent demographic', typicalPrice: '$25 – $52' },
      { name: 'Ceramic Scent & Diffusers', demandNote: 'High giftability and repeat essential-oil buyers', typicalPrice: '$44 – $62' },
      { name: 'Warm Solar Patio Lighting', demandNote: 'Easy 4-pack upsells for backyard makeovers', typicalPrice: '$48 – $72' },
    ],
    sections: [
      {
        heading: 'Designing a Calm Homewares Store That Commands Boutique Pricing',
        paragraphs: [
          'Home and garden shoppers buy aspirational calm. When products are framed inside sunlit Scandinavian interiors rather than white-background factory cutouts, customers happily pay $48 to $66 for self-watering planters, Belgian linen throws, and matte stoneware vessels.',
        ],
        bullets: [
          'Use warm editorial photography and natural material callouts (cedar, stoneware, brass)',
          'Position self-watering planters and brass moisture probes as "plant insurance" for busy owners',
          'Cross-sell room scenting items cleanly in the cart drawer',
        ],
      },
    ],
  },
  'solution-fitness': {
    route: 'solution-fitness',
    nicheId: 'fitness',
    title: 'AI-Built Fitness & Wellness Shopify Stores',
    subtitle:
      'Serve home athletes, runners, and desk-bound professionals with portable recovery tools, cork mats, and conditioning gear.',
    avgMargin: '68%',
    avgAov: '$54.00',
    topSubNiches: [
      { name: 'Pocket Muscle Recovery Hardware', demandNote: 'Solves immediate soreness & desk stiffness', typicalPrice: '$39 – $69' },
      { name: 'Home Mobility & Cork Yoga Gear', demandNote: 'Eco-conscious upgrade over slippery PVC mats', typicalPrice: '$45 – $65' },
      { name: 'Portable Strength & Conditioning', demandNote: 'Smart jump ropes & woven bands ship cheap and fast', typicalPrice: '$24 – $36' },
    ],
    sections: [
      {
        heading: 'Building Repeat Demand in Home Fitness & Recovery',
        paragraphs: [
          'Heavy iron barbells are terrible for dropshipping due to freight costs. Compact recovery and conditioning hardware—like pocket percussion massagers, woven fabric resistance sets, and hall-sensor jump ropes—gives you the exact same passionate audience with lightweight 400g–900g shipping parcels.',
        ],
        bullets: [
          'Sell the outcome (pain-free shoulders, 15-minute home cardio) rather than technical specs alone',
          'Pair high-ticket recovery devices with $24–$29 accessories like wrist wraps or gliding discs',
          'Run clean split-screen DTC layouts featuring concrete durability guarantees',
        ],
      },
    ],
  },
  'solution-themes': {
    route: 'solution-themes',
    nicheId: 'smarthome',
    title: 'AI-Built Shopify Themes Engineered for Speed & Trust',
    subtitle:
      'Explore the five distinct conversion layouts built directly into Xampe’s Anti-Repetition Store Engine.',
    avgMargin: '68%',
    avgAov: '$56.00',
    topSubNiches: [
      { name: 'Modern Minimalist & Editorial Spotlight', demandNote: 'Best for design-forward home, fashion & tech brands', typicalPrice: '$45 – $85' },
      { name: 'High-Converting DTC & Vibrant Grid', demandNote: 'Best for impulse-driven social video traffic', typicalPrice: '$24 – $59' },
      { name: 'Luxury Dark Boutique', demandNote: 'Best for premium accessories, watches & cabin hardware', typicalPrice: '$54 – $89' },
    ],
    sections: [
      {
        heading: 'Why Storefront Variety Directly Impacts Your Return on Ad Spend',
        paragraphs: [
          'When ten advertisers send TikTok traffic to the exact same default white theme, conversion rates drop across the board. Xampe solves store homogeneity by rotating between five structurally different Shopify-ready layouts—varying hero geometry, typography pairings, urgency bars, and product grid density.',
          'Inside the builder on our homepage, you can switch templates in real time, preview six accessible color themes, and shuffle hero photography until your brand feels completely bespoke.',
        ],
      },
    ],
  },
};

export const GUIDES: Record<string, GuideContent> = {
  'guide-dropship-shopify': {
    route: 'guide-dropship-shopify',
    category: 'Foundations · 7 min read',
    title: 'How to Dropship on Shopify: The Complete 2026 Playbook',
    subtitle:
      'Learn how modern Shopify dropshipping works—from selecting high-margin evergreen products to automating fulfillment without holding warehouse inventory.',
    readTime: '7 min read',
    updatedAt: 'Updated November 2026',
    sections: [
      {
        heading: '1. What Modern Shopify Dropshipping Actually Looks Like',
        paragraphs: [
          'Dropshipping is an inventory fulfillment model where your Shopify store markets products, collects customer payments at retail price, and forwards orders to a verified supplier who ships directly to the buyer. You never buy bulk stock upfront or rent warehouse space.',
          'What has changed dramatically over the last two years is customer expectation. Ten years ago, shoppers waited 35 days for generic items on cluttered multi-category stores. Today, profitable dropshippers operate focused niche brands with 5-to-9-day delivery, clean brand typography, and genuine customer support.',
        ],
      },
      {
        heading: '2. Picking a Profitable Niche and Calculating True Margins',
        paragraphs: [
          'Your niche determines both your advertising cost and your repeat purchase rate. Look for markets where customers either care deeply about an identity (pet owners, home gym athletes, car enthusiasts) or want to solve an immediate daily annoyance (tangled desk cables, muddy dog paws, stiff necks).',
          'Always enforce a simple pricing rule before adding a SKU: your retail price should be at least 2.8x to 3.5x your landed cost (product cost plus shipping). For example, if a smart jump rope costs $8 landed and sells for $34, you earn $26 gross margin per order—giving you healthy room to pay $12–$15 for an ad conversion and still bank clean net profit.',
        ],
        bullets: [
          'Avoid ultra-cheap $9 retail items—ad clicks cost too much to break even',
          'Avoid heavy, fragile, or complex electronics with high defect rates',
          'Focus on 6 complementary SKUs that can be bundled together in the cart',
        ],
        proTip:
          'Use Xampe’s Profit Margin & ROAS Calculator before testing any product so you know your exact break-even cost per acquisition.',
      },
      {
        heading: '3. Building a Storefront That Earns Cold-Traffic Trust',
        paragraphs: [
          'When a stranger taps your ad on TikTok or Instagram, your website has three seconds to prove it is a legitimate business. Use a concise two-word brand name, connect a real `.com` domain, write crisp benefit-focused product descriptions, and display clear shipping and return policies.',
          'Rather than spending three weeks manually tweaking Liquid templates, generate your store structure with Xampe, export your product CSV, and spend your energy on product photography and ad creative testing.',
        ],
      },
      {
        heading: '4. Order Fulfillment, Tracking, and Scaling Winners',
        paragraphs: [
          'Once orders begin arriving, connect your Shopify store to a vetted fulfillment partner or private agent who offers automated tracking sync. When a single SKU achieves consistent profitability at $30–$50/day in ad spend, lock in faster local warehouse inventory or custom branded packaging to push repeat purchases even higher.',
        ],
      },
    ],
  },
  'guide-ai-dropshipping': {
    route: 'guide-ai-dropshipping',
    category: 'Automation · 6 min read',
    title: 'AI Dropshipping Step-by-Step Guide: Launch Faster With Higher Precision',
    subtitle:
      'Use AI tools responsibly to eliminate repetitive store setup tasks while keeping human judgment over product quality, pricing, and creative angles.',
    readTime: '6 min read',
    updatedAt: 'Updated November 2026',
    sections: [
      {
        heading: 'Step 1: Let Xampe AI Narrow Down Niche & Product Combinations',
        paragraphs: [
          'Beginner store owners often lose two weeks staring at blank spreadsheets trying to pick products. Using Xampe’s Store Builder, you pick one of six proven evergreen categories and immediately receive six complementary SKUs with verified retail-to-supplier margin spreads.',
          'Review every suggested item through a simple human filter: would a real friend understand what this does within two seconds of seeing a photo? If yes, keep it in your launch lineup.',
        ],
      },
      {
        heading: 'Step 2: Generate Brand Identity, Theme Layout & Conversion Copy',
        paragraphs: [
          'Consistent branding separates sustainable Shopify stores from one-week gimmicks. Use Xampe’s Business Name Generator to shortlist short, memorable domain names, then test different storefront archetypes (Modern Minimalist, High-Converting DTC, Luxury Dark Boutique) in our live preview.',
          'Make sure to lightly edit generated headlines and product descriptions so they sound specific to your audience—swap generic adjectives for exact dimensions, materials, and use cases.',
        ],
        bullets: [
          'Generate 3 distinct storefront variations and compare visual hierarchy',
          'Customize your accent color to match your hero lifestyle photography',
          'Export your finished 6-product catalog as a Shopify-ready CSV in one click',
        ],
      },
      {
        heading: 'Step 3: Script Short-Form Video Hooks With AI Ad Frameworks',
        paragraphs: [
          'Store setup used to take 80% of a founder’s first month. With AI compressing store assembly down to minutes, 80% of your competitive advantage now comes from testing better video hooks. Use Xampe’s AI Ad Hook Generator to produce five distinct opening lines per product—testing problem-agitation, before/after visual contrast, and curiosity angles.',
        ],
        proTip:
          'Never rely solely on AI avatars for ads. Order one sample unit of your #1 product and film 3 raw smartphone clips showing the item solving a real problem in natural daylight.',
      },
    ],
  },
  'guide-marketing-tiktok': {
    route: 'guide-marketing-tiktok',
    category: 'Growth · 8 min read',
    title: 'Shopify Marketing & TikTok Ads Guide for New Store Owners',
    subtitle:
      'A practical traffic framework covering organic short-form video hooks, TikTok Spark Ads, Meta Advantage+ testing, and email cart recovery.',
    readTime: '8 min read',
    updatedAt: 'Updated November 2026',
    sections: [
      {
        heading: '1. The 3-Second Hook Formula That Stops the Scroll',
        paragraphs: [
          'On TikTok, Instagram Reels, and Facebook Feeds, your ad is competing against entertaining creator videos—not other store pages. If the first three seconds look like a polished TV commercial, viewers swipe past instantly. Instead, open with visual motion paired with a specific, relatable callout.',
          'For example, when promoting a cordless cabin vacuum, start mid-action vacuuming sand out of a dark floor mat while your caption reads: "Why detailers stopped dragging shop vacs into their driveway." Direct visual proof beats abstract brand slogans every single time.',
        ],
        bullets: [
          'Visual hook: Show the problem or transformation inside the very first 1.5 seconds',
          'Text overlay: Keep on-screen captions under 8 words in high-contrast typography',
          'Pacing: Cut shots every 2–3 seconds and close with a clear "Link in bio / Shop Now" directive',
        ],
      },
      {
        heading: '2. Testing Budgets Without Burning Cash',
        paragraphs: [
          'Start lean. Allocate a testing budget of $30 to $50 per day across 3 to 5 distinct video hooks pointing to a single product page—not your homepage. Sending cold paid traffic to a product page removes extra clicks and raises conversion rates by 30% to 50%.',
          'Evaluate creatives strictly on outbound click-through rate (target > 1.2%), cost per click, and add-to-cart rate before turning off weak angles after 48–72 hours.',
        ],
        proTip:
          'Always calculate your Break-Even CPA first: if your net margin before ads is $30, any campaign acquiring customers for $22 leaves $8 pure profit per order.',
      },
      {
        heading: '3. Don’t Leave 25% of Revenue Behind: Setup Automated Flows',
        paragraphs: [
          'Paid ads bring visitors to the door, but automated email and SMS flows capture the customers who got distracted at checkout. Before buying traffic, activate a 3-part Abandoned Cart flow (1 hour, 12 hours, and 36 hours after abandonment) plus a post-purchase cross-sell email 7 days after delivery.',
        ],
      },
    ],
  },
  'guide-shopify-seo': {
    route: 'guide-shopify-seo',
    category: 'Organic Traffic · 6 min read',
    title: 'Shopify SEO Guide: Rank Product & Collection Pages for Free Traffic',
    subtitle:
      'Build compounding organic search traffic on Google so your store acquires high-intent buyers without paying for every single click.',
    readTime: '6 min read',
    updatedAt: 'Updated November 2026',
    sections: [
      {
        heading: '1. Keyword Intent: Collection Pages vs. Product Pages',
        paragraphs: [
          'Many beginners make the mistake of stuffing broad keywords onto their homepage while ignoring collection pages. In e-commerce SEO, collection pages rank best for broader category searches ("orthopedic dog beds", "minimalist monitor light bars"), while individual product pages capture specific model and feature queries.',
          'Structure your navigation cleanly so Google understands the relationship between your niche collections and individual products within two clicks from the homepage.',
        ],
      },
      {
        heading: '2. On-Page Checklist Every Shopify Product Needs',
        paragraphs: [
          'Every product imported into your Shopify store should have a clean, descriptive URL slug, a unique H1 product title, scannable specification bullets, and compressed images with descriptive alt text.',
        ],
        bullets: [
          'Title Tag (50–60 chars): Include primary keyword + key benefit ("CloudWeave Orthopedic Bolster Dog Bed | Washable Linen")',
          'Meta Description (140–155 chars): Mention shipping speed, guarantee, and core material to improve search click-through rate',
          'Image Alt Text: Describe what is visible ("Minimalist beige herringbone orthopedic dog bed in living room")',
          'Unique Copy: Never copy-paste raw supplier descriptions that already exist on 500 other sites',
        ],
        proTip:
          'Publish 2 helpful buyer-guide blog posts per month answering specific customer questions (e.g., "How to Measure Your Dog for an Orthopedic Bed") and link directly to your products inside the article.',
      },
    ],
  },
  'guide-start-shopify': {
    route: 'guide-start-shopify',
    category: 'Getting Started · 6 min read',
    title: 'How to Start a Shopify Store From Scratch in One Afternoon',
    subtitle:
      'A step-by-step launch checklist covering store creation, tax and payment settings, legal pages, and your first test checkout.',
    readTime: '6 min read',
    updatedAt: 'Updated November 2026',
    sections: [
      {
        heading: 'Phase 1: Foundation & Store Architecture (Hours 1–2)',
        paragraphs: [
          'Begin by defining your niche and picking a clean, memorable brand name on Xampe. Avoid over-complicating your store with 15 apps on day one—every unnecessary third-party script slows down page load times and eats into mobile conversion rates.',
          'Generate your initial storefront layout and 6-product selection on Xampe, export your product CSV, and import it directly into a fresh Shopify trial account.',
        ],
        bullets: [
          'Configure Store Name, support email (e.g., support@yourdomain.com), and currency',
          'Connect a custom `.com` domain inside Settings > Domains',
          'Publish clear Shipping, Refund, Privacy Policy, and Terms of Service pages in your footer',
        ],
      },
      {
        heading: 'Phase 2: Payments, Shipping & Test Order (Hours 3–4)',
        paragraphs: [
          'Before turning your storefront live, configure transparent shipping rates. Free shipping on orders over $45 (or flat-rate tracked shipping) consistently beats surprise $9.95 fees calculated at the final checkout screen.',
          'Enable Shopify Payments alongside accelerated wallets like Apple Pay and Shop Pay. Finally, run a $1 real test transaction or Bogus Gateway checkout to confirm order confirmation emails, inventory counts, and tracking notifications work smoothly.',
        ],
        proTip:
          'Remove the default "Powered by Shopify" footer link and add your brand copyright notice and support email so your store looks 100% independent.',
      },
    ],
  },
  'guide-how-shopify-works': {
    route: 'guide-how-shopify-works',
    category: 'Platform Overview · 5 min read',
    title: 'How Does Shopify Work? Architecture, Fees & Storefront Basics Explained',
    subtitle:
      'Understand what Shopify handles behind the scenes—hosting, SSL security, checkout processing, and app integrations—so you can focus on sales.',
    readTime: '5 min read',
    updatedAt: 'Updated November 2026',
    sections: [
      {
        heading: '1. Hosted Commerce Infrastructure Without Server Maintenance',
        paragraphs: [
          'Shopify is a cloud-hosted Software-as-a-Service (SaaS) e-commerce platform. Instead of renting web servers, configuring SSL certificates, or patching database security vulnerabilities yourself, Shopify manages global CDN hosting, uptime, PCI-compliant credit card processing, and checkout optimization under one subscription.',
          'Inside the Shopify Admin dashboard, you manage four core pillars: Products (titles, variants, pricing, inventory), Orders (fulfillment, tracking, refunds), Customers (profiles and purchase history), and Online Store (themes, navigation menus, and pages).',
        ],
      },
      {
        heading: '2. Understanding Shopify Plans and Transaction Fees',
        paragraphs: [
          'Most new dropshippers start on the Basic Shopify plan, which includes unlimited products, 24/7 support, abandoned checkout recovery, and access to the Shopify App Store. When using Shopify Payments, standard online credit card fees typically sit around 2.9% + $0.30 per transaction—so make sure to include a ~3% processing buffer inside your profit calculator.',
        ],
        bullets: [
          'Zero bandwidth caps: traffic spikes from viral videos will not crash your checkout',
          'Built-in Shop Pay one-tap checkout converts noticeably higher on mobile devices',
          'Open App Store ecosystem for reviews, upsells, and automated supplier fulfillment',
        ],
      },
    ],
  },
};

export const GLOSSARY_TERMS: GlossaryEntry[] = [
  {
    term: 'AOV',
    fullName: 'Average Order Value',
    category: 'Financial',
    definition: 'The average dollar amount a customer spends per completed checkout on your store.',
    formulaOrExample: 'Total Revenue ÷ Total Orders (e.g., $2,800 ÷ 50 orders = $56.00 AOV)',
  },
  {
    term: 'ROAS',
    fullName: 'Return on Ad Spend',
    category: 'Marketing',
    definition: 'Gross revenue generated for every dollar spent on paid advertising campaigns.',
    formulaOrExample: 'Ad Revenue ÷ Ad Spend (e.g., $1,500 revenue ÷ $500 spend = 3.0x ROAS)',
  },
  {
    term: 'CPA',
    fullName: 'Cost Per Acquisition',
    category: 'Marketing',
    definition: 'The average ad spend required to generate one completed customer purchase.',
    formulaOrExample: 'Total Ad Spend ÷ Total Purchases (e.g., $300 ÷ 15 orders = $20.00 CPA)',
  },
  {
    term: 'Gross Margin',
    fullName: 'Gross Profit Margin (%)',
    category: 'Financial',
    definition: 'Percentage of retail revenue remaining after subtracting supplier product cost and shipping.',
    formulaOrExample: '(Retail Price - Landed Cost) ÷ Retail Price × 100',
  },
  {
    term: 'Break-Even ROAS',
    fullName: 'Break-Even Return on Ad Spend',
    category: 'Financial',
    definition: 'The minimum ROAS needed for a campaign to cover product, shipping, and processing costs with zero loss.',
    formulaOrExample: '1 ÷ Profit Margin Before Ads (e.g., 50% margin = 2.0x Break-Even ROAS)',
  },
  {
    term: 'Fulfillment',
    fullName: 'Order Fulfillment',
    category: 'Operations',
    definition: 'The end-to-end process of picking, packing, shipping, and syncing a tracking number to the customer order.',
    formulaOrExample: 'Automated via Shopify fulfillment apps or direct supplier CSV sync.',
  },
  {
    term: 'SKU',
    fullName: 'Stock Keeping Unit',
    category: 'Operations',
    definition: 'A unique alphanumeric identifier assigned to each distinct product and variant for inventory tracking.',
    formulaOrExample: 'Example: XMP-FIT-101 for PulseMini Percussion Massager.',
  },
  {
    term: 'Supplier',
    fullName: 'Verified Dropship Supplier',
    category: 'Operations',
    definition: 'The manufacturer, wholesaler, or fulfillment agent holding physical stock and shipping orders directly to customers.',
    formulaOrExample: 'Always confirm processing times (24–48h) and tracking reliability before scaling.',
  },
  {
    term: 'CVR',
    fullName: 'Store Conversion Rate',
    category: 'Marketing',
    definition: 'Percentage of storefront visitors who complete a purchase during a session.',
    formulaOrExample: 'Orders ÷ Sessions × 100 (healthy DTC target: 2.0% – 3.5%).',
  },
  {
    term: 'CTR',
    fullName: 'Click-Through Rate',
    category: 'Marketing',
    definition: 'Percentage of people who saw your ad impression and clicked through to your store.',
    formulaOrExample: 'Link Clicks ÷ Impressions × 100 (strong TikTok/Meta target: > 1.2%).',
  },
  {
    term: 'Upsell / Cross-Sell',
    fullName: 'Cart & Post-Purchase Upsell',
    category: 'Marketing',
    definition: 'Offering a higher-tier bundle or complementary add-on inside the cart or immediately after checkout.',
    formulaOrExample: 'Raises AOV by 12%–22% without paying extra for ad traffic.',
  },
  {
    term: '3PL',
    fullName: 'Third-Party Logistics',
    category: 'Operations',
    definition: 'Outsourced regional warehouse services used once winning products scale to 30+ orders per day for 2–4 day domestic shipping.',
    formulaOrExample: 'Transition from direct dropshipping to 3PL once a SKU proves stable demand.',
  },
  {
    term: 'Chargeback',
    fullName: 'Payment Dispute / Chargeback',
    category: 'Financial',
    definition: 'A cardholder dispute filed with their issuing bank requesting funds back—prevented by fast tracking and responsive support.',
    formulaOrExample: 'Keep chargeback rate strictly below 0.5% to protect payment processor standing.',
  },
  {
    term: 'MOQ',
    fullName: 'Minimum Order Quantity',
    category: 'Operations',
    definition: 'The smallest batch size a factory requires when transitioning from zero-inventory dropshipping to custom private-label runs.',
    formulaOrExample: 'Zero MOQ while dropshipping; typically 100–300 units for custom branded boxes.',
  },
];

export const SUCCESS_STORIES: CaseStudy[] = [
  {
    id: 'story-1',
    founder: 'Hannah Morales',
    location: 'Austin, Texas',
    storeName: 'Hearth & Hound',
    niche: 'pets',
    nicheLabel: 'Pet Accessories',
    timeframe: 'First 90 Days',
    monthlyRevenue: '$18,400 / mo',
    netMargin: '29% Net',
    startingBudget: '$450 Total Launch',
    headline: 'From Zero Store Design Experience to $18.4k/mo With Orthopedic Pet Gear',
    storyParagraphs: [
      'Hannah worked full-time in dental office administration and had tried twice before to build a Shopify store—both times stalling out after spending weeks fighting complicated theme code and picking low-margin novelty gadgets.',
      'Using Xampe’s Pet Accessories generator, she built Hearth & Hound in one evening using the Modern Minimalist layout and focused exclusively on four high-utility items: the CloudWeave Orthopedic Bolster Bed, PorcelainFlow Ceramic Fountain, SteamMist Brush, and TrailSip Walk Bottle.',
      'Instead of hiring a film crew, Hannah filmed three 15-second videos with her own golden retriever stepping onto the bolster bed and drinking from the ceramic fountain. By week six, two Spark Ads held a steady 3.1x ROAS, crossing $18,400 in monthly revenue by day 90 with a 29% net margin after ad spend.',
    ],
    keyTakeaways: [
      'Started with 4 tightly matched pet comfort products instead of a cluttered general store',
      'Bundled the grooming brush at checkout to raise AOV from $48 to $61',
      'Set up automated 1-hour and 24-hour cart recovery emails on day one',
    ],
  },
  {
    id: 'story-2',
    founder: 'Devon Park',
    location: 'Toronto, Canada',
    storeName: 'LumenDesk Studio',
    niche: 'smarthome',
    nicheLabel: 'Smart Home & Electronics',
    timeframe: 'First 4 Months',
    monthlyRevenue: '$24,900 / mo',
    netMargin: '26% Net',
    startingBudget: '$600 Total Launch',
    headline: 'Scaling Minimalist Desk Hardware to $24.9k/mo Targeting Remote Professionals',
    storyParagraphs: [
      'Devon noticed how many remote software engineers and designers were posting desk makeover reels every week—yet most affordable desk lamps looked bulky and dated. He used Xampe’s Smart Home generator with the Editorial Spotlight template to create LumenDesk Studio.',
      'His hero product, the HaloBar Asymmetric Monitor Light, carried a $17 supplier cost and $59 retail price ($42 gross margin). Devon paired it with the MagDock 3-in-1 Stand and No-Drill Under-Desk Cable Tray so customers regularly checked out with two items.',
      'Rather than competing on discount coupons, Devon leaned into architectural photography and clear USB-C setup specs. Organic Reels combined with $65/day in Meta Advantage+ campaigns pushed LumenDesk past $24,900/mo in month four.',
    ],
    keyTakeaways: [
      'Used Editorial Spotlight layout to put the highest-margin hero item front and center',
      'Maintained a $64 average order value through desk-bundle quantity breaks',
      'Kept return rates under 1.8% by publishing exact desk thickness compatibility notes',
    ],
  },
  {
    id: 'story-3',
    founder: 'Claire & Sam Bennett',
    location: 'Manchester, UK',
    storeName: 'Klara Living',
    niche: 'home',
    nicheLabel: 'Home & Garden',
    timeframe: 'First 6 Months',
    monthlyRevenue: '$31,200 / mo',
    netMargin: '32% Net',
    startingBudget: '$520 Total Launch',
    headline: 'Building an Evergreen Botanical & Scent Brand Averaging 32% Net Profit',
    storyParagraphs: [
      'Claire wanted a side business centered around indoor plants and calm living spaces, while Sam handled ad metrics and supplier operations. They generated Klara Living on Xampe using the Terracotta Warmth palette and launched with six indoor botanical and aroma essentials.',
      'Their breakout pair was the HydroWick Self-Watering Herb Trio alongside the TerraMist Ceramic Diffuser. Because renters and apartment plant owners frequently overwater herbs or struggle with dry winter air, simple "never kill your kitchen basil again" hooks generated high click-through rates at low CPCs.',
      'By month six, repeat customers ordering gift sets and extra planters accounted for 22% of monthly revenue—driving overall net profit margins to 32% across $31,200 in monthly sales.',
    ],
    keyTakeaways: [
      'Combined Xampe’s Profit Calculator with strict $18 CPA caps during early ad testing',
      'Captured gift-season demand with clean 2-pack ceramic diffuser bundles',
      'Built an email list of 4,200 subscribers through a free indoor herb care PDF',
    ],
  },
];

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    id: 'blog-1',
    category: 'Product Research',
    title: 'The 5-Point Scorecard We Use to Pick Winning Dropshipping Products in 2026',
    excerpt:
      'Why gross dollar margin matters more than percentage markup—and the five quantitative checks every SKU must pass before you spend a dollar on ads.',
    author: 'Marcus Chen, Commerce Strategist',
    publishedAt: 'November 10, 2026',
    readTime: '5 min read',
    sections: [
      {
        heading: 'Why Percentage Markup Alone Traps Beginners',
        paragraphs: [
          'A phone ring light that costs $2 and sells for $8 technically boasts a 75% gross margin—yet it is almost impossible to run profitably with paid ads. Why? Because a single customer purchase on TikTok or Meta rarely costs less than $10 to $18 in ad spend, regardless of how cheap the item is.',
          'When evaluating winning products on Xampe, we prioritize absolute dollar margin alongside percentage margin. Look for products with at least $22 to $45 in gross dollar headroom between landed supplier cost and retail price.',
        ],
      },
      {
        heading: 'The 5 Checks Every Product Must Pass',
        paragraphs: [
          'Before adding a new SKU to our curated catalog, our product research team puts every candidate through five non-negotiable filters:',
        ],
        bullets: [
          '1. Minimum $22 Dollar Headroom: Retail minus supplier cost must leave room for acquisition and payment fees.',
          '2. Instant Visual Hook: Can a viewer understand the benefit in 2 seconds with the sound muted?',
          '3. Sub-1.2 kg Parcel Weight: Keeps international express shipping predictable and affordable.',
          '4. Low Defect & Fragility Risk: Avoids delicate glass or complex batteries prone to transit damage.',
          '5. Clear Perceived Value: Does the design look like a $45–$75 boutique item rather than a dollar-store trinket?',
        ],
        proTip:
          'Whenever you test a $24–$29 accessory, pair it with a $54–$79 hero product in the same store so upsells carry the advertising load.',
      },
    ],
  },
  {
    id: 'blog-2',
    category: 'Conversion Optimization',
    title: '7 Trust Signals That Lift Cold-Traffic Conversion Rates Above 3%',
    excerpt:
      'Small structural fixes on your Shopify product page—from shipping clarity to clean typography—that convert skeptical first-time visitors into buyers.',
    author: 'Elena Rostova, UX Lead',
    publishedAt: 'November 4, 2026',
    readTime: '6 min read',
    sections: [
      {
        heading: 'Cold Traffic Needs Clarity, Not Countdown Clutter',
        paragraphs: [
          'Five years ago, stores plastered flashing red countdown bars, fake stock counters, and spinning discount wheels across every pixel. Today’s shoppers instantly associate cluttered flash-sale popups with untrustworthy sites.',
          'Top-performing Shopify brands earn higher conversion rates through quiet competence: balanced margins, crisp high-resolution lifestyle hero banners, honest delivery windows ("Ships in 24h · Arrives in 5–8 business days"), and visible support contact details.',
        ],
        bullets: [
          'Place exact shipping timeframe directly underneath the Add to Cart button',
          'Lead product descriptions with 3 scannable outcome bullets before technical specs',
          'Use one consistent accent color for primary action buttons across the whole store',
          'Ensure mobile and desktop product card prices align cleanly with zero text overflow',
        ],
      },
    ],
  },
  {
    id: 'blog-3',
    category: 'Paid Acquisition',
    title: 'How to Read Your First 48 Hours of TikTok & Meta Ad Metrics Without Panicking',
    excerpt:
      'Know exactly when to turn off a losing creative, when to leave an ad set alone, and how Break-Even ROAS guides every scaling decision.',
    author: 'Julian Brooks, Performance Media',
    publishedAt: 'October 26, 2026',
    readTime: '6 min read',
    sections: [
      {
        heading: 'Stop Checking Live Ads Every 15 Minutes',
        paragraphs: [
          'Ad algorithms need data volume to optimize delivery. Turning off a campaign after spending $9 simply because no purchase happened yet guarantees you never gather enough signal to find buyers.',
          'Instead, establish clear decision rules before launching. Let each creative spend at least 1.5x your target CPA—or roughly $35 to $45 on a $55 retail item—before making a keep-or-cut judgment.',
        ],
        bullets: [
          'High CTR (> 1.5%) + Zero Add-to-Carts = Fix your product page offer, price, or hero photo',
          'High Add-to-Carts (> 6%) + Zero Purchases = Check surprise shipping costs at checkout',
          'Low CTR (< 0.7%) = Your first 3 seconds failed to hook viewers; test a new opening shot',
        ],
      },
    ],
  },
];

export const HOME_FAQS = [
  {
    q: 'Is Xampe really 100% free with no sign-up required?',
    a: 'Yes. Creating dropshipping stores, browsing winning products, previewing desktop and mobile storefront layouts, inspecting profit margin breakdowns, and using all four calculators on Xampe is 100% free with no credit card or sign-up required.',
  },
  {
    q: 'How does Xampe avoid generating identical cookie-cutter stores?',
    a: 'Our Store Engine rotates across 5 distinct storefront layout templates (Modern Minimalist, High-Converting DTC, Luxury Dark Boutique, Vibrant Grid, Editorial Spotlight), 6 color themes, 15 lifestyle hero banners, and pulls 6 unique niche-matched winning products on every build.',
  },
  {
    q: 'Are supplier prices, margins, and ad hooks included?',
    a: 'Every built store displays each product’s estimated supplier cost, live retail pricing, gross profit margin percentage, customer rating benchmark, and a ready-to-run TikTok/Meta ad hook.',
  },
  {
    q: 'How do I launch my store onto my real Shopify account?',
    a: 'Click "Upload to Shopify Automatically (1-Click)" below your preview, enter your .myshopify.com domain (or create a free Shopify store first), and Xampe automatically uploads all 6 winning products, photos, descriptions, and retail pricing directly into your store.',
  },
];

export const EXTENDED_FAQS = [
  ...HOME_FAQS,
  {
    q: 'Do I need coding or design experience to use Xampe?',
    a: 'None at all. Xampe handles layout structure, color contrast pairing, product curation, and conversion copywriting automatically. You can customize your theme and shuffle hero banners with single clicks.',
  },
  {
    q: 'Can I bring my own store name or generate one inside Xampe?',
    a: 'Both. Type your existing brand name right on the homepage, click "Auto-Generate Name", or open our dedicated Shopify Business Name Generator tool to explore 12 tailored ideas by tone and keyword.',
  },
  {
    q: 'How are Profit Margin and Break-Even ROAS calculated?',
    a: 'Net Profit equals Selling Price minus Product Cost, Shipping Cost, Payment Processing Fees, and Ad Spend CPA. Break-Even ROAS equals Selling Price divided by your pre-ad gross profit—showing the exact ad return needed before you lose money.',
  },
  {
    q: 'What support is available if I have questions about setting up my store?',
    a: 'Read any of our step-by-step guides inside the Guides section or reach our team directly through the Contact Support page at support@xampe.com.',
  },
];
