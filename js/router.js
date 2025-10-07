export function initRouter() {
  const loadingOverlay = document.createElement('div');
  loadingOverlay.className = 'page-loading';
  loadingOverlay.innerHTML = '<div class="loading-spinner"></div>';
  document.body.appendChild(loadingOverlay);

  document.addEventListener('click', function(e) {
    const link = e.target.closest('a[href^="/"]');
    if (link && !link.hasAttribute('target')) {
      const href = link.getAttribute('href');
      
      if (href && !href.startsWith('http')) {
        const isNavLink = link.closest('.header-nav') || 
                         href.match(/^\/(index|music|projects|blog)(\.html)?$/);
        
        if (isNavLink) {
          e.preventDefault();
          navigateTo(href);
        }
      }
    }
  });

  window.addEventListener('popstate', function(e) {
    if (e.state && e.state.path) {
      loadPage(e.state.path, false);
    }
  });

  if (!window.history.state) {
    window.history.replaceState({ path: window.location.pathname }, '', window.location.pathname);
  }
}

async function navigateTo(path) {
  window.history.pushState({ path: path }, '', path);
  await loadPage(path, true);
}

async function loadPage(path, animate = true) {
  try {
    if (path === '/') {
      path = '/index.html';
    } else if (!path.endsWith('.html')) {
      path = path + '.html';
    }

    const response = await fetch(path);
    if (!response.ok) throw new Error('Page not found');
    
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const newMain = doc.querySelector('main.terminal-content');
    const newHeader = doc.querySelector('header#header');
    const newTitle = doc.querySelector('title');

    // Replace main content
    if (newMain) {
      const currentMain = document.querySelector('main.terminal-content');
      if (currentMain) {
        newMain.style.opacity = '0';
        currentMain.replaceWith(newMain);
      }
    }

    if (newHeader) {
      const currentHeader = document.querySelector('header#header');
      const newPrompt = newHeader.querySelector('.prompt');
      const currentPrompt = currentHeader?.querySelector('.prompt');
      
      if (currentPrompt && newPrompt) {
        currentPrompt.innerHTML = newPrompt.innerHTML;
      }

      const currentNav = currentHeader?.querySelector('.header-nav');
      if (currentNav) {
        currentNav.querySelectorAll('a').forEach(link => {
          link.classList.remove('accent');
        });
        
        const currentPath = path.replace('.html', '').replace('/index', '/');
        const activeLink = currentNav.querySelector(`a[href="${currentPath}"]`);
        if (activeLink) {
          activeLink.classList.add('accent');
        }
      }
    }

    if (newTitle) {
      document.title = newTitle.textContent;
    }

    if (window.htmx) {
      setTimeout(() => {
        const mainContent = document.querySelector('main.terminal-content');
        if (mainContent) {
          window.htmx.process(mainContent);
          
          const loadElements = mainContent.querySelectorAll('[hx-trigger]');
          loadElements.forEach(el => {
            const trigger = el.getAttribute('hx-trigger');
            if (trigger && trigger.includes('load')) {
              window.htmx.trigger(el, 'load');
            }
          });
        }
      }, 0);
    }

    if (animate) {
      // Fade in main content first
      const mainContent = document.querySelector('main.terminal-content');
      if (mainContent) {
        mainContent.style.opacity = '1';
        mainContent.style.transition = 'opacity 0.3s ease';
      }
      
      // Stagger fade-in for terminal boxes inside main content only (exclude header and footer)
      const newBoxes = mainContent ? mainContent.querySelectorAll('.terminal-box:not(#header):not(#footer)') : [];
      newBoxes.forEach((box, index) => {
        // Set initial state
        box.style.opacity = '0';
        box.style.transform = 'translateY(10px)';
        
        // Animate in with delay
        setTimeout(() => {
          box.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          box.style.opacity = '1';
          box.style.transform = 'translateY(0)';
          
          // Clean up inline styles after animation completes
          setTimeout(() => {
            box.style.removeProperty('opacity');
            box.style.removeProperty('transform');
            box.style.removeProperty('transition');
          }, 400);
        }, 50 + (index * 50)); // Stagger by 50ms per box
      });
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

  } catch (error) {
    console.error('Navigation error:', error);
    window.location.href = path;
  }
}
