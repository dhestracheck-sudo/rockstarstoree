import { useEffect } from 'react';

export default function PageScripts({ sources }) {
  useEffect(() => {
    const registry = (window.__rockstarPageScripts ??= new Map());
    const pageKey = JSON.stringify(sources);
    if (registry.has(pageKey)) return;

    const loadSource = (source) =>
      new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = source;
        script.async = false;
        script.addEventListener('load', resolve, { once: true });
        script.addEventListener('error', resolve, { once: true });
        document.body.appendChild(script);
      });

    const loading = sources.reduce(
      (queue, source) => queue.then(() => loadSource(source)),
      Promise.resolve(),
    );
    registry.set(pageKey, loading);
  }, [sources]);

  return null;
}
