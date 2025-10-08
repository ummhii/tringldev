// Cache TTL: 5 minutes
const CACHE_TTL = 5 * 60 * 1000;

export function initMusicPeriodSelector() {
  const periodSelectors = document.querySelectorAll('.period-selector[data-list-type]');
  
  if (periodSelectors.length === 0) {
    return;
  }

  periodSelectors.forEach(selector => {
    const listType = selector.getAttribute('data-list-type');
    const contentElement = document.getElementById(`top-${listType}-content`);
    
    if (!contentElement) return;
    
    if (selector.hasAttribute('data-period-initialized')) {
      return;
    }
    
    selector.setAttribute('data-period-initialized', 'true');
    
    const savedPeriod = localStorage.getItem(`lastfm-${listType}-period`) || '7day';

    const buttons = selector.querySelectorAll('.period-btn');
    
    buttons.forEach(btn => {
      if (btn.getAttribute('data-period') === savedPeriod) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
    loadDataForList(listType, savedPeriod, contentElement);
    
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        const period = button.getAttribute('data-period');
        
        if (button.classList.contains('active')) {
          return;
        }

        buttons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        localStorage.setItem(`lastfm-${listType}-period`, period);
        
        loadDataForList(listType, period, contentElement);
      });
    });
  });
}

function getCachedData(type, period) {
  try {
    const key = `lastfm-${type}-${period}`;
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    const data = JSON.parse(cached);
    const now = Date.now();
    
    if (now - data.timestamp > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }
    
    return data.html;
  } catch (e) {
    return null;
  }
}

function setCachedData(type, period, html) {
  try {
    const key = `lastfm-${type}-${period}`;
    const data = {
      html: html,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    // Failed to cache data
  }
}

function loadDataForList(listType, period, contentElement) {
  const baseUrl = 'https://tringldev-server.fly.dev/api';
  const skeletonHTML = `
    <div class="skeleton skeleton-text"></div>
    <div class="skeleton skeleton-text"></div>
    <div class="skeleton skeleton-text"></div>
    <div class="skeleton skeleton-text"></div>
    <div class="skeleton skeleton-text"></div>
  `;

  const cachedData = getCachedData(listType, period);
  if (cachedData) {
    contentElement.innerHTML = cachedData;
    return;
  }

  contentElement.innerHTML = skeletonHTML;

  if (listType === 'artists') {
    htmx.ajax('GET', `${baseUrl}/top-artists?limit=10&period=${period}`, {
      target: contentElement,
      swap: 'innerHTML'
    });
  } else if (listType === 'albums') {
    setTimeout(() => {
      const albumsUrl = `${baseUrl}/top-albums?limit=10&period=${period}`;

      fetch(albumsUrl)
        .then(res => res.json())
        .then(data => {
          const html = data.albums && data.albums.length > 0 
            ? data.albums.map((album, index) => `
                <div class="artist-item">
                  <div class="artist-item-group-left">
                    <span class="artist-rank">#${index + 1}</span>
                    <span class="artist-name">
                      <span class="track-name-part">${album.name} </span>
                      <span class="track-artist-part">${album.artist}</span>
                    </span>
                  </div>
                  <div class="artist-item-group-right">
                    <span class="artist-plays">${album.playcount} plays</span>
                  </div>
                </div>
              `).join('')
            : `<p class="small" style="color: var(--muted);">No album data available</p>`;
          
          contentElement.innerHTML = html;
          setCachedData(listType, period, html);
        })
        .catch(err => {
          console.error('Albums fetch error:', err);
          contentElement.innerHTML = `<p class="small" style="color: var(--error);">Unable to fetch top albums</p>`;
        });
    }, 100);
  } else if (listType === 'tracks') {
    setTimeout(() => {
      htmx.ajax('GET', `${baseUrl}/top-tracks?limit=10&period=${period}`, {
        target: contentElement,
        swap: 'innerHTML'
      });
    }, 200);
  }
}
