import { initTheme } from './theme.js';
import { runInitialAnimations } from './animations.js';
import { initRouter } from './router.js';
import { initHtmxHandlers } from './htmx-handlers.js';
import { initKeyboardShortcuts } from './keyboard.js';
import { initHamburgerMenu } from './hamburger-menu.js';
import { initMusicPeriodSelector } from './music-period-selector.js';

// Ensure page starts at the top on load/refresh
if (history.scrollRestoration) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', function() {
  clearMusicCache();
  
  // Scroll to top again after DOM is ready
  window.scrollTo(0, 0);
  
  initTheme();
  runInitialAnimations();
  initRouter();
  initHtmxHandlers();
  initKeyboardShortcuts();
  initHamburgerMenu();
  
  if (document.querySelector('.period-selector')) {
    initMusicPeriodSelector();
  }
});

function clearMusicCache() {
  const periods = ['7day', '1month', '12month', 'overall'];
  const types = ['artists', 'albums', 'tracks'];
  
  periods.forEach(period => {
    types.forEach(type => {
      const key = `lastfm-${type}-${period}`;
      localStorage.removeItem(key);
    });
  });
}
