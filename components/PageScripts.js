import { useEffect } from 'react';

export default function PageScripts({ sources }) {
  useEffect(() => {
    const registry = (window.__rockstarPageScriptLoads ??= new Map());

    Promise.all(
      sources.map((source) => {
        const scriptUrl = new URL(source, window.location.href);
        // A cache-busting query can change during Fast Refresh. Avoid executing
        // the same classic script twice in one document: its top-level lexical
        // declarations and event handlers are shared for the lifetime of page.
        const scriptKey = scriptUrl.origin + scriptUrl.pathname;
        if (registry.has(scriptKey)) return registry.get(scriptKey);

        const alreadyAdded = Array.from(document.scripts).some((existing) => {
          if (!existing.src) return false;
          const existingUrl = new URL(existing.src, window.location.href);
          return existingUrl.origin + existingUrl.pathname === scriptKey;
        });
        if (alreadyAdded) {
          const loaded = Promise.resolve();
          registry.set(scriptKey, loaded);
          return loaded;
        }

        const scriptLoad = new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = scriptUrl.href;
          // Download together, but keep execution order for scripts with shared globals.
          script.async = false;
          script.addEventListener('load', resolve, { once: true });
          script.addEventListener('error', resolve, { once: true });
          document.body.appendChild(script);
        });
        registry.set(scriptKey, scriptLoad);
        return scriptLoad;
      }),
    );
  }, [sources]);

  return null;
}
