document.addEventListener('DOMContentLoaded', function() {
  const header = document.querySelector('.terminal-header');
  if (header) {
    header.style.opacity = '0';
    setTimeout(() => {
      header.style.transition = 'opacity 0.5s ease';
      header.style.opacity = '1';
    }, 100);
  }
  
  // Add entrance animation to boxes
  const boxes = document.querySelectorAll('.terminal-box');
  boxes.forEach((box, index) => {
    box.style.opacity = '0';
    setTimeout(() => {
      box.style.transition = 'all 0.5s ease';
      box.style.opacity = '1';
    }, 100 * (index + 1));
  });
});


document.addEventListener('keydown', function(event) {
  // CTRL + K to focus on contact form
  if (event.ctrlKey && event.key === 'k') {
    event.preventDefault();
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    document.getElementById('name').focus();
  }
  
  // CTRL + H to scroll to top
  if (event.ctrlKey && event.key === 'h') {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

let cachedSongData = null;

// Handle HTMX responses from the real API
document.body.addEventListener('htmx:afterSwap', function(event) {
  const target = event.detail.target;
  
  // Handle pinned repo response
  if (event.detail.requestConfig.path.includes('pinned-repo')) {
    try {
      const data = JSON.parse(event.detail.xhr.responseText);
      target.innerHTML = `
        <a href="${data.url}" class="terminal-link" target="_blank" rel="noopener noreferrer">
          ${data.name}
        </a>
        <p class="small">${data.description || 'No description available'}</p>
        ${data.language ? `<p class="small">Language: <span class="highlight">${data.language}</span></p>` : ''}
        <p class="small">${data.stars || 0} stars | ${data.forks || 0} forks</p>
      `;
    } catch (e) {
      target.innerHTML = `<p class="small" style="color: var(--ctp-mocha-red);">Failed to load project</p>`;
    }
  }
  
  // Handle now-playing response
  if (event.detail.requestConfig.path.includes('now-playing')) {
    try {
      const data = JSON.parse(event.detail.xhr.responseText);
      
      if (data.isPlaying) {
  
        // Placeholder SVG for when there's no album art
        const placeholderSvg = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23cba6f7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Cpath d="M9 18V5l12-2v13"%3E%3C/path%3E%3Ccircle cx="6" cy="18" r="3"%3E%3C/circle%3E%3Ccircle cx="18" cy="16" r="3"%3E%3C/circle%3E%3C/svg%3E';

        target.innerHTML = `
          <div class="now-playing-content">
            <img src="${data.albumArt || placeholderSvg}" alt="Album art for ${data.albumName || data.songName}" class="album-art ${!data.albumArt ? 'placeholder' : ''}">
            <div class="song-details">
              <h3 class="highlight">${data.songName}</h3>
              <p class="small">by ${data.artistName}</p>
              ${data.albumName ? `<p class="small">from "${data.albumName}"</p>` : ''}
              ${data.songUrl ? `<a href="${data.songUrl}" class="terminal-link music-link" target="_blank" rel="noopener noreferrer">View on Last.fm →</a>` : ''}
            </div>
          </div>
        `;
        cachedSongData = data; // Cache the current song data
      } else {
        target.innerHTML = `
          <p class="small" style="color: var(--ctp-mocha-overlay1);">
            Not currently playing anything
          </p>
        `;
        cachedSongData = null; // Clear cache when not playing
      }
    } catch (e) {
      target.innerHTML = `<p class="small" style="color: var(--ctp-mocha-red);">Failed to load music data</p>`;
      cachedSongData = null; // Clear cache on error
    }
  }

  // Handle top artists response
  if (event.detail.requestConfig.path.includes('top-artists')) {
    try {
      const data = JSON.parse(event.detail.xhr.responseText);
      
      if (data.artists && data.artists.length > 0) {
        target.innerHTML = data.artists.map((artist, index) => `
          <div class="artist-item">
            <span class="artist-rank">#${index + 1}</span>
            <span class="artist-name">${artist.name}</span>
            <span class="artist-plays">(${artist.playcount} plays)</span>
          </div>
        `).join('');
      } else {
        target.innerHTML = `
          <p class="small" style="color: var(--ctp-mocha-overlay1);">
            No artist data available
          </p>
        `;
      }
    } catch (e) {
      target.innerHTML = `<p class="small" style="color: var(--ctp-mocha-red);">Failed to load top artists</p>`;
    }
  }

  // Handle contact form response
  if (event.detail.requestConfig.path.includes('/api/contact')) {
    setTimeout(() => {
      const responseDiv = document.getElementById('contact-response');
      responseDiv.hidden = false;
      responseDiv.innerHTML = `
        <p style="color: #a6e3a1;">
          ✓ Message sent successfully! I'll get back to you soon.
        </p>
      `;
      event.target.reset();
    }, 500);
  }

  // handle latest post response
  if (event.detail.requestConfig.path.includes('/api/latest-post')) {
    try {
      const data = JSON.parse(event.detail.xhr.responseText);
      target.innerHTML = `
        <a href="${data.url}" class="terminal-link" target="_blank" rel="noopener noreferrer">
          ${data.title}
        </a>
        <p class="small">${new Date(data.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      `;
    } catch (e) {
      target.innerHTML = `<p class="small" style="color: var(--ctp-mocha-red);">Failed to load latest post</p>`;
    }
  }
});

// Handle API errors
document.body.addEventListener('htmx:responseError', function(event) {
  const target = event.detail.target;
  
  if (event.detail.requestConfig.path.includes('pinned-repo')) {
    target.innerHTML = `<p class="small" style="color: var(--ctp-mocha-red);">Unable to fetch project data</p>`;
  }
  
  if (event.detail.requestConfig.path.includes('now-playing')) {
    target.innerHTML = `<p class="small" style="color: var(--ctp-mocha-red);">Unable to fetch music data</p>`;
    cachedSongData = null; // Clear cache on error
  }

  if (event.detail.requestConfig.path.includes('top-artists')) {
    target.innerHTML = `<p class="small" style="color: var(--ctp-mocha-red);">Unable to fetch top artists</p>`;
  }

  if (event.detail.requestConfig.path.includes('/api/contact')) {
    const responseDiv = document.getElementById('contact-response');
    responseDiv.hidden = false;
    responseDiv.innerHTML = `
      <p style="color: var(--ctp-mocha-red);">
        ✗ Failed to send message. Please try again later.
      </p>
    `;
  }
});

// Keep existing DOM animations
document.addEventListener('DOMContentLoaded', function() {
  const header = document.querySelector('.terminal-header');
  if (header) {
    header.style.opacity = '0';
    setTimeout(() => {
      header.style.transition = 'opacity 0.5s ease';
      header.style.opacity = '1';
    }, 100);
  }
  
  const boxes = document.querySelectorAll('.terminal-box');
  boxes.forEach((box, index) => {
    box.style.opacity = '0';
    setTimeout(() => {
      box.style.transition = 'all 0.5s ease';
      box.style.opacity = '1';
    }, 100 * (index + 1));
  });
});

// Keep existing keyboard shortcuts
document.addEventListener('keydown', function(event) {
  if (event.ctrlKey && event.key === 'k') {
    event.preventDefault();
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    document.getElementById('name').focus();
  }
  
  if (event.ctrlKey && event.key === 'h') {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

console.log('%c> Terminal Portfolio Loaded', 'color: #cba6f7; font-size: 16px; font-family: monospace;');
console.log('%c> Type Ctrl+K to jump to contact form', 'color: #89dceb; font-size: 12px; font-family: monospace;');
console.log('%c> Type Ctrl+H to scroll to top', 'color: #89dceb; font-size: 12px; font-family: monospace;');
