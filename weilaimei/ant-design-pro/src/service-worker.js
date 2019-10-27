/* globals workbox */
/* eslint-disable no-restricted-globals */
workbox.core.setCacheNameDetails({
  prefix: 'antd-pro',
  suffix: 'v1',
});
// Control all opened tabs ASAP
workbox.clientsClaim();

/**
 * Use precaching list generated by workbox in build process.
 * https://developers.google.com/web/tools/workbox/reference-docs/latest/workbox.precaching
 */
/* eslint-disable no-underscore-dangle */
workbox.precaching.precacheAndRoute(self.__precacheManifest || []);

/**
 * Merchant a navigation route.
 * https://developers.google.com/web/tools/workbox/modules/workbox-routing#how_to_register_a_navigation_route
 */
workbox.routing.registerNavigationRoute('/index.html');

/**
 * Use runtime cache:
 * https://developers.google.com/web/tools/workbox/reference-docs/latest/workbox.routing#.registerRoute
 *
 * Workbox provides all common caching strategies including CacheFirst, NetworkFirst etc.
 * https://developers.google.com/web/tools/workbox/reference-docs/latest/workbox.strategies
 */

/**
 * Handle API requests
 */
workbox.routing.registerRoute(/\/api\//, workbox.strategies.networkFirst());

/**
 * Handle third party requests
 */
workbox.routing.registerRoute(
  /^https:\/\/gw.alipayobjects.com\//,
  workbox.strategies.networkFirst()
);
workbox.routing.registerRoute(
  /^https:\/\/cdnjs.cloudflare.com\//,
  workbox.strategies.networkFirst()
);
workbox.routing.registerRoute(/\/color.less/, workbox.strategies.networkFirst());

/**
 * Response to client after skipping waiting with MessageChannel
 */
addEventListener('message', event => {
  const replyPort = event.ports[0];
  const message = event.data;
  if (replyPort && message && message.type === 'skip-waiting') {
    event.waitUntil(
      self
        .skipWaiting()
        .then(
          () => replyPort.postMessage({ error: null }),
          error => replyPort.postMessage({ error })
        )
    );
  }
});
