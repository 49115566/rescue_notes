import { useEffect } from 'react';

export function PWASetup() {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('SW registered: ', registration);
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    // Add manifest link
    const manifest = document.createElement('link');
    manifest.rel = 'manifest';
    manifest.href = '/manifest.json';
    document.head.appendChild(manifest);

    // Add meta tags for PWA
    const viewport = document.createElement('meta');
    viewport.name = 'viewport';
    viewport.content = 'width=device-width, initial-scale=1, user-scalable=no';
    document.head.appendChild(viewport);

    const themeColor = document.createElement('meta');
    themeColor.name = 'theme-color';
    themeColor.content = '#030213';
    document.head.appendChild(themeColor);

    const appleMobileWebAppCapable = document.createElement('meta');
    appleMobileWebAppCapable.name = 'apple-mobile-web-app-capable';
    appleMobileWebAppCapable.content = 'yes';
    document.head.appendChild(appleMobileWebAppCapable);

    const appleMobileWebAppStatusBar = document.createElement('meta');
    appleMobileWebAppStatusBar.name = 'apple-mobile-web-app-status-bar-style';
    appleMobileWebAppStatusBar.content = 'black-translucent';
    document.head.appendChild(appleMobileWebAppStatusBar);

    const appleMobileWebAppTitle = document.createElement('meta');
    appleMobileWebAppTitle.name = 'apple-mobile-web-app-title';
    appleMobileWebAppTitle.content = 'RESCUE NOTES';
    document.head.appendChild(appleMobileWebAppTitle);

    return () => {
      // Cleanup
      document.head.removeChild(manifest);
      document.head.removeChild(viewport);
      document.head.removeChild(themeColor);
      document.head.removeChild(appleMobileWebAppCapable);
      document.head.removeChild(appleMobileWebAppStatusBar);
      document.head.removeChild(appleMobileWebAppTitle);
    };
  }, []);

  return null;
}