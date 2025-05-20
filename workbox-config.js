module.exports = {
  globDirectory: '.', // Your build output directory
  globPatterns: [
    '**/*.{html,js,css,webmanifest,png,webp,ico,task}' // Files to precache
  ],
  swDest: 'service-worker.js', // Output service worker file
  runtimeCaching: [
    {
      urlPattern: ({ url }) =>
        url.origin === self.location.origin && /\.(?:html|js|css|task)$/.test(url.pathname),
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'static-assets', },
    },
    {
      urlPattern: ({ url }) =>
        url.origin === self.location.origin && /\.(?:png|webp|ico)$/.test(url.pathname),
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'images', },
    },
    {
      urlPattern: ({ url }) => url.origin.includes('cdn.jsdelivr.net'),
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'cdn-modules', },
    },
  ],
};
