import { initTheme } from './theme.js';
import { runInitialAnimations } from './animations.js';
import { initRouter } from './router.js';
import { initHtmxHandlers } from './htmx-handlers.js';
import { initKeyboardShortcuts } from './keyboard.js';
import { initHamburgerMenu } from './hamburger-menu.js';

document.addEventListener('DOMContentLoaded', function() {
  initTheme();
  runInitialAnimations();
  initRouter();
  initHtmxHandlers();
  initKeyboardShortcuts();
  initHamburgerMenu();
});
