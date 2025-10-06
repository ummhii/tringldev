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


function createMatrixRain() {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.opacity = '0.05';
  canvas.style.zIndex = '-1';
  document.body.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const chars = '01アイウエオカキクケコサシスセソタチツテト';
  const fontSize = 14;
  const columns = canvas.width / fontSize;
  const drops = Array(Math.floor(columns)).fill(1);
  
  function draw() {
    ctx.fillStyle = 'rgba(30, 30, 46, 0.05)'; // Catppuccin base with opacity
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#cba6f7'; // Catppuccin mauve
    ctx.font = fontSize + 'px monospace';
    
    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);
      
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }
  
  setInterval(draw, 35);
  
  // Resize handler
  window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

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
  

        target.innerHTML = `
          <p>♫ Now Playing:</p>
          <p class="highlight">${data.songName}</p>
          <p class="small">by ${data.artistName}</p>
          ${data.albumName ? `<p class="small">from "${data.albumName}"</p>` : ''}
          ${data.songUrl ? `<a href="${data.songUrl}" class="terminal-link small" target="_blank" rel="noopener noreferrer">View on Last.fm</a>` : ''}
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
});

// Keep existing contact form handler for demo
document.body.addEventListener('htmx:configRequest', function(event) {
  if (event.detail.path.includes('/api/contact')) {
    event.preventDefault();
    
    setTimeout(() => {
      const responseDiv = document.getElementById('contact-response');
      responseDiv.innerHTML = `
        <p style="color: #a6e3a1;">
          ✓ Message sent successfully! I'll get back to you soon.
        </p>
      `;
      event.target.reset();
    }, 500);
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
