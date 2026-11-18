import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ApiKeysModal } from './components/ApiKeysModal';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import {
  BlogPage,
  ContactPage,
  FaqPage,
  FeatureDetailPage,
  GlossaryPage,
  GuideArticlePage,
  GuidesHubPage,
  LegalPage,
  NicheSolutionPage,
  SuccessStoriesPage,
} from './pages/ContentPages';
import { HomePage } from './pages/HomePage';
import {
  AdHookGeneratorPage,
  FreeToolsHubPage,
  NameGeneratorPage,
  ProfitCalculatorPage,
  ThemeAnalyzerPage,
} from './pages/ToolsPages';
import { NicheId, PageRoute } from './types/xampe';
import {
  fetchServerKeyStatus,
  getClientApiKeys,
  ServerKeyStatus,
} from './utils/apiKeys';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageRoute>('home');
  const [selectedNiche, setSelectedNiche] = useState<NicheId | null>(null);
  const [storeNameInput, setStoreNameInput] = useState('');
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [keysRevision, setKeysRevision] = useState(0);
  const [serverStatus, setServerStatus] = useState<ServerKeyStatus>({
    hasServerProxy: false,
    serperEnvConfigured: false,
  });

  const [shopifySuccess, setShopifySuccess] = useState<{
    shop: string;
    count: number;
    storeName: string;
  } | null>(null);
  const [shopifyError, setShopifyError] = useState('');

  const builderSectionRef = useRef<HTMLDivElement | null>(null);

  const refreshKeyStatus = useCallback(() => {
    setKeysRevision((r) => r + 1);
    fetchServerKeyStatus().then(setServerStatus);
  }, []);

  useEffect(() => {
    document.title = 'Xampe — Dropshipping Made Easy';
  }, []);

  useEffect(() => {
    refreshKeyStatus();
  }, [refreshKeyStatus]);

  // Parse Shopify OAuth redirect params and popup postMessage events
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('shopify_connected') === 'true') {
      const shop = params.get('shop') || '';
      const count = Number(params.get('count') || '6');
      const storeName = params.get('store') || 'Your Store';
      if (shop) {
        setShopifySuccess({
          shop,
          count: Number.isNaN(count) ? 6 : count,
          storeName,
        });
        setCurrentPage('home');
      }
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.hash
      );
    } else if (params.get('shopify_error')) {
      setShopifyError(params.get('shopify_error') || '');
      setCurrentPage('home');
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.hash
      );
    }

    const handleMessage = (event: MessageEvent) => {
      const isAllowedOrigin =
        event.origin === window.location.origin ||
        event.origin.endsWith('.run.app') ||
        event.origin.startsWith('http://localhost:');
      if (!isAllowedOrigin || !event.data || typeof event.data !== 'object') {
        return;
      }

      if (event.data.type === 'SHOPIFY_INJECT_SUCCESS') {
        setShopifySuccess({
          shop: String(event.data.shop || ''),
          count: Number(event.data.injectedCount || 6),
          storeName: String(event.data.storeName || 'Your Store'),
        });
        setShopifyError('');
        setCurrentPage('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (event.data.type === 'SHOPIFY_INJECT_ERROR') {
        setShopifyError(
          String(
            event.data.message ||
              'Could not push products to Shopify. Please try again or use the Shopify Product CSV.'
          )
        );
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Secret private access for owner key management: Ctrl+Shift+K (or Cmd+Shift+K) or #admin-keys hash
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#admin-keys') {
        setApiModalOpen(true);
      }
    };
    checkHash();

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setApiModalOpen((prev) => !prev);
      }
    };

    window.addEventListener('hashchange', checkHash);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('hashchange', checkHash);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleCloseApiModal = () => {
    setApiModalOpen(false);
    if (window.location.hash === '#admin-keys') {
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search
      );
    }
  };

  const clientKeys = getClientApiKeys();
  const hasSerper = Boolean(clientKeys.serperKey || serverStatus.serperEnvConfigured);

  const navigate = (route: PageRoute) => {
    setCurrentPage(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBuildFreeStore = () => {
    setCurrentPage('home');
    window.setTimeout(() => {
      builderSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 40);
  };

  const handleUseStoreName = (name: string, niche?: NicheId) => {
    if (name) {
      setStoreNameInput(name);
    }
    if (niche) {
      setSelectedNiche(niche);
    }
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBuildNicheStore = (niche?: NicheId) => {
    if (niche) {
      setSelectedNiche(niche);
    }
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            selectedNiche={selectedNiche}
            onSelectNiche={setSelectedNiche}
            storeNameInput={storeNameInput}
            onChangeStoreName={setStoreNameInput}
            onNavigate={navigate}
            builderSectionRef={builderSectionRef}
            hasSerperKey={hasSerper}
            keysRevision={keysRevision}
            shopifySuccess={shopifySuccess}
            onDismissShopifySuccess={() => setShopifySuccess(null)}
            shopifyError={shopifyError}
            onDismissShopifyError={() => setShopifyError('')}
          />
        );

      // Tools
      case 'tools-hub':
        return <FreeToolsHubPage onNavigate={navigate} />;
      case 'tool-name-generator':
        return (
          <NameGeneratorPage
            onNavigate={navigate}
            onUseStoreName={handleUseStoreName}
          />
        );
      case 'tool-profit-calculator':
        return <ProfitCalculatorPage onNavigate={navigate} />;
      case 'tool-ad-hooks':
        return <AdHookGeneratorPage onNavigate={navigate} />;
      case 'tool-theme-analyzer':
        return (
          <ThemeAnalyzerPage
            onNavigate={navigate}
            onUseStoreName={handleUseStoreName}
          />
        );

      // Features
      case 'feature-winning-products':
      case 'feature-store-pages':
      case 'feature-custom-domain':
        return (
          <FeatureDetailPage
            route={currentPage}
            onNavigate={navigate}
            onBuildNicheStore={handleBuildNicheStore}
          />
        );

      // Solutions
      case 'solution-themes':
      case 'solution-pets':
      case 'solution-electronics':
      case 'solution-fashion':
      case 'solution-home':
      case 'solution-fitness':
        return (
          <NicheSolutionPage
            route={currentPage}
            onNavigate={navigate}
            onBuildNicheStore={handleBuildNicheStore}
          />
        );

      // Guides
      case 'guides-hub':
        return (
          <GuidesHubPage
            onNavigate={navigate}
            onBuildNicheStore={handleBuildNicheStore}
          />
        );
      case 'guide-dropship-shopify':
      case 'guide-ai-dropshipping':
      case 'guide-marketing-tiktok':
      case 'guide-shopify-seo':
      case 'guide-start-shopify':
      case 'guide-how-shopify-works':
        return (
          <GuideArticlePage
            route={currentPage}
            onNavigate={navigate}
            onBuildNicheStore={handleBuildNicheStore}
          />
        );

      // Resources
      case 'glossary':
        return (
          <GlossaryPage
            onNavigate={navigate}
            onBuildNicheStore={handleBuildNicheStore}
          />
        );
      case 'success-stories':
        return (
          <SuccessStoriesPage
            onNavigate={navigate}
            onBuildNicheStore={handleBuildNicheStore}
          />
        );
      case 'blog':
        return (
          <BlogPage
            onNavigate={navigate}
            onBuildNicheStore={handleBuildNicheStore}
          />
        );
      case 'faq':
        return (
          <FaqPage
            onNavigate={navigate}
            onBuildNicheStore={handleBuildNicheStore}
          />
        );

      // Legal & Support
      case 'privacy':
        return <LegalPage type="privacy" onNavigate={navigate} />;
      case 'terms':
        return <LegalPage type="terms" onNavigate={navigate} />;
      case 'contact':
        return <ContactPage onNavigate={navigate} />;

      default:
        return (
          <HomePage
            selectedNiche={selectedNiche}
            onSelectNiche={setSelectedNiche}
            storeNameInput={storeNameInput}
            onChangeStoreName={setStoreNameInput}
            onNavigate={navigate}
            builderSectionRef={builderSectionRef}
            hasSerperKey={hasSerper}
            keysRevision={keysRevision}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111827]">
      <Navbar
        currentPage={currentPage}
        onNavigate={navigate}
        onBuildFreeStore={handleBuildFreeStore}
      />
      <main className="flex-1">{renderPage()}</main>
      <Footer onNavigate={navigate} />
      <ApiKeysModal
        open={apiModalOpen}
        onClose={handleCloseApiModal}
        serverStatus={serverStatus}
        onKeysSaved={refreshKeyStatus}
      />
    </div>
  );
}
