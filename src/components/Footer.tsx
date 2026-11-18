import React from 'react';
import { PageRoute } from '../types/xampe';
import { XampeLogo } from './XampeLogo';

interface FooterProps {
  onNavigate: (route: PageRoute) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const columns: {
    heading: string;
    links: { label: string; route: PageRoute }[];
  }[] = [
    {
      heading: 'Features',
      links: [
        { label: 'Winning Dropshipping Products', route: 'feature-winning-products' },
        { label: 'High-Converting Store Pages', route: 'feature-store-pages' },
        { label: 'Custom Domain Setup', route: 'feature-custom-domain' },
      ],
    },
    {
      heading: 'Solutions',
      links: [
        { label: 'Shopify Dropshipping Themes', route: 'solution-themes' },
        { label: 'Pet Stores', route: 'solution-pets' },
        { label: 'Electronics Stores', route: 'solution-electronics' },
        { label: 'Fashion & Beauty Stores', route: 'solution-fashion' },
        { label: 'Home & Garden Stores', route: 'solution-home' },
        { label: 'Fitness & Sports Stores', route: 'solution-fitness' },
      ],
    },
    {
      heading: 'Tools & Guides',
      links: [
        { label: 'How to Dropship on Shopify', route: 'guide-dropship-shopify' },
        { label: 'Xampe AI Dropshipping Guide', route: 'guide-ai-dropshipping' },
        { label: 'Shopify Marketing Guide', route: 'guide-marketing-tiktok' },
        { label: 'Shopify SEO Guide', route: 'guide-shopify-seo' },
        { label: 'How to Start a Shopify Store', route: 'guide-start-shopify' },
        { label: 'How Does Shopify Work?', route: 'guide-how-shopify-works' },
        { label: 'Shopify Theme Analyzer', route: 'tool-theme-analyzer' },
        { label: 'Shopify Business Name Generator', route: 'tool-name-generator' },
      ],
    },
    {
      heading: 'Resources',
      links: [
        { label: 'Blog', route: 'blog' },
        { label: 'Glossary', route: 'glossary' },
        { label: 'Success Stories', route: 'success-stories' },
        { label: 'Profit Margin Calculator', route: 'tool-profit-calculator' },
        { label: 'Ad Hook Generator', route: 'tool-ad-hooks' },
        { label: 'FAQ', route: 'faq' },
      ],
    },
    {
      heading: 'Legal & Contact',
      links: [
        { label: 'Privacy Policy', route: 'privacy' },
        { label: 'Terms of Service', route: 'terms' },
        { label: 'Contact Us (support@xampe.com)', route: 'contact' },
      ],
    },
  ];

  return (
    <footer className="w-full bg-[#111827] text-neutral-300 border-t border-neutral-800 mt-16 sm:mt-20">
      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {columns.map((col) => (
            <div key={col.heading}>
              <h3 className="font-display text-sm font-semibold text-white mb-4">
                {col.heading}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <button
                      type="button"
                      onClick={() => onNavigate(link.route)}
                      className="text-left text-[13px] leading-snug text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 sm:mt-14 pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-neutral-400">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#EA580C]"
            >
              <XampeLogo variant="dark" size="sm" />
            </button>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span>Shopify Dropshipping Store Builder · 100% Free, No Sign-Up</span>
          </div>
          <p>© Xampe 2026 (xampe.com). All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
