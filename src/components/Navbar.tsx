import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { PageRoute } from '../types/xampe';
import { XampeLogo } from './XampeLogo';

interface NavbarProps {
  currentPage: PageRoute;
  onNavigate: (route: PageRoute) => void;
  onBuildFreeStore: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onBuildFreeStore,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isToolsActive =
    currentPage === 'tools-hub' ||
    currentPage.startsWith('tool-');

  const isGuidesActive =
    currentPage === 'guides-hub' ||
    currentPage.startsWith('guide-') ||
    currentPage === 'glossary' ||
    currentPage === 'blog';

  const navItems: { label: string; route: PageRoute; active: boolean }[] = [
    { label: 'Store Builder', route: 'home', active: currentPage === 'home' },
    { label: 'Free Tools', route: 'tools-hub', active: isToolsActive },
    { label: 'Guides', route: 'guides-hub', active: isGuidesActive },
    { label: 'Success Stories', route: 'success-stories', active: currentPage === 'success-stories' },
    { label: 'FAQ', route: 'faq', active: currentPage === 'faq' },
  ];

  const handleMobileNav = (route: PageRoute) => {
    setMobileMenuOpen(false);
    onNavigate(route);
  };

  return (
    <header className="w-full bg-white border-b border-[#E5E7EB] sticky top-0 z-40">
      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 lg:gap-8">
        {/* Zone 1: Custom E-Commerce Brand Mark & Wordmark */}
        <button
          type="button"
          onClick={() => handleMobileNav('home')}
          className="flex items-center text-left whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#EA580C]"
        >
          <XampeLogo variant="light" size="md" />
        </button>

        {/* Zone 2: Desktop Horizontal Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-7">
          {navItems.map((item) => (
            <button
              key={item.route}
              type="button"
              onClick={() => onNavigate(item.route)}
              className={`relative py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                item.active
                  ? 'text-[#111827]'
                  : 'text-neutral-600 hover:text-[#111827]'
              }`}
            >
              {item.label}
              {item.active && (
                <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-[#EA580C]" />
              )}
            </button>
          ))}
        </nav>

        {/* Zone 3: Primary Action + Mobile Menu Toggle */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onBuildFreeStore();
            }}
            className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-white bg-[#EA580C] hover:bg-[#C2410C] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Build My Store
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[#E5E7EB] text-[#111827] hover:bg-[#FAFAFA] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Clean Flat Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5E7EB] bg-white px-4 py-4 space-y-2">
          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => (
              <button
                key={item.route}
                type="button"
                onClick={() => handleMobileNav(item.route)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  item.active
                    ? 'bg-[#FFF7ED] text-[#9A3412] font-semibold'
                    : 'text-neutral-700 hover:bg-[#FAFAFA]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="pt-2 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onBuildFreeStore();
              }}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#EA580C] hover:bg-[#C2410C] rounded-lg transition-colors cursor-pointer"
            >
              Build My Store (100% Free)
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
