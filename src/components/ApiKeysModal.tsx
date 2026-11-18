import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Trash2,
  X,
} from 'lucide-react';
import {
  getLocalStorageApiKeys,
  saveLocalStorageApiKeys,
  ServerKeyStatus,
} from '../utils/apiKeys';
import { testLiveConnections } from '../utils/liveApi';

interface ApiKeysModalProps {
  open: boolean;
  onClose: () => void;
  serverStatus: ServerKeyStatus;
  onKeysSaved: () => void;
}

export const ApiKeysModal: React.FC<ApiKeysModalProps> = ({
  open,
  onClose,
  serverStatus,
  onKeysSaved,
}) => {
  const [serperKey, setSerperKey] = useState('');
  const [showSerper, setShowSerper] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    shoppingOk: boolean;
    shoppingMessage: string;
    imagesOk: boolean;
    imagesMessage: string;
  } | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (open) {
      const local = getLocalStorageApiKeys();
      setSerperKey(local.serperKey);
      setTestResult(null);
      setSavedNotice(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveLocalStorageApiKeys({ serperKey });
    setSavedNotice(true);
    onKeysSaved();
    window.setTimeout(() => {
      onClose();
    }, 550);
  };

  const handleTest = async () => {
    saveLocalStorageApiKeys({ serperKey });
    onKeysSaved();
    setTesting(true);
    setTestResult(null);
    const result = await testLiveConnections();
    setTestResult(result);
    setTesting(false);
  };

  const handleClear = () => {
    setSerperKey('');
    saveLocalStorageApiKeys({ serperKey: '' });
    setTestResult(null);
    onKeysSaved();
  };

  const hasViteSerper = Boolean(
    typeof import.meta !== 'undefined' &&
      import.meta.env?.VITE_SERPER_API_KEY?.trim()
  );

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/60 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-[540px] bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
        <div className="px-6 py-4 bg-[#FAFAFA] border-b border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFF7ED] border border-[#FED7AA] flex items-center justify-center text-[#EA580C]">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-[#111827]">
                Live Marketplace &amp; Hero Images API Key
              </h2>
              <p className="text-xs text-neutral-500">
                Single Serper.dev key powers live Shopping products &amp; lifestyle hero banners
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close API keys modal"
            className="p-1.5 text-neutral-500 hover:text-[#111827] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="serper-key-input"
                className="text-xs font-semibold text-neutral-700"
              >
                Serper.dev API Key
              </label>
              <span className="text-[11px] font-medium text-neutral-500">
                {serverStatus.serperEnvConfigured || hasViteSerper
                  ? 'Env variable detected (local key overrides)'
                  : 'Get key at serper.dev'}
              </span>
            </div>
            <div className="relative">
              <input
                id="serper-key-input"
                type={showSerper ? 'text' : 'password'}
                value={serperKey}
                onChange={(e) => setSerperKey(e.target.value)}
                placeholder="Paste your Serper X-API-KEY..."
                className="w-full pr-10 pl-3.5 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg font-mono-tabular focus:outline-none focus:border-[#EA580C]"
              />
              <button
                type="button"
                onClick={() => setShowSerper((v) => !v)}
                aria-label={showSerper ? 'Hide Serper key' : 'Show Serper key'}
                className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                {showSerper ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1.5 leading-relaxed">
              Saved locally in browser storage for instant preview testing (also reads <code className="font-mono-tabular">SERPER_API_KEY</code> / <code className="font-mono-tabular">VITE_SERPER_API_KEY</code>). Fetches both real Google Shopping listings and high-resolution landscape hero banners.
            </p>
          </div>

          {testResult && (
            <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg p-3.5 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                {testResult.shoppingOk ? (
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span className="font-semibold text-neutral-800">Serper Shopping:</span>
                <span className={testResult.shoppingOk ? 'text-[#059669]' : 'text-red-600'}>
                  {testResult.shoppingMessage}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {testResult.imagesOk ? (
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span className="font-semibold text-neutral-800">Serper Hero Images:</span>
                <span className={testResult.imagesOk ? 'text-[#059669]' : 'text-red-600'}>
                  {testResult.imagesMessage}
                </span>
              </div>
            </div>
          )}

          {savedNotice && (
            <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-lg px-3.5 py-2 text-xs font-semibold text-[#9A3412] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#EA580C]" />
              Serper.dev API key saved to browser storage. Live fetching active.
            </div>
          )}

          <div className="pt-2 flex items-center justify-between border-t border-neutral-100">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={testing}
                onClick={handleTest}
                className="px-3.5 py-2 text-xs font-semibold text-neutral-700 bg-[#FAFAFA] hover:bg-neutral-100 border border-[#D1D5DB] rounded-lg inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {testing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{testing ? 'Testing...' : 'Test Connection'}</span>
              </button>
              {serperKey && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-2 text-xs font-medium text-neutral-500 hover:text-red-600 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-neutral-700 border border-[#D1D5DB] rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-[#EA580C] hover:bg-[#C2410C] rounded-lg transition-colors cursor-pointer"
              >
                Save API Key
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
