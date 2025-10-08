import { initTheme } from './theme.js';
import { runInitialAnimations } from './animations.js';
import { initRouter } from './router.js';
import { initHtmxHandlers } from './htmx-handlers.js';
import { initKeyboardShortcuts } from './keyboard.js';
import { initHamburgerMenu } from './hamburger-menu.js';
import { initMusicPeriodSelector } from './music-period-selector.js';

document.addEventListener('DOMContentLoaded', function() {
  clearMusicCache();
  
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
