import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';
// highlight.js theme for code syntax coloring
import 'highlight.js/styles/github-dark.css';

// Runtime, env-driven Google Analytics injection.
// This ensures the tag is only added in production and when VITE_GA_ID is set.
;(function injectGtagIfNeeded() {
	try {
		const GA_ID = (import.meta as any).env?.VITE_GA_ID as string | undefined;
		const isProd = (import.meta as any).env?.PROD === true;

		if (!GA_ID || !isProd) return;

		// Add the async loader
		const s = document.createElement('script');
		s.async = true;
		s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
		document.head.appendChild(s);

		// Add the inline initialization
		const inline = document.createElement('script');
		inline.innerHTML = `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${GA_ID}');`;
		document.head.appendChild(inline);
	} catch (e) {
		// don't break the app if injection fails
		// console.debug('gtag injection skipped', e);
	}
})();

// Ensure a stable favicon is set and resist accidental changes by other scripts or extensions.
function ensureStableFavicon(href = '/favicon.ico') {
	try {
		const setHref = (el: HTMLLinkElement) => {
			if (el.getAttribute('href') !== href) el.setAttribute('href', href);
			// also ensure type attribute
			if (!el.getAttribute('type')) el.setAttribute('type', 'image/x-icon');
		};

		let icon = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
		if (!icon) {
			icon = document.createElement('link');
			icon.setAttribute('rel', 'icon');
			document.head.appendChild(icon);
		}
		setHref(icon);

		// Observe changes to the head and restore favicon if it changes
		const observer = new MutationObserver((mutations) => {
			for (const m of mutations) {
				if (m.type === 'attributes' && (m.target as Element).matches("link[rel~='icon']")) {
					const el = m.target as HTMLLinkElement;
					if (el.getAttribute('href') !== href) setHref(el);
				}
				if (m.type === 'childList') {
					// if a new icon link was added, reset it
					const added = Array.from(document.head.querySelectorAll("link[rel~='icon']")).find(n => (n as HTMLLinkElement).getAttribute('href') !== href) as HTMLLinkElement | undefined;
					if (added) setHref(added);
				}
			}
		});

		observer.observe(document.head, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'], });
	} catch (e) {
		// non-fatal
		// console.debug('ensureStableFavicon failed', e);
	}
}

ensureStableFavicon();

createRoot(document.getElementById('root')!).render(
	<HelmetProvider>
		<App />
	</HelmetProvider>
);
