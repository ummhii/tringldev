
document.body.addEventListener('htmx:configRequest', function(event) {
  // Prevent actual HTTP requests for demo purposes
  if (event.detail.path.includes('/api/')) {
    event.preventDefault();
    
    // Simulate API responses
    setTimeout(() => {
      const target = document.querySelector(event.detail.target);
      
      if (event.detail.path.includes('/api/random-project')) {
        const projects = [
          { name: 'Terminal Portfolio', desc: 'A retro terminal-style portfolio website', url: '#' },
          { name: 'HTMX Dashboard', desc: 'Real-time dashboard built with HTMX', url: '#' },
          { name: 'Code Visualizer', desc: 'Interactive code visualization tool', url: '#' },
          { name: 'API Monitor', desc: 'Monitor and debug APIs in real-time', url: '#' }
        ];
        const random = projects[Math.floor(Math.random() * projects.length)];
        target.innerHTML = `
          <a href="${random.url}" class="terminal-link">${random.name}</a>
          <p class="small">${random.desc}</p>
        `;
      }
      
      if (event.detail.path.includes('/api/music')) {
        const songs = [
          { title: 'Synthwave Dreams', artist: 'Cyberpunk Radio' },
          { title: 'Digital Rain', artist: 'Terminal Beats' },
          { title: 'Code & Coffee', artist: 'Dev Lofi' },
          { title: 'Neon Nights', artist: 'Retrowave FM' }
        ];
        const random = songs[Math.floor(Math.random() * songs.length)];
        target.innerHTML = `
          <p>♫ Now Playing:</p>
          <p class="highlight">${random.title}</p>
          <p class="small">by ${random.artist}</p>
        `;
      }
      
      if (event.detail.path.includes('/api/contact')) {
        const responseDiv = document.getElementById('contact-response');
        responseDiv.innerHTML = `
          <p style="color: #a6e3a1;">
            ✓ Message sent successfully! I'll get back to you soon.
          </p>
        `;
        event.target.reset();
      }
    }, 500);
  }
});


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
    box.style.transform = 'translateY(20px)';
    setTimeout(() => {
      box.style.transition = 'all 0.5s ease';
      box.style.opacity = '1';
      box.style.transform = 'translateY(0)';
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

console.log('%c> Terminal Portfolio Loaded', 'color: #cba6f7; font-size: 16px; font-family: monospace;');
console.log('%c> Type Ctrl+K to jump to contact form', 'color: #89dceb; font-size: 12px; font-family: monospace;');
console.log('%c> Type Ctrl+H to scroll to top', 'color: #89dceb; font-size: 12px; font-family: monospace;');
