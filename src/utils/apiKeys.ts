const SERPER_STORAGE_KEY = 'xampe_serper_api_key';

export interface ClientApiKeys {
  serperKey: string;
}

export interface ServerKeyStatus {
  hasServerProxy: boolean;
  serperEnvConfigured: boolean;
}

export function getClientApiKeys(): ClientApiKeys {
  let localSerper = '';

  if (typeof window !== 'undefined' && window.localStorage) {
    localSerper = window.localStorage.getItem(SERPER_STORAGE_KEY)?.trim() || '';
  }

  const envSerper =
    (typeof import.meta !== 'undefined' &&
      import.meta.env &&
      typeof import.meta.env.VITE_SERPER_API_KEY === 'string' &&
      import.meta.env.VITE_SERPER_API_KEY.trim()) ||
    '';

  return {
    serperKey: localSerper || envSerper,
  };
}

export function getLocalStorageApiKeys(): ClientApiKeys {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { serperKey: '' };
  }
  return {
    serperKey: window.localStorage.getItem(SERPER_STORAGE_KEY)?.trim() || '',
  };
}

export function saveLocalStorageApiKeys(keys: ClientApiKeys): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  const s = keys.serperKey.trim();
  if (s) {
    window.localStorage.setItem(SERPER_STORAGE_KEY, s);
  } else {
    window.localStorage.removeItem(SERPER_STORAGE_KEY);
  }
}

export async function fetchServerKeyStatus(): Promise<ServerKeyStatus> {
  try {
    const res = await fetch('/api/health', { method: 'GET' });
    if (!res.ok) {
      return {
        hasServerProxy: false,
        serperEnvConfigured: false,
      };
    }
    const data = (await res.json()) as {
      ok?: boolean;
      envConfigured?: { serper?: boolean };
    };
    return {
      hasServerProxy: Boolean(data.ok),
      serperEnvConfigured: Boolean(data.envConfigured?.serper),
    };
  } catch {
    return {
      hasServerProxy: false,
      serperEnvConfigured: false,
    };
  }
}
